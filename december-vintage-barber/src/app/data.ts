export type Lang = "cs" | "en";
export type Category = "women" | "men" | "kids" | "spa";

export interface Branch {
  id: string;
  city: string;
  mall: string;
  address: string;
  hours: string;
  phone: string;
  phoneRaw: string;
  mapLink: string;
  image: string;
  /** [longitude, latitude] */
  coords: [number, number];
}

export const directionsUrl = (b: Branch) =>
  `https://www.google.com/maps/dir/?api=1&destination=${b.coords[1]},${b.coords[0]}`;

export const BRANCHES: Branch[] = [
  {
    id: "europark",
    city: "Praha",
    mall: "OC Europark Štěrboholy",
    address: "Nákupní 389/3, 102 00 Praha – Štěrboholy",
    hours: "09:00 – 20:00",
    phone: "+420 776 765 588",
    phoneRaw: "+420776765588",
    mapLink: "https://maps.google.com/?q=Europark+Sterboholy",
    image: "/images/salon-interior-main.png",
    coords: [14.54193, 50.07245],
  },
  {
    id: "kladno",
    city: "Kladno",
    mall: "OC Central Kladno",
    address: "Arménská 3277, 272 01 Kladno",
    hours: "09:00 – 20:00",
    phone: "+420 770 678 966",
    phoneRaw: "+420770678966",
    mapLink: "https://maps.google.com/?q=Central+Kladno",
    image: "/images/salon-reception.png",
    // TODO(owner): Arménská 3277 is NC Oaza on OpenStreetMap, not OC Central — confirm which mall
    coords: [14.13933, 50.13372],
  },
  {
    id: "mlada-boleslav",
    city: "Mladá Boleslav",
    mall: "OC Bondy Centrum",
    address: "Tř. Václava Klementa 1459, 293 01 Mladá Boleslav",
    hours: "08:00 – 20:00",
    phone: "+420 775 526 297",
    phoneRaw: "+420775526297",
    mapLink: "https://maps.google.com/?q=Bondy+Centrum+Mlada+Boleslav",
    image: "/images/barber-chair-vintage-chrome.png",
    coords: [14.9155, 50.42033],
  },
];

export const SOCIAL = {
  instagram: "https://www.instagram.com/december.hair",
  facebook: "https://www.facebook.com/decemberczech",
};

export interface Reel {
  id: string;
  src: string;
  poster: string;
  tagCs: string;
  tagEn: string;
  cs: string;
  en: string;
  branch?: string;
}

// Captions are the salon's own words from its social posts (EN is a translation)
export const REELS: Reel[] = [
  {
    id: "europark",
    src: "/videos/europark.mp4",
    poster: "/videos/europark-poster.jpg",
    tagCs: "Nově v Europarku",
    tagEn: "New at Europark",
    cs: "Světlo, klid, čisté linie.",
    en: "Light, calm, clean lines.",
    branch: "europark",
  },
  {
    id: "balayage",
    src: "/videos/reel-balayage.mp4",
    poster: "/videos/reel-balayage-poster.jpg",
    tagCs: "Balayage",
    tagEn: "Balayage",
    cs: "Balayage a péče o váš styl.",
    en: "Balayage, and care for your style.",
  },
  {
    id: "kids",
    src: "/videos/reel-kids.mp4",
    poster: "/videos/reel-kids-poster.jpg",
    tagCs: "Děti",
    tagEn: "Kids",
    cs: "Krásný účes pro každé dítě.",
    en: "A beautiful cut for every child.",
  },
  {
    id: "care",
    src: "/videos/reel-care.mp4",
    poster: "/videos/reel-care-poster.jpg",
    tagCs: "Péče",
    tagEn: "Care",
    cs: "Sednout si, vypnout hlavu a nechat se hýčkat.",
    en: "Sit down, switch off and be pampered.",
  },
  {
    id: "blonde",
    src: "/videos/reel-blonde.mp4",
    poster: "/videos/reel-blonde-poster.jpg",
    tagCs: "Blond",
    tagEn: "Blonde",
    cs: "Od prvního mytí po poslední pohled do zrcadla.",
    en: "From the first wash to the last look in the mirror.",
  },
  {
    id: "colour",
    src: "/videos/reel-colour.mp4",
    poster: "/videos/reel-colour-poster.jpg",
    tagCs: "Barva",
    tagEn: "Colour",
    cs: "Proměna barvy krok za krokem.",
    en: "A colour transformation, step by step.",
  },
];

