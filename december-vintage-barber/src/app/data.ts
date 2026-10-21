import type { Branch, Lang, Look, Panel, Reel, Service, SiteMedia } from "@/content/types";
import { everyDay } from "@/lib/hours";

// The site's starting content. The live site reads the CMS (src/content/index.ts); this file is
//   - the fallback the page renders when the API can't be reached (src/content/local.ts), and
//   - the seed for a new database: npm run export:content, then `python -m app.cli seed` in the backend repo (december_hair_be).
// Editing it changes neither the CMS nor the live site.

export const BRANCHES: Branch[] = [
  {
    id: "europark",
    city: { cs: "Praha", en: "Prague" },
    mall: "OC Europark Štěrboholy",
    shortName: "OC Europark",
    address: "Nákupní 389/3, 102 00 Praha – Štěrboholy",
    phone: "+420 776 765 588",
    phoneRaw: "+420776765588",
    coords: [14.54193, 50.07245],
    map: { bearing: -28, zoom: 16.2, pitch: 58 },
    image: "/images/salon-interior-main.png",
    googleMapsUrl: "https://maps.google.com/?q=Europark+Sterboholy",
    bookAt: { cs: "Rezervovat v Europarku", en: "Book at Europark" },
    hours: everyDay("09:00", "20:00"),
    specialDays: [],
  },
  {
    id: "kladno",
    city: { cs: "Kladno", en: "Kladno" },
    mall: "OC Central Kladno",
    shortName: "OC Central",
    address: "Arménská 3277, 272 01 Kladno",
    phone: "+420 770 678 966",
    phoneRaw: "+420770678966",
    // TODO(owner): Arménská 3277 is NC Oaza on OpenStreetMap, not OC Central — confirm which mall
    coords: [14.13933, 50.13372],
    map: { bearing: 20, zoom: 16.2, pitch: 58 },
    image: "/images/salon-reception.png",
    googleMapsUrl: "https://maps.google.com/?q=Central+Kladno",
    bookAt: { cs: "Rezervovat v Kladně", en: "Book in Kladno" },
    hours: everyDay("09:00", "20:00"),
    specialDays: [],
  },
  {
    id: "mlada-boleslav",
    city: { cs: "Mladá Boleslav", en: "Mladá Boleslav" },
    mall: "OC Bondy Centrum",
    shortName: "OC Bondy",
    address: "Tř. Václava Klementa 1459, 293 01 Mladá Boleslav",
    phone: "+420 775 526 297",
    phoneRaw: "+420775526297",
    coords: [14.9155, 50.42033],
    map: { bearing: -12, zoom: 16.2, pitch: 58 },
    image: "/images/barber-chair-vintage-chrome.png",
    googleMapsUrl: "https://maps.google.com/?q=Bondy+Centrum+Mlada+Boleslav",
    bookAt: { cs: "Rezervovat v Mladé Boleslavi", en: "Book in Mladá Boleslav" },
    hours: everyDay("08:00", "20:00"),
    specialDays: [],
  },
];

export const SOCIAL = {
  instagram: "https://www.instagram.com/december.hair",
  facebook: "https://www.facebook.com/decemberczech",
};

export const SETTINGS = { defaultBranch: "europark" };

// Captions are the salon's own words from its social posts (EN is a translation)
export const REELS: Reel[] = [
  {
    id: "europark",
    video: "/videos/europark.mp4",
    poster: "/videos/europark-poster.jpg",
    tag: { cs: "Nově v Europarku", en: "New at Europark" },
    caption: { cs: "Světlo, klid, čisté linie.", en: "Light, calm, clean lines." },
    branch: "europark",
  },
  {
    id: "balayage",
    video: "/videos/reel-balayage.mp4",
    poster: "/videos/reel-balayage-poster.jpg",
    tag: { cs: "Balayage", en: "Balayage" },
    caption: { cs: "Balayage a péče o váš styl.", en: "Balayage, and care for your style." },
  },
  {
    id: "kids",
    video: "/videos/reel-kids.mp4",
    poster: "/videos/reel-kids-poster.jpg",
    tag: { cs: "Děti", en: "Kids" },
    caption: { cs: "Krásný účes pro každé dítě.", en: "A beautiful cut for every child." },
  },
  {
    id: "care",
    video: "/videos/reel-care.mp4",
    poster: "/videos/reel-care-poster.jpg",
    tag: { cs: "Péče", en: "Care" },
    caption: { cs: "Sednout si, vypnout hlavu a nechat se hýčkat.", en: "Sit down, switch off and be pampered." },
  },
  {
    id: "blonde",
    video: "/videos/reel-blonde.mp4",
    poster: "/videos/reel-blonde-poster.jpg",
    tag: { cs: "Blond", en: "Blonde" },
    caption: { cs: "Od prvního mytí po poslední pohled do zrcadla.", en: "From the first wash to the last look in the mirror." },
  },
  {
    id: "colour",
    video: "/videos/reel-colour.mp4",
    poster: "/videos/reel-colour-poster.jpg",
    tag: { cs: "Barva", en: "Colour" },
    caption: { cs: "Proměna barvy krok za krokem.", en: "A colour transformation, step by step." },
  },
];

