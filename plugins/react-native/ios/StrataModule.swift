import Foundation
import GameController
import React
import UIKit

/**
 * Strata React Native module for iOS.
 *
 * Provides device detection, input handling, and haptic feedback.
 */
@objc(StrataModule)
class StrataModule: NSObject {

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    /**
     * Get device profile information.
     */
    @objc
    func getDeviceProfile(_ resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            let screen = UIScreen.main
            let hasGamepad = self.hasGamepadConnected()

            let result: [String: Any] = [
                "platform": "ios",
                "deviceType": self.getDeviceType(),
                "inputMode": hasGamepad ? "gamepad" : "touch",
                "orientation": self.getOrientation(),
                "hasTouch": true,
                "hasGamepad": hasGamepad,
                "screenWidth": screen.bounds.width,
                "screenHeight": screen.bounds.height,
                "pixelRatio": screen.scale,
                "safeAreaInsets": self.safeAreaInsetsMap(),
                "performanceMode": self.getPerformanceModeInternal()
            ]

            resolve(result)
        }
    }

    private func getPerformanceModeInternal() -> String {
        let isLowPowerMode = ProcessInfo.processInfo.isLowPowerModeEnabled
        if isLowPowerMode {
            return "low"
        }

        let physicalMemory = ProcessInfo.processInfo.physicalMemory
        if physicalMemory < 2 * 1024 * 1024 * 1024 {
            return "low"
        } else if physicalMemory < 4 * 1024 * 1024 * 1024 {
            return "medium"
        }

        return "high"
    }

    @objc
    func getPerformanceMode(_ resolve: @escaping RCTPromiseResolveBlock,
                           reject: @escaping RCTPromiseRejectBlock) {
        let isLowPowerMode = ProcessInfo.processInfo.isLowPowerModeEnabled

        resolve([
            "mode": self.getPerformanceModeInternal(),
            "isLowPowerMode": isLowPowerMode,
            "totalMemory": ProcessInfo.processInfo.physicalMemory
        ])
    }

    @objc
    func setOrientation(_ orientation: String) {
        DispatchQueue.main.async {
            var orientationValue: UIInterfaceOrientation = .unknown
            if orientation == "portrait" {
                orientationValue = .portrait
            } else if orientation == "landscape" {
                orientationValue = .landscapeLeft
            }

            if #available(iOS 16.0, *) {
                if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                    let window = windowScene.windows.first
                    window?.rootViewController?.setNeedsUpdateOfSupportedInterfaceOrientations()
                }
            } else {
                UIDevice.current.setValue(orientationValue.rawValue, forKey: "orientation")
                UIViewController.attemptRotationToDeviceOrientation()
            }
        }
    }

    @objc
    func getInputSnapshot(_ resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            resolve(self.createInputSnapshot())
        }
    }

    @objc
    func getSafeAreaInsets(_ resolve: @escaping RCTPromiseResolveBlock,
                           reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            resolve(self.safeAreaInsetsMap())
        }
    }

    /**
     * Trigger haptic feedback.
     */
    @objc
    func triggerHaptics(_ intensity: String,
                        resolve: @escaping RCTPromiseResolveBlock,
                        reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            let generator: UIImpactFeedbackGenerator

            switch intensity {
            case "heavy":
                generator = UIImpactFeedbackGenerator(style: .heavy)
            case "light":
                generator = UIImpactFeedbackGenerator(style: .light)
            default:
                generator = UIImpactFeedbackGenerator(style: .medium)
            }

            generator.prepare()
            generator.impactOccurred()

            resolve(nil)
        }
    }

    private func getDeviceType() -> String {
        if #available(iOS 14.0, *), UIDevice.current.userInterfaceIdiom == .mac {
            return "desktop"
        }

        switch UIDevice.current.userInterfaceIdiom {
        case .phone:
            return "mobile"
        case .pad:
            return "tablet"
        default:
            return "mobile"
        }
    }

    private func getOrientation() -> String {
        guard let windowScene = keyWindow()?.windowScene else {
            let bounds = UIScreen.main.bounds
            return bounds.width > bounds.height ? "landscape" : "portrait"
        }

        switch windowScene.interfaceOrientation {
        case .landscapeLeft, .landscapeRight:
            return "landscape"
        default:
            return "portrait"
        }
    }

    private func keyWindow() -> UIWindow? {
        if #available(iOS 13.0, *) {
            return UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
                .first { $0.isKeyWindow }
        }

        return UIApplication.shared.keyWindow
    }

    private func safeAreaInsetsMap() -> [String: CGFloat] {
        guard let window = keyWindow() else {
            return ["top": 0, "right": 0, "bottom": 0, "left": 0]
        }

        let insets = window.safeAreaInsets
        return [
            "top": insets.top,
            "right": insets.right,
            "bottom": insets.bottom,
            "left": insets.left
        ]
    }

    private func hasGamepadConnected() -> Bool {
        return !GCController.controllers().isEmpty
    }

    private func createInputSnapshot() -> [String: Any] {
        var buttons = defaultButtons()
        var leftStick: [String: Float] = ["x": 0, "y": 0]
        var rightStick: [String: Float] = ["x": 0, "y": 0]
        var triggers: [String: Float] = ["left": 0, "right": 0]

        if let controller = GCController.controllers().first {
            if let gamepad = controller.extendedGamepad {
                leftStick = [
                    "x": gamepad.leftThumbstick.xAxis.value,
                    "y": gamepad.leftThumbstick.yAxis.value
                ]
                rightStick = [
                    "x": gamepad.rightThumbstick.xAxis.value,
                    "y": gamepad.rightThumbstick.yAxis.value
                ]
                triggers = [
                    "left": gamepad.leftTrigger.value,
                    "right": gamepad.rightTrigger.value
                ]

                buttons["a"] = gamepad.buttonA.isPressed
                buttons["b"] = gamepad.buttonB.isPressed
                buttons["x"] = gamepad.buttonX.isPressed
                buttons["y"] = gamepad.buttonY.isPressed
                buttons["l1"] = gamepad.leftShoulder.isPressed
                buttons["r1"] = gamepad.rightShoulder.isPressed
                buttons["l2"] = gamepad.leftTrigger.isPressed
                buttons["r2"] = gamepad.rightTrigger.isPressed
                buttons["dpadUp"] = gamepad.dpad.up.isPressed
                buttons["dpadDown"] = gamepad.dpad.down.isPressed
                buttons["dpadLeft"] = gamepad.dpad.left.isPressed
                buttons["dpadRight"] = gamepad.dpad.right.isPressed

                if #available(iOS 12.1, *) {
                    buttons["leftStick"] = gamepad.leftThumbstickButton?.isPressed ?? false
                    buttons["rightStick"] = gamepad.rightThumbstickButton?.isPressed ?? false
                }

                if #available(iOS 13.0, *) {
                    buttons["start"] = gamepad.buttonMenu.isPressed
                    buttons["select"] = gamepad.buttonOptions?.isPressed ?? false
                }
            } else if let gamepad = controller.microGamepad {
                leftStick = [
                    "x": gamepad.dpad.xAxis.value,
                    "y": gamepad.dpad.yAxis.value
                ]
                buttons["a"] = gamepad.buttonA.isPressed
                buttons["x"] = gamepad.buttonX.isPressed
            }
        }

        let connectedGamepads = GCController.controllers().enumerated().map { index, controller in
            [
                "index": index,
                "id": controller.vendorName ?? "Game Controller \(index)"
            ] as [String: Any]
        }

        return [
            "timestamp": Date().timeIntervalSince1970 * 1000,
            "leftStick": leftStick,
            "rightStick": rightStick,
            "buttons": buttons,
            "triggers": triggers,
            "connectedGamepads": connectedGamepads
        ]
    }

    private func defaultButtons() -> [String: Bool] {
        return [
            "a": false,
            "b": false,
            "x": false,
            "y": false,
            "l1": false,
            "r1": false,
            "l2": false,
            "r2": false,
            "start": false,
            "select": false,
            "dpadUp": false,
            "dpadDown": false,
            "dpadLeft": false,
            "dpadRight": false
        ]
    }
}
