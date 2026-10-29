/**
 * Layer 1b of the hero: the air in the room. A soft band of warm light that
 * crosses the frame every so often, and a few motes rising from the candles.
 *
 * Pure CSS (transform and opacity only), so it runs on the compositor and costs
 * no JavaScript. Every element rests invisible, so the reduced-motion rule in
 * globals.css leaves a clean still frame. Pauses with the rest of the hero when
 * it is off-screen (see `[data-idle]` in globals.css).
 */

// Hand-placed rather than random, so server and client render the same markup
// and the spread looks composed. [left %, size px, duration s, delay s, drift px, glow]
const MOTES: [number, number, number, number, number, number][] = [
  [8, 3, 19, -2, 24, 0.45],
  [17, 2, 23, -11, -18, 0.35],
  [26, 4, 17, -6, 30, 0.4],
  [34, 2, 25, -17, -12, 0.3],
  [45, 3, 21, -9, 20, 0.45],
  [53, 2, 18, -14, -26, 0.35],
  [61, 4, 24, -3, 16, 0.5],
  [68, 2, 20, -19, -20, 0.35],
  [74, 3, 16, -8, 28, 0.45],
  [81, 2, 22, -12, -14, 0.3],
  [88, 4, 19, -5, 18, 0.4],
  [94, 2, 26, -21, -22, 0.35],
];

export function HeroAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Light sweep: a wide, very faint band, so it reads as light, not a shape */}
      <div className="absolute -inset-y-1/4 left-0 w-[45%] bg-[linear-gradient(90deg,transparent,rgba(227,200,143,0.07)_45%,rgba(255,236,200,0.09)_50%,rgba(227,200,143,0.07)_55%,transparent)] opacity-0 motion-safe:animate-light-sweep [animation-delay:2.4s]" />

      {MOTES.map(([left, size, duration, delay, drift, glow], i) => (
        <span
          key={i}
          // Half the motes on phones: the frame is smaller, the effect should be too
          className={`absolute -bottom-2 rounded-full bg-gold-light opacity-0 blur-[1px] motion-safe:animate-ember-rise ${i % 2 ? "max-sm:hidden" : ""}`}
          style={
            {
              left: `${left}%`,
              width: size,
              height: size,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              "--drift": `${drift}px`,
              "--glow": glow,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
