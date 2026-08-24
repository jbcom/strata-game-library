/**
 * Core Shared Utilities and Platform Helpers.
 *
 * Provides cross-platform utilities, shared types, and foundational logic
 * used across all Strata modules.
 *
 * @packageDocumentation
 * @module core/shared
 * @category World Building
 */

export { detectCapabilities, detectPlatform, isCapacitor, isNative, isReactNative, isWeb, resetPlatformCache, selectAdapter } from "./platform";
export type { AdapterMap, Platform, PlatformCapabilities } from "./platform";
