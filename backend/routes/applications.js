import express from 'express';
import Applicant from '../models/Applicant.js';
import ApplicationRecord from '../models/ApplicationRecord.js';
import { scoreApplicantWithAI } from '../services/aiService.js';
import { verifyToken, requireRole, requireDb } from '../middleware/auth.js';

const router = express.Router();

// Apply strict database check on all application endpoints - no silent in-memory fallback
router.use(requireDb);

/**
 * GET /api/applications/my
 * Allows authenticated applicants to retrieve only their own submitted applications
 */
router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const records = await ApplicationRecord.find({
      $or: [{ userId: userId }, { applicantId: userId }, { 'applicantSnapshot.email': req.user.email }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('[Fetch My Applications Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/applications
 * Accessible only by authenticated loan_officer.
 * Fetches all applications with search, status filter, tier filter, and sorting.
 */
router.get('/', verifyToken, requireRole('loan_officer'), async (req, res) => {
  try {
    const { status, tier, search, limit = 50, sort = 'recent' } = req.query;

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (tier && tier !== 'ALL') {
      query['aiResults.creditTier'] = tier;
    }
    if (search) {
      query.$or = [
        { 'applicantSnapshot.fullName': { $regex: search, $options: 'i' } },
        { 'applicantSnapshot.email': { $regex: search, $options: 'i' } },
        { 'applicantSnapshot.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions =
      sort === 'score_desc'
        ? { 'aiResults.trustScore': -1 }
        : sort === 'score_asc'
        ? { 'aiResults.trustScore': 1 }
        : { createdAt: -1 };

    const records = await ApplicationRecord.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .lean();

    return res.json({
      success: true,
      count: records.length,
      storageMode: 'mongodb',
      data: records,
    });
  } catch (error) {
    console.error('[Fetch Applications Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/applications/:id
 * Fetches full details for a single application.
 * Accessible by loan_officer OR the applicant who owns the application.
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const record = await ApplicationRecord.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, error: 'Application record not found.' });
    }

    // Role-based authorization
    if (req.user.role !== 'loan_officer') {
      const isOwner =
        (record.userId && record.userId.toString() === req.user._id.toString()) ||
        (record.applicantId && record.applicantId.toString() === req.user._id.toString()) ||
        record.applicantSnapshot?.email?.toLowerCase() === req.user.email?.toLowerCase();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only view your own applications.',
        });
      }
    }

    return res.json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/applications
 * Accessible by authenticated users (applicants or officers).
 * Links application to req.user._id, calls FastAPI /predict, and saves to MongoDB.
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      nationalId,
      employmentType,
      city,
      monthlyIncomeEstimate,
      requestedLoanAmount,
      loanPurpose,
      wallet_transaction_frequency,
      avg_utility_days_late,
      prepaid_recharge_regularity,
      gig_platform_rating,
      microloan_repayment_ratio,
    } = req.body;

    const applicantName = fullName || req.user.name;
    const applicantEmail = email || req.user.email;

    if (!applicantName || !applicantEmail || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required applicant fields: fullName, email, and phone are mandatory.',
      });
    }

    // 1. Prepare raw alternative metrics
    const metrics = {
      wallet_transaction_frequency: Number(wallet_transaction_frequency ?? 25),
      avg_utility_days_late: Number(avg_utility_days_late ?? 2),
      prepaid_recharge_regularity: Number(prepaid_recharge_regularity ?? 75),
      gig_platform_rating: Number(gig_platform_rating ?? 4.5),
      microloan_repayment_ratio: Number(microloan_repayment_ratio ?? 0.92),
      monthly_income_estimate: Number(monthlyIncomeEstimate ?? 1200),
    };

    // 2. Score via Python AI microservice (XGBoost + SHAP + Ollama)
    let aiResponse;
    try {
      aiResponse = await scoreApplicantWithAI({
        fullName: applicantName,
        requestedLoanAmount,
        ...metrics,
      });
    } catch (aiErr) {
      return res.status(502).json({
        success: false,
        error: `Failed to score applicant with AI Microservice: ${aiErr.message}. Ensure Python FastAPI is running on port 8000.`,
      });
    }

    const aiResults = {
      defaultProbability: aiResponse.defaultProbability,
      trustScore: aiResponse.trustScore,
      creditTier: aiResponse.creditTier,
      shapValues: aiResponse.shapValues,
      riskAssessmentReport: aiResponse.riskAssessmentReport,
      llmModelUsed: aiResponse.llmModelUsed,
      scoredAt: new Date(),
    };

    // Determine initial status based on AI Score
    let initialStatus = 'PENDING';
    if (aiResponse.trustScore >= 80) {
      initialStatus = 'APPROVED';
    } else if (aiResponse.trustScore < 45) {
      initialStatus = 'REJECTED';
    } else {
      initialStatus = 'MANUAL_REVIEW';
    }

    // Create and save Applicant demographics
    const applicantDoc = new Applicant({
      fullName: applicantName,
      email: applicantEmail,
      phone,
      nationalId,
      employmentType: employmentType || 'gig_worker',
      city: city || 'Urban Region',
      monthlyIncomeEstimate: metrics.monthly_income_estimate,
      requestedLoanAmount: Number(requestedLoanAmount || 1500),
      loanPurpose: loanPurpose || 'Working Capital',
    });
    const savedApplicant = await applicantDoc.save();

    // Create and save ApplicationRecord strictly to MongoDB
    const applicationDoc = new ApplicationRecord({
      userId: req.user._id,
      applicantId: req.user._id,
      applicantSnapshot: {
        fullName: applicantName,
        email: applicantEmail,
        phone,
        employmentType: savedApplicant.employmentType,
        city: savedApplicant.city,
        requestedLoanAmount: savedApplicant.requestedLoanAmount,
        loanPurpose: savedApplicant.loanPurpose,
      },
      metrics,
      aiResults,
      status: initialStatus,
    });

    const savedRecord = await applicationDoc.save();

    return res.status(201).json({
      success: true,
      message: 'Application scored and saved to MongoDB successfully.',
      data: savedRecord,
    });
  } catch (error) {
    console.error('[Create Application Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error processing credit application.',
    });
  }
});

