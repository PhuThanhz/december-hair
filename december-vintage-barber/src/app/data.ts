import type { Branch, Lang, Look, Panel, Reel, Service, SiteMedia } from "@/content/types";
import { everyDay } from "@/lib/hours";

// The site's content until the back office serves it (src/content/local.ts turns this into SiteContent)

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

// TODO(owner): ceny, délky a názvy služeb jsou orientační — potvrdit s majitelem salonu.
export const SERVICES: Service[] = [
  { id: "cut-blowdry", category: "women", name: { cs: "Střih a foukaná", en: "Cut & blow-dry" }, note: { cs: "konzultace, mytí, styling", en: "consultation, wash, styling" }, durationMin: 60, price: 890, priceFrom: false, image: "/images/women-layered-copper.webp" },
  { id: "balayage", category: "women", name: { cs: "Balayage", en: "Balayage" }, note: { cs: "včetně tónování a foukané", en: "toner and blow-dry included" }, durationMin: 180, price: 2490, priceFrom: true, image: "/images/women-blonde-waves.webp" },
  { id: "colour-highlights", category: "women", name: { cs: "Barvení a melír", en: "Colour & highlights" }, note: { cs: "dle délky vlasů", en: "depending on length" }, durationMin: 120, price: 1890, priceFrom: true, image: "/images/color-copper-mullet.webp" },
  { id: "mens-cut", category: "men", name: { cs: "Pánský střih", en: "Men's haircut" }, note: { cs: "nůžky a strojek, mytí", en: "scissors and clipper, wash" }, durationMin: 35, price: 490, priceFrom: false, image: "/images/men-textured-taper.webp" },
  { id: "fade-beard", category: "men", name: { cs: "Fade a úprava vousů", en: "Fade & beard trim" }, note: { cs: "kontury břitvou, horký ručník", en: "razor lines, hot towel" }, durationMin: 50, price: 790, priceFrom: false, image: "/images/men-skin-fade-beard.webp" },
  { id: "kids-cut", category: "kids", name: { cs: "Dětský střih", en: "Kids' haircut" }, note: { cs: "do 12 let", en: "up to 12 years" }, durationMin: 30, price: 390, priceFrom: false, image: "/images/haircut-kid-fade.png" },
  { id: "wash-massage", category: "spa", name: { cs: "Mytí a masáž hlavy", en: "Wash & head massage" }, note: { cs: "relaxační mytí s masáží", en: "relaxing wash with massage" }, durationMin: 30, price: 450, priceFrom: false, image: "/images/service-hair-wash-massage.png" },
  { id: "head-spa", category: "spa", name: { cs: "Head spa", en: "Head spa" }, note: { cs: "peeling pokožky, pára, masáž hlavy a šíje", en: "scalp peel, steam, head and neck massage" }, durationMin: 60, price: 1290, priceFrom: false, image: "/images/care-olaplex-blonde.webp" },
];

