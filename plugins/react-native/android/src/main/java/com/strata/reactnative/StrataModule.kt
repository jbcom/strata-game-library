package com.strata.reactnative

import com.facebook.react.bridge.*
import android.content.Context
import android.content.pm.ActivityInfo
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager


/**
 * Strata React Native module for Android.
 *
 * Provides device detection, input handling, and haptic feedback.
 */
class StrataModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "StrataModule"

    /**
     * Get device profile information.
     */
    @ReactMethod
    fun getDeviceProfile(promise: Promise) {
        val result = Arguments.createMap().apply {
            putString("platform", "android")
            putString("deviceType", getDeviceType())
            putBoolean("hasTouch", true)
            putBoolean("hasGamepad", false) // TODO: detect gamepad
            putDouble("screenWidth", getScreenWidth())
            putDouble("screenHeight", getScreenHeight())
            putDouble("pixelRatio", getPixelRatio())
            putMap("safeAreaInsets", getSafeAreaInsets())
            putString("performanceMode", getPerformanceModeInternal())
        }
        promise.resolve(result)
    }

    private fun getPerformanceModeInternal(): String {
        var isLowPowerMode = false
        val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? android.os.PowerManager
        if (powerManager != null) {
            isLowPowerMode = powerManager.isPowerSaveMode
        }

        val mi = android.app.ActivityManager.MemoryInfo()
        val activityManager = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as? android.app.ActivityManager
        activityManager?.getMemoryInfo(mi)

        return if (isLowPowerMode || mi.totalMem < 2L * 1024 * 1024 * 1024) {
            "low"
        } else if (mi.totalMem < 4L * 1024 * 1024 * 1024) {
            "medium"
        } else {
            "high"
        }
    }

    @ReactMethod
    fun getPerformanceMode(promise: Promise) {
        val map = Arguments.createMap()

        var isLowPowerMode = false
        val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? android.os.PowerManager
        if (powerManager != null) {
            isLowPowerMode = powerManager.isPowerSaveMode
        }

        val mi = android.app.ActivityManager.MemoryInfo()
        val activityManager = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as? android.app.ActivityManager
        activityManager?.getMemoryInfo(mi)

        map.putString("mode", getPerformanceModeInternal())
        map.putBoolean("isLowPowerMode", isLowPowerMode)
        map.putDouble("totalMemory", mi.totalMem.toDouble())
        promise.resolve(map)
    }

    @ReactMethod
    fun setOrientation(orientation: String) {
        val currentActivity = currentActivity ?: return
        val orientationConstant = when (orientation) {
            "portrait" -> ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
            "landscape" -> ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
            else -> ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
        }
        currentActivity.requestedOrientation = orientationConstant
    }

    /**
     * Trigger haptic feedback.
     */
    @ReactMethod
    fun triggerHaptics(intensity: String, promise: Promise) {
        try {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = reactApplicationContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vibratorManager.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                reactApplicationContext.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }

            if (!vibrator.hasVibrator()) {
                promise.resolve(null)
                return
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val effect = when (intensity) {
                    "light" -> VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE)
                    "heavy" -> VibrationEffect.createOneShot(200, VibrationEffect.DEFAULT_AMPLITUDE)
                    else -> VibrationEffect.createOneShot(100, VibrationEffect.DEFAULT_AMPLITUDE) // medium
                }
                vibrator.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                val duration = when (intensity) {
                    "light" -> 50L
                    "heavy" -> 200L
                    else -> 100L
                }
                vibrator.vibrate(duration)
            }

            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("HAPTICS_ERROR", "Failed to trigger haptics: ${e.message}")
        } catch (e: Error) {
            promise.reject("HAPTICS_ERROR", "Critical error triggering haptics: ${e.message}")
        }
    }

    private fun getDeviceType(): String {
        val context = reactApplicationContext
        val metrics = context.resources.displayMetrics
        val widthInches = metrics.widthPixels / metrics.xdpi
        val heightInches = metrics.heightPixels / metrics.ydpi
        val diagonalInches = Math.hypot(widthInches.toDouble(), heightInches.toDouble())

        return when {
            diagonalInches < 7 -> "mobile"
            diagonalInches < 10 -> "tablet"
            else -> "tablet"
        }
    }

    private fun getScreenWidth(): Double {
        return reactApplicationContext.resources.displayMetrics.widthPixels.toDouble()
    }

    private fun getScreenHeight(): Double {
        return reactApplicationContext.resources.displayMetrics.heightPixels.toDouble()
    }

    private fun getPixelRatio(): Double {
        return reactApplicationContext.resources.displayMetrics.density.toDouble()
    }

    private fun getSafeAreaInsets(): WritableMap {
        return Arguments.createMap().apply {
            putDouble("top", 0.0)
            putDouble("right", 0.0)
            putDouble("bottom", 0.0)
            putDouble("left", 0.0)
        }
    }
}
