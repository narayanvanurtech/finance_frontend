'use client';

import { useEffect } from 'react';
import usePushNotifications from '@/hooks/usePushNotifications';

export default function PushNotificationProvider() {
  usePushNotifications(); // now safely runs on client
  return null; // this component doesn't render anything
}
