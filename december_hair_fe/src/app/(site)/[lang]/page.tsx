import { getContent } from "@/content";
import type { Lang } from "@/content/types";
import DecemberClient from "./DecemberClient";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const content = await getContent();
  return <DecemberClient content={content} initialLang={lang as Lang} />;
}