// Ceny podle ceníku salonu (říjen 2026). Délky služeb jsou orientační, salon je upraví v administraci.
// Ženské služby (a dívčí střih, regenerace) mají ceny podle délky vlasů: krátké / polodlouhé / dlouhé.
const byLength = (short: number, medium: number, long: number) => ({ price: short, lengthPrices: { short, medium, long } });
const single = (price: number) => ({ price, lengthPrices: null });
const NO_NOTE = { cs: "", en: "" };
const UP_TO_10 = { cs: "do 10 let", en: "up to 10 years" };
const BY_USE = { cs: "cena dle spotřeby materiálu", en: "price depends on the product used" };

export const SERVICES: Service[] = [
  // Ženy · střih
  { id: "women-tips", category: "women", name: { cs: "Stříhání konečků", en: "Trim (ends only)" }, note: NO_NOTE, durationMin: 30, ...single(450), priceFrom: false, image: "/images/women-long-layers.webp" },
  { id: "women-cut", category: "women", name: { cs: "Klasický střih", en: "Classic cut" }, note: NO_NOTE, durationMin: 60, ...byLength(550, 650, 750), priceFrom: false, image: "/images/women-long-layers.webp" },
  { id: "wash-blowdry", category: "women", name: { cs: "Mytí a foukaná", en: "Wash & blow-dry" }, note: NO_NOTE, durationMin: 45, ...byLength(400, 450, 500), priceFrom: false, image: "/images/service-hair-styling-iron.png" },
  // Ženy · barvení
  { id: "women-colour", category: "women", name: { cs: "Barvení vlasů", en: "Hair colouring" }, note: NO_NOTE, durationMin: 120, ...byLength(1200, 1500, 1800), priceFrom: false, image: "/images/women-cherry-red.webp" },
  { id: "women-trend-colour", category: "women", name: { cs: "Trendy barvy", en: "Trend colours" }, note: NO_NOTE, durationMin: 150, ...byLength(2000, 2500, 3000), priceFrom: false, image: "/images/women-cherry-red.webp" },
  { id: "highlights-t", category: "women", name: { cs: "Melír T-sekce", en: "Highlights – T-section" }, note: NO_NOTE, durationMin: 90, ...byLength(1000, 1200, 1400), priceFrom: false, image: "/images/women-blonde-waves.webp" },
  { id: "highlights-half", category: "women", name: { cs: "Melír 1/2 hlavy", en: "Highlights – half head" }, note: NO_NOTE, durationMin: 120, ...byLength(1400, 1600, 1800), priceFrom: false, image: "/images/women-blonde-waves.webp" },
  { id: "highlights-full", category: "women", name: { cs: "Melír celá hlava", en: "Highlights – full head" }, note: NO_NOTE, durationMin: 150, ...byLength(1600, 1900, 2200), priceFrom: false, image: "/images/women-blonde-waves.webp" },
  { id: "toning", category: "women", name: { cs: "Tónování", en: "Toning" }, note: NO_NOTE, durationMin: 45, ...byLength(800, 1000, 1200), priceFrom: false, image: "/images/showcase-balayage-curls.png" },
  { id: "balayage", category: "women", name: { cs: "Balayage a tónování", en: "Balayage & toning" }, note: BY_USE, durationMin: 180, ...single(3500), priceFrom: true, image: "/images/showcase-balayage-curls.png" },
  { id: "women-perm", category: "women", name: { cs: "Trvalá ondulace", en: "Perm" }, note: BY_USE, durationMin: 150, ...single(2000), priceFrom: true, image: null },
  // Muži · střih
  { id: "mens-cut", category: "men", name: { cs: "Klasický střih", en: "Classic cut" }, note: NO_NOTE, durationMin: 40, ...single(450), priceFrom: false, image: "/images/men-textured-crop-fade.webp" },
  { id: "clipper-cut", category: "men", name: { cs: "Střih strojkem", en: "Clipper cut" }, note: NO_NOTE, durationMin: 30, ...single(400), priceFrom: false, image: "/images/men-dark-fade-side.webp" },
  { id: "beard", category: "men", name: { cs: "Vousy", en: "Beard" }, note: NO_NOTE, durationMin: 20, ...single(350), priceFrom: false, image: "/images/men-skin-fade-beard-salon.webp" },
  { id: "beard-with-cut", category: "men", name: { cs: "Vousy ke střihu", en: "Beard with a haircut" }, note: { cs: "při stříhání vlasů", en: "when booked with a haircut" }, durationMin: 15, ...single(250), priceFrom: false, image: "/images/men-skin-fade-beard-salon.webp" },
  // Muži · barvení
  { id: "mens-colour", category: "men", name: { cs: "Barvení vlasů", en: "Hair colouring" }, note: NO_NOTE, durationMin: 60, ...single(1000), priceFrom: false, image: null },
  { id: "mens-trend-colour", category: "men", name: { cs: "Trendy barvy", en: "Trend colours" }, note: NO_NOTE, durationMin: 90, ...single(1600), priceFrom: false, image: "/images/men-platinum-crop.webp" },
  { id: "mens-highlights", category: "men", name: { cs: "Melír a tónování", en: "Highlights & toning" }, note: NO_NOTE, durationMin: 90, ...single(1600), priceFrom: false, image: "/images/men-platinum-crop.webp" },
  { id: "mens-perm", category: "men", name: { cs: "Trvalá ondulace", en: "Perm" }, note: NO_NOTE, durationMin: 90, ...single(1600), priceFrom: false, image: null },
  // Děti
  { id: "kids-cut", category: "kids", name: { cs: "Dětský střih – kluci", en: "Kids' cut – boys" }, note: UP_TO_10, durationMin: 30, ...single(300), priceFrom: false, image: "/images/haircut-kid-fade.png" },
  { id: "girls-cut", category: "kids", name: { cs: "Dětský střih – holky", en: "Kids' cut – girls" }, note: UP_TO_10, durationMin: 40, ...byLength(350, 400, 450), priceFrom: false, image: null },
  { id: "kids-tips", category: "kids", name: { cs: "Dětské stříhání konečků", en: "Kids' trim (ends only)" }, note: NO_NOTE, durationMin: 20, ...single(300), priceFrom: false, image: null },
  // Regenerace
  { id: "olaplex", category: "spa", name: { cs: "Olaplex", en: "Olaplex" }, note: NO_NOTE, durationMin: 30, ...byLength(500, 700, 900), priceFrom: false, image: "/images/care-olaplex-blonde.webp" },
  { id: "keratin", category: "spa", name: { cs: "Keratin", en: "Keratin treatment" }, note: NO_NOTE, durationMin: 120, ...byLength(2000, 2500, 3000), priceFrom: false, image: "/images/treatment-steaming-rinse.png" },
];

