import { menuCategories } from "@/content/site-content";
import { MenuEditor } from "@/components/admin/MenuEditor";
import { PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { splitTags } from "@/lib/menu";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menu & prices" };

export default async function MenuAdminPage() {
  await requireUser("menu");
  const items = await db.menuItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <PageTitle title="Menu & prices" subtitle="Changes appear on the website immediately after saving." />
      <MenuEditor
        categories={menuCategories}
        items={items.map((i) => ({
          id: i.id,
          categoryId: i.categoryId,
          name: i.name,
          description: i.description,
          price: i.price,
          bottlePrice: i.bottlePrice,
          tags: splitTags(i.tags),
          isSpecial: i.isSpecial,
          available: i.available,
          sortOrder: i.sortOrder,
        }))}
      />
    </>
  );
}
