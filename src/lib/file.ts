import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const QR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

async function uploadToCloudinary(file: File, folder: 'payment-proofs' | 'qr') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: `svn-student-portal/${folder}`,
    resource_type: file.type === 'application/pdf' ? 'raw' : 'image',
    public_id: `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`
  });

  return result.secure_url;
}

async function uploadLocally(file: File, folder: 'payment-proofs' | 'qr') {
  const ext = file.name.split('.').pop()?.toLowerCase() || (file.type.includes('png') ? 'png' : 'jpg');
  const safeName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, safeName), buffer);
  return `/uploads/${folder}/${safeName}`;
}

export async function saveUploadedFile(file: File, folder: 'payment-proofs' | 'qr') {
  const maxMb = Number(process.env.MAX_UPLOAD_MB || 3);
  if (file.size > maxMb * 1024 * 1024) throw new Error(`File must be less than ${maxMb}MB`);

  const allowed = folder === 'qr' ? QR_ALLOWED_TYPES : ALLOWED_TYPES;
  if (!allowed.includes(file.type)) throw new Error('Unsupported file type');

  // Vercel/serverless filesystems are not persistent. Use Cloudinary when configured.
  if (hasCloudinaryConfig()) return uploadToCloudinary(file, folder);

  // Local/VPS fallback.
  return uploadLocally(file, folder);
}
