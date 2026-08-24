/**
 * Shared type definitions for the core UI system.
 *
 * Pure declaration module — configuration shapes for HUD widgets, dialogue,
 * inventory, and world-anchored overlays. Contains no runtime code and no
 * renderer coupling, so it is safe to import from any layer.
 *
 * @packageDocumentation
 * @module core/ui/types
 * @category UI & Interaction
 */

/**
 * Screen-space anchor points for UI elements.
 * @category UI & Interaction
 */
export type UIAnchor =
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

/**
 * Supported text directions.
 * @category UI & Interaction
 */
export type TextDirection = 'ltr' | 'rtl' | 'auto';

/**
 * Configuration for a progress bar UI element.
 * @category UI & Interaction
 */
export interface ProgressBarConfig {
  /** Current progress value. */
  value: number;
  /** Maximum value representing 100% completion. */
  maxValue: number;
  /** Physical or pixel width. */
  width?: number;
  /** Physical or pixel height. */
  height?: number;
  /** CSS-compatible background color string. */
  backgroundColor?: string;
  /** CSS-compatible fill color string. */
  fillColor?: string;
  /** CSS-compatible border color string. */
  borderColor?: string;
  /** Border thickness in pixels. */
  borderWidth?: number;
  /** Border radius in pixels for rounded corners. */
  borderRadius?: number;
  /** Whether to display text (e.g., "75%"). */
  showText?: boolean;
  /** Format for the displayed progress text. */
  textFormat?: 'percentage' | 'fraction' | 'value' | 'none';
  /** Duration of fill animations in milliseconds. */
  animationDuration?: number;
  /** Number of visual segments (e.g., for segmented health bars). */
  segments?: number;
  /** CSS-compatible glow color string. */
  glowColor?: string;
  /** Intensity of the glow effect (0-1). */
  glowIntensity?: number;
}

/**
 * Definition of a single item slot in an inventory.
 * @category UI & Interaction
 */
