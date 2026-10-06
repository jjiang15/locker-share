import { get, set, authed } from './_lib.js';

export default async function handler(req, res) {
  if (!authed(req)) return res.status(401).json({ error: 'Wrong PIN' });
  const { who, sub } = req.body || {};
  if (req.method !== 'POST' || !who || !sub?.endpoint) return res.status(400).json({ error: 'Bad request' });

  const subs = await get('subs', {});
  subs[sub.endpoint] = { who: String(who).slice(0, 30), sub };
  await set('subs', subs);
  res.json({ ok: true });
}
