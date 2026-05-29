import mongoose, { Schema, InferSchemaType, models } from 'mongoose';

const SettingsSchema = new Schema(
  {
    registrationFee: { type: Number, default: 500, min: 0 },
    qrCodeImage: { type: String, default: '' },
    certificateVerifyUrl: { type: String, default: process.env.CERTIFICATE_VERIFY_URL || 'https://example.com/verify' },
    registrationEnabled: { type: Boolean, default: true },
    qrEnabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type SettingsDocument = InferSchemaType<typeof SettingsSchema> & { _id: mongoose.Types.ObjectId };
export default models.Settings || mongoose.model('Settings', SettingsSchema);
