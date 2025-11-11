package com.qswf.app

import android.content.Context
import android.util.Log
import android.webkit.JavascriptInterface
import android.widget.Toast
import org.json.JSONObject

/**
 * JavaScript interface that allows the web app to communicate with native Android code.
 *
 * Methods in this class can be called from JavaScript using:
 * Android.methodName(params)
 */
class WebAppInterface(
    private val context: Context,
    private val notificationHelper: NotificationHelper
) {
    companion object {
        private const val TAG = "WebAppInterface"
    }

    /**
     * Returns true if running in Android WebView.
     * Called from JavaScript to detect native environment.
     */
    @JavascriptInterface
    fun isAndroid(): Boolean {
        return true
    }

    /**
     * Returns the Android SDK version.
     */
    @JavascriptInterface
    fun getAndroidVersion(): Int {
        return android.os.Build.VERSION.SDK_INT
    }

    /**
     * Schedule a notification to be shown at a future time.
     *
     * @param title Notification title
     * @param body Notification body text
     * @param delayMs Delay in milliseconds before showing the notification
     * @param notificationId Unique ID for this notification (optional)
     */
    @JavascriptInterface
    fun scheduleNotification(
        title: String,
        body: String,
        delayMs: Long,
        notificationId: Int = (System.currentTimeMillis() % Int.MAX_VALUE).toInt()
    ) {
        Log.d(TAG, "scheduleNotification: title=$title, delay=$delayMs ms, id=$notificationId")

        notificationHelper.scheduleNotification(
            title = title,
            message = body,
            delayMs = delayMs,
            notificationId = notificationId
        )
    }

    /**
     * Cancel a scheduled notification.
     *
     * @param notificationId The ID of the notification to cancel
     */
    @JavascriptInterface
    fun cancelNotification(notificationId: Int) {
        Log.d(TAG, "cancelNotification: id=$notificationId")
        notificationHelper.cancelNotification(notificationId)
    }

    /**
     * Cancel all scheduled notifications.
     */
    @JavascriptInterface
    fun cancelAllNotifications() {
        Log.d(TAG, "cancelAllNotifications")
        notificationHelper.cancelAllNotifications()
    }

    /**
     * Show an immediate notification (no delay).
     *
     * @param title Notification title
     * @param body Notification body text
     */
    @JavascriptInterface
    fun showNotification(title: String, body: String) {
        Log.d(TAG, "showNotification: title=$title")
        notificationHelper.showNotification(title, body)
    }

    /**
     * Show a toast message (short popup).
     *
     * @param message Message to display
     */
    @JavascriptInterface
    fun showToast(message: String) {
        Log.d(TAG, "showToast: $message")
        android.os.Handler(context.mainLooper).post {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Log a message to Android's Logcat (for debugging).
     *
     * @param message Message to log
     * @param level Log level: "d" (debug), "i" (info), "w" (warn), "e" (error)
     */
    @JavascriptInterface
    fun log(message: String, level: String = "d") {
        when (level.lowercase()) {
            "d" -> Log.d("WebApp", message)
            "i" -> Log.i("WebApp", message)
            "w" -> Log.w("WebApp", message)
            "e" -> Log.e("WebApp", message)
            else -> Log.d("WebApp", message)
        }
    }

    /**
     * Check if notification permission is granted.
     *
     * @return true if permission is granted
     */
    @JavascriptInterface
    fun hasNotificationPermission(): Boolean {
        return notificationHelper.hasNotificationPermission()
    }

    /**
     * Vibrate the device.
     *
     * @param durationMs Duration in milliseconds
     */
    @JavascriptInterface
    fun vibrate(durationMs: Long = 200) {
        Log.d(TAG, "vibrate: ${durationMs}ms")
        notificationHelper.vibrate(durationMs)
    }

    /**
     * Get app version information.
     *
     * @return JSON string with version info
     */
    @JavascriptInterface
    fun getAppVersion(): String {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            JSONObject().apply {
                put("versionName", packageInfo.versionName)
                put("versionCode", packageInfo.longVersionCode)
            }.toString()
        } catch (e: Exception) {
            Log.e(TAG, "Error getting app version", e)
            "{}"
        }
    }
}
