import Foundation
import Capacitor
import UIKit
import GameController
import AudioToolbox

@objc(StrataPlugin)
public class StrataPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StrataPlugin"
    public let jsName = "Strata"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getDeviceProfile", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getControlHints", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getInputSnapshot", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setInputMapping", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "triggerHaptics", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "triggerHaptic", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "vibrate", returnType: CAPPluginReturnPromise)
    ]
    
    private var inputMapping: [String: [String]] = [
        "moveForward": ["KeyW", "ArrowUp"],
        "moveBackward": ["KeyS", "ArrowDown"],
        "moveLeft": ["KeyA", "ArrowLeft"],
        "moveRight": ["KeyD", "ArrowRight"],
        "jump": ["Space"],
        "action": ["KeyE", "Enter"],
        "cancel": ["Escape"]
    ]
    
    private var activeTouches: [Int: [String: Any]] = [:]
    private var lightImpactGenerator: UIImpactFeedbackGenerator?
    private var mediumImpactGenerator: UIImpactFeedbackGenerator?
    private var heavyImpactGenerator: UIImpactFeedbackGenerator?
    
    public override func load() {
        lightImpactGenerator = UIImpactFeedbackGenerator(style: .light)
        mediumImpactGenerator = UIImpactFeedbackGenerator(style: .medium)
        heavyImpactGenerator = UIImpactFeedbackGenerator(style: .heavy)
        
        lightImpactGenerator?.prepare()
        mediumImpactGenerator?.prepare()
        heavyImpactGenerator?.prepare()
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(controllerDidConnect),
            name: .GCControllerDidConnect,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(controllerDidDisconnect),
            name: .GCControllerDidDisconnect,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(orientationDidChange),
            name: UIDevice.orientationDidChangeNotification,
            object: nil
        )
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    @objc func controllerDidConnect(_ notification: Notification) {
        guard let controller = notification.object as? GCController else { return }
        let index = GCController.controllers().firstIndex(of: controller) ?? 0
        notifyListeners("gamepadConnected", data: [
            "index": index,
            "id": controller.vendorName ?? "Unknown Controller"
        ])
        notifyDeviceChange()
    }
    
    @objc func controllerDidDisconnect(_ notification: Notification) {
        guard let controller = notification.object as? GCController else { return }
        let index = GCController.controllers().firstIndex(of: controller) ?? 0
        notifyListeners("gamepadDisconnected", data: ["index": index])
        notifyDeviceChange()
    }
    
    @objc func orientationDidChange() {
        notifyDeviceChange()
    }
    
    private func notifyDeviceChange() {
        let profile = buildDeviceProfile()
        notifyListeners("deviceChange", data: profile)
    }
    
    private func detectDeviceType() -> String {
        let device = UIDevice.current
        switch device.userInterfaceIdiom {
        case .phone:
            return "mobile"
        case .pad:
            return "tablet"
        case .mac:
            return "desktop"
        default:
            return "mobile"
        }
    }
    
    private func detectInputMode() -> String {
        let hasGamepad = !GCController.controllers().isEmpty
        let hasTouch = true
        
        if hasGamepad && hasTouch {
            return "hybrid"
        } else if hasGamepad {
            return "gamepad"
        }
        return "touch"
    }
    
    private func getOrientation() -> String {
        let orientation = UIDevice.current.orientation
        switch orientation {
        case .landscapeLeft, .landscapeRight:
            return "landscape"
        case .portrait, .portraitUpsideDown:
            return "portrait"
        default:
            let screen = UIScreen.main.bounds
            return screen.width > screen.height ? "landscape" : "portrait"
        }
    }
    
    private func getSafeAreaInsets() -> [String: CGFloat] {
        var insets: [String: CGFloat] = ["top": 0, "right": 0, "bottom": 0, "left": 0]
        
        DispatchQueue.main.sync {
            if let window = UIApplication.shared.connectedScenes
                .compactMap({ $0 as? UIWindowScene })
                .flatMap({ $0.windows })
                .first(where: { $0.isKeyWindow }) {
                let safeArea = window.safeAreaInsets
                insets = [
                    "top": safeArea.top,
                    "right": safeArea.right,
                    "bottom": safeArea.bottom,
                    "left": safeArea.left
                ]
            }
        }
        
        return insets
    }
    
    private func buildDeviceProfile() -> [String: Any] {
        let deviceType = detectDeviceType()
        let inputMode = detectInputMode()
        let screen = UIScreen.main.bounds
        let hasGamepad = !GCController.controllers().isEmpty
        
        return [
            "deviceType": deviceType,
            "platform": "ios",
            "inputMode": inputMode,
            "orientation": getOrientation(),
            "hasTouch": true,
            "hasPointer": false,
            "hasGamepad": hasGamepad,
            "isMobile": deviceType == "mobile",
            "isTablet": deviceType == "tablet",
            "isFoldable": false,
            "isDesktop": deviceType == "desktop",
            "screenWidth": screen.width,
            "screenHeight": screen.height,
            "pixelRatio": UIScreen.main.scale,
            "safeAreaInsets": getSafeAreaInsets()
        ]
    }
    
    @objc func getDeviceProfile(_ call: CAPPluginCall) {
        let profile = buildDeviceProfile()
        call.resolve(profile)
    }
    
    @objc func getControlHints(_ call: CAPPluginCall) {
        let inputMode = detectInputMode()
        var hints: [String: String]
        
        switch inputMode {
        case "touch":
            hints = [
                "movement": "Drag to move",
                "action": "Tap to interact",
                "camera": "Pinch to zoom"
            ]
        case "gamepad":
            hints = [
                "movement": "Left stick to move",
                "action": "A / X to interact",
                "camera": "Right stick to look"
            ]
        case "hybrid":
            hints = [
                "movement": "Touch or stick to move",
                "action": "Tap or A to interact",
                "camera": "Swipe or right stick"
            ]
        default:
            hints = [
                "movement": "Drag to move",
                "action": "Tap to interact",
                "camera": "Pinch to zoom"
            ]
        }
        
        call.resolve(hints)
    }
    
    @objc func getInputSnapshot(_ call: CAPPluginCall) {
        var leftStick: [String: Float] = ["x": 0, "y": 0]
        var rightStick: [String: Float] = ["x": 0, "y": 0]
        var buttons: [String: Bool] = [
            "jump": false,
            "action": false,
            "cancel": false
        ]
        var triggers: [String: Float] = ["left": 0, "right": 0]
        
        if let controller = GCController.controllers().first,
           let gamepad = controller.extendedGamepad {
            let deadzone: Float = 0.15
            
            let lx = gamepad.leftThumbstick.xAxis.value
            let ly = gamepad.leftThumbstick.yAxis.value
            if abs(lx) > deadzone { leftStick["x"] = lx }
            if abs(ly) > deadzone { leftStick["y"] = -ly }
            
            let rx = gamepad.rightThumbstick.xAxis.value
            let ry = gamepad.rightThumbstick.yAxis.value
            if abs(rx) > deadzone { rightStick["x"] = rx }
            if abs(ry) > deadzone { rightStick["y"] = -ry }
            
            buttons["jump"] = gamepad.buttonA.isPressed
            buttons["action"] = gamepad.buttonB.isPressed
            buttons["cancel"] = gamepad.buttonX.isPressed
            
            triggers["left"] = gamepad.leftTrigger.value
            triggers["right"] = gamepad.rightTrigger.value
        }
        
        let touchesArray: [[String: Any]] = activeTouches.map { (id, data) in
            return [
                "id": id,
                "position": data["position"] ?? ["x": 0, "y": 0],
                "phase": data["phase"] ?? "began"
            ]
        }
        
        let snapshot: [String: Any] = [
            "timestamp": CACurrentMediaTime() * 1000,
            "leftStick": leftStick,
            "rightStick": rightStick,
            "buttons": buttons,
            "triggers": triggers,
            "touches": touchesArray
        ]
        
        call.resolve(snapshot)
    }
    
    @objc func setInputMapping(_ call: CAPPluginCall) {
        if let moveForward = call.getArray("moveForward", String.self) {
            inputMapping["moveForward"] = moveForward
        }
        if let moveBackward = call.getArray("moveBackward", String.self) {
            inputMapping["moveBackward"] = moveBackward
        }
        if let moveLeft = call.getArray("moveLeft", String.self) {
            inputMapping["moveLeft"] = moveLeft
        }
        if let moveRight = call.getArray("moveRight", String.self) {
            inputMapping["moveRight"] = moveRight
        }
        if let jump = call.getArray("jump", String.self) {
            inputMapping["jump"] = jump
        }
        if let action = call.getArray("action", String.self) {
            inputMapping["action"] = action
        }
        if let cancel = call.getArray("cancel", String.self) {
            inputMapping["cancel"] = cancel
        }
        
        call.resolve()
    }
    
    @objc func triggerHaptics(_ call: CAPPluginCall) {
        // Check if customIntensity is provided (takes precedence)
        let customIntensity = call.getDouble("customIntensity")
        let intensity: String

        if let customValue = customIntensity {
            // Map numeric intensity (0-1) to discrete iOS levels
            // Note: iOS only supports 3 levels (light/medium/heavy)
            let clampedValue = max(0.0, min(1.0, customValue))
            if clampedValue < 0.33 {
                intensity = "light"
            } else if clampedValue < 0.66 {
                intensity = "medium"
            } else {
                intensity = "heavy"
            }
        } else {
            intensity = call.getString("intensity") ?? "medium"
        }

        // Note: iOS ignores duration and pattern parameters
        // UIImpactFeedbackGenerator uses system default duration (~10ms)

        DispatchQueue.main.async { [weak self] in
            switch intensity {
            case "light":
                self?.lightImpactGenerator?.impactOccurred()
            case "heavy":
                self?.heavyImpactGenerator?.impactOccurred()
            default:
                self?.mediumImpactGenerator?.impactOccurred()
            }
        }

        call.resolve()
    }
    
    @objc func triggerHaptic(_ call: CAPPluginCall) {
        let pattern = call.getObject("pattern")
        let intensity = pattern?["intensity"] as? Double ?? 0.5
        
        DispatchQueue.main.async { [weak self] in
            if intensity < 0.33 {
                self?.lightImpactGenerator?.impactOccurred()
            } else if intensity < 0.66 {
                self?.mediumImpactGenerator?.impactOccurred()
            } else {
                self?.heavyImpactGenerator?.impactOccurred()
            }
        }
        
        call.resolve()
    }
    
    @objc func vibrate(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            self?.heavyImpactGenerator?.impactOccurred()
        }
        call.resolve()
    }
    
    public func handleTouchBegan(_ touch: UITouch, at location: CGPoint) {
        let id = touch.hash
        activeTouches[id] = [
            "position": ["x": location.x, "y": location.y],
            "phase": "began"
        ]
    }
    
    public func handleTouchMoved(_ touch: UITouch, at location: CGPoint) {
        let id = touch.hash
        if activeTouches[id] != nil {
            activeTouches[id] = [
                "position": ["x": location.x, "y": location.y],
                "phase": "moved"
            ]
        }
    }
    
    public func handleTouchEnded(_ touch: UITouch) {
        let id = touch.hash
        activeTouches.removeValue(forKey: id)
    }
    
    public func handleTouchCancelled(_ touch: UITouch) {
        let id = touch.hash
        activeTouches.removeValue(forKey: id)
    }
}