export interface InventorySlot {
  /** Unique identifier for this slot. */
  id: string;
  /** ID of the item currently occupying this slot. */
  itemId?: string;
  /** Display name of the item. */
  itemName?: string;
  /** Path to the item's icon image. */
  itemIcon?: string;
  /** Current quantity of the item. */
  quantity?: number;
  /** Maximum stack size for this item. */
  maxStack?: number;
  /** Whether this slot is locked (unusable). */
  locked?: boolean;
  /** Whether this slot is currently highlighted. */
  highlighted?: boolean;
  /** Item rarity, used for background coloring and categorization. */
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * Configuration for an inventory grid or container.
 * @category UI & Interaction
 */
export interface InventoryConfig {
  /** Array of slots defining the inventory contents. */
  slots: InventorySlot[];
  /** Number of columns in the grid. */
  columns: number;
  /** Number of rows in the grid. */
  rows: number;
  /** Pixel size of each slot. */
  slotSize?: number;
  /** Gap between slots in pixels. */
  slotGap?: number;
  /** CSS-compatible background color for the container. */
  backgroundColor?: string;
  /** CSS-compatible background color for each slot. */
  slotBackgroundColor?: string;
  /** CSS-compatible border color for each slot. */
  slotBorderColor?: string;
  /** Border color for the currently selected slot. */
  selectedSlotBorderColor?: string;
  /** Whether to show information tooltips on hover. */
  showTooltips?: boolean;
  /** Whether to allow dragging items between slots. */
  allowDrag?: boolean;
  /** Whether to display item quantities. */
  showQuantity?: boolean;
  /** Mapping of rarity names to CSS-compatible color strings. */
  rarityColors?: Record<string, string>;
}

/**
 * A single line of text in a dialogue sequence.
 * @category UI & Interaction
 */
export interface DialogLine {
  /** Name of the character speaking. */
  speaker?: string;
  /** The actual dialogue text to display. */
  text: string;
  /** Path to an image representing the speaker. */
  speakerImage?: string;
  /** Array of interactive choices available after this line. */
  choices?: DialogChoice[];
  /** Whether to advance to the next line automatically. */
  autoAdvance?: boolean;
  /** Delay in milliseconds before auto-advancing. */
  autoAdvanceDelay?: number;
  /** Optional emotion tag for facial expression synchronization. */
  emotion?: string;
  /** Path to an audio file for this dialogue line. */
  voiceClip?: string;
}

/**
 * An interactive choice presented during a dialogue.
 * @category UI & Interaction
 */
export interface DialogChoice {
  /** Unique identifier for this choice. */
  id: string;
  /** Text displayed to the user for this choice. */
  text: string;
  /** Whether this choice is currently disabled. */
  disabled?: boolean;
  /** Optional function to determine if this choice should be visible. */
  condition?: () => boolean;
  /** Optional tag for branching logic consequence. */
  consequence?: string;
}

/**
 * Configuration for a dialogue system.
 * @category UI & Interaction
 */
export interface DialogConfig {
  /** The full sequence of lines in this dialogue. */
  lines: DialogLine[];
  /** Index of the line currently being displayed. */
  currentLine?: number;
  /** Characters per second for the typewriter effect. */
  typewriterSpeed?: number;
  /** CSS-compatible text color string. */
  textColor?: string;
  /** CSS-compatible background color string. */
  backgroundColor?: string;
  /** CSS-compatible speaker name color string. */
  speakerColor?: string;
  /** Base font size in pixels. */
  fontSize?: number;
  /** CSS-compatible font family string. */
  fontFamily?: string;
  /** Direction of text flow. */
  textDirection?: TextDirection;
  /** Whether to display character portraits. */
  showSpeakerImage?: boolean;
  /** Position of the character portrait relative to the text. */
  imagePosition?: 'left' | 'right';
  /** Character shown when more text is available. */
  continueIndicator?: string;
  /** Whether users can skip the typewriter animation. */
  skipEnabled?: boolean;
  /** Internal container padding in pixels. */
  padding?: number;
  /** Maximum width of the dialogue box in pixels. */
  maxWidth?: number;
  /** Screen corner anchor point. */
  position?: UIAnchor;
}

/**
 * Configuration for hoverable tooltips.
 * @category UI & Interaction
 */
export interface TooltipConfig {
  /** Main heading of the tooltip. */
  title?: string;
  /** Detailed descriptive text. */
  description?: string;
  /** Key-value pairs of statistics to display (e.g., for item stats). */
  stats?: Array<{ label: string; value: string | number; color?: string }>;
  /** Display string for item rarity. */
  rarity?: string;
  /** Color string for rarity text or border. */
  rarityColor?: string;
  /** CSS-compatible background color string. */
  backgroundColor?: string;
  /** CSS-compatible border color string. */
  borderColor?: string;
  /** CSS-compatible text color string. */
  textColor?: string;
  /** Maximum width in pixels. */
  maxWidth?: number;
  /** Base font size in pixels. */
  fontSize?: number;
  /** Internal padding in pixels. */
  padding?: number;
  /** Delay in milliseconds before showing the tooltip. */
  showDelay?: number;
  /** Delay in milliseconds before hiding the tooltip. */
  hideDelay?: number;
}

/**
 * Configuration for temporary screen notifications or "toasts".
 * @category UI & Interaction
 */
export interface NotificationConfig {
  /** Unique identifier for the notification. */
  id?: string;
  /** Main text message to display. */
  message: string;
  /** Optional bold heading. */
  title?: string;
  /** Visual style category. */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Path to an icon image or emoji character. */
  icon?: string;
  /** Duration in milliseconds before auto-hiding. */
  duration?: number;
  /** Screen corner anchor point. */
  position?: UIAnchor;
  /** Whether the user can manually close the notification. */
  dismissible?: boolean;
  /** Whether to show a countdown progress bar. */
  progress?: boolean;
  /** Callback fired when the notification is dismissed. */
  onDismiss?: () => void;
  /** CSS-compatible background color string. */
  backgroundColor?: string;
  /** CSS-compatible text color string. */
  textColor?: string;
  /** CSS-compatible border color string. */
  borderColor?: string;
  /** Name of the entry animation. */
  animationIn?: string;
  /** Name of the exit animation. */
  animationOut?: string;
}

/**
 * Configuration for an in-game minimap or radar system.
 * @category UI & Interaction
 */
export interface MinimapConfig {
  /** Pixel size of the map (square). */
  size?: number;
  /** Current zoom level (meters per pixel). */
  zoom?: number;
  /** Manual rotation offset in radians. */
  rotation?: number;
  /** Whether the map centers on the player. */
  followPlayer?: boolean;
  /** Whether the map rotates to match the player's heading. */
  rotateWithPlayer?: boolean;
  /** CSS-compatible background color string. */
  backgroundColor?: string;
  /** CSS-compatible border color string. */
  borderColor?: string;
  /** Border thickness in pixels. */
  borderWidth?: number;
  /** Corner radius (size/2 for circular maps). */
  borderRadius?: number;
  /** Path to the player icon image. */
  playerIcon?: string;
  /** Color for the player indicator. */
  playerColor?: string;
  /** Size of the player indicator in pixels. */
  playerSize?: number;
  /** Definitions for custom marker types. */
  markerTypes?: Record<string, MinimapMarker>;
  /** Whether to enable fog-of-war exploration. */
  fogOfWar?: boolean;
  /** Whether to display a north-facing compass needle. */
  showCompass?: boolean;
}

/**
 * Definition of an interactive marker on the minimap.
 * @category UI & Interaction
 */
export interface MinimapMarker {
  /** Path to an icon image. */
  icon?: string;
  /** Color for the marker indicator. */
  color?: string;
  /** Size of the marker in pixels. */
  size?: number;
  /** Text label to show on hover or next to marker. */
  label?: string;
  /** Whether the marker should pulse or blink. */
  blinking?: boolean;
}

/**
 * Configuration for a screen reticle or crosshair.
 * @category UI & Interaction
 */
export interface CrosshairConfig {
  /** Visual style of the reticle. */
  type?: 'dot' | 'cross' | 'circle' | 'custom';
  /** Base size in pixels. */
  size?: number;
  /** Thickness of the lines in pixels. */
  thickness?: number;
  /** Gap between crosshair segments in pixels. */
  gap?: number;
  /** CSS-compatible color string. */
  color?: string;
  /** Color for the reticle outline. */
  outlineColor?: string;
  /** Width of the outline in pixels. */
  outlineWidth?: number;
  /** Global opacity (0-1). */
  opacity?: number;
  /** Whether to show a center dot. */
  dot?: boolean;
  /** Size of the center dot in pixels. */
  dotSize?: number;
  /** Whether the crosshair expands with weapon spread. */
  dynamic?: boolean;
  /** Sensitivity of the dynamic expansion. */
  spreadMultiplier?: number;
}

/**
 * Configuration for animated damage/healing text numbers.
 * @category UI & Interaction
 */
export interface DamageNumberConfig {
  /** The numeric value to display. */
  value: number;
  /** Category determining visual style (color/size). */
  type?: 'normal' | 'critical' | 'heal' | 'miss' | 'block';
  /** CSS-compatible color string override. */
  color?: string;
  /** Font size in pixels. */
  fontSize?: number;
  /** CSS-compatible font family string. */
  fontFamily?: string;
  /** CSS font-weight value. */
  fontWeight?: string;
  /** Total animation duration in milliseconds. */
  duration?: number;
  /** Vertical distance the number floats upwards. */
  floatDistance?: number;
  /** Percentage of duration (0-1) when fading begins. */
  fadeStart?: number;
  /** Initial scale multiplier for impact emphasis. */
  scale?: number;
  /** Maximum random horizontal jitter in pixels. */
  randomOffset?: number;
}

/**
 * Configuration for world-space entity nameplates and health bars.
 * @category UI & Interaction
 */
export interface NameplateConfig {
  /** Entity name to display. */
  name: string;
  /** Optional sub-title or title (e.g., "The Destroyer"). */
  title?: string;
  /** Character level or rank. */
  level?: number;
  /** Configuration for the integrated health bar. */
  healthBar?: ProgressBarConfig;
  /** Guild or faction name. */
  guild?: string;
  /** Faction name or tag. */
  faction?: string;
  /** Color for the main name text. */
  nameColor?: string;
  /** Color for the title text. */
  titleColor?: string;
  /** Background container color. */
  backgroundColor?: string;
  /** Whether to display the integrated health bar. */
  showHealthBar?: boolean;
  /** Whether to display the level indicator. */
  showLevel?: boolean;
  /** Current distance from camera (for auto-scaling/fading). */
  distance?: number;
  /** Distance when nameplate starts to fade out. */
  fadeStart?: number;
  /** Distance when nameplate is completely hidden. */
  fadeEnd?: number;
}

/**
 * Result of a world-to-screen projection.
 * @category UI & Interaction
 */
export interface ScreenPosition {
  /** Screen X coordinate in pixels. */
  x: number;
  /** Screen Y coordinate in pixels. */
  y: number;
  /** Whether the point is within the camera's view frustum and not behind it. */
  visible: boolean;
  /** World distance from the camera. */
  distance: number;
}
