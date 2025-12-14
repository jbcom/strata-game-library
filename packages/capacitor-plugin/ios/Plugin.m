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
)
