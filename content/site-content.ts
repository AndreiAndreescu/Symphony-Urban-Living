/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SYMPHONY URBAN LIVING — SITE CONTENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  This is the ONE file to edit when the real branding, texts, menu, prices,
 *  chef bio, address and photos arrive. Components never hard-code business
 *  text — they read everything from here.
 *
 *  Everything below is realistic PLACEHOLDER content so the site is demo-able.
 *  Search this file for "TODO" to find what must be replaced before launch.
 *
 *  Notes
 *  • Prices are in RON, whole numbers.
 *  • Photos live in /public/images. To swap a photo, drop the real file in that
 *    folder and change the `src` below (keep good `alt` text — it matters for
 *    accessibility and Google).
 *  • The MENU below seeds the database the first time the site is set up.
 *    After that, prices and dishes are edited in /admin → Menu (instant, no
 *    code). To re-import this file into the database run: npm run menu:import
 *  • OPENING HOURS below are the defaults. After setup they are edited in
 *    /admin → Settings.
 * ════════════════════════════════════════════════════════════════════════════
 */

// ─── Brand ──────────────────────────────────────────────────────────────────
export const site = {
  name: "Symphony Urban Living",
  shortName: "Symphony Urban Living",
  tagline: "Fire, season & slow evenings",
  description:
    "Symphony Urban Living is a modern European restaurant and cocktail bar in București — seasonal Romanian produce, an open wood-fired kitchen and a terrace made for long evenings.",
  // Logo: text wordmark by default. To use an image logo, put it in /public/images
  // and set e.g. logo: { src: "/images/logo.svg", width: 160, height: 40 }
  logo: null as null | { src: string; width: number; height: number },
  locale: "en",
  timezone: "Europe/Bucharest",
  currency: "RON",
  priceRange: "$$$", // for Google: $ … $$$$
  cuisines: ["Modern European", "Romanian", "Mediterranean"],

  // Short location line shown under the name (header menu, footer, emails, social card)
  locationLine: "Sector 3 · București",

  // TODO: replace the email with the real reservations inbox
  contact: {
    phone: "+40 769 669 875",
    email: "reservations@symphony-urban-living.example",
    address: {
      street: "Str. Moților nr. 16, Sector 3",
      city: "București",
      region: "București",
      postalCode: "", // TODO: add the postal code (hidden while empty)
      country: "RO",
      countryName: "Romania",
    },
    // Text used for the Google Maps embed and "Get directions" link
    mapQuery: "Str. Moților nr. 16, Sector 3, București, Romania",
    // Optional — improves the Google listing. Left empty on purpose: set the
    // exact coordinates of the entrance (from Google Maps) once confirmed.
    geo: null as null | { lat: number; lng: number },
  },

  social: {
    instagram: "", // TODO e.g. "https://instagram.com/…"
    facebook: "",
  },

  // Company details shown in the privacy policy (GDPR data controller)
  legal: {
    companyName: "Symphony Urban Living SRL",
    registrationNumber: "J00/0000/2026", // TODO: real trade register number
    vatNumber: "RO00000000", // TODO: real CUI / VAT number
    privacyEmail: "privacy@symphony-urban-living.example", // TODO: real privacy inbox
    policyLastUpdated: "15 September 2026",
    consentVersion: "2026-09", // bump when the privacy policy changes materially
  },
};

// ─── Navigation ─────────────────────────────────────────────────────────────
export const navigation = [
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Story & Chef" },
  { href: "/gallery", label: "Gallery" },
  { href: "/private-events", label: "Private Events" },
  { href: "/contact", label: "Contact" },
];

