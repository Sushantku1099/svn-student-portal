import mongoose, { Schema, InferSchemaType, models } from 'mongoose';

const AdminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' }
  },
  { timestamps: true }
);

export type AdminDocument = InferSchemaType<typeof AdminSchema> & { _id: mongoose.Types.ObjectId };
export default models.Admin || mongoose.model('Admin', AdminSchema);