/**
 * PATCH /api/applications/:id/status
 * Accessible ONLY by authenticated loan_officer.
 * Updates underwriting decision and stamps reviewer name.
 */
router.patch('/:id/status', verifyToken, requireRole('loan_officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updated = await ApplicationRecord.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          officerNotes: notes || '',
          reviewedBy: req.user.name || req.user.email || 'Loan Officer',
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Application record not found.' });
    }

    return res.json({
      success: true,
      message: `Status updated to ${status} by ${req.user.name}`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/applications/seed
 * Accessible only by authenticated loan_officer to seed demo profiles into MongoDB
 */
router.post('/seed', verifyToken, requireRole('loan_officer'), async (req, res) => {
  try {
    const samples = [
      {
        fullName: 'Elena Rostova',
        email: 'elena.rostova@deliverygig.io',
        phone: '+1 555-0144',
        employmentType: 'gig_worker',
        city: 'Metro North',
        monthlyIncomeEstimate: 2100,
        requestedLoanAmount: 1800,
        loanPurpose: 'Vehicle Maintenance & EV Scooter Battery',
        wallet_transaction_frequency: 74,
        avg_utility_days_late: 0.8,
        prepaid_recharge_regularity: 95,
        gig_platform_rating: 4.92,
        microloan_repayment_ratio: 0.99,
      },
      {
        fullName: 'Carlos Mendez',
        email: 'carlos.m@artisanworkshop.net',
        phone: '+1 555-0182',
        employmentType: 'street_vendor',
        city: 'East District',
        monthlyIncomeEstimate: 1450,
        requestedLoanAmount: 1200,
        loanPurpose: 'Seasonal Inventory Purchase',
        wallet_transaction_frequency: 42,
        avg_utility_days_late: 3.5,
        prepaid_recharge_regularity: 82,
        gig_platform_rating: 4.65,
        microloan_repayment_ratio: 0.91,
      },
      {
        fullName: 'Aisha Bello',
        email: 'aisha.bello@marketcoop.org',
        phone: '+1 555-0199',
        employmentType: 'micro_merchant',
        city: 'Central Market',
        monthlyIncomeEstimate: 1680,
        requestedLoanAmount: 1500,
        loanPurpose: 'Bulk Produce Refrigeration Unit',
        wallet_transaction_frequency: 58,
        avg_utility_days_late: 1.5,
        prepaid_recharge_regularity: 90,
        gig_platform_rating: 4.8,
        microloan_repayment_ratio: 0.96,
      },
      {
        fullName: 'David K. Osei',
        email: 'david.osei@quickhaul.biz',
        phone: '+1 555-0128',
        employmentType: 'freelancer',
        city: 'Westside',
        monthlyIncomeEstimate: 980,
        requestedLoanAmount: 1000,
        loanPurpose: 'Tools and Hardware Restock',
        wallet_transaction_frequency: 22,
        avg_utility_days_late: 12.0,
        prepaid_recharge_regularity: 62,
        gig_platform_rating: 4.1,
        microloan_repayment_ratio: 0.84,
      },
      {
        fullName: 'Marcus Vance',
        email: 'marcus.v@dailyworks.com',
        phone: '+1 555-0115',
        employmentType: 'daily_wage',
        city: 'Harbor Zone',
        monthlyIncomeEstimate: 620,
        requestedLoanAmount: 1400,
        loanPurpose: 'Emergency Medical & Family Expenses',
        wallet_transaction_frequency: 8,
        avg_utility_days_late: 28.5,
        prepaid_recharge_regularity: 32,
        gig_platform_rating: 3.4,
        microloan_repayment_ratio: 0.6,
      },
    ];

    const results = [];
    for (const sample of samples) {
      try {
        const aiScore = await scoreApplicantWithAI(sample);
        const aiResults = {
          defaultProbability: aiScore.defaultProbability,
          trustScore: aiScore.trustScore,
          creditTier: aiScore.creditTier,
          shapValues: aiScore.shapValues,
          riskAssessmentReport: aiScore.riskAssessmentReport,
          llmModelUsed: aiScore.llmModelUsed,
          scoredAt: new Date(),
        };

        const initialStatus =
          aiScore.trustScore >= 80 ? 'APPROVED' : aiScore.trustScore < 45 ? 'REJECTED' : 'MANUAL_REVIEW';

        const applicationDoc = await new ApplicationRecord({
          userId: req.user._id,
          applicantId: req.user._id,
          applicantSnapshot: {
            fullName: sample.fullName,
            email: sample.email,
            phone: sample.phone,
            employmentType: sample.employmentType,
            city: sample.city,
            requestedLoanAmount: sample.requestedLoanAmount,
            loanPurpose: sample.loanPurpose,
          },
          metrics: {
            wallet_transaction_frequency: sample.wallet_transaction_frequency,
            avg_utility_days_late: sample.avg_utility_days_late,
            prepaid_recharge_regularity: sample.prepaid_recharge_regularity,
            gig_platform_rating: sample.gig_platform_rating,
            microloan_repayment_ratio: sample.microloan_repayment_ratio,
            monthly_income_estimate: sample.monthlyIncomeEstimate,
          },
          aiResults,
          status: initialStatus,
        }).save();

        results.push(applicationDoc);
      } catch (err) {
        console.warn(`Failed seeding sample ${sample.fullName}:`, err.message);
      }
    }

    return res.json({
      success: true,
      message: `Seeded ${results.length} diverse applicants directly into MongoDB.`,
      seededCount: results.length,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
