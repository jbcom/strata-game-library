package com.strata.capacitor;

import android.content.Context;
import android.content.res.Configuration;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.view.WindowMetrics;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@CapacitorPlugin(name = "Strata")
public class StrataPlugin extends Plugin {

    private static final String TAG = "StrataPlugin";
    private static final int MAX_INPUT_MAPPING_SIZE = 5;
    private static final int MAX_INPUT_ACTION_LENGTH = 32;
    private static final float GAMEPAD_DEADZONE = 0.15f;

    /**
     * Immutable snapshot of gamepad axis values.
     * By extracting values immediately and storing them in an immutable object,
     * we avoid race conditions with MotionEvent recycling.
     */
    private static final class GamepadState {
        final float leftStickX;
        final float leftStickY;
        final float rightStickX;
        final float rightStickY;
        final float leftTrigger;
        final float rightTrigger;

        GamepadState(float leftStickX, float leftStickY, float rightStickX, float rightStickY,
                     float leftTrigger, float rightTrigger) {
            this.leftStickX = leftStickX;
            this.leftStickY = leftStickY;
            this.rightStickX = rightStickX;
            this.rightStickY = rightStickY;
            this.leftTrigger = leftTrigger;
            this.rightTrigger = rightTrigger;
        }
    }

    private Map<String, List<String>> inputMapping = new HashMap<>();
    // Use ConcurrentHashMap for thread safety - touch events come from UI thread,
    // while plugin methods may run on background threads
    private Map<Integer, JSObject> activeTouches = new ConcurrentHashMap<>();
    private Vibrator vibrator;
    // Store extracted gamepad axis values in an immutable snapshot to avoid
    // race conditions with MotionEvent recycling. The volatile keyword ensures
    // visibility of the reference, and immutability ensures safe usage.
    private volatile GamepadState lastGamepadState = null;
    // Selected controller device ID for multi-controller support
    // -1 means use first available controller
    private int selectedControllerDeviceId = -1;

    @Override
    public void load() {
        super.load();

        inputMapping.put("moveForward", createStringList("KeyW", "ArrowUp"));
        inputMapping.put("moveBackward", createStringList("KeyS", "ArrowDown"));
        inputMapping.put("moveLeft", createStringList("KeyA", "ArrowLeft"));
        inputMapping.put("moveRight", createStringList("KeyD", "ArrowRight"));
        inputMapping.put("jump", createStringList("Space"));
        inputMapping.put("action", createStringList("KeyE", "Enter"));
        inputMapping.put("cancel", createStringList("Escape"));

        initVibrator();
    }

    private List<String> createStringList(String... items) {
        List<String> list = new ArrayList<>();
        for (String item : items) {
            list.add(item);
        }
        return list;
    }

    private void initVibrator() {
        Context context = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vibratorManager = (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            if (vibratorManager != null) {
                vibrator = vibratorManager.getDefaultVibrator();
            }
        } else {
            vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        }
    }

    private String detectDeviceType() {
        Context context = getContext();
        Configuration config = context.getResources().getConfiguration();
        int screenLayout = config.screenLayout & Configuration.SCREENLAYOUT_SIZE_MASK;

        boolean isTablet = screenLayout >= Configuration.SCREENLAYOUT_SIZE_LARGE;

        if (isFoldableDevice()) {
            return "foldable";
        } else if (isTablet) {
            return "tablet";
        } else {
            return "mobile";
        }
    }

    private boolean isFoldableDevice() {
        String manufacturer = Build.MANUFACTURER.toLowerCase();
        String model = Build.MODEL.toLowerCase();

        if (manufacturer.contains("samsung") && (model.contains("fold") || model.contains("flip"))) {
            return true;
        }
        if (manufacturer.contains("huawei") && model.contains("mate x")) {
            return true;
        }
        if (manufacturer.contains("motorola") && model.contains("razr")) {
            return true;
        }
        return false;
    }

    private String detectInputMode() {
        boolean hasGamepad = hasGameController();
        boolean hasTouch = hasTouchScreen();

        if (hasGamepad && hasTouch) {
            return "hybrid";
        } else if (hasGamepad) {
            return "gamepad";
        } else if (hasTouch) {
            return "touch";
        }
        return "keyboard";
    }