export interface Service {
  category: Category;
  cs: string;
  en: string;
  noteCs: string;
  noteEn: string;
  duration: string;
  price: string;
  from?: boolean;
  image: string;
}

// TODO(owner): ceny, délky a názvy služeb jsou orientační — potvrdit s majitelem salonu.
export const SERVICES: Service[] = [
  { category: "women", cs: "Střih a foukaná", en: "Cut & blow-dry", noteCs: "konzultace, mytí, styling", noteEn: "consultation, wash, styling", duration: "60 min", price: "890", image: "/images/women-layered-copper.webp" },
  { category: "women", cs: "Balayage", en: "Balayage", noteCs: "včetně tónování a foukané", noteEn: "toner and blow-dry included", duration: "180 min", price: "2 490", from: true, image: "/images/women-blonde-waves.webp" },
  { category: "women", cs: "Barvení a melír", en: "Colour & highlights", noteCs: "dle délky vlasů", noteEn: "depending on length", duration: "120 min", price: "1 890", from: true, image: "/images/color-copper-mullet.webp" },
  { category: "men", cs: "Pánský střih", en: "Men's haircut", noteCs: "nůžky a strojek, mytí", noteEn: "scissors and clipper, wash", duration: "35 min", price: "490", image: "/images/men-textured-taper.webp" },
  { category: "men", cs: "Fade a úprava vousů", en: "Fade & beard trim", noteCs: "kontury břitvou, horký ručník", noteEn: "razor lines, hot towel", duration: "50 min", price: "790", image: "/images/men-skin-fade-beard.webp" },
  { category: "kids", cs: "Dětský střih", en: "Kids' haircut", noteCs: "do 12 let", noteEn: "up to 12 years", duration: "30 min", price: "390", image: "/images/haircut-kid-fade.png" },
  { category: "spa", cs: "Mytí a masáž hlavy", en: "Wash & head massage", noteCs: "relaxační mytí s masáží", noteEn: "relaxing wash with massage", duration: "30 min", price: "450", image: "/images/service-hair-wash-massage.png" },
  { category: "spa", cs: "Head spa", en: "Head spa", noteCs: "peeling pokožky, pára, masáž hlavy a šíje", noteEn: "scalp peel, steam, head and neck massage", duration: "60 min", price: "1 290", image: "/images/care-olaplex-blonde.webp" },
];

export interface Look {
  src: string;
  cs: string;
  en: string;
  /** Matches Service.cs — the service you'd book for this look */
  service: string;
}

// The lookbook: real work from the salon, each tied to the service behind it
export const LOOKS: Look[] = [
  { src: "/images/women-blonde-waves.webp", cs: "Blond vlny", en: "Blonde waves", service: "Balayage" },
  { src: "/images/men-hair-tattoo.webp", cs: "Fade s ornamentem", en: "Hair tattoo fade", service: "Fade a úprava vousů" },
  { src: "/images/women-layered-copper.webp", cs: "Vrstvený střih", en: "Layered cut", service: "Střih a foukaná" },
  { src: "/images/men-lilac-fade.webp", cs: "Lila fade", en: "Lilac fade", service: "Barvení a melír" },
  { src: "/images/color-copper-mullet.webp", cs: "Měděné konce", en: "Copper tips", service: "Barvení a melír" },
  { src: "/images/men-skin-fade-beard.webp", cs: "Skin fade a vousy", en: "Skin fade & beard", service: "Fade a úprava vousů" },
  { src: "/images/haircut-kid-fade.png", cs: "Klučičí fade", en: "Boys' fade", service: "Dětský střih" },
  { src: "/images/care-olaplex-blonde.webp", cs: "Olaplex péče", en: "Olaplex care", service: "Head spa" },
  { src: "/images/men-textured-taper.webp", cs: "Texturovaný taper", en: "Textured taper", service: "Pánský střih" },
  { src: "/images/showcase-balayage-curls.png", cs: "Balayage lokny", en: "Balayage curls", service: "Balayage" },
  { src: "/images/barber-scissor-cut.webp", cs: "Klasický střih nůžkami", en: "Classic scissor cut", service: "Pánský střih" },
  { src: "/images/men-classic-fade.jpg", cs: "Klasický pánský fade", en: "Classic gentleman's fade", service: "Pánský střih" },
  { src: "/images/stylist-haircut-action.png", cs: "Krátký pánský střih", en: "Short men's cut", service: "Pánský střih" },
];

