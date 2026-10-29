import type { Metadata } from "next";
import Link from "next/link";
import { dietaryTags, menuNote, site } from "@/content/site-content";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { formatPrice } from "@/lib/format";
import { getMenu, type PublicMenuItem } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Menu",
  description: `Seasonal starters, wood-fired mains, desserts, cocktails and wine at ${site.name}. Prices in RON.`,
  alternates: { canonical: "/menu" },
};

function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <span className="ml-2 inline-flex translate-y-[-2px] gap-1 align-middle">
      {tags.map((t) => (
        <abbr
          key={t}
          title={dietaryTags[t] ?? t}
          className="rounded border border-cream/20 px-1.5 py-px text-[0.65rem] font-medium tracking-wide text-cream-muted no-underline"
        >
          {t}
        </abbr>
      ))}
    </span>
  );
}

function Price({ item }: { item: PublicMenuItem }) {
  if (item.bottlePrice) {
    return (
      <span className="whitespace-nowrap text-right">
        <span className="sr-only">Glass </span>
        {item.price}
        <span className="text-cream-dim"> / </span>
        <span className="sr-only">bottle </span>
        {formatPrice(item.bottlePrice)}
      </span>
    );
  }
  return <span className="whitespace-nowrap">{formatPrice(item.price)}</span>;
}

function MenuRow({ item }: { item: PublicMenuItem }) {
  return (
    <div className="group -mx-4 rounded-xl px-4 py-5 transition-colors duration-300 hover:bg-cream/[0.035]">
      <div className="flex items-baseline gap-3">
        <h3 className="font-serif text-xl text-cream transition-colors duration-300 group-hover:text-gold-light sm:text-[1.35rem]">
          {item.name}
          <Tags tags={item.tags} />
        </h3>
        <span className="mb-1 min-w-6 flex-1 border-b border-dotted border-cream/20" aria-hidden="true" />
        <span className="font-medium text-gold transition-transform duration-300 group-hover:-translate-x-0.5">
          <Price item={item} />
        </span>
      </div>
      {item.description && <p className="mt-1.5 max-w-[46ch] text-cream-muted">{item.description}</p>}
    </div>
  );
}

export default async function MenuPage() {
  const menu = await getMenu();
  const specials = menu.flatMap((c) => c.items.filter((i) => i.isSpecial));

  return (
    <>
      <PageHero
        eyebrow="Menu"
        title="Cooked with the season"
        intro="Our menu follows the market. Dishes and prices can change weekly — the specials below are this season's favourites."
        image={{ src: "/images/open-kitchen.jpg", alt: "Open kitchen with wood-fired grill" }}
      />

      {/* Category jump links */}
      <nav aria-label="Menu sections" className="sticky top-[72px] z-30 border-y border-cream/10 bg-ink/90 backdrop-blur-md">
        <ul className="container-site flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          {specials.length > 0 && (
            <li>
              <a href="#specials" className="block whitespace-nowrap rounded-full border border-gold/50 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-ink">
                Chef&apos;s specials
              </a>
            </li>
          )}
          {menu.filter((c) => c.items.length).map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className="block whitespace-nowrap rounded-full border border-cream/15 px-4 py-2 text-sm text-cream-muted transition-colors hover:border-cream/40 hover:text-cream">
                {c.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {specials.length > 0 && (
        <section id="specials" className="scroll-mt-40 pt-20" aria-labelledby="specials-title">
          <div className="container-site">
            <Reveal className="relative overflow-hidden rounded-[2rem] border border-gold/40 bg-gradient-to-br from-emerald-dark via-ink-800 to-burgundy/40 p-7 sm:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
              <p className="eyebrow">Seasonal · this week</p>
              <h2 id="specials-title" className="mt-3 text-4xl sm:text-5xl">
                Chef&apos;s specials
              </h2>
              <Stagger className="mt-8 grid gap-x-12 md:grid-cols-2">
                {specials.map((item) => (
                  <StaggerItem key={item.id}>
                    <MenuRow item={item} />
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>
          </div>
        </section>
      )}

      <div className="container-site py-12 sm:py-20">
        {menu
          .filter((c) => c.items.length)
          .map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-40 border-b border-cream/10 py-14 last:border-0" aria-labelledby={`${category.id}-title`}>
              <div className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-16">
                <Reveal className="lg:sticky lg:top-44 lg:self-start">
                  <h2 id={`${category.id}-title`} className="text-4xl sm:text-5xl">
                    {category.title}
                  </h2>
                  <p className="mt-3 text-cream-dim">{category.blurb}</p>
                  {category.id === "wine" && <p className="mt-2 text-sm text-cream-dim">Prices: glass / bottle</p>}
                </Reveal>
                <Stagger className="grid gap-x-12 md:grid-cols-2">
                  {category.items.map((item) => (
                    <StaggerItem key={item.id}>
                      <MenuRow item={item} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </section>
          ))}

        <Reveal className="mt-10 flex flex-col items-start justify-between gap-8 rounded-2xl border border-cream/10 p-8 md:flex-row md:items-center">
          <div className="max-w-2xl text-sm leading-relaxed text-cream-muted">
            <p>{menuNote}</p>
            <p className="mt-3">
              {Object.entries(dietaryTags)
                .map(([k, v]) => `${k} — ${v}`)
                .join(" · ")}
            </p>
          </div>
          <Link href="/reservations" className="btn-primary shrink-0">
            Reserve a table
          </Link>
        </Reveal>
      </div>
    </>
  );
}
