"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { useAdminT, useMe } from "@/admin/Providers";
import type { Me, UiLang } from "@/admin/types";
import { Button, Field, Input, Toast } from "@/admin/ui";
import { CURTAIN_CLOSE_MS, Curtain, markEntering, wantsCurtain } from "@/admin/Curtain";

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
  // Bumped on every failure, so a repeated wrong password shows the toast again
  const [errorId, setErrorId] = useState(0);
  const [busy, setBusy] = useState(false);
  // Signed in and on the way into the admin: the seal opens into the curtain first
  const [entering, setEntering] = useState<{ x: number; y: number } | null>(null);
  const seal = useRef<HTMLDivElement>(null);
  // Next keeps this page alive behind the admin: after signing out it must come back clean
  if (me === null && (entering || busy)) {
    setEntering(null);
    setBusy(false);
  }

  // Already signed in: straight to the admin (unless the curtain is playing)
  useEffect(() => {
    if (me && !entering) router.replace(nextPath());
  }, [me, entering, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await api<Me>("/auth/login", { method: "POST", body: { email, password } });
      if (wantsCurtain() && seal.current) {
        const r = seal.current.getBoundingClientRect();
        setEntering({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
        markEntering();
        setTimeout(() => router.replace(nextPath()), CURTAIN_CLOSE_MS);
      } else {
        router.replace(nextPath());
      }
      qc.setQueryData(["me"], user);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? t.login.tooMany : err instanceof ApiError && err.status === 401 ? t.login.wrong : t.somethingWrong);
      setErrorId((n) => n + 1);
      setBusy(false);
    }
  };

  return (
    <main className="min-h-dvh grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] bg-paper">
      {/* The salon itself (a still photo, light to load) behind the brand mark */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-forest text-paper p-12 xl:p-16">
        <Image
          src="/images/salon-interior-main.png"
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover motion-safe:animate-[loginDrift_30s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-forest/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,transparent,rgba(17,38,26,0.9))]" />

        <span className="relative flex items-end">
          <Image src="/images/logo-wordmark-paper.png" alt="December" width={144} height={28} className="h-7 w-auto" priority />
          <span className="ml-2.5 pb-0.5 text-[11px] tracking-[0.32em] uppercase text-paper/60">Hair</span>
        </span>

        <div className="relative flex flex-col items-center text-center">
          <Image
            src="/images/logo-transparent.png"
            alt=""
            width={320}
            height={320}
            priority
            className="w-[clamp(180px,20vw,300px)] h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.45)] motion-safe:animate-[fadeIn_1.6s_ease-out]"
          />
          <p className="-mt-2 font-serif italic text-[clamp(2rem,3.2vw,3rem)] leading-[1.05] max-w-md text-paper/90 text-balance">{t.login.lead}</p>
        </div>

        <span className="relative label text-sage text-center">Praha · Kladno · Mladá Boleslav</span>
      </div>

      {/* Over the form column on wide screens (the photo takes 1.1 of 2.1 parts) */}
      {entering && <Curtain mode="close" origin={entering} />}
      <Toast message={error} id={errorId} onClose={() => setError(null)} closeLabel={t.close} className="lg:pl-[calc(1.1/2.1*100%+1rem)]" />

      <div className="relative flex flex-col px-5 py-6 sm:px-10 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="link-line text-sm text-ink-soft hover:text-ink">
            ← {t.login.backToSite}
          </Link>
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

        <div className="my-auto mx-auto w-full max-w-sm py-10">
          <Seal ref={seal} fast={!!entering} />
          <h1 className="mt-8 text-center font-serif text-[clamp(2.75rem,9vw,3.75rem)] tracking-[-0.03em] leading-[0.95]">{t.login.title}</h1>
          <p className="mt-3 text-center text-ink-soft lg:hidden">{t.login.lead}</p>
          <form onSubmit={submit} className="mt-8 sm:mt-10 space-y-5">
            <Field label={t.login.email}>
              {(id) => <Input id={id} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />}
            </Field>
            <Field label={t.login.password}>
              {(id) => (
                <Input id={id} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              )}
            </Field>
            <Button type="submit" disabled={busy} className="group w-full py-3.5 flex items-center justify-center gap-2">
              {busy ? t.loading : t.login.submit}
              {!busy && (
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

/** The salon's stamp: the D monogram inside a slowly turning ring naming the three salons */
function Seal({ ref, fast }: { ref: React.Ref<HTMLDivElement>; fast: boolean }) {
  return (
    <div ref={ref} aria-hidden className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32">
      <svg
        viewBox="0 0 120 120"
        className={`absolute inset-0 w-full h-full text-forest ${fast ? "animate-[spin_0.9s_cubic-bezier(0.5,0,0.2,1)_infinite]" : "motion-safe:animate-[spin_40s_linear_infinite]"}`}
      >
        <defs>
          <path id="seal-ring" d="M60,60 m-49,0 a49,49 0 1,1 98,0 a49,49 0 1,1 -98,0" />
        </defs>
        <circle cx="60" cy="60" r="58.5" fill="none" stroke="currentColor" strokeOpacity="0.25" />
        <circle cx="60" cy="60" r="39" fill="none" stroke="currentColor" strokeOpacity="0.25" />
        <text fill="currentColor" fontSize="8" letterSpacing="0" style={{ fontFamily: "inherit" }}>
          <textPath href="#seal-ring" textLength="304" lengthAdjust="spacing">
            DECEMBER HAIR · PRAHA · KLADNO · MLADÁ BOLESLAV ·
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-[30%] bg-forest [mask:url(/images/logo-d-white.png)_center/contain_no-repeat] [-webkit-mask:url(/images/logo-d-white.png)_center/contain_no-repeat]" />
    </div>
  );
}
