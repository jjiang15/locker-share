import { Redis } from '@upstash/redis';
import webpush from 'web-push';

const TZ = process.env.APP_TZ || 'America/New_York';

// Upstash Redis in production (env vars injected by the Vercel integration);
// in-memory map for local dev.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;
const mem = (globalThis.__lockerMem ??= new Map());

export async function get(key, fallback) {
  const v = redis ? await redis.get(key) : mem.get(key);
  return v ?? fallback;
}

export async function set(key, value, ttlDays) {
  if (redis) await redis.set(key, value, ttlDays ? { ex: ttlDays * 86400 } : undefined);
  else mem.set(key, value);
}

// YYYY-MM-DD in the school's timezone
export function dayKey(offset = 0) {
  const d = new Date(Date.now() + offset * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export function authed(req) {
  const pin = process.env.APP_PIN;
  return !pin || req.headers['x-pin'] === pin;
}

// Send a push to every subscription matching `filter`; drop dead ones.
export async function notify(filter, payload) {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return;
  const subject = process.env.VAPID_SUBJECT
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://localhost');
  webpush.setVapidDetails(subject, pub, priv);

  const subs = await get('subs', {});
  let changed = false;
  await Promise.all(Object.entries(subs).filter(([, s]) => filter(s)).map(async ([endpoint, s]) => {
    try {
      await webpush.sendNotification(s.sub, JSON.stringify(payload));
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) { delete subs[endpoint]; changed = true; }
      else console.error('push failed', e.statusCode, e.body);
    }
  }));
  if (changed) await set('subs', subs);
}
