/**
 * Emergency password reset / create login from the command line.
 *   npm run user:password -- someone@example.com "New-Password-123" [admin|owner|staff] ["Full Name"]
 * If the email doesn't exist yet, a new login is created with the given role (default: staff).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const [emailArg, password, role = "staff", name = "Team member"] = process.argv.slice(2);
  if (!emailArg || !password) {
    console.error('Usage: npm run user:password -- email@example.com "New-Password-123" [admin|owner|staff] ["Full Name"]');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("Password must be at least 10 characters.");
    process.exit(1);
  }
  if (!["admin", "owner", "staff"].includes(role)) {
    console.error("Role must be admin, owner or staff.");
    process.exit(1);
  }
  const email = emailArg.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    await db.user.update({ where: { email }, data: { passwordHash, active: true } });
    console.log(`Password updated for ${email} (${existing.role}). Existing sessions were signed out.`);
  } else {
    await db.user.create({ data: { email, passwordHash, role, name } });
    console.log(`Created ${role} login for ${email}.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
