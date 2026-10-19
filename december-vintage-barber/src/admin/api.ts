// Talks to the backend on the same origin (Nginx in prod, the Next rewrite in dev), so the
// httpOnly session cookie rides along. Every write echoes the dh_csrf cookie in X-CSRF-Token.

const BASE = "/api/v1";
const CSRF_COOKIE = "dh_csrf";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function csrfToken() {
  const m = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

/** FastAPI errors: { detail: "…" } or, for validation, { detail: [{ msg, loc }] } */
function message(body: unknown, status: number) {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: { msg?: string; loc?: unknown[] }) => `${d.loc?.slice(-1)[0] ?? ""}: ${d.msg ?? ""}`).join("; ");
  }
  return `HTTP ${status}`;
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const method = init.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") headers["X-CSRF-Token"] = csrfToken();
  const res = await fetch(BASE + path, {
    method,
    headers,
    credentials: "same-origin",
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, message(body, res.status));
  return body as T;
}
