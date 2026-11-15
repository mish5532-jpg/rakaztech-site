// Quran Heart cloud save. One Durable Object per reader name.
// POST /load {name, pin}            -> {t, data} | {t:0}
// POST /save {name, pin, base, data} -> {t}  (409 {t, data} if someone saved since `base`)
import { DurableObject } from "cloudflare:workers";

const ORIGINS = ["https://rakaztech.com", "https://www.rakaztech.com", "http://localhost:8765"];
const MAX = 400_000;            // bytes of progress JSON
const LOCK_AFTER = 8, LOCK_MS = 15 * 60_000;

const cors = (req) => {
  const o = req.headers.get("Origin") || "";
  return { "Access-Control-Allow-Origin": ORIGINS.includes(o) ? o : ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400", "Vary": "Origin" };
};
const json = (req, body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors(req) } });
export const normName = (s) => String(s || "").normalize("NFC").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه")
  .replace(/ى/g, "ي").replace(/[ً-ْٰـ]/g, "").replace(/\s+/g, " ").trim();

async function sha(text) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
const eq = (a, b) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/") return json(req, { ok: true });
    if (req.method !== "POST" || !["/load", "/save"].includes(url.pathname)) return json(req, { error: "not found" }, 404);
    const raw = await req.text();
    if (raw.length > MAX + 2000) return json(req, { error: "too big" }, 413);
    let b; try { b = JSON.parse(raw); } catch { return json(req, { error: "bad json" }, 400); }
    const name = normName(b.name);
    if (!name || name.length > 60) return json(req, { error: "name" }, 400);
    if (!/^\d{4,8}$/.test(String(b.pin || ""))) return json(req, { error: "pin" }, 400);
    const stub = env.VAULT.get(env.VAULT.idFromName(name));
    const res = await stub.handle(url.pathname, { pin: String(b.pin), base: +b.base || 0, data: b.data });
    return json(req, res.body, res.status);
  },
};

export class Vault extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS v (k TEXT PRIMARY KEY, val TEXT)`);
  }
  get(k) { const r = this.ctx.storage.sql.exec(`SELECT val FROM v WHERE k=?`, k).toArray(); return r.length ? r[0].val : null; }
  put(k, val) { this.ctx.storage.sql.exec(`INSERT INTO v (k,val) VALUES (?,?) ON CONFLICT(k) DO UPDATE SET val=excluded.val`, k, String(val)); }

  async handle(path, { pin, base, data }) {
    const now = Date.now();
    const lockUntil = +(this.get("lock") || 0);
    if (lockUntil > now) return { status: 429, body: { error: "locked", until: lockUntil } };

    let salt = this.get("salt"), hash = this.get("hash");
    if (hash) {
      if (!eq(await sha(salt + ":" + pin), hash)) {
        const f = +(this.get("fails") || 0) + 1;
        this.put("fails", f >= LOCK_AFTER ? 0 : f);
        if (f >= LOCK_AFTER) this.put("lock", now + LOCK_MS);
        return { status: 403, body: { error: "pin", left: Math.max(0, LOCK_AFTER - f) } };
      }
      if (this.get("fails") !== "0") this.put("fails", 0);
    }
    const t = +(this.get("t") || 0);
    if (path === "/load") return { status: 200, body: hash ? { t, data: JSON.parse(this.get("data") || "null") } : { t: 0 } };

    // save
    if (!data || typeof data !== "object") return { status: 400, body: { error: "data" } };
    const s = JSON.stringify(data);
    if (s.length > MAX) return { status: 413, body: { error: "too big" } };
    if (hash && base !== t) return { status: 409, body: { t, data: JSON.parse(this.get("data") || "null") } };
    if (!hash) { salt = crypto.randomUUID(); this.put("salt", salt); this.put("hash", await sha(salt + ":" + pin)); }
    const nt = Math.max(now, t + 1);
    this.put("data", s); this.put("t", nt);
    return { status: 200, body: { t: nt } };
  }
}
