import webpush from 'web-push';
import { randomBytes } from 'node:crypto';

const { publicKey, privateKey } = webpush.generateVAPIDKeys();
console.log('Add these as Environment Variables in Vercel:\n');
console.log('VAPID_PUBLIC_KEY=' + publicKey);
console.log('VAPID_PRIVATE_KEY=' + privateKey);
console.log('CRON_SECRET=' + randomBytes(16).toString('hex'));
console.log('APP_PIN=<pick a PIN to share with your partner>');
