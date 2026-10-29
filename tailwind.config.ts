import type { Config } from "tailwindcss";

// Brand palette. Change these values to re-theme the whole site.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.ts"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0D0C0B", // page background
          900: "#0D0C0B",
          800: "#15130F",
          700: "#1C1915",
          600: "#26221C",
          500: "#35302A",
        },
        cream: {
          DEFAULT: "#F4ECDE", // primary text
          muted: "#CFC4B2",
          dim: "#A39884",
        },
        gold: {
          DEFAULT: "#CDA85E",
          light: "#E3C88F",
          dark: "#9C7C3C",
        },
        emerald: {
          DEFAULT: "#1E4A3D",
          light: "#2C6553",
          dark: "#123128",
        },
        burgundy: {
          DEFAULT: "#6B2232",
          light: "#8A3446",
        },
        danger: "#F0968B",
        success: "#86D0AE",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.28em",
      },
      maxWidth: {
        site: "82rem",
      },
      keyframes: {
        drift1: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(8%, -6%, 0) scale(1.15)" },
        },
        drift2: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1.1)" },
          "50%": { transform: "translate3d(-10%, 7%, 0) scale(0.95)" },
        },
        drift3: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(5%, 9%, 0) scale(1.2)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translate3d(0, 0.6em, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        // Starts at 1% opacity (never 0, never clipped) so the browser counts the
        // headline as painted immediately — keeps LCP fast while still animating in
        focusIn: {
          "0%": { opacity: "0.01", filter: "blur(12px)", transform: "translate3d(0, 0.12em, 0)" },
          "100%": { opacity: "1", filter: "blur(0)", transform: "translate3d(0, 0, 0)" },
        },
        cue: {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "50%": { transform: "translateY(10px)", opacity: "1" },
        },
        // Headline lines rise out of their mask, one after the other
        lineRise: {
          "0%": { opacity: "0", transform: "translate3d(0, 108%, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        // Hero room: surfaces out of the dark and settles from a slight zoom
        stageIn: {
          "0%": { opacity: "0", transform: "scale(1.06)" },
          "40%": { opacity: "1" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Hero plate: opens like an iris while it settles into place
        plateReveal: {
          "0%": { opacity: "0", clipPath: "circle(12% at 50% 50%)", transform: "scale(1.12)" },
          "30%": { opacity: "1" },
          "100%": { opacity: "1", clipPath: "circle(75% at 50% 50%)", transform: "scale(1)" },
        },
        // The plate breathes and turns a hair while it's on show, so no frame is
        // ever frozen (1.00 → 1.03 → 1.00)
        plateBreathe: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
          "50%": { transform: "translate3d(-0.4%, -0.8%, 0) scale(1.03) rotate(1.4deg)" },
        },
        // The room behind breathes on a longer, unrelated cycle
        roomBreathe: {
          "0%": { transform: "scale(1) translate3d(0, 0, 0)" },
          "100%": { transform: "scale(1.05) translate3d(-1.2%, -0.6%, 0)" },
        },
        // A soft band of warm light crosses the room, then rests
        lightSweep: {
          "0%": { opacity: "0", transform: "translate3d(-120%, 0, 0) rotate(14deg)" },
          "12%": { opacity: "1" },
          "58%": { opacity: "1" },
          "70%, 100%": { opacity: "0", transform: "translate3d(260%, 0, 0) rotate(14deg)" },
        },
        // Warm motes rising from the candles; drift comes from --drift per mote
        emberRise: {
          "0%": { opacity: "0", transform: "translate3d(0, 0, 0) scale(0.6)" },
          "15%": { opacity: "var(--glow, 0.5)" },
          "70%": { opacity: "calc(var(--glow, 0.5) * 0.6)" },
          "100%": { opacity: "0", transform: "translate3d(var(--drift, 0px), -72svh, 0) scale(1)" },
        },
        // Pool of light under the plate, drifting as if from a candle
        glowDrift: {
          "0%, 100%": { opacity: "1", transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { opacity: "0.72", transform: "translate3d(2%, -1.5%, 0) scale(1.06)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        // Occasional sheen across the reservation button
        sheen: {
          "0%": { transform: "translateX(-130%) skewX(-18deg)" },
          "22%, 100%": { transform: "translateX(230%) skewX(-18deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Hairlines draw from their origin
        drawX: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        // Light travelling down the scroll cue
        cueLine: {
          "0%": { transform: "translateY(-100%)" },
          "60%, 100%": { transform: "translateY(400%)" },
        },
      },
      animation: {
        rise: "rise 1.1s cubic-bezier(0.22, 1, 0.36, 1) both",
        "focus-in": "focusIn 1.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        cue: "cue 2.4s ease-in-out infinite",
        drift1: "drift1 26s ease-in-out infinite",
        drift2: "drift2 32s ease-in-out infinite",
        drift3: "drift3 38s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        "line-rise": "lineRise 1.15s cubic-bezier(0.22, 1, 0.36, 1) both",
        "stage-in": "stageIn 2.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        "plate-reveal": "plateReveal 2.2s cubic-bezier(0.16, 1, 0.3, 1) both",
        "plate-breathe": "plateBreathe 11s ease-in-out infinite",
        "room-breathe": "roomBreathe 26s ease-in-out infinite alternate",
        "light-sweep": "lightSweep 19s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "ember-rise": "emberRise 18s linear infinite",
        "glow-drift": "glowDrift 13s ease-in-out infinite",
        orbit: "orbit 36s linear infinite",
        sheen: "sheen 8s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "fade-in": "fadeIn 1.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "draw-x": "drawX 1.2s cubic-bezier(0.65, 0, 0.35, 1) both",
        "cue-line": "cueLine 2.8s cubic-bezier(0.65, 0, 0.35, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
