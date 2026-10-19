import type { Role, UiLang } from "./types";

// The admin's own words, English and Czech; each user picks theirs (users.ui_lang)
const en = {
  brand: "December Admin",
  viewSite: "View site",
  signOut: "Sign out",
  soon: "Soon",
  loading: "Loading…",
  save: "Save",
  edit: "Edit",
  saving: "Saving…",
  saved: "Saved",
  cancel: "Cancel",
  close: "Close",
  never: "Never",
  notAllowed: "Your role does not have access to this page.",
  somethingWrong: "Something went wrong",

  nav: {
    dashboard: "Dashboard",
    content: "Texts & content",
    branches: "Branches",
    media: "Media library",
    seo: "SEO",
    bookings: "Bookings",
    vouchers: "Voucher orders",
    users: "Users",
    account: "My account",
  } as Record<string, string>,

  roles: { admin: "Admin", editor: "Editor", branch_manager: "Branch manager" } as Record<Role, string>,
  roleHelp: {
    admin: "Everything, including users and settings",
    editor: "Content, media and SEO; no bookings or users",
    branch_manager: "Only their branches: details, hours, bookings and vouchers",
  } as Record<Role, string>,
  langs: { en: "English", cs: "Čeština" } as Record<UiLang, string>,

  login: {
    title: "Sign in",
    lead: "The back office of December Hair.",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    wrong: "Incorrect email or password.",
    tooMany: "Too many attempts. Wait a minute and try again.",
  },

  dash: {
    hello: "Hello, {name}",
    signedInAs: "Signed in as {role}",
    yourBranches: "Your branches",
    branches: "Branches",
    services: "Services",
    looks: "Lookbook",
    reels: "Reels",
    users: "Users",
    newBookings: "New bookings",
    newVouchers: "New voucher orders",
    next: "Content editing, media, SEO and bookings arrive in the next steps of the build.",
  },

  users: {
    title: "Users",
    lead: "Who can sign in to the back office, and what they may do.",
    add: "Add user",
    edit: "Edit user",
    name: "Name",
    email: "Email",
    role: "Role",
    language: "Admin language",
    branches: "Branches",
    branchesHelp: "A branch manager sees and edits only these.",
    unpublished: "not published",
    status: "Status",
    active: "Active",
    inactive: "Deactivated",
    activeHelp: "A deactivated user cannot sign in; their open sessions end.",
    lastLogin: "Last sign-in",
    password: "Password",
    newPassword: "New password",
    newPasswordHelp: "Leave empty to keep it. Setting one signs the user out everywhere.",
    passwordHelp: "At least 10 characters.",
    you: "you",
    allBranches: "All",
  },

  account: {
    title: "My account",
    profile: "Profile",
    name: "Name",
    email: "Email",
    language: "Admin language",
    password: "Change password",
    current: "Current password",
    next: "New password",
    repeat: "Repeat new password",
    mismatch: "The new passwords do not match.",
    changed: "Password changed. Your other sessions have been signed out.",
  },
};

export type AdminDict = typeof en;

const cs: AdminDict = {
  brand: "December Admin",
  viewSite: "Zobrazit web",
  signOut: "Odhlásit",
  soon: "Brzy",
  loading: "Načítám…",
  save: "Uložit",
  edit: "Upravit",
  saving: "Ukládám…",
  saved: "Uloženo",
  cancel: "Zrušit",
  close: "Zavřít",
  never: "Nikdy",
  notAllowed: "Vaše role nemá k této stránce přístup.",
  somethingWrong: "Něco se pokazilo",

  nav: {
    dashboard: "Přehled",
    content: "Texty a obsah",
    branches: "Pobočky",
    media: "Knihovna médií",
    seo: "SEO",
    bookings: "Rezervace",
    vouchers: "Objednávky poukazů",
    users: "Uživatelé",
    account: "Můj účet",
  },

  roles: { admin: "Administrátor", editor: "Editor", branch_manager: "Vedoucí pobočky" },
  roleHelp: {
    admin: "Vše včetně uživatelů a nastavení",
    editor: "Obsah, média a SEO; bez rezervací a uživatelů",
    branch_manager: "Jen své pobočky: údaje, otevírací doba, rezervace a poukazy",
  },
  langs: { en: "English", cs: "Čeština" },

  login: {
    title: "Přihlášení",
    lead: "Administrace December Hair.",
    email: "E-mail",
    password: "Heslo",
    submit: "Přihlásit",
    wrong: "Nesprávný e-mail nebo heslo.",
    tooMany: "Příliš mnoho pokusů. Počkejte minutu a zkuste to znovu.",
  },

  dash: {
    hello: "Dobrý den, {name}",
    signedInAs: "Přihlášen(a) jako {role}",
    yourBranches: "Vaše pobočky",
    branches: "Pobočky",
    services: "Služby",
    looks: "Lookbook",
    reels: "Reels",
    users: "Uživatelé",
    newBookings: "Nové rezervace",
    newVouchers: "Nové objednávky poukazů",
    next: "Úpravy obsahu, média, SEO a rezervace přibudou v dalších krocích vývoje.",
  },

  users: {
    title: "Uživatelé",
    lead: "Kdo se může přihlásit do administrace a co smí dělat.",
    add: "Přidat uživatele",
    edit: "Upravit uživatele",
    name: "Jméno",
    email: "E-mail",
    role: "Role",
    language: "Jazyk administrace",
    branches: "Pobočky",
    branchesHelp: "Vedoucí pobočky vidí a upravuje jen tyto.",
    unpublished: "nezveřejněná",
    status: "Stav",
    active: "Aktivní",
    inactive: "Deaktivovaný",
    activeHelp: "Deaktivovaný uživatel se nepřihlásí; jeho otevřené relace skončí.",
    lastLogin: "Poslední přihlášení",
    password: "Heslo",
    newPassword: "Nové heslo",
    newPasswordHelp: "Nechte prázdné, pokud se nemění. Nové heslo uživatele všude odhlásí.",
    passwordHelp: "Alespoň 10 znaků.",
    you: "vy",
    allBranches: "Všechny",
  },

  account: {
    title: "Můj účet",
    profile: "Profil",
    name: "Jméno",
    email: "E-mail",
    language: "Jazyk administrace",
    password: "Změna hesla",
    current: "Současné heslo",
    next: "Nové heslo",
    repeat: "Nové heslo znovu",
    mismatch: "Nová hesla se neshodují.",
    changed: "Heslo bylo změněno. Ostatní relace byly odhlášeny.",
  },
};

export const ADMIN_DICTS: Record<UiLang, AdminDict> = { en, cs };

export const fmt = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

export function formatDate(iso: string | null, lang: UiLang, never: string) {
  if (!iso) return never;
  return new Intl.DateTimeFormat(lang === "cs" ? "cs-CZ" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }).format(new Date(iso));
}
