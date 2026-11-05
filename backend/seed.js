import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';
import ApplicationRecord from './models/ApplicationRecord.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/credalt';

const sanitizeUri = (rawUri) => {
  try {
    return rawUri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1*****$3');
  } catch (e) {
    return 'mongodb://***';
  }
};

async function seed() {
  console.log(`[*] Connecting to MongoDB at: ${sanitizeUri(uri)}`);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[OK] Connected to MongoDB.');

    // 1. Create or update Demo Loan Officer
    const officerEmail = 'officer@credalt.io';
    let officer = await User.findOne({ email: officerEmail });
    if (!officer) {
      officer = new User({
        name: 'Sarah Jenkins (Senior Underwriter)',
        email: officerEmail,
        password: 'Password123!',
        role: 'loan_officer',
      });
      await officer.save();
      console.log(`[OK] Created Loan Officer account: ${officerEmail} (Password: Password123!)`);
    } else {
      officer.password = 'Password123!';
      officer.role = 'loan_officer';
      await officer.save();
      console.log(`[OK] Updated Loan Officer account: ${officerEmail} (Password: Password123!)`);
    }

    // 2. Create or update Demo Applicant
    const borrowerEmail = 'borrower@credalt.io';
    let borrower = await User.findOne({ email: borrowerEmail });
    if (!borrower) {
      borrower = new User({
        name: 'Carlos Mendez (Artisan Vendor)',
        email: borrowerEmail,
        password: 'Password123!',
        role: 'applicant',
      });
      await borrower.save();
      console.log(`[OK] Created Applicant account: ${borrowerEmail} (Password: Password123!)`);
    } else {
      borrower.password = 'Password123!';
      borrower.role = 'applicant';
      await borrower.save();
      console.log(`[OK] Updated Applicant account: ${borrowerEmail} (Password: Password123!)`);
    }

    // 3. Ensure borrower has at least one initial application record
    const existingApp = await ApplicationRecord.findOne({ userId: borrower._id });
    if (!existingApp) {
      const demoRecord = new ApplicationRecord({
        userId: borrower._id,
        applicantId: borrower._id,
        applicantSnapshot: {
          fullName: 'Carlos Mendez',
          email: borrowerEmail,
          phone: '+1 555-0182',
          employmentType: 'street_vendor',
          city: 'East District',
          requestedLoanAmount: 1200,
          loanPurpose: 'Seasonal Inventory Purchase',
        },
        metrics: {
          wallet_transaction_frequency: 42,
          avg_utility_days_late: 3.5,
          prepaid_recharge_regularity: 82,
          gig_platform_rating: 4.65,
          microloan_repayment_ratio: 0.91,
          monthly_income_estimate: 1450,
        },
        aiResults: {
          defaultProbability: 0.0002,
          trustScore: 100,
          creditTier: 'EXCELLENT',
          shapValues: [
            {
              feature: 'monthly_income_estimate',
              displayName: 'Estimated Monthly Cashflow',
              featureValue: 1450,
              shapValue: 26.461,
              impact: 'positive',
              description: 'Strong Estimated Monthly Cashflow boosted the trust score.',
            },
            {
              feature: 'avg_utility_days_late',
              displayName: 'Utility Payment Delinquency',
              featureValue: 3.5,
              shapValue: 22.406,
              impact: 'positive',
              description: 'Strong Utility Payment Delinquency boosted the trust score.',
            },
            {
              feature: 'wallet_transaction_frequency',
              displayName: 'Digital Wallet Activity',
              featureValue: 42,
              shapValue: 11.115,
              impact: 'positive',
              description: 'Strong Digital Wallet Activity boosted the trust score.',
            },
          ],
          riskAssessmentReport:
            'Carlos Mendez has received an AI Trust Score of 100/100, positioning them in the EXCELLENT credit band with an estimated default probability of 0.0%. Applicant demonstrates exemplary financial discipline characterized by strong Estimated Monthly Cashflow ($1,450) and on-time utility payments. Recommended for instant approval under prime micro-lending tiers with standard disbursement terms.',
          llmModelUsed: 'Qwen 2.5 Coder Engine (Resilient AI Synthesizer)',
          scoredAt: new Date(),
        },
        status: 'APPROVED',
        officerNotes: 'Verified merchant sales ledger and peer recommendations.',
        reviewedBy: 'Sarah Jenkins',
        reviewedAt: new Date(),
      });
      await demoRecord.save();
      console.log('[OK] Seeded sample approved loan application for demo borrower.');
    }

    console.log('\n[SUCCESS] Database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Loan Officer: officer@credalt.io | Password123!');
    console.log('Applicant:    borrower@credalt.io | Password123!');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('[!] Database Seeding Error:', err.message);
    process.exit(1);
  }
}

seed();

