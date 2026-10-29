import { unstable_cache } from "next/cache";
import { menuCategories, menuItems as seedItems } from "@/content/site-content";
import { db } from "@/lib/db";

export const MENU_TAG = "menu";

export type PublicMenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  bottlePrice: number | null;
  tags: string[];
  isSpecial: boolean;
};

export type PublicMenuCategory = { id: string; title: string; blurb: string; items: PublicMenuItem[] };

export function splitTags(tags: string): string[] {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function fromContentFile(): PublicMenuItem[] {
  return seedItems.map((item, i) => ({
    id: `seed-${i}`,
    categoryId: item.category,
    name: item.name,
    description: item.description,
    price: item.price,
    bottlePrice: item.bottlePrice ?? null,
    tags: item.tags ?? [],
    isSpecial: Boolean(item.special),
  }));
}

async function loadMenu(): Promise<PublicMenuCategory[]> {
  let items: PublicMenuItem[];
  try {
    const total = await db.menuItem.count();
    if (total === 0) {
      items = fromContentFile();
    } else {
      const rows = await db.menuItem.findMany({
        where: { available: true },
        orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      });
      items = rows.map((r) => ({
        id: r.id,
        categoryId: r.categoryId,
        name: r.name,
        description: r.description,
        price: r.price,
        bottlePrice: r.bottlePrice,
        tags: splitTags(r.tags),
        isSpecial: r.isSpecial,
      }));
    }
  } catch (error) {
    console.error("[menu] database unavailable, using content file:", error);
    items = fromContentFile();
  }

  return menuCategories.map((c) => ({ ...c, items: items.filter((i) => i.categoryId === c.id) }));
}

/** Cached; invalidated with revalidateTag("menu") when edited in /admin. */
export const getMenu = unstable_cache(loadMenu, ["public-menu"], { tags: [MENU_TAG], revalidate: 3600 });
