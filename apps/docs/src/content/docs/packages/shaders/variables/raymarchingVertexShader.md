[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / raymarchingVertexShader

# Variable: raymarchingVertexShader

> `const` **raymarchingVertexShader**: "\n  varying vec2 vUv;\n  varying vec3 vRayOrigin;\n  varying vec3 vRayDirection;\n  \n  void main() \{\n    vUv = uv;\n    \n    // Fullscreen quad\n    gl\_Position = vec4(position, 1.0);\n    \n    // Ray origin is camera position (passed as uniform)\n    // Ray direction calculated in fragment shader\n  \}\n"

Defined in: [raymarching.ts:10](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/raymarching.ts#L10)

Ray marching shader - GPU-based SDF rendering

Based on marching.js patterns for efficient ray marching