// The lookbook: real work from the salon, each tied to the service behind it (price and time come from there)
export const LOOKS: Look[] = [
  { id: "blonde-waves", image: "/images/women-blonde-waves.webp", title: { cs: "Blond vlny", en: "Blonde waves" }, serviceId: "balayage", category: "women" },
  { id: "hair-tattoo-fade", image: "/images/men-fade-design.webp", title: { cs: "Fade s ornamentem", en: "Hair tattoo fade" }, serviceId: "mens-cut", category: "men" },
  { id: "layered-cut", image: "/images/women-long-layers.webp", title: { cs: "Vrstvený střih", en: "Layered cut" }, serviceId: "women-cut", category: "women" },
  { id: "classic-fade", image: "/images/men-light-mid-fade.webp", title: { cs: "Klasický fade", en: "Classic fade" }, serviceId: "mens-cut", category: "men" },
  { id: "platinum-crop", image: "/images/men-platinum-crop.webp", title: { cs: "Platinový crop", en: "Platinum crop" }, serviceId: "mens-highlights", category: "men" },
  { id: "cherry-red", image: "/images/women-cherry-red.webp", title: { cs: "Višňově červená", en: "Cherry red" }, serviceId: "women-trend-colour", category: "women" },
  { id: "skin-fade-beard", image: "/images/men-skin-fade-beard-salon.webp", title: { cs: "Skin fade a vousy", en: "Skin fade & beard" }, serviceId: "mens-cut", category: "men" },
  { id: "boys-fade", image: "/images/haircut-kid-fade.png", title: { cs: "Klučičí fade", en: "Boys' fade" }, serviceId: "kids-cut", category: "kids" },
  { id: "olaplex-care", image: "/images/care-olaplex-blonde.webp", title: { cs: "Olaplex péče", en: "Olaplex care" }, serviceId: "olaplex", category: "spa" },
  { id: "textured-taper", image: "/images/men-textured-taper.webp", title: { cs: "Texturovaný taper", en: "Textured taper" }, serviceId: "mens-cut", category: "men" },
  { id: "balayage-curls", image: "/images/showcase-balayage-curls.png", title: { cs: "Balayage lokny", en: "Balayage curls" }, serviceId: "balayage", category: "women" },
  { id: "scissor-cut", image: "/images/men-dark-textured-crop.webp", title: { cs: "Texturovaný střih nůžkami", en: "Textured scissor cut" }, serviceId: "mens-cut", category: "men" },
  { id: "short-mens-cut", image: "/images/men-dark-fade-side.webp", title: { cs: "Krátký pánský střih", en: "Short men's cut" }, serviceId: "mens-cut", category: "men" },
  { id: "textured-crop", image: "/images/men-textured-crop-fade.webp", title: { cs: "Texturovaný crop s fade", en: "Textured crop & fade" }, serviceId: "mens-cut", category: "men" },
  { id: "blowdry-styling", image: "/images/service-hair-styling-iron.png", title: { cs: "Foukaná a styling", en: "Blow-dry & styling" }, serviceId: "wash-blowdry", category: "women" },
  { id: "messy-crop", image: "/images/men-messy-textured.webp", title: { cs: "Volný texturovaný střih", en: "Loose textured cut" }, serviceId: "mens-cut", category: "men" },
  { id: "keratin-care", image: "/images/treatment-steaming-rinse.png", title: { cs: "Keratinová regenerace", en: "Keratin treatment" }, serviceId: "keratin", category: "spa" },
  { id: "deep-care", image: "/images/salon-wash-stations.png", title: { cs: "Rituál hloubkové péče", en: "Deep care ritual" }, serviceId: "olaplex", category: "spa" },
];

