// Notification utilities
// This module provides a unified API for notifications that works
// across web browsers and Android WebView

import {
  checkNotificationPermission,
  requestNotificationPermission as requestPermission,
  scheduleNotification as scheduleNativeNotification,
  showNotification as showNativeNotification,
  cancelNotification,
  cancelAllNotifications,
  isNativeAndroid,
} from './notificationBridge.js';

// Storage for scheduled notification IDs
const scheduledNotificationIds = new Map();

/**
 * Check if notifications are supported
 * @returns {boolean} True if notifications are supported
 */
export const isNotificationSupported = () => {
  // Android WebView always supports notifications
  if (isNativeAndroid()) {
    return true;
  }
  // Web browsers need Notification API
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 * @returns {string} 'granted', 'denied', 'default', or 'unsupported'
 */
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return 'unsupported';

  // For Android, check native permission
  if (isNativeAndroid()) {
    return checkNotificationPermission() ? 'granted' : 'denied';
  }

  // For web, return Notification.permission
  return Notification.permission;
}

/**
 * Request notification permission from the user
 * @returns {Promise<Object>} Result object with success and reason
 */
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.log('Notifications are not supported');
    return { success: false, reason: 'unsupported' };
  }

  try {
    const granted = await requestPermission();
    return {
      success: granted,
      reason: granted ? 'granted' : 'denied'
    };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { success: false, reason: 'error' };
  }
}

/**
 * Show an immediate notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @returns {Promise<boolean>} True if shown successfully
 */
export const showNotification = async (title, options = {}) => {
  try {
    const body = options.body || '';
    const tag = options.tag || 'qswf-notification';

    return await showNativeNotification(title, body, tag);
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
}

/**
 * Schedule a notification to be shown after a delay
 * @param {string} type - Notification type ('cigarette' or 'vape')
 * @param {number} waitTimeMs - Delay in milliseconds
 * @returns {Promise<number|null>} Notification ID if scheduled, null if failed
 */
export const scheduleNotification = async (type, waitTimeMs) => {
  try {
    const typeText = type === 'cigarette' ? 'cigarette' : 'vape';
    const title = `Ready for your ${typeText}`;
    const body = `You can now have a ${typeText}. Tap to open the app.`;
    const notificationId = Date.now() + Math.floor(Math.random() * 1000);

    const success = await scheduleNativeNotification({
      title,
      body,
      delayMs: waitTimeMs,
      id: notificationId,
      tag: `ready-${type}`,
    });

    if (success) {
      // Store the notification ID for potential cancellation
      scheduledNotificationIds.set(type, notificationId);
      console.log(`Scheduled ${type} notification (ID: ${notificationId}) in ${waitTimeMs}ms`);
      return notificationId;
    }

    return null;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications
 * @returns {boolean} True if cancelled successfully
 */
export const cancelScheduledNotifications = () => {
  try {
    // Cancel using the unified bridge
    const success = cancelAllNotifications();

    // Clear our tracking map
    scheduledNotificationIds.clear();

    console.log('Cancelled all scheduled notifications');
    return success;
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    return false;
  }
}

/**
 * Cancel a specific notification by type
 * @param {string} type - Notification type ('cigarette' or 'vape')
 * @returns {boolean} True if cancelled successfully
 */
export const cancelNotificationByType = (type) => {
  try {
    const notificationId = scheduledNotificationIds.get(type);

    if (notificationId) {
      const success = cancelNotification(notificationId);
      scheduledNotificationIds.delete(type);
      console.log(`Cancelled ${type} notification (ID: ${notificationId})`);
      return success;
    }

    return false;
  } catch (error) {
    console.error(`Error cancelling ${type} notification:`, error);
    return false;
  }
}

/**
 * Check if running in native Android app
 * @returns {boolean} True if in Android WebView
 */
export const isAndroidApp = () => {
  return isNativeAndroid();
}
