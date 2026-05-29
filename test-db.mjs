import nextEnv from '@next/env';
import mongoose from 'mongoose';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

console.log('Mongo URI exists:', !!process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI not found. Check .env.local location and variable name.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000
  });
  console.log('MongoDB connected successfully');
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error('MongoDB connection failed:');
  console.error(error);
  process.exit(1);
}
