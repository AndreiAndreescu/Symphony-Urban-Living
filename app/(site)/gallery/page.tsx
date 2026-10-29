import type { Metadata } from "next";
import Link from "next/link";
import { gallery, site } from "@/content/site-content";
import { Reveal } from "@/components/motion/Reveal";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Gallery",
  description: `The dining room, terrace, bar and dishes at ${site.name}.`,
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery & ambiance"
        title="Candlelight, brass and open fire"
        intro="A look inside the dining room, the bar, the terrace and the kitchen. (Placeholder images — real photography coming soon.)"
      />
      <section className="container-site pb-24 sm:pb-32">
        <GalleryGrid images={gallery} />
        <Reveal className="mt-16 text-center">
          <p className="font-serif text-3xl sm:text-4xl">Better in person.</p>
          <Link href="/reservations" className="btn-primary mt-8">
            Reserve a table
          </Link>
        </Reveal>
      </section>
    </>
  );
}
