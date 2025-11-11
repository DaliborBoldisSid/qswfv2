/**
 * Unified Notification Bridge
 *
 * Provides a consistent API for scheduling notifications that works
 * across both web (using Web Notifications API) and Android WebView
 * (using native Android notifications).
 */

import {
  isAndroidWebView,
  scheduleAndroidNotification,
  cancelAndroidNotification,
  cancelAllAndroidNotifications,
  showAndroidNotification,
  hasAndroidNotificationPermission,
} from './androidBridge.js';

// Storage for web notification timeouts
const scheduledNotifications = new Map();

/**
 * Check if notifications are supported and permission is granted
 * @returns {Promise<boolean>} True if notifications are available
 */
export async function checkNotificationPermission() {
  // Check if running in Android WebView
  if (isAndroidWebView()) {
    return hasAndroidNotificationPermission();
  }

  // Check web notifications
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  return Notification.permission === 'granted';
}

/**
 * Request notification permission
 * @returns {Promise<boolean>} True if permission granted
 */
export async function requestNotificationPermission() {
  // In Android WebView, permission is handled natively
  if (isAndroidWebView()) {
    // Android app handles permission request on startup
    return hasAndroidNotificationPermission();
  }

  // Request web notification permission
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Schedule a notification to be shown after a delay
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body text
 * @param {number} options.delayMs - Delay in milliseconds before showing
 * @param {string|number} options.id - Unique notification ID (optional)
 * @param {string} options.tag - Notification tag (web only, optional)
 * @returns {Promise<boolean>} True if scheduled successfully
 */
export async function scheduleNotification({ title, body, delayMs, id, tag }) {
  const notificationId = id || generateNotificationId();

  // Use Android native notifications if available
  if (isAndroidWebView()) {
    return scheduleAndroidNotification(title, body, delayMs, notificationId);
  }

  // Use web notifications
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return false;
  }

  // Clear any existing notification with this ID
  if (scheduledNotifications.has(notificationId)) {
    clearTimeout(scheduledNotifications.get(notificationId).timeoutId);
  }

  // Schedule the notification
  const timeoutId = setTimeout(() => {
    showWebNotification(title, body, tag);
    scheduledNotifications.delete(notificationId);
  }, delayMs);

  scheduledNotifications.set(notificationId, {
    timeoutId,
    title,
    body,
    scheduledAt: Date.now(),
    showAt: Date.now() + delayMs,
  });

  console.log(`[Web] Scheduled notification: ${title} in ${delayMs}ms (ID: ${notificationId})`);
  return true;
}

/**
 * Show an immediate notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {string} tag - Notification tag (web only, optional)
 * @returns {Promise<boolean>} True if shown successfully
 */
export async function showNotification(title, body, tag) {
  // Use Android native notifications if available
  if (isAndroidWebView()) {
    return showAndroidNotification(title, body);
  }

  // Use web notifications
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return false;
  }

  return showWebNotification(title, body, tag);
}

/**
 * Show a web notification (internal helper)
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {string} tag - Notification tag (optional)
 * @returns {boolean} True if shown successfully
 */
function showWebNotification(title, body, tag) {
  try {
    const notification = new Notification(title, {
      body,
      tag: tag || 'qswf-notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
    });

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    console.log(`[Web] Showed notification: ${title}`);
    return true;
  } catch (error) {
    console.error('Error showing web notification:', error);
    return false;
  }
}

/**
 * Cancel a scheduled notification
 * @param {string|number} notificationId - The ID of the notification to cancel
 * @returns {boolean} True if cancelled successfully
 */
export function cancelNotification(notificationId) {
  // Cancel Android notification
  if (isAndroidWebView()) {
    return cancelAndroidNotification(notificationId);
  }

  // Cancel web notification timeout
  if (scheduledNotifications.has(notificationId)) {
    const notification = scheduledNotifications.get(notificationId);
    clearTimeout(notification.timeoutId);
    scheduledNotifications.delete(notificationId);
    console.log(`[Web] Cancelled notification: ${notificationId}`);
    return true;
  }

  return false;
}

/**
 * Cancel all scheduled notifications
 * @returns {boolean} True if cancelled successfully
 */
export function cancelAllNotifications() {
  // Cancel Android notifications
  if (isAndroidWebView()) {
    return cancelAllAndroidNotifications();
  }

  // Cancel all web notification timeouts
  for (const [id, notification] of scheduledNotifications) {
    clearTimeout(notification.timeoutId);
  }

  const count = scheduledNotifications.size;
  scheduledNotifications.clear();
  console.log(`[Web] Cancelled ${count} notifications`);
  return true;
}

/**
 * Get all scheduled notifications
 * @returns {Array} Array of scheduled notification info
 */
export function getScheduledNotifications() {
  // Only available for web notifications
  if (isAndroidWebView()) {
    console.warn('getScheduledNotifications not available in Android WebView');
    return [];
  }

  return Array.from(scheduledNotifications.entries()).map(([id, notification]) => ({
    id,
    title: notification.title,
    body: notification.body,
    scheduledAt: notification.scheduledAt,
    showAt: notification.showAt,
    remainingMs: Math.max(0, notification.showAt - Date.now()),
  }));
}

/**
 * Generate a unique notification ID
 * @returns {number} Unique ID
 */
function generateNotificationId() {
  return Math.floor(Math.random() * 1000000000);
}

/**
 * Check if running in Android WebView
 * @returns {boolean} True if in Android WebView
 */
export function isNativeAndroid() {
  return isAndroidWebView();
}

// Export for debugging
export { scheduledNotifications };