// ─── Home page ──────────────────────────────────────────────────────────────
export const home = {
  hero: {
    eyebrow: "Restaurant & cocktail bar · București",
    // Shown under the restaurant name, which is the headline itself
    title: "Where the evening slows down",
    subtitle:
      "Seasonal Romanian produce, an open wood-fired kitchen and cocktails poured with intent — in the heart of Sector 3.",
    primaryCta: "Reserve a table",
    secondaryCta: "Explore the menu",
    // Atmosphere behind everything, darkened and softened by the page. TODO: replace
    // with the best real photograph of the room (landscape, at least 2400px wide,
    // dark and warm works best).
    image: {
      src: "/images/hero-dining-room.jpg",
      alt: "Candle-lit tables in the Symphony Urban Living dining room during evening service (placeholder image)",
    },
    // The dishes that float over the room like product shots. The hero slowly
    // cycles through them (a still first plate for visitors who prefer reduced
    // motion). TODO: replace each with a real top-down photo of the plate, cut
    // out onto a TRANSPARENT background (square PNG or WebP, at least 1600px,
    // plate filling the frame). `dish` must match a dish name in the menu.
    plates: [
      { src: "/images/hero-plate.png", dish: "Seared Scallops", alt: "Seared scallops with brown butter and herbs on an ivory plate (placeholder image)" },
      { src: "/images/hero-plate-lamb.png", dish: "Wood-fired Lamb Rack", alt: "Herb-crusted lamb cutlets over smoked aubergine on a charcoal plate (placeholder image)" },
      { src: "/images/hero-plate-risotto.png", dish: "Wild Mushroom Risotto", alt: "Wild mushroom risotto with thyme and aged cheese in a shallow bowl (placeholder image)" },
      { src: "/images/hero-plate-tart.png", dish: "Burnt Honey Tart", alt: "A slice of burnt honey tart with sour cream ice cream (placeholder image)" },
    ],
  },
  story: {
    eyebrow: "The concept",
    title: "A neighbourhood restaurant worth crossing town for",
    body: [
      "We cook the way the seasons tell us to. Black Sea fish arrives in the morning, vegetables come from small farms in Dobrogea, and everything that can meet an open flame does.",
      "The room is warm and unhurried: brass, walnut and candlelight inside, olive trees and string lights on the terrace. Stay for one glass or for the whole night.",
    ],
    image: { src: "/images/interior-dining-room.jpg", alt: "Warm, candle-lit dining room with walnut tables (placeholder image)" },
    stats: [
      { value: "70", label: "seats inside" },
      { value: "40", label: "on the terrace" },
      { value: "120+", label: "wines by the bottle" },
    ],
  },
  signatureTitle: "Signature plates",
  signatureSubtitle: "A few dishes guests come back for. The full menu changes with the season.",
  // Names must match dish names in the menu below
  signatureDishes: [
    { name: "Seared Scallops", image: { src: "/images/dish-scallops.jpg", alt: "Seared scallops with brown butter (placeholder image)" } },
    { name: "Wood-fired Lamb Rack", image: { src: "/images/dish-lamb.jpg", alt: "Wood-fired lamb rack with herb crust (placeholder image)" } },
    { name: "Burnt Honey Tart", image: { src: "/images/dish-dessert.jpg", alt: "Burnt honey tart with sour cream ice cream (placeholder image)" } },
  ],
  ambienceBand: {
    image: { src: "/images/terrace-evening.jpg", alt: "Terrace at dusk with string lights (placeholder image)" },
    quote: "Long tables, low light, and no reason to rush.",
  },
  privateEventsTeaser: {
    eyebrow: "Private dining",
    title: "Your table, your evening",
    body: "Birthdays, business dinners, rehearsal dinners and celebrations — for 10 to 70 guests, with menus written for the occasion.",
    cta: "Plan an event",
    image: { src: "/images/private-dining.jpg", alt: "Private dining room set for a group dinner (placeholder image)" },
  },
};

// ─── Testimonials ───────────────────────────────────────────────────────────
// TODO: replace with REAL, verifiable guest reviews before launch.
// (EU consumer law prohibits invented reviews on a live commercial site.)
export const testimonials = [
  {
    quote: "The scallops alone are worth the trip, and the staff made our anniversary feel effortless.",
    author: "Ioana P.",
    context: "Guest review · placeholder",
  },
  {
    quote: "We came for one cocktail and stayed for dinner. Best terrace in town for a slow evening.",
    author: "Daniel & Maria",
    context: "Guest review · placeholder",
  },
  {
    quote: "A cocktail list with real personality and a kitchen that clearly loves Romanian produce.",
    author: "Local food guide",
    context: "Press quote · placeholder",
  },
];

