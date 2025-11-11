# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep JavaScript interface methods
-keepclassmembers class com.qswf.app.WebAppInterface {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep notification helper
-keep class com.qswf.app.NotificationHelper { *; }
-keep class com.qswf.app.NotificationHelper$NotificationReceiver { *; }

# WebView
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public void *(android.webkit.WebView, java.lang.String);
}

# Keep all classes used by reflection
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes SourceFile,LineNumberTable