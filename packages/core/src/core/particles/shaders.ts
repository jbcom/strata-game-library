/**
 * GLSL program source for the instanced particle material.
 *
 * Kept apart from the emitter so the shader text can be diffed, linted and
 * asserted against without loading the rest of the particle system.
 *
 * @packageDocumentation
 * @module core/particles/shaders
 * @category Effects & Atmosphere
 */

/** Maximum number of gradient stops the fragment shader can interpolate. */
export const MAX_GRADIENT_STOPS = 8;

/**
 * Vertex stage: expands each instance into a camera-facing quad.
 *
 * Size is interpolated between `uSizeStart` and `uSizeEnd` by normalized age,
 * then scaled by the per-instance size jitter. The billboard is built in view
 * space so particles always face the camera, and rotated about the view axis
 * by `instanceRotation`.
 *
 * @category Effects & Atmosphere
 */
export const particleVertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uSizeStart;
    uniform float uSizeEnd;

    attribute float instanceAge;
    attribute float instanceLifetime;
    attribute float instanceSize;
    attribute float instanceRotation;
    attribute float instanceColorIndex;

    varying float vAge;
    varying float vLifetime;
    varying float vColorIndex;
    varying vec2 vUv;

    void main() {
        vUv = uv;
        vAge = instanceAge;
        vLifetime = instanceLifetime;
        vColorIndex = instanceColorIndex;

        float t = clamp(instanceAge / instanceLifetime, 0.0, 1.0);
        float size = mix(uSizeStart, uSizeEnd, t) * instanceSize;

        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);

        float c = cos(instanceRotation);
        float s = sin(instanceRotation);
        vec2 rotatedPos = vec2(
            position.x * c - position.y * s,
            position.x * s + position.y * c
        );

        mvPosition.xy += rotatedPos * size;

        gl_Position = projectionMatrix * mvPosition;
    }
`;

/**
 * Fragment stage: resolves colour, gradient and opacity for one particle.
 *
 * With fewer than two gradient stops the shader falls back to a straight
 * `uColorStart` to `uColorEnd` mix. Fade-in and fade-out are applied
 * multiplicatively at the head and tail of the lifetime. Untextured particles
 * are shaped into a soft disc and discarded outside the unit radius.
 *
 * @category Effects & Atmosphere
 */
export const particleFragmentShader = /* glsl */ `
    uniform sampler2D uTexture;
    uniform bool uHasTexture;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform float uOpacityStart;
    uniform float uOpacityEnd;
    uniform vec3 uColorGradient[8];
    uniform float uColorGradientStops[8];
    uniform int uColorGradientCount;
    uniform float uFadeIn;
    uniform float uFadeOut;

    varying float vAge;
    varying float vLifetime;
    varying float vColorIndex;
    varying vec2 vUv;

    vec3 getGradientColor(float t) {
        if (uColorGradientCount <= 1) {
            return mix(uColorStart, uColorEnd, t);
        }

        for (int i = 0; i < 7; i++) {
            if (i + 1 >= uColorGradientCount) break;
            if (t >= uColorGradientStops[i] && t <= uColorGradientStops[i + 1]) {
                float localT = (t - uColorGradientStops[i]) / (uColorGradientStops[i + 1] - uColorGradientStops[i]);
                return mix(uColorGradient[i], uColorGradient[i + 1], localT);
            }
        }
        return uColorGradient[uColorGradientCount - 1];
    }

    void main() {
        float t = clamp(vAge / vLifetime, 0.0, 1.0);

        vec3 color = getGradientColor(t);
        float opacity = mix(uOpacityStart, uOpacityEnd, t);

        // Fade in/out
        if (t < uFadeIn && uFadeIn > 0.0) {
            opacity *= t / uFadeIn;
        }
        if (t > (1.0 - uFadeOut) && uFadeOut > 0.0) {
            opacity *= (1.0 - t) / uFadeOut;
        }

        if (uHasTexture) {
            vec4 texColor = texture2D(uTexture, vUv);
            color *= texColor.rgb;
            opacity *= texColor.a;
        } else {
            // Circular particle without texture
            float dist = length(vUv - 0.5) * 2.0;
            if (dist > 1.0) discard;
            opacity *= 1.0 - smoothstep(0.5, 1.0, dist);
        }

        gl_FragColor = vec4(color, opacity);
    }
`;
