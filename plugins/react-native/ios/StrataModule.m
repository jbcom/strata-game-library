#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(StrataModule, NSObject)

RCT_EXTERN_METHOD(getDeviceProfile:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(triggerHaptics:(NSString *)intensity
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getPerformanceMode:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setOrientation:(NSString *)orientation)

@end