// Who we look after, one mirror each. `focus` keeps the head and face inside a narrow mirror.
export const PANELS: Panel[] = [
  {
    id: "women",
    image: "/images/showcase-balayage-curls.png",
    focus: "50% 30%",
    bookingCategory: "women",
    name: { cs: "Ženy", en: "Women" },
    line: { cs: "Střih a barva, které ladí s vámi, ne jen s trendem.", en: "Cut and colour that suit you, not just the trend." },
    tags: { cs: ["konzultace", "barva na míru", "balayage"], en: ["consultation", "tailored colour", "balayage"] },
  },
  {
    id: "men",
    image: "/images/men-skin-fade-beard-salon.webp",
    focus: "45% 35%",
    bookingCategory: "men",
    name: { cs: "Muži", en: "Men" },
    line: { cs: "Precizní fade, čisté kontury a chvíle klidu.", en: "Precise fades, clean lines and a moment of calm." },
    tags: { cs: ["fade", "úprava vousů", "horký ručník"], en: ["fade", "beard trim", "hot towel"] },
  },
  {
    id: "kids",
    image: "/images/haircut-kid-fade.png",
    focus: "34% 35%",
    bookingCategory: "kids",
    name: { cs: "Děti", en: "Kids" },
    line: { cs: "Klidný střih bez stresu, i pro ty nejmenší.", en: "A calm, stress-free cut, even for the littlest ones." },
    tags: { cs: ["trpělivost", "do 10 let", "bez stresu"], en: ["patience", "up to 10", "no stress"] },
  },
  {
    id: "care",
    image: "/images/care-olaplex-blonde.webp",
    focus: "55% 40%",
    bookingCategory: "spa",
    name: { cs: "Péče", en: "Care" },
    line: { cs: "Olaplex a keratin vrátí vlasům sílu a lesk.", en: "Olaplex and keratin bring back strength and shine." },
    tags: { cs: ["olaplex", "keratin", "regenerace"], en: ["olaplex", "keratin", "repair"] },
  },
];

