import mongoose from 'mongoose';

const ApplicantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Applicant full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    nationalId: {
      type: String,
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ['gig_worker', 'street_vendor', 'freelancer', 'artisan', 'daily_wage', 'micro_merchant', 'other'],
      default: 'gig_worker',
    },
    city: {
      type: String,
      default: 'Metropolitan',
    },
    monthlyIncomeEstimate: {
      type: Number,
      required: true,
      min: 0,
    },
    requestedLoanAmount: {
      type: Number,
      required: true,
      min: 100,
    },
    loanPurpose: {
      type: String,
      default: 'Working Capital / Equipment',
    },
  },
  { timestamps: true }
);

export const Applicant = mongoose.models.Applicant || mongoose.model('Applicant', ApplicantSchema);
export default Applicant;
