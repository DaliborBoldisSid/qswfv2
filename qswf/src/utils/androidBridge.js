/**
 * Android WebView Bridge Utility
 *
 * Provides utilities for detecting Android WebView environment
 * and communicating with native Android code through JavaScript interface.
 */

/**
 * Check if the app is running inside Android WebView
 * @returns {boolean} True if running in Android WebView
 */
export function isAndroidWebView() {
  try {
    // Check if Android interface is available
    return typeof window.Android !== 'undefined' &&
           typeof window.Android.isAndroid === 'function' &&
           window.Android.isAndroid();
  } catch (error) {
    console.error('Error checking Android WebView:', error);
    return false;
  }
}

/**
 * Get Android version if running in WebView
 * @returns {number|null} Android SDK version or null if not in WebView
 */
export function getAndroidVersion() {
  try {
    if (isAndroidWebView() && typeof window.Android.getAndroidVersion === 'function') {
      return window.Android.getAndroidVersion();
    }
  } catch (error) {
    console.error('Error getting Android version:', error);
  }
  return null;
}

/**
 * Check if native notification permission is granted
 * @returns {boolean} True if permission is granted
 */
export function hasAndroidNotificationPermission() {
  try {
    if (isAndroidWebView() && typeof window.Android.hasNotificationPermission === 'function') {
      return window.Android.hasNotificationPermission();
    }
  } catch (error) {
    console.error('Error checking notification permission:', error);
  }
  return false;
}

/**
 * Schedule a notification through native Android
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {number} delayMs - Delay in milliseconds
 * @param {number} notificationId - Unique notification ID (optional)
 * @returns {boolean} True if scheduled successfully
 */
export function scheduleAndroidNotification(title, body, delayMs, notificationId) {
  try {
    if (isAndroidWebView() && typeof window.Android.scheduleNotification === 'function') {
      if (notificationId !== undefined) {
        window.Android.scheduleNotification(title, body, delayMs, notificationId);
      } else {
        window.Android.scheduleNotification(title, body, delayMs);
      }
      console.log(`[Android] Scheduled notification: ${title} in ${delayMs}ms`);
      return true;
    }
  } catch (error) {
    console.error('Error scheduling Android notification:', error);
  }
  return false;
}

/**
 * Cancel a scheduled notification
 * @param {number} notificationId - The ID of the notification to cancel
 * @returns {boolean} True if cancelled successfully
 */
export function cancelAndroidNotification(notificationId) {
  try {
    if (isAndroidWebView() && typeof window.Android.cancelNotification === 'function') {
      window.Android.cancelNotification(notificationId);
      console.log(`[Android] Cancelled notification: ${notificationId}`);
      return true;
    }
  } catch (error) {
    console.error('Error cancelling Android notification:', error);
  }
  return false;
}

/**
 * Cancel all scheduled notifications
 * @returns {boolean} True if cancelled successfully
 */
export function cancelAllAndroidNotifications() {
  try {
    if (isAndroidWebView() && typeof window.Android.cancelAllNotifications === 'function') {
      window.Android.cancelAllNotifications();
      console.log('[Android] Cancelled all notifications');
      return true;
    }
  } catch (error) {
    console.error('Error cancelling all Android notifications:', error);
  }
  return false;
}

/**
 * Show an immediate notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @returns {boolean} True if shown successfully
 */
export function showAndroidNotification(title, body) {
  try {
    if (isAndroidWebView() && typeof window.Android.showNotification === 'function') {
      window.Android.showNotification(title, body);
      console.log(`[Android] Showed notification: ${title}`);
      return true;
    }
  } catch (error) {
    console.error('Error showing Android notification:', error);
  }
  return false;
}

/**
 * Show a toast message (Android only)
 * @param {string} message - Message to display
 */
export function showAndroidToast(message) {
  try {
    if (isAndroidWebView() && typeof window.Android.showToast === 'function') {
      window.Android.showToast(message);
    }
  } catch (error) {
    console.error('Error showing Android toast:', error);
  }
}

/**
 * Log a message to Android Logcat (for debugging)
 * @param {string} message - Message to log
 * @param {string} level - Log level: 'd', 'i', 'w', 'e'
 */
export function logToAndroid(message, level = 'd') {
  try {
    if (isAndroidWebView() && typeof window.Android.log === 'function') {
      window.Android.log(message, level);
    }
  } catch (error) {
    // Silent fail for logging
  }
}

/**
 * Vibrate the device
 * @param {number} durationMs - Duration in milliseconds (default: 200)
 */
export function vibrateAndroid(durationMs = 200) {
  try {
    if (isAndroidWebView() && typeof window.Android.vibrate === 'function') {
      window.Android.vibrate(durationMs);
    }
  } catch (error) {
    console.error('Error vibrating device:', error);
  }
}

/**
 * Get Android app version information
 * @returns {Object|null} Version info object or null
 */
export function getAndroidAppVersion() {
  try {
    if (isAndroidWebView() && typeof window.Android.getAppVersion === 'function') {
      const versionJson = window.Android.getAppVersion();
      return JSON.parse(versionJson);
    }
  } catch (error) {
    console.error('Error getting Android app version:', error);
  }
  return null;
}

// Expose utility for navigation from deep links
if (typeof window !== 'undefined') {
  window.navigateToStats = () => {
    console.log('[Android] Deep link navigation to Stats');
    // This will be called by MainActivity when deep link is triggered
    // The actual navigation will be handled by the app's router
    const event = new CustomEvent('android-navigate', { detail: { page: 'stats' } });
    window.dispatchEvent(event);
  };

  window.navigateToAchievements = () => {
    console.log('[Android] Deep link navigation to Achievements');
    const event = new CustomEvent('android-navigate', { detail: { page: 'achievements' } });
    window.dispatchEvent(event);
  };

  window.onNotificationPermissionGranted = () => {
    console.log('[Android] Notification permission granted');
    const event = new CustomEvent('android-permission-granted', { detail: { permission: 'notifications' } });
    window.dispatchEvent(event);
  };
}