export const SITE_MEDIA: SiteMedia = {
  // Vertical 1080×1920 clips. The first is the third one pre-rotated to start 9.5 s in, so the two never
  // show the same shot (a separate file avoids a mid-file seek, which made the browser download it twice)
  heroPanels: [
    { src: "/videos/december-hair-b.mp4", poster: "/videos/december-hair-b-poster.jpg", alt: { cs: "Salon December", en: "The December salon" } },
    { src: "/videos/europark.mp4", poster: "/videos/europark-poster.jpg", alt: { cs: "Nový salon December v Europarku", en: "The new December salon at Europark" } },
    { src: "/videos/december-hair.mp4", poster: "/videos/december-hair-poster.jpg", alt: { cs: "Den v salonu December", en: "A day at the December salon" } },
  ],
  // The centre clip's middle band, flipped upside down and in black and white
  heroReflection: { src: "/videos/europark-reflection.mp4", poster: "/videos/europark-reflection-poster.jpg" },
  aboutClips: {
    cut: { src: "/videos/about-cut.mp4", poster: "/videos/about-cut.jpg" },
    colour: { src: "/videos/about-colour.mp4", poster: "/videos/about-colour.jpg" },
    care: { src: "/videos/about-care.mp4", poster: "/videos/about-care.jpg" },
  },
};

export const VOUCHER = { options: [1000, 3000], defaultAmount: 3000 };

