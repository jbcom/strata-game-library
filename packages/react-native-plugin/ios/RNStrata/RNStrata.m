#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNStrata, RCTEventEmitter)

RCT_EXTERN_METHOD(getDeviceDetails:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(triggerHaptic:(NSString *)type
                  options:(NSDictionary *)options)

RCT_EXTERN_METHOD(getGamepadSnapshot:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