// ─── Chef & story (About page) ──────────────────────────────────────────────
export const about = {
  intro: {
    eyebrow: "Our story",
    title: "Built around a fire, a market and a long table",
    body: [
      "Symphony Urban Living opened with a simple idea: cook honest, seasonal food with real technique, and serve it in a room where people want to linger.",
      "Neighbours drop in after work. Others come back for birthdays, first dates and Friday nights at the bar. Everyone gets the same welcome.",
    ],
    image: { src: "/images/bar-counter.jpg", alt: "Brass-lined cocktail bar with back-lit bottles (placeholder image)" },
  },
  // TODO: replace with the real chef's name, bio and photo
  chef: {
    name: "Matei Radu",
    role: "Head Chef",
    image: { src: "/images/chef-portrait.jpg", alt: "Portrait of the head chef in the kitchen (placeholder image)" },
    bio: [
      "Matei trained in Bucharest and spent eight years in kitchens in Lyon and San Sebastián before coming home to Romania.",
      "His cooking is rooted in the Romanian pantry — smoked fish, fermented vegetables, sheep's cheese, wild herbs — and finished with the precision of the French brigade.",
    ],
    quote: "I want every plate to taste like the week it was cooked in.",
  },
  values: [
    { title: "Seasonal first", body: "The menu follows the market, not the other way around. Specials change weekly." },
    { title: "Local producers", body: "Fish from Black Sea day boats, vegetables and cheese from farms within 150 km." },
    { title: "Open fire", body: "Our wood-fired grill and oven give everything from bread to lamb its character." },
  ],
};

// ─── Gallery ────────────────────────────────────────────────────────────────
// All images are PLACEHOLDERS — replace with real photography.
export const gallery = [
  { src: "/images/interior-dining-room.jpg", alt: "Dining room with candle-lit walnut tables", category: "Space", width: 1600, height: 1067 },
  { src: "/images/dish-scallops.jpg", alt: "Seared scallops with brown butter and citrus", category: "Dishes", width: 1600, height: 1067 },
  { src: "/images/bar-counter.jpg", alt: "Brass cocktail bar with back-lit shelves", category: "Bar", width: 1200, height: 1500 },
  { src: "/images/dish-lamb.jpg", alt: "Wood-fired lamb rack with herbs", category: "Dishes", width: 1600, height: 1067 },
  { src: "/images/terrace-evening.jpg", alt: "Terrace in the evening under string lights", category: "Space", width: 1600, height: 1067 },
  { src: "/images/cocktail-signature.jpg", alt: "Signature smoked cocktail in a coupe glass", category: "Bar", width: 1200, height: 1500 },
  { src: "/images/dish-dessert.jpg", alt: "Burnt honey tart with sour cream ice cream", category: "Dishes", width: 1600, height: 1067 },
  { src: "/images/private-dining.jpg", alt: "Private dining room set for twelve", category: "Space", width: 1600, height: 1067 },
  { src: "/images/wine-cellar.jpg", alt: "Wine wall with Romanian and European bottles", category: "Bar", width: 1200, height: 1500 },
  { src: "/images/dish-risotto.jpg", alt: "Wild mushroom risotto with aged cheese", category: "Dishes", width: 1600, height: 1067 },
  { src: "/images/open-kitchen.jpg", alt: "Open kitchen with wood-fired grill", category: "Kitchen", width: 1600, height: 1067 },
  { src: "/images/table-setting.jpg", alt: "Table set with linen, brass cutlery and candles", category: "Space", width: 1200, height: 1500 },
];

// ─── Private events ─────────────────────────────────────────────────────────
// TODO: PLACEHOLDER COPY — confirm the real spaces, capacities and services
// (menus, wine pairings, flowers, AV) with the restaurant before launch.
export const privateEvents = {
  eyebrow: "Private dining & events",
  title: "Gatherings worth remembering",
  intro:
    "From an intimate dinner for ten to a full buyout of the restaurant and terrace, our team looks after the details — a menu written for the occasion, wine pairings and a room set the way you want it.",
  image: { src: "/images/private-dining.jpg", alt: "Private dining room set for a group dinner (placeholder image)" },
  spaces: [
    { name: "The Private Room", capacity: "10 – 18 guests", body: "A walnut-panelled room set apart from the main dining room, with a single long table." },
    { name: "The Terrace", capacity: "up to 40 guests", body: "Olive trees, string lights and heaters for cooler nights. Ideal for receptions and summer parties." },
    { name: "Full Buyout", capacity: "up to 110 guests", body: "The whole restaurant, bar and terrace — for weddings, launches and corporate evenings." },
  ],
  occasions: ["Birthdays & anniversaries", "Business dinners", "Rehearsal dinners", "Product launches", "Company dinners", "Wine tastings"],
  contactNote: "Tell us the date, number of guests and the occasion — we reply within one working day with menus and a proposal.",
};

