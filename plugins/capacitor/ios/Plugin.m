#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(StrataPlugin, "Strata",
    CAP_PLUGIN_METHOD(getDeviceProfile, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getControlHints, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getInputSnapshot, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(setInputMapping, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(selectController, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getConnectedControllers, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(triggerHaptics, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(vibrate, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getDeviceInfo, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(haptics, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(setScreenOrientation, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getSafeAreaInsets, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getPerformanceMode, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(configureTouchHandling, CAPPluginReturnPromise);
)
