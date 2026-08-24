import { ChromaticAberration } from "@react-three/postprocessing";
import type { JSX } from "react";
import type * as THREE from "three";

/**
 * `<ChromaticAberration>` with the prop types upstream actually intends.
 *
 * postprocessing 6.39.4 emits a constructor type where `radialModulation` and
 * `modulationOffset` are REQUIRED, while the JSDoc directly above them
 * documents both as optional with defaults (`false` and `0.15`) and the
 * implementation destructures them with those defaults. The declaration
 * contradicts both the docs and the runtime.
 *
 * @react-three/postprocessing derives its props with
 * `Omit<Partial<ConstructorParameters<...>[0]>, "offset">`. The parameter is
 * `{...} | undefined`, so `Partial` does not distribute over the union and the
 * two required members survive — every call site fails to typecheck unless it
 * passes both. That broke r3f's declaration build, and with it the dts build
 * of @strata-game-library/presets, which needs r3f's types.
 *
 * The props are restated here rather than derived from the broken type,
 * because every attempt to repair it by composition (Partial, Omit) keeps the
 * union that caused the problem. One cast, one file to delete when upstream
 * adds the `?`.
 */
export interface ChromaticAberrationFixedProps {
  /** Colour offset. Defaults to a small non-zero offset upstream. */
  offset?: THREE.Vector2 | [number, number];
  /** Modulate the effect with a radial gradient. Upstream default: false. */
  radialModulation?: boolean;
  /** Modulation offset; applies only with radialModulation. Default: 0.15. */
  modulationOffset?: number;
  /** Blend function; upstream default is BlendFunction.NORMAL. */
  blendFunction?: number;
}

export function ChromaticAberrationFixed(
  props: ChromaticAberrationFixedProps,
): JSX.Element {
  const Component = ChromaticAberration as unknown as (
    p: ChromaticAberrationFixedProps,
  ) => JSX.Element;
  return <Component {...props} />;
}