// ─── Reservations page ──────────────────────────────────────────────────────
export const reservations = {
  eyebrow: "Book a table",
  title: "Reserve your table",
  intro: "Choose a date, time and party size. We confirm every request by email — usually within the hour during opening times.",
  largeGroupNote: "Booking for a larger group or a private event? Call us or send an enquiry and we'll look after you.",
  cancellationNote: "Plans changed? Call or reply to your confirmation email — no fees, we just appreciate the notice.",
  seatingOptions: [
    { id: "indoor", label: "Dining room", description: "Warm, candle-lit, close to the open kitchen" },
    { id: "terrace", label: "Terrace", description: "Seasonal, weather permitting (Apr – Oct)" },
    { id: "private", label: "Private room", description: "For groups of 8+, subject to availability" },
  ],
  occasions: [
    { id: "birthday", label: "Birthday" },
    { id: "anniversary", label: "Anniversary" },
    { id: "business", label: "Business" },
    { id: "other", label: "Other celebration" },
  ],
};

// ─── Default opening hours & booking rules ──────────────────────────────────
// Used the first time the site is set up. After that, edit them in /admin → Settings.
// Index: 0 = Sunday, 1 = Monday … 6 = Saturday. [] = closed.
const lunch = { service: "lunch" as const, open: "12:00", close: "15:30" };
const dinner = { service: "dinner" as const, open: "18:30", close: "23:00" };
const lateDinner = { service: "dinner" as const, open: "18:30", close: "23:59" };

export const defaultBookingSettings = {
  hours: [
    [lunch, dinner], // Sunday
    [], // Monday — closed
    [lunch, dinner], // Tuesday
    [lunch, dinner], // Wednesday
    [lunch, dinner], // Thursday
    [lunch, lateDinner], // Friday
    [lunch, lateDinner], // Saturday
  ],
  services: {
    lunch: { maxCoversPerSlot: 16, slotIntervalMinutes: 30, lastSeatingMinutesBeforeClose: 90 },
    dinner: { maxCoversPerSlot: 24, slotIntervalMinutes: 30, lastSeatingMinutesBeforeClose: 120 },
  },
  maxPartySizeOnline: 10,
  minLeadMinutes: 120,
  maxDaysAhead: 60,
  closedDates: [] as string[],
  notifyEmails: [] as string[], // in addition to the NOTIFY_EMAILS env var
};

// ─── Menu ───────────────────────────────────────────────────────────────────
// Dietary tags: V = vegetarian, VG = vegan, GF = gluten free, N = contains nuts, S = spicy
export const dietaryTags: Record<string, string> = {
  V: "Vegetarian",
  VG: "Vegan",
  GF: "Gluten free",
  N: "Contains nuts",
  S: "Spicy",
};

export const menuCategories = [
  { id: "starters", title: "Starters", blurb: "To share, or not." },
  { id: "mains", title: "Mains", blurb: "From the wood-fired grill and the stove." },
  { id: "desserts", title: "Desserts", blurb: "Made in-house every morning." },
  { id: "cocktails", title: "Cocktails & Drinks", blurb: "Classic structure, local character." },
  { id: "wine", title: "Wine List", blurb: "Glass / bottle. Ask for the full cellar list." },
];

export type MenuSeedItem = {
  category: string;
  name: string;
  description: string;
  price: number;
  bottlePrice?: number;
  tags?: string[];
  special?: boolean;
};

export const menuNote =
  "Prices in RON, VAT included. Please tell your server about any allergies — a full allergen list is available on request.";

