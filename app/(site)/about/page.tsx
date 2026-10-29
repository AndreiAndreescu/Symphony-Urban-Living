import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { about, site } from "@/content/site-content";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Our Story & Chef",
  description: `The story of ${site.name} and head chef ${about.chef.name}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const { intro, chef, values } = about;
  return (
    <>
      <PageHero eyebrow={intro.eyebrow} title={intro.title} />

      <section className="pb-24 sm:pb-32">
        <div className="container-site grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            {intro.body.map((p) => (
              <p key={p} className="mb-6 text-xl leading-relaxed text-cream-muted first:text-2xl first:text-cream">
                {p}
              </p>
            ))}
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image src={intro.image.src} alt={intro.image.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </Reveal>
        </div>
      </section>

      <section className="overflow-hidden border-y border-cream/10 bg-ink-800 py-24 sm:py-32" aria-labelledby="chef-title">
        <div className="container-site grid gap-14 md:grid-cols-[0.85fr_1.15fr] md:items-center lg:gap-24">
          <Reveal className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 -translate-x-5 translate-y-5 rounded-[2rem] border border-gold/40" aria-hidden="true" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <Image src={chef.image.src} alt={chef.image.alt} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow">{chef.role}</p>
              <h2 id="chef-title" className="mt-4 text-5xl sm:text-6xl">
                {chef.name}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              {chef.bio.map((p) => (
                <p key={p} className="mt-6 text-lg leading-relaxed text-cream-muted">
                  {p}
                </p>
              ))}
              <blockquote className="mt-10 border-l-2 border-gold pl-6 font-serif text-3xl italic leading-snug">“{chef.quote}”</blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32" aria-labelledby="values-title">
        <div className="container-site">
          <Reveal>
            <p className="eyebrow">What we believe</p>
            <h2 id="values-title" className="mt-4 text-4xl sm:text-5xl">
              Three things we don&apos;t compromise on
            </h2>
          </Reveal>
          <Stagger as="ol" className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <StaggerItem as="li" key={v.title} className="card group p-8 transition-colors duration-500 hover:border-gold/30">
                <span className="font-serif text-5xl text-gold/60 transition-colors group-hover:text-gold">0{i + 1}</span>
                <h3 className="mt-6 text-2xl">{v.title}</h3>
                <p className="mt-3 leading-relaxed text-cream-muted">{v.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-16 flex flex-col gap-3 sm:flex-row">
            <Link href="/reservations" className="btn-primary">
              Reserve a table
            </Link>
            <Link href="/menu" className="btn-ghost">
              See the menu
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
