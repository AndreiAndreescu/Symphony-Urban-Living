import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: { src: string; alt: string };
  children?: React.ReactNode;
};

/** Header band for inner pages: dramatic, image-backed, but lightweight. */
export function PageHero({ eyebrow, title, intro, image, children }: Props) {
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-36 sm:pb-24 sm:pt-44">
      {image ? (
        <>
          <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className="-z-20 object-cover opacity-40" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/80 to-ink" />
        </>
      ) : (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(205,168,94,0.16),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(30,74,61,0.35),transparent_55%)]" />
      )}
      {/* Above the fold: CSS-only entrance so the heading paints before JavaScript loads */}
      <div className="container-site">
        <p className="eyebrow animate-rise">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl animate-focus-in text-[2.6rem] leading-[1.05] [animation-delay:60ms] sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <div className="gold-rule mt-8 animate-rise [animation-delay:200ms]" />
        {intro && <p className="mt-8 max-w-2xl text-lg leading-relaxed text-cream-muted">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-4xl leading-[1.1] sm:text-5xl">{title}</h2>
      {intro && <p className="mt-6 text-lg leading-relaxed text-cream-muted">{intro}</p>}
    </Reveal>
  );
}