export const CATEGORY_IMAGE: Record<Category, string> = {
  women: "/images/women-blonde-waves.webp",
  men: "/images/men-hair-tattoo.webp",
  kids: "/images/haircut-kid-fade.png",
  spa: "/images/care-olaplex-blonde.webp",
};

export const CATEGORY_FROM: Record<Category, string> = {
  women: "890",
  men: "490",
  kids: "390",
  spa: "450",
};

export const T = {
  cs: {
    navServices: "Služby",
    navPrices: "Ceník",
    navSalon: "Salon",
    navBranches: "Pobočky",
    navVouchers: "Poukazy",
    book: "Rezervovat",
    menu: "Menu",
    close: "Zavřít",
    navWork: "Naše práce",
    menuContact: "Kontakt",
    menuFollow: "Sledujte nás",
    menuHint: {
      sluzby: "Ženy · Muži · Děti · Péče",
      cenik: "od {price} Kč · spočítejte si návštěvu",
      salon: "Proměny z našich křesel",
      poukazy: "1 000 nebo 3 000 Kč, platí 12 měsíců",
      pobocky: "Praha · Kladno · Mladá Boleslav",
    } as Record<string, string>,
    menuOpenNow: "Otevřeno · do {time}",
    menuClosedNow: "Zavřeno · otevíráme v {time}",

    introLine: "December Hair · Praha · Kladno · Mladá Boleslav",

    heroLine: "Kadeřnictví pro ženy, muže i děti.",
    heroCities: "Praha — Kladno — Mladá Boleslav",
    heroScroll: "Scroll",
    heroCta: "Rezervovat termín",

    aboutLabel: "O nás",
    aboutLead:
      "Tři salony v obchodních centrech, jeden tým. Stříháme, barvíme a pečujeme o vlasy celé rodiny — každý den od rána do večera, bez spěchu a s citem pro detail.",
    // [clip|word] marks a verb that drives the video beside the sentence
    aboutRich: "Tři salony, jeden tým. [cut|Stříháme], [colour|barvíme] a [care|pečujeme] o vlasy celé rodiny.",
    aboutClips: { cut: "Střih", colour: "Barva", care: "Péče" } as Record<string, string>,
    aboutNote: "Každý den od rána do večera — bez spěchu a s citem pro detail.",
    aboutTitle: ["Tři salony,", "jeden tým."],
    aboutVerbs: ["Stříháme", "barvíme", "pečujeme"],
    aboutDays: ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"],
    aboutText: "Stříháme, barvíme a pečujeme bez spěchu a s citem pro detail. Ať přijdete do kteréhokoli salonu, čeká vás stejná péče.",
    aboutFacts: [
      { n: "3", l: "salony" },
      { n: "7", l: "dní v týdnu otevřeno" },
      { n: "20:00", l: "zavíráme každý den" },
    ],
    factSalons: "salony",
    factDays: "dní v týdnu",
    factHours: "otevírací doba",

    servicesLabel: "Služby",
    servicesTitle: "Pro celou rodinu",
    people: {
      women: { name: "Ženy", line: "Střih a barva, které ladí s vámi, ne jen s trendem.", tags: ["konzultace", "barva na míru", "balayage"] },
      men: { name: "Muži", line: "Precizní fade, čisté kontury a chvíle klidu.", tags: ["fade", "úprava vousů", "horký ručník"] },
      seniors: { name: "Senioři", line: "Klasický střih bez spěchu, s pohodlím a péčí.", tags: ["bez spěchu", "klasický střih", "pohodlí"] },
      kids: { name: "Děti", line: "Klidný střih bez stresu, i pro ty nejmenší.", tags: ["trpělivost", "do 12 let", "bez stresu"] },
      care: { name: "Péče", line: "Mytí, pára a masáž hlavy. Chvíle jen pro vás.", tags: ["masáž hlavy", "pára", "head spa"] },
    } as Record<string, { name: string; line: string; tags: string[] }>,
    servicesFrom: "od",
    catDesc: {
      women: "Střih, foukaná, barvení a balayage s plynulými přechody.",
      men: "Klasický střih, fade a úprava vousů s horkým ručníkem.",
      kids: "Klidný a trpělivý střih pro nejmenší, bez stresu.",
      spa: "Mytí, pára a masáž hlavy. Chvíle jen pro vás.",
    } as Record<Category, string>,

    pricesTitle: "Ceník",
    pricesNote: "Ceny v Kč. Konečnou cenu vám stylista potvrdí při konzultaci.",
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
    cat: { women: "Ženy", men: "Muži", kids: "Děti", spa: "Péče" } as Record<Category, string>,

    reelsLabel: "Z našich křesel",
    reelsTitle: "Proměny",
    filmLabel: "Nový salon",
    filmA: "Nově",
    filmB: "v Europarku",
    filmBody:
      "Světlo, klid, čisté linie. Místo, kde si odložíte každodenní shon a v křesle zůstáváte jen vy, vaše vlasy a náš profesionální dotek.",
    filmPlace: "OC Europark Štěrboholy · Nákupní 389/3, Praha",
    filmBook: "Rezervovat v Europarku",
    play: "Přehrát",
    pause: "Pauza",
    soundOn: "Zvuk zapnout",
    soundOff: "Zvuk vypnout",

    lookLabel: "Portfolio",
    lookTitle: "Naše práce",
    lookBody: "Výběr z toho, co vzniklo v našich křeslech.",
    lookCta: "Chci podobný styl",
    lookStyle: "Styl",
    lookAll: "Vše",
    salonTitle: "Naše práce",
    salonBody: "Střihy, barvy a péče přímo z našich křesel — a prostor, ve kterém vznikají.",

    vouchersLabel: "Dárek",
    vouchersTitle: "Dárkový poukaz",
    vouchersBody:
      "Poukaz v hodnotě 1 000 nebo 3 000 Kč, platný 12 měsíců ve všech třech salonech. Zakoupíte ho na recepci.",
    vouchersCta: "Objednat poukaz",

    branchesTitle: "Pobočky",
    mapStreet: "Mapa",
    mapAerial: "Letecká",
    branchesNote: "Parkování v obchodním centru zdarma. Otevřeno každý den.",
    map: "Navigovat",
    mapHint: "Vyberte salon na mapě",
    mapOpenGoogle: "Otevřít v Google Maps",
    marquee: "Rezervovat termín",

    footerRights: "Všechna práva vyhrazena.",
    igTitle: "Sledujte naši práci",
    igBody: "Nové střihy, barvy a proměny každý týden na Instagramu.",
    igFollow: "Sledovat na Instagramu",
    fbText: "Novinky a akce na Facebooku",
    cursorView: "Zobrazit",
    cursorDrag: "Scroll",

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
  },
  en: {
    navServices: "Services",
    navPrices: "Prices",
    navSalon: "Salon",
    navBranches: "Locations",
    navVouchers: "Vouchers",
    book: "Book",
    menu: "Menu",
    close: "Close",
    navWork: "Our work",
    menuContact: "Contact",
    menuFollow: "Follow us",
    menuHint: {
      sluzby: "Women · Men · Kids · Care",
      cenik: "from {price} CZK · build your visit",
      salon: "Transformations from our chairs",
      poukazy: "1,000 or 3,000 CZK, valid 12 months",
      pobocky: "Prague · Kladno · Mladá Boleslav",
    } as Record<string, string>,
    menuOpenNow: "Open · until {time}",
    menuClosedNow: "Closed · opens at {time}",

    introLine: "December Hair · Prague · Kladno · Mladá Boleslav",

    heroLine: "Hair salon for women, men and kids.",
    heroCities: "Prague — Kladno — Mladá Boleslav",
    heroScroll: "Scroll",
    heroCta: "Book an appointment",

    aboutLabel: "About",
    aboutLead:
      "Three salons in shopping centres, one team. We cut, colour and care for the whole family's hair — every day, morning to evening, unhurried and with an eye for detail.",
    aboutRich: "Three salons, one team. We [cut|cut], [colour|colour] and [care|care for] the whole family's hair.",
    aboutClips: { cut: "Cut", colour: "Colour", care: "Care" } as Record<string, string>,
    aboutNote: "Every day, morning to evening — unhurried, with an eye for detail.",
    aboutTitle: ["Three salons,", "one team."],
    aboutVerbs: ["We cut", "colour", "care"],
    aboutDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    aboutText: "We cut, colour and care, unhurried and with an eye for detail. Whichever salon you walk into, the same care is waiting.",
    aboutFacts: [
      { n: "3", l: "salons" },
      { n: "7", l: "days a week open" },
      { n: "20:00", l: "closing time, every day" },
    ],
    factSalons: "salons",
    factDays: "days a week",
    factHours: "opening hours",

    servicesLabel: "Services",
    servicesTitle: "For the whole family",
    people: {
      women: { name: "Women", line: "Cut and colour that suit you, not just the trend.", tags: ["consultation", "tailored colour", "balayage"] },
      men: { name: "Men", line: "Precise fades, clean lines and a moment of calm.", tags: ["fade", "beard trim", "hot towel"] },
      seniors: { name: "Seniors", line: "A classic cut, unhurried, with comfort and care.", tags: ["unhurried", "classic cut", "comfort"] },
      kids: { name: "Kids", line: "A calm, stress-free cut, even for the littlest ones.", tags: ["patience", "up to 12", "no stress"] },
      care: { name: "Care", line: "Wash, steam and head massage. Time just for you.", tags: ["head massage", "steam", "head spa"] },
    } as Record<string, { name: string; line: string; tags: string[] }>,
    servicesFrom: "from",
    catDesc: {
      women: "Cuts, blow-dries, colour and softly blended balayage.",
      men: "Classic cuts, fades and beard trims with a hot towel.",
      kids: "A calm, patient haircut for the little ones.",
      spa: "Wash, steam and head massage. Time just for you.",
    } as Record<Category, string>,

    pricesTitle: "Prices",
    pricesNote: "Prices in CZK. Your stylist confirms the final price at the consultation.",
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
    cat: { women: "Women", men: "Men", kids: "Kids", spa: "Care" } as Record<Category, string>,

    reelsLabel: "From our chairs",
    reelsTitle: "Transformations",
    filmLabel: "New salon",
    filmA: "Now open",
    filmB: "at Europark",
    filmBody:
      "Light, calm, clean lines. A place to leave the everyday rush behind — just you, your hair and our professional touch.",
    filmPlace: "Europark Štěrboholy · Nákupní 389/3, Prague",
    filmBook: "Book at Europark",
    play: "Play",
    pause: "Pause",
    soundOn: "Sound on",
    soundOff: "Sound off",

    lookLabel: "Portfolio",
    lookTitle: "Our work",
    lookBody: "A selection of what has come out of our chairs.",
    lookCta: "I want a similar look",
    lookStyle: "Look",
    lookAll: "All",
    salonTitle: "Our work",
    salonBody: "Cuts, colour and care straight from our chairs — and the room they happen in.",

    vouchersLabel: "Gift",
    vouchersTitle: "Gift voucher",
    vouchersBody:
      "A voucher worth 1,000 or 3,000 CZK, valid for 12 months at all three salons. Available at reception.",
    vouchersCta: "Order a voucher",

    branchesTitle: "Locations",
    mapStreet: "Map",
    mapAerial: "Aerial",
    branchesNote: "Free parking at the shopping centre. Open every day.",
    map: "Directions",
    mapHint: "Pick a salon on the map",
    mapOpenGoogle: "Open in Google Maps",
    marquee: "Book an appointment",

    footerRights: "All rights reserved.",
    igTitle: "Follow our work",
    igBody: "New cuts, colours and transformations every week on Instagram.",
    igFollow: "Follow on Instagram",
    fbText: "News and offers on Facebook",
    cursorView: "View",
    cursorDrag: "Scroll",

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
  },
};

export type Dict = (typeof T)["cs"];
