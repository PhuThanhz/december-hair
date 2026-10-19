"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { useAdminT, useMe } from "@/admin/Providers";
import type { Me, UiLang } from "@/admin/types";
import { Alert, Button, Field, Input } from "@/admin/ui";

/** Where to go after signing in: back to the page that sent us here, if it was in the admin */
function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";
}

export default function LoginPage() {
  const { t, lang, setLang } = useAdminT();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in: straight to the admin
  useEffect(() => {
    if (me) router.replace(nextPath());
  }, [me, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await api<Me>("/auth/login", { method: "POST", body: { email, password } });
      qc.setQueryData(["me"], user);
      router.replace(nextPath());
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? t.login.tooMany : err instanceof ApiError && err.status === 401 ? t.login.wrong : t.somethingWrong);
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-forest text-paper p-12">
        <span className="font-serif text-2xl">December</span>
        <p className="font-serif italic text-5xl leading-[1.05] max-w-md text-paper/90">{t.login.lead}</p>
        <span className="label text-sage">Praha · Kladno · Mladá Boleslav</span>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center justify-between">
            <span className="label text-ink-soft">{t.brand}</span>
            <div className="flex gap-1 text-xs">
              {(["cs", "en"] as UiLang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`cursor-pointer rounded-full px-2.5 py-1 ${lang === l ? "bg-forest text-paper" : "text-ink-soft hover:text-ink"}`}
                >
                  {l === "cs" ? "CZ" : "EN"}
                </button>
              ))}
            </div>
          </div>
          <h1 className="mt-10 font-serif text-5xl tracking-[-0.03em]">{t.login.title}</h1>
          <form onSubmit={submit} className="mt-8 space-y-5">
            {error && <Alert>{error}</Alert>}
            <Field label={t.login.email}>
              {(id) => <Input id={id} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />}
            </Field>
            <Field label={t.login.password}>
              {(id) => (
                <Input id={id} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              )}
            </Field>
            <Button type="submit" disabled={busy} className="w-full py-3">
              {busy ? t.loading : t.login.submit}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