// Texts. Placeholders are filled in for the visitor:
//   about the salons (src/lib/text.ts branchVars): {count} {countWord} {CountWord} {salons} {cities} {citiesDash} {citiesList}
//   by the component that shows them: {price} {time} {n}
const cs = {
  navServices: "Služby",
  navPrices: "Ceník",
  navBranches: "Pobočky",
  navVouchers: "Poukazy",
  book: "Rezervovat",
  menu: "Menu",
  close: "Zavřít",
  navWork: "Naše práce",
  menuContact: "Kontakt",
  menuHint: {
    sluzby: "Ženy · Muži · Děti · Regenerace",
    cenik: "od {price} Kč · spočítejte si návštěvu",
    salon: "Proměny z našich křesel",
    poukazy: "1 000 nebo 3 000 Kč, platí 12 měsíců",
    pobocky: "{cities}",
  } as Record<string, string>,
  menuOpenNow: "Otevřeno · do {time}",
  menuClosedNow: "Zavřeno · otevíráme v {time}",
  closed: "zavřeno",

  // How the texts count salons: 1 / 2–4 / 5+, and the "and" before the last city
  salonForms: ["salon", "salony", "salonů"],
  listAnd: "a",

  introLine: "December Hair · {cities}",

  heroLine: "Kadeřnictví pro ženy, muže i děti.",
  heroCities: "{citiesDash}",
  heroTag: "Salon & Barber",
  heroPlaces: "Praha · Kladno",
  heroScroll: "Scroll",

  aboutClips: { cut: "Střih", colour: "Barva", care: "Péče" } as Record<string, string>,
  aboutTitle: ["{CountWord} {salons},", "jeden tým."],
  aboutVerbs: ["Stříháme", "barvíme", "pečujeme"],
  aboutDays: ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"],
  aboutText: "Stříháme, barvíme a pečujeme bez spěchu a s citem pro detail. Ať přijdete do kteréhokoli salonu, čeká vás stejná péče.",
  aboutFacts: ["{salons}", "dní v týdnu otevřeno", "zavíráme každý den"],

  servicesLabel: "Služby",
  servicesTitle: "Pro celou rodinu",
  servicesFrom: "od",

  pricesTitle: "Ceník",
  pricesBook: "Rezervovat",
  pricesLead: "Sestavte si návštěvu",
  pricesHow: "Vyberte služby a hned uvidíte cenu i čas.",
  hairLength: "Délka vlasů",
  hairLengths: ["Krátké", "Polodlouhé", "Dlouhé"],
  receiptTitle: "Váš výběr",
  receiptEmpty: "Zatím nic. Klikněte na služby vlevo.",
  receiptTotal: "Celkem",
  receiptTime: "Čas v křesle",
  receiptBook: "Rezervovat výběr",
  receiptClear: "Vymazat",
  receiptFoot: "Orientační cena · finální potvrdí stylista",
  receiptVat: "včetně DPH",
  cat: { women: "Ženy", men: "Muži", kids: "Děti", spa: "Regenerace" },

  reelsTitle: "Proměny",
  reelsBody: "Nahlédněte do atmosféry našich salonů v Praze, Kladně a Mladé Boleslavi.",
  soundOn: "Zvuk zapnout",
  soundOff: "Zvuk vypnout",
  prevVideo: "Předchozí video",
  nextVideo: "Další video",
  goToVideo: "Přejít na video {n}",

  lookTitle: ["Naše práce", "v křesle"],
  lookAll: "Vše ({n})",
  lookFilters: { women: "Dámské & Balayage", men: "Pánský salon & Fade", care: "Péče & Děti" } as Record<string, string>,
  lookView: "Detail",
  lookDuration: "Doba v salonu:",
  lookPrice: "Cena:",
  lookNote: "Při návštěvě provádíme úvodní diagnostiku vlasů a doporučíme optimální odstín, střih i domácí péči.",
  lookCta: "Chci podobný styl",
  lookStyle: "Styl",

  vouchersTitle: "Dárkový poukaz",
  vouchersCta: "Připravit poukaz",
  vScratch: "Setřete",
  vScratchHint: "Setřete foli a podívejte se, co v poukazu je",
  vReveal: "Odkrýt",
  vAgain: "Zakrýt znovu",
  vPreview: "Takhle ho uvidí obdarovaný.",
  vSpecs: [
    ["Platnost", "12 měsíců"],
    ["Salony", "{cities}"],
    ["Vyzvednutí", "na recepci, kterou si vyberete"],
  ],
  vWhat: "Co si za to dopřeje?",
  vTime: "min jen pro sebe",
  vOptions: ["možnost", "možnosti", "možností"],
  vOptionsTail: "co si za to dopřát",
  vValid: "Platí 12 měsíců · všechny {count} {salons}",
  vPick: "Hodnota poukazu",
  vNote: "Dárkový poukaz",
  vLead: "Darujte chvíli jen pro sebe. Hodnotu vyberete vy, termín si vybere obdarovaný.",

  branchesTitle: "Pobočky",
  mapStreet: "Mapa",
  mapAerial: "Letecká",
  mapAria: "Mapa poboček",
  branchesNote: "Parkování v obchodním centru zdarma. Otevřeno každý den.",
  map: "Navigovat",
  mapHint: "Vyberte salon na mapě",
  mapOpenGoogle: "Otevřít v Google Maps",
  mapShow: "Ukázat na mapě",
  mapBack: "Zpět na přehled",
  marquee: "Rezervovat termín",
  marqueeTagline: "Kadeřnictví pro ženy, muže i děti",

  socialTitle: ["Sledujte naši tvorbu", "na Instagramu i Facebooku"],
  socialBody: "Nové střihy, barvy a proměny každý týden ze salonů {citiesList}.",
  follow: "Sledovat",
  fbOfficial: "Oficiální Facebook",
  footerRights: "Všechna práva vyhrazena.",

  modalTitle: "Rezervace",
  modalBody: "Vyberte salon a nechte nám kontakt. Ozveme se vám s potvrzením termínu.",
  formBranch: "Salon",
  formCategory: "Služba",
  formName: "Jméno",
  formPhone: "Telefon",
  formDate: "Datum",
  formNote: "Poznámka",
  formSubmit: "Odeslat",
  formDoneTitle: "Děkujeme.",
  formDone: "Rezervaci jsme přijali. Brzy se vám ozveme.",
};

export type Dict = typeof cs;

