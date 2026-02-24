import Foundation
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

            let result: [String: Any] = [
                "platform": "ios",
                "deviceType": self.getDeviceType(),
                "hasTouch": true,
                "hasGamepad": false, // TODO: detect MFi controller
                "screenWidth": screen.bounds.width,
                "screenHeight": screen.bounds.height,
                "pixelRatio": screen.scale,
                "safeAreaInsets": self.getSafeAreaInsets(),
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
        switch UIDevice.current.userInterfaceIdiom {
        case .phone:
            return "mobile"
        case .pad:
            return "tablet"
        default:
            return "mobile"
        }
    }

    private func getSafeAreaInsets() -> [String: CGFloat] {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first else {
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
}
