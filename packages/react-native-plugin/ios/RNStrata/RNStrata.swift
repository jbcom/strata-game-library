import Foundation
import UIKit
import GameController
import React

@objc(RNStrata)
class RNStrata: RCTEventEmitter {

  private var hasListeners = false

  override func supportedEvents() -> [String]! {
    return ["onGamepadUpdate"]
  }

  override func startObserving() {
    hasListeners = true
    setupGamepadObservers()
  }

  override func stopObserving() {
    hasListeners = false
    NotificationCenter.default.removeObserver(self)
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  // MARK: - Device Detection

  @objc(getDeviceDetails:rejecter:)
  func getDeviceDetails(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      do {
        let device = UIDevice.current
        let screen = UIScreen.main
        let bounds = screen.bounds

        var deviceType = "mobile"
        if device.userInterfaceIdiom == .pad {
          deviceType = "tablet"
        } else if #available(iOS 14.0, *), device.userInterfaceIdiom == .mac {
          deviceType = "desktop"
        }
        #if targetEnvironment(macCatalyst)
        deviceType = "desktop"
        #endif

        let orientation: String
        if let windowScene = self.getKeyWindow()?.windowScene {
          switch windowScene.interfaceOrientation {
          case .landscapeLeft, .landscapeRight:
            orientation = "landscape"
          default:
            orientation = "portrait"
          }
        } else {
          orientation = "portrait"
        }

        let window = self.getKeyWindow()
        let safeArea = window?.safeAreaInsets ?? .zero

        let hasGamepad = GCController.controllers().count > 0

        let details: [String: Any] = [
          "deviceType": deviceType,
          "platform": "ios",
          "inputMode": hasGamepad ? "gamepad" : "touch",
          "orientation": orientation,
          "hasTouch": true,
          "hasGamepad": hasGamepad,
          "screenWidth": bounds.width,
          "screenHeight": bounds.height,
          "pixelRatio": screen.scale,
          "safeAreaInsets": [
            "top": safeArea.top,
            "right": safeArea.right,
            "bottom": safeArea.bottom,
            "left": safeArea.left
          ]
        ]

        resolve(details)
      } catch {
        reject("DEVICE_ERROR", "Failed to get device details: \(error.localizedDescription)", error)
      }
    }
  }

  private func getKeyWindow() -> UIWindow? {
    if #available(iOS 13.0, *) {
      return UIApplication.shared.connectedScenes
        .filter({$0.activationState == .foregroundActive})
        .map({$0 as? UIWindowScene})
        .compactMap({$0})
        .first?.windows
        .filter({$0.isKeyWindow}).first
    } else {
      return UIApplication.shared.keyWindow
    }
  }

  // MARK: - Haptic Feedback

  @objc(triggerHaptic:options:)
  func triggerHaptic(type: String, options: [String: Any]) {
    DispatchQueue.main.async {
      switch type {
      case "impact":
        let styleStr = options["intensity"] as? String ?? "medium"
        var style: UIImpactFeedbackGenerator.FeedbackStyle = .medium

        switch styleStr {
        case "light": style = .light
        case "medium": style = .medium
        case "heavy": style = .heavy
        default: style = .medium
        }

        let generator = UIImpactFeedbackGenerator(style: style)
        generator.prepare()
        generator.impactOccurred()

      case "notification":
        let styleStr = options["intensity"] as? String ?? "success"
        var style: UINotificationFeedbackGenerator.FeedbackType = .success

        switch styleStr {
        case "success": style = .success
        case "warning": style = .warning
        case "error": style = .error
        default: style = .success
        }

        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(style)

      case "selection":
        let generator = UISelectionFeedbackGenerator()
        generator.prepare()
        generator.selectionChanged()

      default:
        break
      }
    }
  }

  // MARK: - Gamepad Support

  private func setupGamepadObservers() {
    // Remove existing observers first to prevent duplicates
    NotificationCenter.default.removeObserver(self, name: .GCControllerDidConnect, object: nil)
    NotificationCenter.default.removeObserver(self, name: .GCControllerDidDisconnect, object: nil)

    NotificationCenter.default.addObserver(self, selector: #selector(gamepadDidConnect), name: .GCControllerDidConnect, object: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(gamepadDidDisconnect), name: .GCControllerDidDisconnect, object: nil)
  }

  @objc private func gamepadDidConnect(notification: Notification) {
    // Handle gamepad connection
    if hasListeners {
      sendEvent(withName: "onGamepadUpdate", body: ["connected": true])
    }
  }

  @objc private func gamepadDidDisconnect(notification: Notification) {
    // Handle gamepad disconnection
    if hasListeners {
      sendEvent(withName: "onGamepadUpdate", body: ["connected": false])
    }
  }

  @objc(getGamepadSnapshot:rejecter:)
  func getGamepadSnapshot(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    do {
      let controllers = GCController.controllers()
      guard let controller = controllers.first else {
        resolve(nil)
        return
      }

      var snapshot: [String: Any] = [:]

      if let gamepad = controller.extendedGamepad {
        snapshot["leftStick"] = ["x": gamepad.leftThumbstick.xAxis.value, "y": gamepad.leftThumbstick.yAxis.value]
        snapshot["rightStick"] = ["x": gamepad.rightThumbstick.xAxis.value, "y": gamepad.rightThumbstick.yAxis.value]

        var buttons: [String: Bool] = [
          "a": gamepad.buttonA.isPressed,
          "b": gamepad.buttonB.isPressed,
          "x": gamepad.buttonX.isPressed,
          "y": gamepad.buttonY.isPressed,
          "leftShoulder": gamepad.leftShoulder.isPressed,
          "rightShoulder": gamepad.rightShoulder.isPressed,
          "leftTrigger": gamepad.leftTrigger.isPressed,
          "rightTrigger": gamepad.rightTrigger.isPressed,
          "dpadUp": gamepad.dpad.up.isPressed,
          "dpadDown": gamepad.dpad.down.isPressed,
          "dpadLeft": gamepad.dpad.left.isPressed,
          "dpadRight": gamepad.dpad.right.isPressed
        ]

        if #available(iOS 12.1, *) {
          buttons["leftStickButton"] = gamepad.leftThumbstickButton?.isPressed ?? false
          buttons["rightStickButton"] = gamepad.rightThumbstickButton?.isPressed ?? false
        }

        if #available(iOS 13.0, *) {
          buttons["menu"] = gamepad.buttonMenu.isPressed
          buttons["options"] = gamepad.buttonOptions?.isPressed ?? false
        }

        if #available(iOS 14.0, *) {
          buttons["home"] = gamepad.buttonHome?.isPressed ?? false
        }

        snapshot["buttons"] = buttons
        snapshot["triggers"] = [
          "left": gamepad.leftTrigger.value,
          "right": gamepad.rightTrigger.value
        ]
      } else {
        // Provide default values for simpler controllers to match InputSnapshot interface
        snapshot["leftStick"] = ["x": 0, "y": 0]
        snapshot["rightStick"] = ["x": 0, "y": 0]
        snapshot["buttons"] = [:]
        snapshot["triggers"] = ["left": 0, "right": 0]
      }

      snapshot["timestamp"] = Date().timeIntervalSince1970 * 1000
      resolve(snapshot)
    } catch {
      reject("GAMEPAD_ERROR", "Failed to get gamepad snapshot: \(error.localizedDescription)", error)
    }
  }
}
