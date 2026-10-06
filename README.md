# Locker

A tiny shared-locker PWA for two people. It shows the locker code and location, and lets each of you reserve today or tomorrow (Medium or Large, first come first served, never blocked). It sends a push reminder Sunday–Thursday evenings and pings the other person when someone reserves.

**Stack (free tiers):** Vercel (hosting, API and the nightly cron), plus Upstash Redis through the Vercel Marketplace (storage).

## Deploy (about 15 minutes, one time)

1. **Create a free Vercel account** at vercel.com.
2. **Deploy.** From this folder, run:
   ```
   npx vercel login
   npx vercel --prod
   ```
   Accept the defaults. You'll get a URL like `https://locker-xyz.vercel.app`.
3. **Add storage.** In the Vercel dashboard, open your project → **Storage** → **Create** → *Upstash for Redis* (free plan) → connect it to this project.
4. **Add environment variables.** Run `npm run keys`, then go to Project → **Settings → Environment Variables** and add:
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET` (from the script output)
   - `APP_PIN`: any PIN you share with your partner. It keeps the locker code private.
5. **Redeploy:** `npx vercel --prod`

## On each iPhone (iOS 16.4 or later)

1. Open the URL in **Safari** → Share → **Add to Home Screen**.
2. Open the app **from the home-screen icon**, then enter the PIN and your name.
3. Tap **Turn on nightly reminders** and allow notifications.
4. Tap ⚙︎ once to enter the locker code and location (the two of you share them).

## Tweaks

- **Reminder time:** `vercel.json` → `crons.schedule` (UTC). `0 0 * * 1-5` means about 8pm ET (7pm in winter) on Sunday through Thursday. On the free plan, Vercel may fire it at any point within that hour.
- **Timezone:** set the `APP_TZ` env var (default `America/New_York`).
- **Local preview:** `npm run dev` → http://localhost:3000 (in-memory data, no push).
