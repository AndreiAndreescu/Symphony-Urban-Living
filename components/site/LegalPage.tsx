import { PageHero } from "@/components/site/PageHero";

export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={`Last updated: ${updated}`} />
      <article className="container-site pb-24 sm:pb-32">
        <div className="max-w-3xl space-y-5 text-[1.05rem] leading-relaxed text-cream-muted [&_a]:text-gold [&_a]:underline [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:text-cream [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:text-cream [&_ul]:space-y-2">
          {children}
        </div>
      </article>
    </>
  );
}
