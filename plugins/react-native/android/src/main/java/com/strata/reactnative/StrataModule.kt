package com.strata.reactnative

import android.app.ActivityManager
import android.content.Context
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.os.Build
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.InputDevice
import android.view.KeyEvent
import android.view.MotionEvent
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap


/**
 * Strata React Native module for Android.
 *
 * Provides device detection, input handling, and haptic feedback.
 */
class StrataModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val buttons = linkedMapOf(
        "a" to false,
        "b" to false,
        "x" to false,
        "y" to false,
        "l1" to false,
        "r1" to false,
        "l2" to false,
        "r2" to false,
        "start" to false,
        "select" to false,
        "dpadUp" to false,
        "dpadDown" to false,
        "dpadLeft" to false,
        "dpadRight" to false
    )

    private var leftStickX = 0.0
    private var leftStickY = 0.0
    private var rightStickX = 0.0
    private var rightStickY = 0.0
    private var leftTrigger = 0.0
    private var rightTrigger = 0.0

    override fun getName(): String = "StrataModule"

    /**
     * Get device profile information.
     */
    @ReactMethod
    fun getDeviceProfile(promise: Promise) {
        try {
            val hasGamepad = hasGamepadConnected()
            val result = Arguments.createMap().apply {
                putString("platform", "android")
                putString("deviceType", getDeviceType())
                putString("inputMode", if (hasGamepad) "gamepad" else "touch")
                putString("orientation", getOrientation())
                putBoolean("hasTouch", reactApplicationContext.packageManager.hasSystemFeature("android.hardware.touchscreen"))
                putBoolean("hasGamepad", hasGamepad)
                putDouble("screenWidth", getScreenWidth())
                putDouble("screenHeight", getScreenHeight())
                putDouble("pixelRatio", getPixelRatio())
                putMap("safeAreaInsets", getSafeAreaInsetsMap())
                putString("performanceMode", getPerformanceModeInternal())
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("DEVICE_PROFILE_ERROR", "Failed to get device profile: ${e.message}")
        }
    }

    private fun getPerformanceModeInternal(): String {
        var isLowPowerMode = false
        val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
        if (powerManager != null) {
            isLowPowerMode = powerManager.isPowerSaveMode
        }

        val mi = ActivityManager.MemoryInfo()
        val activityManager = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
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
        val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
        if (powerManager != null) {
            isLowPowerMode = powerManager.isPowerSaveMode
        }

        val mi = ActivityManager.MemoryInfo()
        val activityManager = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
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

    @ReactMethod
    @Synchronized
    fun getInputSnapshot(promise: Promise) {
        val snapshot = Arguments.createMap().apply {
            putDouble("timestamp", System.currentTimeMillis().toDouble())
            putMap("buttons", getButtonsMap())
            putMap("leftStick", getStickMap(leftStickX, leftStickY))
            putMap("rightStick", getStickMap(rightStickX, rightStickY))
            putMap("triggers", getTriggersMap())
            putArray("connectedGamepads", getConnectedGamepadIdsArray())
        }

        promise.resolve(snapshot)
    }

    @ReactMethod
    fun getSafeAreaInsets(promise: Promise) {
        promise.resolve(getSafeAreaInsetsMap())
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
        val configuration = reactApplicationContext.resources.configuration

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R &&
            reactApplicationContext.packageManager.hasSystemFeature("android.hardware.sensor.hinge_angle")) {
            return "foldable"
        }

        return when {
            (configuration.screenLayout and Configuration.SCREENLAYOUT_SIZE_MASK) >= Configuration.SCREENLAYOUT_SIZE_LARGE -> "tablet"
            else -> "mobile"
        }
    }

    private fun getScreenWidth(): Double {
        val metrics = reactApplicationContext.resources.displayMetrics
        return metrics.widthPixels.toDouble() / metrics.density
    }

    private fun getScreenHeight(): Double {
        val metrics = reactApplicationContext.resources.displayMetrics
        return metrics.heightPixels.toDouble() / metrics.density
    }

    private fun getPixelRatio(): Double {
        return reactApplicationContext.resources.displayMetrics.density.toDouble()
    }

    private fun getOrientation(): String {
        return if (reactApplicationContext.resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE) {
            "landscape"
        } else {
            "portrait"
        }
    }

    private fun getSafeAreaInsetsMap(): WritableMap {
        val insetsMap = Arguments.createMap().apply {
            putDouble("top", 0.0)
            putDouble("right", 0.0)
            putDouble("bottom", 0.0)
            putDouble("left", 0.0)
        }
        val density = reactApplicationContext.resources.displayMetrics.density
        val activity = currentActivity

        if (activity != null) {
            val windowInsets = ViewCompat.getRootWindowInsets(activity.window.decorView)
            if (windowInsets != null) {
                val cutoutInsets = windowInsets.getInsets(WindowInsetsCompat.Type.displayCutout())
                insetsMap.putDouble("top", cutoutInsets.top.toDouble() / density)
                insetsMap.putDouble("right", cutoutInsets.right.toDouble() / density)
                insetsMap.putDouble("bottom", cutoutInsets.bottom.toDouble() / density)
                insetsMap.putDouble("left", cutoutInsets.left.toDouble() / density)
            }
        }

        if (insetsMap.getDouble("top") == 0.0) {
            val resourceId = reactApplicationContext.resources.getIdentifier("status_bar_height", "dimen", "android")
            if (resourceId > 0) {
                insetsMap.putDouble(
                    "top",
                    reactApplicationContext.resources.getDimensionPixelSize(resourceId).toDouble() / density
                )
            }
        }

        return insetsMap
    }

    private fun hasGamepadConnected(): Boolean {
        return getConnectedGamepadIds().isNotEmpty()
    }

    private fun getConnectedGamepadIds(): List<Int> {
        return InputDevice.getDeviceIds().mapNotNull { deviceId ->
            val device = InputDevice.getDevice(deviceId)
            if (device != null && isGamepadDevice(device)) deviceId else null
        }
    }

    private fun isGamepadDevice(device: InputDevice): Boolean {
        return isGamepadSource(device.sources)
    }

    private fun isGamepadSource(source: Int): Boolean {
        return (source and InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD ||
            (source and InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK
    }

    private fun getConnectedGamepadIdsArray() = Arguments.createArray().apply {
        getConnectedGamepadIds().forEach { pushInt(it) }
    }

    private fun getButtonsMap() = Arguments.createMap().apply {
        buttons.forEach { (button, pressed) -> putBoolean(button, pressed) }
    }

    private fun getStickMap(x: Double, y: Double) = Arguments.createMap().apply {
        putDouble("x", x)
        putDouble("y", y)
    }

    private fun getTriggersMap() = Arguments.createMap().apply {
        putDouble("left", leftTrigger)
        putDouble("right", rightTrigger)
    }

    @Synchronized
    fun handleKeyEvent(event: KeyEvent): Boolean {
        if (!isGamepadSource(event.source)) return false

        val button = when (event.keyCode) {
            KeyEvent.KEYCODE_BUTTON_A -> "a"
            KeyEvent.KEYCODE_BUTTON_B -> "b"
            KeyEvent.KEYCODE_BUTTON_X -> "x"
            KeyEvent.KEYCODE_BUTTON_Y -> "y"
            KeyEvent.KEYCODE_BUTTON_L1 -> "l1"
            KeyEvent.KEYCODE_BUTTON_R1 -> "r1"
            KeyEvent.KEYCODE_BUTTON_L2 -> "l2"
            KeyEvent.KEYCODE_BUTTON_R2 -> "r2"
            KeyEvent.KEYCODE_BUTTON_START -> "start"
            KeyEvent.KEYCODE_BUTTON_SELECT -> "select"
            KeyEvent.KEYCODE_DPAD_UP -> "dpadUp"
            KeyEvent.KEYCODE_DPAD_DOWN -> "dpadDown"
            KeyEvent.KEYCODE_DPAD_LEFT -> "dpadLeft"
            KeyEvent.KEYCODE_DPAD_RIGHT -> "dpadRight"
            else -> null
        }

        if (button == null) return false

        buttons[button] = event.action == KeyEvent.ACTION_DOWN
        return true
    }

    @Synchronized
    fun handleMotionEvent(event: MotionEvent): Boolean {
        if (!isGamepadSource(event.source) || event.action != MotionEvent.ACTION_MOVE) return false

        leftStickX = event.getAxisValue(MotionEvent.AXIS_X).toDouble()
        leftStickY = event.getAxisValue(MotionEvent.AXIS_Y).toDouble()
        rightStickX = event.getAxisValue(MotionEvent.AXIS_Z).toDouble()
        rightStickY = event.getAxisValue(MotionEvent.AXIS_RZ).toDouble()
        leftTrigger = maxOf(
            event.getAxisValue(MotionEvent.AXIS_BRAKE).toDouble(),
            event.getAxisValue(MotionEvent.AXIS_LTRIGGER).toDouble()
        )
        rightTrigger = maxOf(
            event.getAxisValue(MotionEvent.AXIS_GAS).toDouble(),
            event.getAxisValue(MotionEvent.AXIS_RTRIGGER).toDouble()
        )

        return true
    }
}
