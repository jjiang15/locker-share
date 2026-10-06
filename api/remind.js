import { get, dayKey, notify } from './_lib.js';

// Called by Vercel Cron the evening before each weekday.
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) return res.status(401).end();

  const list = await get('res:' + dayKey(1), []);
  const taken = list.map((r) => `${r.who} (${r.size})`).join(', ');
  await notify((s) => !list.some((r) => r.who === s.who), {
    title: 'Locker tomorrow?',
    body: taken
      ? `${taken} already reserved. Need it too? Tap to add yourself.`
      : 'Need the locker tomorrow? Tap to reserve Medium or Large.',
    url: '/?day=tomorrow',
  });
  res.json({ ok: true });
}