const en: Dict = {
  navServices: "Services",
  navPrices: "Prices",
  navBranches: "Locations",
  navVouchers: "Vouchers",
  book: "Book",
  menu: "Menu",
  close: "Close",
  navWork: "Our work",
  menuContact: "Contact",
  menuHint: {
    sluzby: "Women · Men · Kids · Treatments",
    cenik: "from {price} CZK · build your visit",
    salon: "Transformations from our chairs",
    poukazy: "1,000 or 3,000 CZK, valid 12 months",
    pobocky: "{cities}",
  },
  menuOpenNow: "Open · until {time}",
  menuClosedNow: "Closed · opens at {time}",
  closed: "closed",

  salonForms: ["salon", "salons", "salons"],
  listAnd: "and",

  introLine: "December Hair · {cities}",

  heroLine: "Hair salon for women, men and kids.",
  heroCities: "{citiesDash}",
  heroTag: "Salon & Barber",
  heroPlaces: "Prague · Kladno",
  heroScroll: "Scroll",

  aboutClips: { cut: "Cut", colour: "Colour", care: "Care" },
  aboutTitle: ["{CountWord} {salons},", "one team."],
  aboutVerbs: ["We cut", "colour", "care"],
  aboutDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  aboutText: "We cut, colour and care, unhurried and with an eye for detail. Whichever salon you walk into, the same care is waiting.",
  aboutFacts: ["{salons}", "days a week open", "closing time, every day"],

  servicesLabel: "Services",
  servicesTitle: "For the whole family",
  servicesFrom: "from",

  pricesTitle: "Prices",
  pricesBook: "Book",
  pricesLead: "Build your visit",
  pricesHow: "Pick your services and see the price and time instantly.",
  hairLength: "Hair length",
  hairLengths: ["Short", "Medium", "Long"],
  receiptTitle: "Your selection",
  receiptEmpty: "Nothing yet. Tap services on the left.",
  receiptTotal: "Total",
  receiptTime: "Time in the chair",
  receiptBook: "Book this selection",
  receiptClear: "Clear",
  receiptFoot: "Estimate · your stylist confirms the final price",
  receiptVat: "VAT included",
  cat: { women: "Women", men: "Men", kids: "Kids", spa: "Treatments" },

  reelsTitle: "Transformations",
  reelsBody: "Experience the unique atmosphere of our salons in Prague, Kladno and Mladá Boleslav.",
  soundOn: "Sound on",
  soundOff: "Sound off",
  prevVideo: "Previous video",
  nextVideo: "Next video",
  goToVideo: "Go to video {n}",

  lookTitle: ["Our Craft", "in the Chair"],
  lookAll: "All ({n})",
  lookFilters: { women: "Women & Balayage", men: "Men & Fade", care: "Care & Kids" },
  lookView: "View",
  lookDuration: "Time in the salon:",
  lookPrice: "Price:",
  lookNote: "During your visit, we perform initial hair diagnostics and advise on the ideal tone, cut, and home care.",
  lookCta: "I want a similar look",
  lookStyle: "Look",

  vouchersTitle: "Gift voucher",
  vouchersCta: "Prepare the voucher",
  vScratch: "Scratch",
  vScratchHint: "Scratch off the foil to see what's inside",
  vReveal: "Reveal",
  vAgain: "Cover again",
  vPreview: "This is how they'll see it.",
  vSpecs: [
    ["Valid", "12 months"],
    ["Salons", "{cities}"],
    ["Pick-up", "at the reception you choose"],
  ],
  vWhat: "What will they treat themselves to?",
  vTime: "min just for them",
  vOptions: ["option", "options", "options"],
  vOptionsTail: "to treat themselves to",
  vValid: "Valid 12 months · all {count} {salons}",
  vPick: "Voucher value",
  vNote: "Gift voucher",
  vLead: "Give them time just for themselves. You pick the value, they pick the day.",

  branchesTitle: "Locations",
  mapStreet: "Map",
  mapAerial: "Aerial",
  mapAria: "Map of our salons",
  branchesNote: "Free parking at the shopping centre. Open every day.",
  map: "Directions",
  mapHint: "Pick a salon on the map",
  mapOpenGoogle: "Open in Google Maps",
  mapShow: "Show on the map",
  mapBack: "Back to overview",
  marquee: "Book an appointment",
  marqueeTagline: "Hair salon for women, men and kids",

  socialTitle: ["Follow our work", "on Instagram and Facebook"],
  socialBody: "New cuts, colours and transformations every week from our salons in {citiesList}.",
  follow: "Follow",
  fbOfficial: "Official Facebook",
  footerRights: "All rights reserved.",

  modalTitle: "Booking",
  modalBody: "Choose a salon and leave your details. We'll get back to you to confirm.",
  formBranch: "Salon",
  formCategory: "Service",
  formName: "Name",
  formPhone: "Phone",
  formDate: "Date",
  formNote: "Note",
  formSubmit: "Send",
  formDoneTitle: "Thank you.",
  formDone: "We've received your request and will be in touch soon.",
};

export const T: Record<Lang, Dict> = { cs, en };
