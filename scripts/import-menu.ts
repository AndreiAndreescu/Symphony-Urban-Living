/**
 * Replaces the menu in the database with the one in content/site-content.ts.
 *   npm run menu:import
 * WARNING: edits made in /admin → Menu will be overwritten.
 */
import { PrismaClient } from "@prisma/client";
import { menuItems } from "../content/site-content";

const db = new PrismaClient();

async function main() {
  const [, deleted] = await db.$transaction([
    db.menuItem.count(),
    db.menuItem.deleteMany({}),
    db.menuItem.createMany({
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
    }),
  ]);
  console.log(`Menu replaced: removed ${deleted.count} items, imported ${menuItems.length} from content/site-content.ts.`);
  console.log("The live site refreshes the menu within an hour, or immediately after any save in /admin → Menu.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
