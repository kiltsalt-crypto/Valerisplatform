import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvRuwmm-v8InGN1pZrXJ8';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPushNotifications(userId: string): Promise<boolean> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return false;

    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth')),
      },
      is_active: true,
    });

    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
}

export async function unsubscribeFromPushNotifications(userId: string): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint);
    }

    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

export async function sendNotification(title: string, body: string, data?: any) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  await registration.showNotification(title, {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data,
    vibrate: [200, 100, 200],
    tag: 'trading-notification',
  });
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';

  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
}

export function scheduleNotification(
  type: 'daily_review' | 'trade_reminder' | 'price_alert',
  scheduledTime: Date,
  data: any
) {
  const now = new Date();
  const delay = scheduledTime.getTime() - now.getTime();

  if (delay <= 0) return;

  setTimeout(() => {
    switch (type) {
      case 'daily_review':
        sendNotification(
          'Time for Your Daily Review',
          'Take a few minutes to reflect on today\'s trading',
          data
        );
        break;
      case 'trade_reminder':
        sendNotification(
          'Trade Reminder',
          data.message || 'Check your open positions',
          data
        );
        break;
      case 'price_alert':
        sendNotification(
          `Price Alert: ${data.symbol}`,
          `${data.symbol} reached ${data.price}`,
          data
        );
        break;
    }
  }, delay);
}
