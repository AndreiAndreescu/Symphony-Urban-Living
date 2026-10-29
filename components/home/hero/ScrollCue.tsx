/** Quiet "keep going" cue at the foot of the hero. CSS only — no JavaScript. */
export function ScrollCue({ href = "#story", className = "" }: { href?: string; className?: string }) {
  return (
    <a
      href={href}
      className={`group items-center gap-3.5 whitespace-nowrap text-[0.6rem] uppercase tracking-eyebrow text-cream-dim transition-colors duration-500 hover:text-cream ${className}`}
    >
      Scroll to discover
      <span className="relative block h-7 w-px overflow-hidden bg-cream/20" aria-hidden="true">
        <span className="absolute inset-x-0 top-0 h-3.5 bg-gradient-to-b from-gold to-transparent motion-safe:animate-cue-line" />
      </span>
    </a>
  );
}
