import { get, set, dayKey, authed, notify } from './_lib.js';

const SIZES = ['Medium', 'Large'];
const DAYS = { today: 0, tomorrow: 1 };

export default async function handler(req, res) {
  if (!authed(req)) return res.status(401).json({ error: 'Wrong PIN' });

  if (req.method === 'POST') {
    const { action, day, who, size, info } = req.body || {};

    if (action === 'info') {
      const clean = (s) => String(s ?? '').slice(0, 200);
      await set('info', { location: clean(info?.location), code: clean(info?.code), notes: clean(info?.notes) });
    } else if ((action === 'reserve' || action === 'cancel') && day in DAYS && who) {
      const name = String(who).slice(0, 30);
      const key = 'res:' + dayKey(DAYS[day]);
      const list = await get(key, []);
      const existing = list.find((r) => r.who === name);
      const next = list.filter((r) => r.who !== name);

      if (action === 'reserve') {
        if (!SIZES.includes(size)) return res.status(400).json({ error: 'Bad size' });
        // keep original timestamp so first-come order survives a size change
        next.push({ who: name, size, at: existing?.at ?? Date.now() });
        next.sort((a, b) => a.at - b.at);
        await notify((s) => s.who !== name, {
          title: 'Locker',
          body: `${name} reserved the locker for ${day} (${size}).`,
          url: '/',
        });
      }
      await set(key, next, 14);
    } else {
      return res.status(400).json({ error: 'Bad request' });
    }
  }

  const [info, today, tomorrow] = await Promise.all([
    get('info', { location: '', code: '', notes: '' }),
    get('res:' + dayKey(0), []),
    get('res:' + dayKey(1), []),
  ]);
  res.json({
    info,
    today: { date: dayKey(0), list: today },
    tomorrow: { date: dayKey(1), list: tomorrow },
    vapidKey: process.env.VAPID_PUBLIC_KEY || null,
  });
}
