// pages/api/send-notification.ts (or any server script)
import admin from '@/firebase/admin';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const message = {
    token: 'APA91bEv5484vv1PuScYv8cwhZ9pUlaFlJooz9XZHrZNEjo-DQUySTuKUpKxCxwU5HKYxjZjfOZOY8WIVMeCplZhJ6eHvsh5lThqZPJNqWSSxbyhI_4v0vg',

    notification: {
      title: '🔔 Background Notification',
      body: 'This is a test push when app is in background!',
    },
    webpush: {
      notification: {
        icon: '/icon.png',
      },
    },
  };

  try {
    await admin.messaging().send(message);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Push send failed', err);
    res.status(500).json({ error: 'Push send failed', details: err });
  }
}
