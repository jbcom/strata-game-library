/**
 * Core User Interface Utilities and Definitions.
 *
 * Provides pure TypeScript logic, configurations, and helper functions for building
 * immersive, game-ready UI systems that bridge the gap between 2D interfaces and 3D scenes.
 *
 * **Key Features:**
 * - **Coordinate Mapping:** Transform world positions to screen space for nameplates and markers.
 * - **HUD Systems:** Definitions and logic for crosshairs, minimaps, and progress bars.
 * - **Interaction:** Advanced dialogue and inventory state definitions.
 * - **Accessibility:** Automatic RTL (right-to-left) text detection.
 *
 * Organised into four concerns:
 * - {@link module:core/ui/types | types} — configuration shapes (declarations only).
 * - {@link module:core/ui/projection | projection} — world/screen coordinate mapping and
 *   anchoring. The only renderer-coupled module here.
 * - {@link module:core/ui/format | format} — text and number formatting for display.
 * - {@link module:core/ui/defaults | defaults} — default widget configs and theme lookups.
 *
 * @packageDocumentation
 * @module core/ui
 * @category UI & Interaction
 *
 * @example
 * ```typescript
 * // Convert world position to screen coordinates for a nameplate
 * const screenPos = worldToScreen(entityPosition, camera, window.innerWidth, window.innerHeight);
 * if (screenPos.visible) {
 *   updateUIElement(screenPos.x, screenPos.y);
 * }
 * ```
 */

import { easeOutCubic, easeOutElastic, lerp } from '../math/utils';

export { lerp, easeOutCubic, easeOutElastic };

export {
  createDefaultCrosshair,
  createDefaultDamageNumber,
  createDefaultDialog,
  createDefaultInventory,
  createDefaultMinimap,
  createDefaultNameplate,
  createDefaultNotification,
  createDefaultProgressBar,
  createDefaultTooltip,
  getDamageNumberColor,
  getNotificationColor,
  getNotificationIcon,
} from './defaults';
export { clampProgress, formatNumber, formatProgressText, getTextDirection } from './format';
export { calculateFade, getAnchorOffset, screenToWorld, worldToScreen } from './projection';
export type {
  CrosshairConfig,
  DamageNumberConfig,
  DialogChoice,
  DialogConfig,
  DialogLine,
  InventoryConfig,
  InventorySlot,
  MinimapConfig,
  MinimapMarker,
  NameplateConfig,
  NotificationConfig,
  ProgressBarConfig,
  ScreenPosition,
  TextDirection,
  TooltipConfig,
  UIAnchor,
} from './types';
