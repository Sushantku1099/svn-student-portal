import nextEnv from '@next/env';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is required. Check that .env.local exists in the project root.');

const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'ChangeMe@12345';

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    passwordHash: String,
    role: String
  },
  { timestamps: true }
);

const SettingsSchema = new mongoose.Schema(
  {
    registrationFee: { type: Number, default: 500 },
    qrCodeImage: { type: String, default: '' },
    certificateVerifyUrl: {
      type: String,
      default: process.env.CERTIFICATE_VERIFY_URL || 'https://example.com/verify'
    },
    registrationEnabled: { type: Boolean, default: true },
    qrEnabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

await mongoose.connect(uri);

const passwordHash = await bcrypt.hash(password, 12);

await Admin.findOneAndUpdate(
  { username },
  { username, passwordHash, role: 'superadmin' },
  { upsert: true, new: true }
);

await Settings.findOneAndUpdate(
  {},
  {},
  { upsert: true, new: true, setDefaultsOnInsert: true }
);

console.log(`Admin ready: ${username}`);
await mongoose.disconnect();
