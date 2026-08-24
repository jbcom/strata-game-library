/**
 * The parent-sized canvas-host contract.
 *
 * @module mount/hostStyle
 * @category Player Experience
 *
 * Strata's `<StrataGame>` shell wraps its `<Canvas>` in a
 * `{ position: relative; width: 100%; height: 100% }` div. That is a
 * *percentage* contract, not a *flex* contract, and it breaks in the most
 * common real layout: a column-flex app shell where the canvas is the
 * growing child and a HUD/toolbar is docked beside or below it. A flex item
 * defaults to `min-height: auto`, which refuses to shrink below its
 * content's intrinsic size — so a `height: 100%` canvas inside it pushes the
 * shell taller every frame instead of filling the space left over.
 *
 * `minHeight: 0` is the load-bearing line that fixes it, and `flex: 1` plus
 * `display: flex` is what makes r3f's own 100%/100% wrapper resolve against
 * a real box so r3f's ResizeObserver does all the sizing work.
 *
 * The chain the caller owns is the other half of the contract:
 *
 * ```
 * html, body { height: 100% }
 *   -> #app { position: fixed; inset: 0; display: flex; flex-direction: column }
 *     -> shell { flex: 1; min-height: 0 }
 *       -> .strata-canvas-host  <- this style
 * ```
 *
 * Every rule here is parent-derived. There is no `vh`, no `vw`, and no
 * `window.innerWidth` read anywhere — those all break under mobile URL-bar
 * collapse and inside embedded/split-pane hosts.
 */

import type { CSSProperties } from 'react';

/**
 * Inline style object implementing the `.strata-canvas-host` contract.
 *
 * Applied inline by {@link StrataCanvas} so the contract holds without the
 * consumer importing any stylesheet.
 */
export const strataCanvasHostStyle: CSSProperties = {
  position: 'relative',
  flex: 1,
  display: 'flex',
  width: '100%',
  height: '100%',
  minHeight: 0,
};

/**
 * Class name applied to the host div, for consumers who want to target it
 * from their own stylesheet (or who mount a raw `<Canvas>` inside their own
 * element carrying this class).
 */
export const STRATA_CANVAS_HOST_CLASS = 'strata-canvas-host';

/**
 * The host contract as a CSS text block, for consumers who inject a
 * stylesheet rather than relying on the inline style — and so the rule and
 * the inline object can be pinned against each other by a test rather than
 * silently drifting apart.
 *
 * Includes the child-`canvas` rule, which the inline object cannot express.
 */
export const STRATA_CANVAS_HOST_CSS = `.${STRATA_CANVAS_HOST_CLASS} {
  position: relative;
  flex: 1;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.${STRATA_CANVAS_HOST_CLASS} canvas {
  width: 100%;
  height: 100%;
  display: block;
}
`;
