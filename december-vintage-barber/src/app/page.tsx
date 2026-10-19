import { getContent } from "@/content";
import DecemberClient from "./DecemberClient";

export default async function Page() {
  const content = await getContent();
  return <DecemberClient content={content} />;
}