// The lookbook: real work from the salon, each tied to the service behind it (price and time come from there)
export const LOOKS: Look[] = [
  { id: "blonde-waves", image: "/images/women-blonde-waves.webp", title: { cs: "Blond vlny", en: "Blonde waves" }, serviceId: "balayage", category: "women" },
  { id: "hair-tattoo-fade", image: "/images/men-hair-tattoo.webp", title: { cs: "Fade s ornamentem", en: "Hair tattoo fade" }, serviceId: "fade-beard", category: "men" },
  { id: "layered-cut", image: "/images/women-layered-copper.webp", title: { cs: "Vrstvený střih", en: "Layered cut" }, serviceId: "cut-blowdry", category: "women" },
  { id: "classic-fade", image: "/images/men-classic-fade.jpg", title: { cs: "Klasický pánský fade", en: "Classic gentleman's fade" }, serviceId: "mens-cut", category: "men" },
  { id: "lilac-fade", image: "/images/men-lilac-fade.webp", title: { cs: "Lila fade", en: "Lilac fade" }, serviceId: "colour-highlights", category: "men" },
  { id: "copper-tips", image: "/images/color-copper-mullet.webp", title: { cs: "Měděné konce", en: "Copper tips" }, serviceId: "colour-highlights", category: "women" },
  { id: "skin-fade-beard", image: "/images/men-skin-fade-beard.webp", title: { cs: "Skin fade a vousy", en: "Skin fade & beard" }, serviceId: "fade-beard", category: "men" },
  { id: "boys-fade", image: "/images/haircut-kid-fade.png", title: { cs: "Klučičí fade", en: "Boys' fade" }, serviceId: "kids-cut", category: "kids" },
  { id: "olaplex-care", image: "/images/care-olaplex-blonde.webp", title: { cs: "Olaplex péče", en: "Olaplex care" }, serviceId: "head-spa", category: "spa" },
  { id: "textured-taper", image: "/images/men-textured-taper.webp", title: { cs: "Texturovaný taper", en: "Textured taper" }, serviceId: "mens-cut", category: "men" },
  { id: "balayage-curls", image: "/images/showcase-balayage-curls.png", title: { cs: "Balayage lokny", en: "Balayage curls" }, serviceId: "balayage", category: "women" },
  { id: "scissor-cut", image: "/images/barber-scissor-cut.webp", title: { cs: "Klasický střih nůžkami", en: "Classic scissor cut" }, serviceId: "mens-cut", category: "men" },
  { id: "short-mens-cut", image: "/images/stylist-haircut-action.png", title: { cs: "Krátký pánský střih", en: "Short men's cut" }, serviceId: "mens-cut", category: "men" },
  { id: "razor-design", image: "/images/haircut-fade-tattoo-pattern.png", title: { cs: "Vzor břitvou na míru", en: "Razor hair design" }, serviceId: "fade-beard", category: "men" },
  { id: "blowdry-styling", image: "/images/service-hair-styling-iron.png", title: { cs: "Foukaná a styling", en: "Blow-dry & styling" }, serviceId: "cut-blowdry", category: "women" },
  { id: "wash-massage", image: "/images/service-hair-wash-massage.png", title: { cs: "Masáž hlavy a mytí", en: "Wash & head massage" }, serviceId: "wash-massage", category: "spa" },
  { id: "steam-treatment", image: "/images/treatment-steaming-rinse.png", title: { cs: "Parní lázeň vlasů", en: "Steam scalp treatment" }, serviceId: "head-spa", category: "spa" },
  { id: "deep-care", image: "/images/salon-wash-stations.png", title: { cs: "Rituál hloubkové péče", en: "Deep care ritual" }, serviceId: "head-spa", category: "spa" },
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
    image: "/images/barber-scissor-cut.webp",
    focus: "100% 40%",
    bookingCategory: "men",
    name: { cs: "Muži", en: "Men" },
    line: { cs: "Precizní fade, čisté kontury a chvíle klidu.", en: "Precise fades, clean lines and a moment of calm." },
    tags: { cs: ["fade", "úprava vousů", "horký ručník"], en: ["fade", "beard trim", "hot towel"] },
  },
  {
    id: "seniors",
    image: "/images/men-classic-fade.jpg",
    focus: "55% 25%",
    name: { cs: "Senioři", en: "Seniors" },
    line: { cs: "Klasický střih bez spěchu, s pohodlím a péčí.", en: "A classic cut, unhurried, with comfort and care." },
    tags: { cs: ["bez spěchu", "klasický střih", "pohodlí"], en: ["unhurried", "classic cut", "comfort"] },
  },
  {
    id: "kids",
    image: "/images/haircut-kid-fade.png",
    focus: "34% 35%",
    bookingCategory: "kids",
    name: { cs: "Děti", en: "Kids" },
    line: { cs: "Klidný střih bez stresu, i pro ty nejmenší.", en: "A calm, stress-free cut, even for the littlest ones." },
    tags: { cs: ["trpělivost", "do 12 let", "bez stresu"], en: ["patience", "up to 12", "no stress"] },
  },
  {
    id: "care",
    image: "/images/service-hair-wash-massage.png",
    focus: "32% 40%",
    bookingCategory: "spa",
    name: { cs: "Péče", en: "Care" },
    line: { cs: "Mytí, pára a masáž hlavy. Chvíle jen pro vás.", en: "Wash, steam and head massage. Time just for you." },
    tags: { cs: ["masáž hlavy", "pára", "head spa"], en: ["head massage", "steam", "head spa"] },
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
    sluzby: "Ženy · Muži · Děti · Péče",
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
  receiptTitle: "Váš výběr",
  receiptEmpty: "Zatím nic. Klikněte na služby vlevo.",
  receiptTotal: "Celkem",
  receiptTime: "Čas v křesle",
  receiptBook: "Rezervovat výběr",
  receiptClear: "Vymazat",
  receiptFoot: "Orientační cena · finální potvrdí stylista",
  receiptVat: "včetně DPH",
  cat: { women: "Ženy", men: "Muži", kids: "Děti", spa: "Péče" },

  reelsTitle: "Proměny",
  reelsBody: "Nahlédněte do atmosféry našich salonů v Praze, Kladně a Mladé Boleslavi.",
  soundOn: "Zvuk zapnout",
  soundOff: "Zvuk vypnout",
  prev: "Předchozí",
  next: "Další",
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
    sluzby: "Women · Men · Kids · Care",
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
  receiptTitle: "Your selection",
  receiptEmpty: "Nothing yet. Tap services on the left.",
  receiptTotal: "Total",
  receiptTime: "Time in the chair",
  receiptBook: "Book this selection",
  receiptClear: "Clear",
  receiptFoot: "Estimate · your stylist confirms the final price",
  receiptVat: "VAT included",
  cat: { women: "Women", men: "Men", kids: "Kids", spa: "Care" },

  reelsTitle: "Transformations",
  reelsBody: "Experience the unique atmosphere of our salons in Prague, Kladno and Mladá Boleslav.",
  soundOn: "Sound on",
  soundOff: "Sound off",
  prev: "Previous",
  next: "Next",
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