export const menuItems: MenuSeedItem[] = [
  // Starters
  { category: "starters", name: "Seared Scallops", description: "Brown butter, citrus, charred leek, hazelnut crumb", price: 78, tags: ["GF", "N"], special: true },
  { category: "starters", name: "Beef Tartare", description: "Hand-cut Transylvanian beef, smoked egg yolk, pickled shallot, rye crisp", price: 69 },
  { category: "starters", name: "Black Sea Mussels", description: "White wine, lovage, garlic cream, grilled sourdough", price: 58 },
  { category: "starters", name: "Burrata & Heirloom Tomatoes", description: "Dobrogea tomatoes, basil oil, aged balsamic", price: 54, tags: ["V", "GF"] },
  { category: "starters", name: "Zacuscă & Wood-fired Flatbread", description: "Smoked pepper and aubergine spread, whipped telemea, herbs", price: 36, tags: ["V"] },
  { category: "starters", name: "Autumn Squash Soup", description: "Roasted pumpkin seeds, brown butter, sage", price: 38, tags: ["V", "GF"], special: true },

  // Mains
  { category: "mains", name: "Wood-fired Lamb Rack", description: "Herb crust, smoked aubergine, mint salsa verde, lamb jus", price: 148, tags: ["GF"] },
  { category: "mains", name: "Black Sea Turbot", description: "Beurre blanc, mussels, samphire, crushed new potatoes", price: 136, tags: ["GF"], special: true },
  { category: "mains", name: "Dry-aged Ribeye 350 g", description: "Bone marrow butter, beef-fat chips, peppercorn sauce", price: 189, tags: ["GF"] },
  { category: "mains", name: "Duck Breast & Plums", description: "Roasted plums, celeriac purée, juniper jus", price: 118, tags: ["GF"] },
  { category: "mains", name: "Wild Mushroom Risotto", description: "Carnaroli rice, forest mushrooms, aged cheese, thyme", price: 82, tags: ["V", "GF"] },
  { category: "mains", name: "Charred Cauliflower", description: "Tahini, pomegranate, dukkah, green herbs", price: 72, tags: ["VG", "GF", "N"] },

  // Desserts
  { category: "desserts", name: "Burnt Honey Tart", description: "Acacia honey, sour cream ice cream, bee pollen", price: 42, tags: ["V"] },
  { category: "desserts", name: "Dark Chocolate Crémeux", description: "Sea salt, olive oil, sour cherries", price: 44, tags: ["V", "GF"] },
  { category: "desserts", name: "Papanași", description: "Warm cheese doughnuts, sour cream, wild blueberry jam", price: 39, tags: ["V"] },
  { category: "desserts", name: "Seasonal Sorbets", description: "Three scoops, ask your server for today's flavours", price: 32, tags: ["VG", "GF"] },

  // Cocktails & drinks
  { category: "cocktails", name: "House Old Fashioned", description: "Bourbon, smoked plum syrup, walnut bitters", price: 52, tags: ["N"] },
  { category: "cocktails", name: "Black Sea Spritz", description: "Aperitivo, sea buckthorn, prosecco, rosemary", price: 46 },
  { category: "cocktails", name: "Linden Gimlet", description: "Gin, linden blossom cordial, lime", price: 48 },
  { category: "cocktails", name: "Zero-proof Garden", description: "Cucumber, elderflower, verjus, tonic", price: 32, tags: ["VG"] },
  { category: "cocktails", name: "Espresso Martini", description: "Vodka, cold brew, coffee liqueur, vanilla", price: 49 },
  { category: "cocktails", name: "Craft Beer Selection", description: "Rotating Romanian craft brewers — ask the bar", price: 22 },

  // Wine (price = glass, bottlePrice = bottle)
  { category: "wine", name: "Fetească Albă, Dealu Mare", description: "White · crisp, white peach, blossom", price: 32, bottlePrice: 150 },
  { category: "wine", name: "Sauvignon Blanc, Dobrogea", description: "White · citrus, gooseberry, saline finish", price: 34, bottlePrice: 160 },
  { category: "wine", name: "Rosé of Busuioacă", description: "Rosé · wild strawberry, basil, dry", price: 30, bottlePrice: 140 },
  { category: "wine", name: "Fetească Neagră, Dealu Mare", description: "Red · plum, black pepper, soft tannins", price: 38, bottlePrice: 185 },
  { category: "wine", name: "Pinot Noir, Burgundy", description: "Red · cherry, forest floor, silky", price: 62, bottlePrice: 310, special: true },
  { category: "wine", name: "Champagne Brut NV", description: "Sparkling · brioche, green apple, fine mousse", price: 75, bottlePrice: 420 },
];
