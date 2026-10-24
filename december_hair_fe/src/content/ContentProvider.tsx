"use client";

import { createContext, useContext, useMemo } from "react";
import type { Lang, SiteContent } from "./types";

const Site = createContext<{ content: SiteContent; lang: Lang } | null>(null);

export function ContentProvider({ content, lang, children }: { content: SiteContent; lang: Lang; children: React.ReactNode }) {
  const value = useMemo(() => ({ content, lang }), [content, lang]);
  return <Site.Provider value={value}>{children}</Site.Provider>;
}

function useSite() {
  const site = useContext(Site);
  if (!site) throw new Error("useContent() outside <ContentProvider>");
  return site;
}

/** The site's content: branches, services, looks, reels… */
export const useContent = () => useSite().content;

/** The visitor's language */
export const useLang = () => useSite().lang;
