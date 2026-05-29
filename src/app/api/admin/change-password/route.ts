import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin, hashPassword, verifyPassword } from "@/lib/auth";
import Admin from "@/models/Admin";
import { ok, fail } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";

export async function PATCH(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`change-password:${ip}`, 5, 60_000).success)
      return fail("Too many attempts. Please wait.", 429);

    const currentAdmin = await requireAdmin();
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword)
      return fail("Current password and new password are required", 422);
    if (String(newPassword).length < 8)
      return fail("New password must be at least 8 characters", 422);

    await connectDB();
    const admin = await Admin.findById(currentAdmin._id);
    if (!admin) return fail("Admin not found", 404);

    const valid = await verifyPassword(
      String(currentPassword),
      admin.passwordHash,
    );
    if (!valid) return fail("Current password is incorrect", 401);

    admin.passwordHash = await hashPassword(String(newPassword));
    await admin.save();

    return ok({ message: "Password changed successfully" });
  } catch {
    return fail("Unauthorized", 401);
  }
}
