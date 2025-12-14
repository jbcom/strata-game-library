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
        CAPPluginMethod(name: "selectController", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getConnectedControllers", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "triggerHaptics", returnType: CAPPluginReturnPromise)
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

    /// Maps action names to GCController button property names
    /// Users can customize which button triggers which action via setInputMapping
    private var gamepadButtonMapping: [String: String] = [
        "jump": "buttonA",
        "action": "buttonB",
        "cancel": "buttonX"
    ]

    /// Index of the currently selected controller (0-based)
    /// Use selectController() to change which controller is used for input
    private var selectedControllerIndex: Int = 0

    private var activeTouches: [Int: [String: Any]] = [:]
    // Serial queue for thread-safe access to activeTouches dictionary.
    // Touch handlers run on main thread, but getInputSnapshot may run on
    // background threads (Capacitor plugin methods don't guarantee main thread).
    private let touchQueue = DispatchQueue(label: "com.strata.capacitor.touches")
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
        // Use playerIndex since controller is already removed from controllers() array by the time this fires
        let index = controller.playerIndex.rawValue >= 0 ? controller.playerIndex.rawValue : 0
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

        // Check if already on main thread to prevent deadlock
        let getSafeArea = {
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

        if Thread.isMainThread {
            getSafeArea()
        } else {
            DispatchQueue.main.sync {
                getSafeArea()
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

        // Get the controller at the selected index, or nil if out of bounds
        let controllers = GCController.controllers()
        let controller = selectedControllerIndex < controllers.count ? controllers[selectedControllerIndex] : nil

        if let controller = controller,
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

            // Use configurable button mapping
            buttons["jump"] = getButtonPressed(gamepad: gamepad, buttonName: gamepadButtonMapping["jump"] ?? "buttonA")
            buttons["action"] = getButtonPressed(gamepad: gamepad, buttonName: gamepadButtonMapping["action"] ?? "buttonB")
            buttons["cancel"] = getButtonPressed(gamepad: gamepad, buttonName: gamepadButtonMapping["cancel"] ?? "buttonX")

            triggers["left"] = gamepad.leftTrigger.value
            triggers["right"] = gamepad.rightTrigger.value
        }

        // Thread-safe read of activeTouches via serial queue
        let touchesArray: [[String: Any]] = touchQueue.sync {
            activeTouches.map { (id, data) in
                return [
                    "id": id,
                    "position": data["position"] ?? ["x": 0, "y": 0],
                    "phase": data["phase"] ?? "began"
                ]
            }
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
        let actions = ["moveForward", "moveBackward", "moveLeft", "moveRight", "jump", "action", "cancel"]
        for action in actions {
            if let mapping = call.getArray(action, String.self) {
                inputMapping[action] = mapping
            }
        }

        // Also support gamepad button mapping
        // e.g., { "gamepadButtons": { "jump": "buttonY", "action": "buttonA" } }
        if let gamepadButtons = call.getObject("gamepadButtons") as? [String: String] {
            for (action, buttonName) in gamepadButtons {
                gamepadButtonMapping[action] = buttonName
            }
        }

        call.resolve()
    }

    /// Select which controller to use for input (0-based index)
    /// Use getConnectedControllers() to see available controllers
    @objc func selectController(_ call: CAPPluginCall) {
        let index = call.getInt("index") ?? 0
        let controllers = GCController.controllers()

        if index >= 0 && index < controllers.count {
            selectedControllerIndex = index
            call.resolve([
                "success": true,
                "selectedIndex": index,
                "controllerId": controllers[index].vendorName ?? "Unknown"
            ])
        } else if controllers.isEmpty {
            call.resolve([
                "success": false,
                "error": "No controllers connected"
            ])
        } else {
            call.resolve([
                "success": false,
                "error": "Controller index \(index) out of range. Available: 0-\(controllers.count - 1)"
            ])
        }
    }

    /// Get list of all connected controllers
    @objc func getConnectedControllers(_ call: CAPPluginCall) {
        let controllers = GCController.controllers()
        var result: [[String: Any]] = []

        for (index, controller) in controllers.enumerated() {
            result.append([
                "index": index,
                "id": controller.vendorName ?? "Unknown Controller",
                "isSelected": index == selectedControllerIndex,
                "hasExtendedGamepad": controller.extendedGamepad != nil,
                "hasMicroGamepad": controller.microGamepad != nil
            ])
        }

        call.resolve([
            "controllers": result,
            "selectedIndex": selectedControllerIndex
        ])
    }

    /// Helper to get button pressed state by button name
    private func getButtonPressed(gamepad: GCExtendedGamepad, buttonName: String) -> Bool {
        switch buttonName {
        case "buttonA":
            return gamepad.buttonA.isPressed
        case "buttonB":
            return gamepad.buttonB.isPressed
        case "buttonX":
            return gamepad.buttonX.isPressed
        case "buttonY":
            return gamepad.buttonY.isPressed
        case "leftShoulder":
            return gamepad.leftShoulder.isPressed
        case "rightShoulder":
            return gamepad.rightShoulder.isPressed
        case "leftTrigger":
            return gamepad.leftTrigger.value > 0.5
        case "rightTrigger":
            return gamepad.rightTrigger.value > 0.5
        case "dpadUp":
            return gamepad.dpad.up.isPressed
        case "dpadDown":
            return gamepad.dpad.down.isPressed
        case "dpadLeft":
            return gamepad.dpad.left.isPressed
        case "dpadRight":
            return gamepad.dpad.right.isPressed
        case "leftThumbstickButton":
            return gamepad.leftThumbstickButton?.isPressed ?? false
        case "rightThumbstickButton":
            return gamepad.rightThumbstickButton?.isPressed ?? false
        case "buttonMenu":
            return gamepad.buttonMenu.isPressed
        case "buttonOptions":
            return gamepad.buttonOptions?.isPressed ?? false
        default:
            return false
        }
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

    public func handleTouchBegan(_ touch: UITouch, at location: CGPoint) {
        let id = touch.hash
        touchQueue.sync {
            activeTouches[id] = [
                "position": ["x": location.x, "y": location.y],
                "phase": "began"
            ]
        }
    }

    public func handleTouchMoved(_ touch: UITouch, at location: CGPoint) {
        let id = touch.hash
        touchQueue.sync {
            if activeTouches[id] != nil {
                activeTouches[id] = [
                    "position": ["x": location.x, "y": location.y],
                    "phase": "moved"
                ]
            }
        }
    }

    public func handleTouchEnded(_ touch: UITouch) {
        let id = touch.hash
        touchQueue.sync {
            _ = activeTouches.removeValue(forKey: id)
        }
    }

    public func handleTouchCancelled(_ touch: UITouch) {
        let id = touch.hash
        touchQueue.sync {
            _ = activeTouches.removeValue(forKey: id)
        }
    }
}
