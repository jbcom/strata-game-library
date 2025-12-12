package com.strata.capacitor;

import android.content.Context;
import android.content.res.Configuration;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.InputDevice;
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

@CapacitorPlugin(name = "Strata")
public class StrataPlugin extends Plugin {

    private static final int MAX_INPUT_MAPPING_SIZE = 5;
    private static final int MAX_INPUT_ACTION_LENGTH = 32;

    private Map<String, List<String>> inputMapping = new HashMap<>();
    private Map<Integer, JSObject> activeTouches = new HashMap<>();
    private Vibrator vibrator;

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
        leftStick.put("x", 0);
        leftStick.put("y", 0);
        
        JSObject rightStick = new JSObject();
        rightStick.put("x", 0);
        rightStick.put("y", 0);
        
        JSObject buttons = new JSObject();
        buttons.put("jump", false);
        buttons.put("action", false);
        buttons.put("cancel", false);
        
        JSObject triggers = new JSObject();
        triggers.put("left", 0);
        triggers.put("right", 0);

        int[] deviceIds = InputDevice.getDeviceIds();
        for (int deviceId : deviceIds) {
            InputDevice device = InputDevice.getDevice(deviceId);
            if (device != null) {
                int sources = device.getSources();
                if ((sources & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD ||
                    (sources & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK) {
                    break;
                }
            }
        }

        JSArray touchesArray = new JSArray();
        for (Map.Entry<Integer, JSObject> entry : activeTouches.entrySet()) {
            JSObject touchData = new JSObject();
            touchData.put("id", entry.getKey());
            try {
                touchData.put("position", entry.getValue().get("position"));
                touchData.put("phase", entry.getValue().getString("phase"));
            } catch (JSONException e) {
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
        try {
            JSArray moveForward = call.getArray("moveForward");
            if (moveForward != null) {
                inputMapping.put("moveForward", jsArrayToStringList(moveForward));
            }
            
            JSArray moveBackward = call.getArray("moveBackward");
            if (moveBackward != null) {
                inputMapping.put("moveBackward", jsArrayToStringList(moveBackward));
            }
            
            JSArray moveLeft = call.getArray("moveLeft");
            if (moveLeft != null) {
                inputMapping.put("moveLeft", jsArrayToStringList(moveLeft));
            }
            
            JSArray moveRight = call.getArray("moveRight");
            if (moveRight != null) {
                inputMapping.put("moveRight", jsArrayToStringList(moveRight));
            }
            
            JSArray jump = call.getArray("jump");
            if (jump != null) {
                inputMapping.put("jump", jsArrayToStringList(jump));
            }
            
            JSArray action = call.getArray("action");
            if (action != null) {
                inputMapping.put("action", jsArrayToStringList(action));
            }
            
            JSArray cancel = call.getArray("cancel");
            if (cancel != null) {
                inputMapping.put("cancel", jsArrayToStringList(cancel));
            }
        } catch (JSONException e) {
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

    @PluginMethod
    public void triggerHaptic(PluginCall call) {
        JSObject pattern = call.getObject("pattern");
        
        if (vibrator == null || !vibrator.hasVibrator()) {
            call.resolve();
            return;
        }

        long duration = 50;
        int amplitude = 128;
        
        if (pattern != null) {
            duration = pattern.getInteger("duration", 50);
            double intensityValue = pattern.getDouble("intensity", 0.5);
            amplitude = (int) (intensityValue * 255);
            amplitude = Math.max(1, Math.min(255, amplitude));
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(duration, amplitude));
        } else {
            vibrator.vibrate(duration);
        }
        
        call.resolve();
    }

    @PluginMethod
    public void vibrate(PluginCall call) {
        Integer duration = call.getInt("duration", 200);
        
        if (vibrator == null || !vibrator.hasVibrator()) {
            call.resolve();
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
            vibrator.vibrate(duration);
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
}
