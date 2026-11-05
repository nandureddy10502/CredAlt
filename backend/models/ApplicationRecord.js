import mongoose from 'mongoose';

const ShapFeatureSchema = new mongoose.Schema(
  {
    feature: { type: String, required: true },
    displayName: { type: String, required: true },
    featureValue: { type: mongoose.Schema.Types.Mixed, required: true },
    shapValue: { type: Number, required: true },
    impact: { type: String, enum: ['positive', 'negative', 'neutral'], required: true },
    description: { type: String },
  },
  { _id: false }
);

const ApplicationRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    // Denormalized applicant snapshot for fast independent queries
    applicantSnapshot: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      employmentType: { type: String, default: 'gig_worker' },
      city: { type: String, default: 'Urban Region' },
      requestedLoanAmount: { type: Number, default: 1500 },
      loanPurpose: { type: String, default: 'Working Capital' },
    },
    // Alternative data metrics
    metrics: {
      wallet_transaction_frequency: {
        type: Number,
        required: true,
        min: 0,
        description: 'Average monthly digital wallet transactions',
      },
      avg_utility_days_late: {
        type: Number,
        required: true,
        min: 0,
        description: 'Average days past due on electricity/water/gas bills',
      },
      prepaid_recharge_regularity: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        description: 'Prepaid phone/data recharge cadence consistency percentage',
      },
      gig_platform_rating: {
        type: Number,
        required: true,
        min: 1.0,
        max: 5.0,
        description: 'Average rating across gig/delivery/rideshare apps',
      },
      microloan_repayment_ratio: {
        type: Number,
        default: 0.92,
        min: 0,
        max: 1.0,
        description: 'Peer-to-peer / microloan on-time completion percentage',
      },
      monthly_income_estimate: {
        type: Number,
        required: true,
        min: 0,
        description: 'Estimated monthly cash inflows from digital traces',
      },
    },
    // AI / ML Scoring Results
    aiResults: {
      defaultProbability: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
      },
      trustScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      creditTier: {
        type: String,
        enum: ['EXCELLENT', 'GOOD', 'FAIR', 'HIGH_RISK'],
        required: true,
      },
      shapValues: [ShapFeatureSchema],
      riskAssessmentReport: {
        type: String,
        required: true,
      },
      llmModelUsed: {
        type: String,
        default: 'qwen2.5-coder (Ollama)',
      },
      scoredAt: {
        type: Date,
        default: Date.now,
      },
    },
    // Decisioning & Loan Officer Workflow
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW'],
      default: 'PENDING',
    },
    officerNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const ApplicationRecord =
  mongoose.models.ApplicationRecord || mongoose.model('ApplicationRecord', ApplicationRecordSchema);
export default ApplicationRecord;
