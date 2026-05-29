import { connectDB } from './db';
import Settings from '@/models/Settings';

export async function getSettings() {
  await connectDB();
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
}
