/**
 * Idempotent setup script — safe to run many times (also runs on every Netlify deploy).
 *  • creates the admin / owner / staff logins if they don't exist yet
 *  • stores default opening hours & capacity rules if none are saved
 *  • imports the menu from content/site-content.ts if the menu table is empty
 * It never overwrites data that was changed in /admin.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultBookingSettings, menuItems } from "../content/site-content";

const db = new PrismaClient();
const isProd = process.env.NODE_ENV === "production" || Boolean(process.env.NETLIFY);

const DEV_DEFAULTS = {
  admin: { email: "andreescuandrei190@gmail.com", password: "Symphony-Admin-2026!", name: "Site Admin" },
  owner: { email: "owner@symphony-urban-living.example", password: "Symphony-Owner-2026!", name: "Restaurant Owner" },
  staff: { email: "host@symphony-urban-living.example", password: "Symphony-Staff-2026!", name: "Host / Floor Manager" },
} as const;

async function ensureUser(role: "admin" | "owner" | "staff") {
  const prefix = role.toUpperCase();
  const email = (process.env[`${prefix}_EMAIL`] || DEV_DEFAULTS[role].email).trim().toLowerCase();
  const password = process.env[`${prefix}_PASSWORD`] || (isProd ? "" : DEV_DEFAULTS[role].password);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`  ✓ ${role.padEnd(5)} ${email} (already exists — unchanged)`);
    return;
  }
  if (!password) {
    console.warn(`  ! ${role.padEnd(5)} skipped: set ${prefix}_PASSWORD to create this login in production`);
    return;
  }
  if (isProd && password === DEV_DEFAULTS[role].password) {
    console.warn(`  ! ${role.padEnd(5)} is using the example password from .env.example — change it in /admin → Team`);
  }
  await db.user.create({
    data: { email, role, name: DEV_DEFAULTS[role].name, passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`  + ${role.padEnd(5)} ${email} created`);
}

async function main() {
  console.log("Seeding Symphony Urban Living…");
  console.log("• Logins");
  for (const role of ["admin", "owner", "staff"] as const) await ensureUser(role);

  console.log("• Booking settings");
  const settings = await db.setting.findUnique({ where: { key: "booking" } });
  if (!settings) {
    await db.setting.create({ data: { key: "booking", value: JSON.stringify(defaultBookingSettings) } });
    console.log("  + default opening hours & capacity saved");
  } else {
    console.log("  ✓ already configured — unchanged");
  }

  console.log("• Menu");
  const menuCount = await db.menuItem.count();
  if (menuCount === 0) {
    await db.menuItem.createMany({
      data: menuItems.map((item, index) => ({
        categoryId: item.category,
        name: item.name,
        description: item.description,
        price: item.price,
        bottlePrice: item.bottlePrice ?? null,
        tags: (item.tags ?? []).join(","),
        isSpecial: Boolean(item.special),
        sortOrder: index,
      })),
    });
    console.log(`  + ${menuItems.length} dishes imported from content/site-content.ts`);
  } else {
    console.log(`  ✓ ${menuCount} items already in database — unchanged (use npm run menu:import to replace)`);
  }
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
