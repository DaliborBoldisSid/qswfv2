package com.qswf.app

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import android.Manifest
import android.content.pm.PackageManager
import android.util.Log

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var notificationHelper: NotificationHelper

    companion object {
        private const val TAG = "MainActivity"
        private const val WEB_APP_URL = "https://daliborboldissid.github.io/qswfv2/"
        private const val NOTIFICATION_PERMISSION_CODE = 123
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize notification helper
        notificationHelper = NotificationHelper(this)

        // Request notification permission for Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    NOTIFICATION_PERMISSION_CODE
                )
            }
        }

        // Setup WebView
        webView = findViewById(R.id.webView)
        setupWebView()

        // Handle deep links
        handleIntent(intent)

        // Handle back button
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT

            // Enable modern web features
            allowFileAccess = false
            allowContentAccess = false

            // Enable responsive design
            useWideViewPort = true
            loadWithOverviewMode = true

            // Enable zoom (optional)
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false

            // Performance optimizations
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                safeBrowsingEnabled = true
            }
        }

        // Add JavaScript interface for web-to-native communication
        webView.addJavascriptInterface(
            WebAppInterface(this, notificationHelper),
            "Android"
        )

        // WebViewClient - handle page navigation
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                // Handle external links
                return if (url.startsWith(WEB_APP_URL)) {
                    false // Load in WebView
                } else {
                    // Open in browser
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    true
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                Log.d(TAG, "Page loaded: $url")
            }
        }

        // WebChromeClient - handle JavaScript dialogs, console logs, etc.
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: android.webkit.ConsoleMessage?): Boolean {
                message?.let {
                    Log.d(TAG, "WebView Console: ${it.message()} (${it.sourceId()}:${it.lineNumber()})")
                }
                return true
            }
        }

        // Load the web app
        webView.loadUrl(WEB_APP_URL)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        val data: Uri? = intent?.data

        if (data != null) {
            Log.d(TAG, "Deep link received: $data")

            when (data.scheme) {
                "qswf" -> handleQswfDeepLink(data)
                "https" -> {
                    // Handle HTTPS deep links
                    if (data.host == "daliborboldissid.github.io") {
                        webView.loadUrl(data.toString())
                    }
                }
            }
        }
    }

    private fun handleQswfDeepLink(uri: Uri) {
        when (uri.host) {
            "notification" -> {
                // Handled by NotificationHelper when scheduling
                Log.d(TAG, "Notification deep link: $uri")
            }
            "open" -> {
                // Just open the app
                webView.loadUrl(WEB_APP_URL)
            }
            "stats" -> {
                // Navigate to stats page
                webView.evaluateJavascript(
                    "if (window.navigateToStats) window.navigateToStats();",
                    null
                )
            }
            "achievements" -> {
                // Navigate to achievements page
                webView.evaluateJavascript(
                    "if (window.navigateToAchievements) window.navigateToAchievements();",
                    null
                )
            }
            else -> {
                Log.w(TAG, "Unknown deep link host: ${uri.host}")
            }
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == NOTIFICATION_PERMISSION_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d(TAG, "Notification permission granted")
                // Notify the web app that permission was granted
                webView.evaluateJavascript(
                    "if (window.onNotificationPermissionGranted) window.onNotificationPermissionGranted();",
                    null
                )
            } else {
                Log.w(TAG, "Notification permission denied")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        webView.destroy()
    }
}