    private boolean hasGameController() {
        int[] deviceIds = InputDevice.getDeviceIds();
        for (int deviceId : deviceIds) {
            InputDevice device = InputDevice.getDevice(deviceId);
            if (device != null) {
                int sources = device.getSources();
                if ((sources & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD ||
                    (sources & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean hasTouchScreen() {
        return getContext().getPackageManager().hasSystemFeature("android.hardware.touchscreen");
    }

    private String getOrientation() {
        Configuration config = getContext().getResources().getConfiguration();
        if (config.orientation == Configuration.ORIENTATION_LANDSCAPE) {
            return "landscape";
        }
        return "portrait";
    }

    private JSObject getSafeAreaInsets() {
        JSObject insets = new JSObject();
        insets.put("top", 0);
        insets.put("right", 0);
        insets.put("bottom", 0);
        insets.put("left", 0);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                View rootView = getActivity().getWindow().getDecorView();
                WindowInsets windowInsets = rootView.getRootWindowInsets();
                if (windowInsets != null) {
                    android.graphics.Insets systemInsets = windowInsets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout()
                    );
                    float density = getContext().getResources().getDisplayMetrics().density;
                    insets.put("top", systemInsets.top / density);
                    insets.put("right", systemInsets.right / density);
                    insets.put("bottom", systemInsets.bottom / density);
                    insets.put("left", systemInsets.left / density);
                }
            } catch (Exception e) {
                Log.w(TAG, "Error getting safe area insets (API 30+)", e);
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            try {
                View rootView = getActivity().getWindow().getDecorView();
                WindowInsets windowInsets = rootView.getRootWindowInsets();
                if (windowInsets != null) {
                    android.view.DisplayCutout cutout = windowInsets.getDisplayCutout();
                    if (cutout != null) {
                        float density = getContext().getResources().getDisplayMetrics().density;
                        insets.put("top", cutout.getSafeInsetTop() / density);
                        insets.put("right", cutout.getSafeInsetRight() / density);
                        insets.put("bottom", cutout.getSafeInsetBottom() / density);
                        insets.put("left", cutout.getSafeInsetLeft() / density);
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "Error getting safe area insets (API 28+)", e);
            }
        }

        return insets;
    }

    private JSObject buildDeviceProfile() {
        JSObject profile = new JSObject();

        String deviceType = detectDeviceType();
        String inputMode = detectInputMode();
        DisplayMetrics metrics = getContext().getResources().getDisplayMetrics();

        profile.put("deviceType", deviceType);
        profile.put("platform", "android");
        profile.put("inputMode", inputMode);
        profile.put("orientation", getOrientation());
        profile.put("hasTouch", hasTouchScreen());
        profile.put("hasPointer", false);
        profile.put("hasGamepad", hasGameController());
        profile.put("isMobile", deviceType.equals("mobile"));
        profile.put("isTablet", deviceType.equals("tablet"));
        profile.put("isFoldable", deviceType.equals("foldable"));
        profile.put("isDesktop", false);
        profile.put("screenWidth", metrics.widthPixels / metrics.density);
        profile.put("screenHeight", metrics.heightPixels / metrics.density);
        profile.put("pixelRatio", metrics.density);
        profile.put("safeAreaInsets", getSafeAreaInsets());

        return profile;
    }

    @PluginMethod
    public void getDeviceProfile(PluginCall call) {
        JSObject profile = buildDeviceProfile();
        call.resolve(profile);
    }

    @PluginMethod
    public void getControlHints(PluginCall call) {
        String inputMode = detectInputMode();
        JSObject hints = new JSObject();

        switch (inputMode) {
            case "touch":
                hints.put("movement", "Drag to move");
                hints.put("action", "Tap to interact");
                hints.put("camera", "Pinch to zoom");
                break;
            case "gamepad":
                hints.put("movement", "Left stick to move");
                hints.put("action", "A / X to interact");
                hints.put("camera", "Right stick to look");
                break;
            case "hybrid":
                hints.put("movement", "Touch or stick to move");
                hints.put("action", "Tap or A to interact");
                hints.put("camera", "Swipe or right stick");
                break;
            default:
                hints.put("movement", "Drag to move");
                hints.put("action", "Tap to interact");
                hints.put("camera", "Pinch to zoom");
                break;
        }

        call.resolve(hints);
    }

    @PluginMethod
    public void getInputSnapshot(PluginCall call) {
        JSObject snapshot = new JSObject();

        JSObject leftStick = new JSObject();
        leftStick.put("x", 0.0f);
        leftStick.put("y", 0.0f);

        JSObject rightStick = new JSObject();
        rightStick.put("x", 0.0f);
        rightStick.put("y", 0.0f);

        JSObject buttons = new JSObject();
        buttons.put("jump", false);
        buttons.put("action", false);
        buttons.put("cancel", false);

        JSObject triggers = new JSObject();
        triggers.put("left", 0.0f);
        triggers.put("right", 0.0f);

        // Read gamepad input from the immutable state snapshot if available
        // This is thread-safe: we read the volatile reference once, and the
        // GamepadState object is immutable, so no race conditions are possible.
        GamepadState gamepadState = lastGamepadState;
        if (gamepadState != null) {
            // Apply deadzone and populate stick values
            if (Math.abs(gamepadState.leftStickX) > GAMEPAD_DEADZONE) {
                leftStick.put("x", gamepadState.leftStickX);
            }
            if (Math.abs(gamepadState.leftStickY) > GAMEPAD_DEADZONE) {
                leftStick.put("y", -gamepadState.leftStickY); // Invert Y for game-style coordinates
            }

            if (Math.abs(gamepadState.rightStickX) > GAMEPAD_DEADZONE) {
                rightStick.put("x", gamepadState.rightStickX);
            }
            if (Math.abs(gamepadState.rightStickY) > GAMEPAD_DEADZONE) {
                rightStick.put("y", -gamepadState.rightStickY); // Invert Y for game-style coordinates
            }

            // Trigger values (already 0 to 1 range)
            triggers.put("left", gamepadState.leftTrigger);
            triggers.put("right", gamepadState.rightTrigger);
        }

        JSArray touchesArray = new JSArray();
        for (Map.Entry<Integer, JSObject> entry : activeTouches.entrySet()) {
            JSObject touchData = new JSObject();
            touchData.put("id", entry.getKey());
            try {
                touchData.put("position", entry.getValue().get("position"));
                touchData.put("phase", entry.getValue().getString("phase"));
            } catch (JSONException e) {
                Log.w(TAG, "Error reading touch data", e);
            }
            touchesArray.put(touchData);
        }

        snapshot.put("timestamp", System.currentTimeMillis());
        snapshot.put("leftStick", leftStick);
        snapshot.put("rightStick", rightStick);
        snapshot.put("buttons", buttons);
        snapshot.put("triggers", triggers);
        snapshot.put("touches", touchesArray);

        call.resolve(snapshot);
    }

    @PluginMethod
    public void setInputMapping(PluginCall call) {
        String[] actions = {
            "moveForward", "moveBackward", "moveLeft", "moveRight",
            "jump", "action", "cancel"
        };

        try {
            for (String action : actions) {
                JSArray mapping = call.getArray(action);
                if (mapping != null) {
                    inputMapping.put(action, jsArrayToStringList(mapping));
                }
            }
        } catch (JSONException e) {
            Log.w(TAG, "Error setting input mapping", e);
        }

        call.resolve();
    }

    private List<String> jsArrayToStringList(JSArray array) throws JSONException {
        List<String> list = new ArrayList<>();
        int length = Math.min(array.length(), MAX_INPUT_MAPPING_SIZE);
        for (int i = 0; i < length; i++) {
            String val = array.getString(i);
            if (val != null && val.length() < MAX_INPUT_ACTION_LENGTH) {
                list.add(val);
            }
        }
        return list;
    }

    @PluginMethod
    public void selectController(PluginCall call) {
        int index = call.getInt("index", 0);
        List<InputDevice> controllers = getGameControllers();

        JSObject result = new JSObject();
        if (index >= 0 && index < controllers.size()) {
            InputDevice device = controllers.get(index);
            selectedControllerDeviceId = device.getId();
            result.put("success", true);
            result.put("selectedIndex", index);
            result.put("controllerId", device.getName());
        } else if (controllers.isEmpty()) {
            selectedControllerDeviceId = -1;
            result.put("success", false);
            result.put("error", "No controllers connected");
        } else {
            result.put("success", false);
            result.put("error", "Controller index " + index + " out of range. Available: 0-" + (controllers.size() - 1));
        }
        call.resolve(result);
    }

    @PluginMethod
    public void getConnectedControllers(PluginCall call) {
        List<InputDevice> controllers = getGameControllers();
        JSArray controllersArray = new JSArray();

        int selectedIndex = 0;
        for (int i = 0; i < controllers.size(); i++) {
            InputDevice device = controllers.get(i);
            JSObject controller = new JSObject();
            controller.put("index", i);
            controller.put("id", device.getName());
            boolean isSelected = (selectedControllerDeviceId == -1 && i == 0) ||
                                 (selectedControllerDeviceId == device.getId());
            controller.put("isSelected", isSelected);
            controller.put("hasExtendedGamepad", true);
            controller.put("hasMicroGamepad", false);
            controllersArray.put(controller);

            if (isSelected) {
                selectedIndex = i;
            }
        }

        JSObject result = new JSObject();
        result.put("controllers", controllersArray);
        result.put("selectedIndex", selectedIndex);
        call.resolve(result);
    }

    /**
     * Get list of connected game controllers (gamepads/joysticks)
     */
    private List<InputDevice> getGameControllers() {
        List<InputDevice> controllers = new ArrayList<>();
        int[] deviceIds = InputDevice.getDeviceIds();
        for (int deviceId : deviceIds) {
            InputDevice device = InputDevice.getDevice(deviceId);
            if (device != null) {
                int sources = device.getSources();
                if ((sources & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD ||
                    (sources & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK) {
                    controllers.add(device);
                }
            }
        }
        return controllers;
    }

    @PluginMethod
    public void triggerHaptics(PluginCall call) {
        if (vibrator == null || !vibrator.hasVibrator()) {
            call.resolve();
            return;
        }

        // Check for pattern array first (takes precedence)
        JSArray patternArray = call.getArray("pattern");
        if (patternArray != null && patternArray.length() > 0) {
            try {
                long[] pattern = new long[patternArray.length()];
                for (int i = 0; i < patternArray.length(); i++) {
                    pattern[i] = patternArray.getLong(i);
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    // Pattern vibration with default amplitude
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
                } else {
                    vibrator.vibrate(pattern, -1);
                }
                call.resolve();
                return;
            } catch (JSONException e) {
                Log.w(TAG, "Error parsing haptic pattern array, falling back to intensity-based haptics", e);
                // Fall through to standard intensity-based haptics
            }
        }

        // Determine amplitude from customIntensity or preset intensity
        int amplitude;
        Double customIntensity = call.getDouble("customIntensity");

        if (customIntensity != null) {
            // Map custom intensity (0-1) to amplitude (1-255)
            double clampedIntensity = Math.max(0.0, Math.min(1.0, customIntensity));
            amplitude = (int) Math.max(1, Math.min(255, clampedIntensity * 255));
        } else {
            // Use preset intensity
            String intensity = call.getString("intensity", "medium");
            switch (intensity) {
                case "light":
                    amplitude = 50;
                    break;
                case "heavy":
                    amplitude = 255;
                    break;
                default:
                    amplitude = 150;
                    break;
            }
        }

        // Determine duration
        Integer duration = call.getInt("duration");
        long vibrationDuration;

        if (duration != null) {
            vibrationDuration = duration;
        } else {
            // Default durations based on intensity
            if (amplitude <= 50) {
                vibrationDuration = 10;
            } else if (amplitude >= 200) {
                vibrationDuration = 50;
            } else {
                vibrationDuration = 25;
            }
        }

        // Vibrate with amplitude control (Android O+) or simple vibration (older)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(vibrationDuration, amplitude));
        } else {
            vibrator.vibrate(vibrationDuration);
        }

        call.resolve();
    }

    public void handleTouchEvent(MotionEvent event) {
        int action = event.getActionMasked();
        int pointerIndex = event.getActionIndex();
        int pointerId = event.getPointerId(pointerIndex);

        switch (action) {
            case MotionEvent.ACTION_DOWN:
            case MotionEvent.ACTION_POINTER_DOWN:
                JSObject touchDown = new JSObject();
                JSObject positionDown = new JSObject();
                positionDown.put("x", event.getX(pointerIndex));
                positionDown.put("y", event.getY(pointerIndex));
                touchDown.put("position", positionDown);
                touchDown.put("phase", "began");
                activeTouches.put(pointerId, touchDown);
                break;

            case MotionEvent.ACTION_MOVE:
                for (int i = 0; i < event.getPointerCount(); i++) {
                    int id = event.getPointerId(i);
                    if (activeTouches.containsKey(id)) {
                        JSObject touchMove = new JSObject();
                        JSObject positionMove = new JSObject();
                        positionMove.put("x", event.getX(i));
                        positionMove.put("y", event.getY(i));
                        touchMove.put("position", positionMove);
                        touchMove.put("phase", "moved");
                        activeTouches.put(id, touchMove);
                    }
                }
                break;

            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_POINTER_UP:
                activeTouches.remove(pointerId);
                break;

            case MotionEvent.ACTION_CANCEL:
                activeTouches.clear();
                break;
        }
    }

    public void notifyDeviceChange() {
        JSObject profile = buildDeviceProfile();
        notifyListeners("deviceChange", profile);
    }

    public void notifyGamepadConnected(int index, String id) {
        JSObject data = new JSObject();
        data.put("index", index);
        data.put("id", id);
        notifyListeners("gamepadConnected", data);
    }

    public void notifyGamepadDisconnected(int index) {
        JSObject data = new JSObject();
        data.put("index", index);
        notifyListeners("gamepadDisconnected", data);
    }

    /**
     * Handle gamepad motion events to capture stick and trigger values.
     * This should be called from the Activity's onGenericMotionEvent.
     *
     * Thread-safety: This method extracts axis values immediately and stores
     * them in an immutable GamepadState object. This avoids race conditions
     * with MotionEvent recycling - the caller can recycle the event after
     * this method returns without affecting getInputSnapshot on other threads.
     */
    public void handleGamepadMotionEvent(MotionEvent event) {
        if (event == null) return;

        int source = event.getSource();
        if ((source & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD ||
            (source & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK) {
            // Extract all axis values immediately from the event.
            // This is safe because we're on the UI thread that owns the event,
            // and we don't hold any reference to it after this method returns.
            float leftStickX = event.getAxisValue(MotionEvent.AXIS_X);
            float leftStickY = event.getAxisValue(MotionEvent.AXIS_Y);
            float rightStickX = event.getAxisValue(MotionEvent.AXIS_Z);
            float rightStickY = event.getAxisValue(MotionEvent.AXIS_RZ);

            // Read trigger values - some controllers use BRAKE/GAS instead
            float leftTrigger = event.getAxisValue(MotionEvent.AXIS_LTRIGGER);
            float rightTrigger = event.getAxisValue(MotionEvent.AXIS_RTRIGGER);
            if (leftTrigger == 0) {
                leftTrigger = event.getAxisValue(MotionEvent.AXIS_BRAKE);
            }
            if (rightTrigger == 0) {
                rightTrigger = event.getAxisValue(MotionEvent.AXIS_GAS);
            }

            // Store in an immutable snapshot - this is thread-safe for readers
            lastGamepadState = new GamepadState(
                leftStickX, leftStickY,
                rightStickX, rightStickY,
                leftTrigger, rightTrigger
            );
        }
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        // Clear the gamepad state reference to allow garbage collection
        lastGamepadState = null;
    }
}
