[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / underwaterOverlayFragmentShader

# Variable: underwaterOverlayFragmentShader

> `const` **underwaterOverlayFragmentShader**: "\n  uniform float uTime;\n  uniform vec3 uWaterColor;\n  uniform float uDensity;\n  uniform float uCausticStrength;\n  uniform float uWaterSurface;\n  uniform float uCameraY;\n  \n  varying vec2 vUv;\n  \n  float hash(vec2 p) \{\n      return fract(sin(dot(p, vec2(12.9898, 78.233))) \* 43758.5453);\n  \}\n  \n  float caustics(vec2 uv, float time) \{\n      float c = 0.0;\n      for (int i = 0; i \< 3; i++) \{\n          float fi = float(i);\n          vec2 p = uv \* (2.0 + fi) + time \* (0.1 + fi \* 0.05);\n          c += abs(sin(p.x \* 8.0 + sin(p.y \* 6.0 + time)) \* \n                   sin(p.y \* 10.0 + sin(p.x \* 7.0 - time \* 0.8)));\n      \}\n      return c / 3.0;\n  \}\n  \n  void main() \{\n      // Only show underwater effect when camera is below water\n      if (uCameraY \>= uWaterSurface) \{\n          discard;\n      \}\n      \n      float depth = (uWaterSurface - uCameraY) \* uDensity;\n      float opacity = clamp(depth \* 0.3, 0.0, 0.6);\n      \n      // Caustics\n      float c = caustics(vUv \* 3.0, uTime) \* uCausticStrength;\n      \n      vec3 color = uWaterColor + vec3(c \* 0.2);\n      \n      gl\_FragColor = vec4(color, opacity);\n  \}\n"

Defined in: [volumetrics-components.ts:91](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics-components.ts#L91)
