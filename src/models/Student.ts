import mongoose, { Schema, InferSchemaType, models } from 'mongoose';

const StudentSchema = new Schema(
  {
    registrationId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    mobile: { type: String, required: true, trim: true, index: true },
    alternateMobile: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    collegeName: { type: String, required: true },
    customCollegeName: { type: String, trim: true },
    registrationNumber: { type: String, required: true, trim: true, index: true },
    branch: { type: String, required: true },
    customBranch: { type: String, trim: true },
    session: { type: String, required: true },
    customSession: { type: String, trim: true },
    paymentStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending', index: true },
    paymentMode: { type: String, enum: ['Razorpay', 'ManualQR'], default: 'ManualQR', index: true },
    paymentId: { type: String, trim: true, index: true },
    utrNumber: { type: String, trim: true, index: true },
    razorpayOrderId: { type: String, trim: true },
    paymentScreenshot: { type: String },
    paymentTimestamp: { type: Date },
    verifiedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String }
  },
  { timestamps: true }
);

export type StudentDocument = InferSchemaType<typeof StudentSchema> & { _id: mongoose.Types.ObjectId };
export default models.Student || mongoose.model('Student', StudentSchema);
