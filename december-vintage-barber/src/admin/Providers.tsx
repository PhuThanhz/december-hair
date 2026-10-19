"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { ADMIN_DICTS } from "./i18n";
import type { Me, UiLang } from "./types";

const LANG_KEY = "dh_admin_lang";

const I18n = createContext<{ lang: UiLang; t: (typeof ADMIN_DICTS)["en"]; setLang: (l: UiLang) => void } | null>(
  null
);

/** The signed-in user; null when signed out (a 401), never retried */
export function useMe() {
  return useQuery<Me | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await api<Me>("/auth/me");
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    staleTime: 60_000,
  });
}

/** The admin's words in the user's language */
export function useAdminT() {
  const ctx = useContext(I18n);
  if (!ctx) throw new Error("useAdminT() outside <AdminProviders>");
  return ctx;
}

// The language before sign-in: the one chosen on this device, else the browser's.
// Read as an external store so the server render (English) and hydration agree.
const LANG_EVENT = "dh-admin-lang";

function deviceLang(): UiLang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === "cs" || v === "en") return v;
  } catch {
    // storage blocked: fall back to the browser language
  }
  return navigator.language.toLowerCase().startsWith("cs") ? "cs" : "en";
}

function storeDeviceLang(l: UiLang) {
  try {
    localStorage.setItem(LANG_KEY, l);
  } catch {
    // private mode: the choice just isn't remembered on this device
  }
  window.dispatchEvent(new Event(LANG_EVENT));
}

function subscribeDeviceLang(onChange: () => void) {
  window.addEventListener(LANG_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LANG_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function I18nProvider({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const local = useSyncExternalStore(subscribeDeviceLang, deviceLang, () => "en" as UiLang);
  const lang = me?.uiLang ?? local;

  const save = useMutation({
    mutationFn: (uiLang: UiLang) => api<Me>("/auth/me", { method: "PATCH", body: { uiLang } }),
    onSuccess: (updated) => qc.setQueryData(["me"], updated),
  });

  const setLang = useCallback(
    (l: UiLang) => {
      storeDeviceLang(l);
      if (me) {
        qc.setQueryData(["me"], { ...me, uiLang: l } satisfies Me);
        save.mutate(l);
      }
    },
    [me, qc, save]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, t: ADMIN_DICTS[lang], setLang }), [lang, setLang]);
  return <I18n.Provider value={value}>{children}</I18n.Provider>;
}

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={client}>
      <I18nProvider>{children}</I18nProvider>
    </QueryClientProvider>
  );
}
