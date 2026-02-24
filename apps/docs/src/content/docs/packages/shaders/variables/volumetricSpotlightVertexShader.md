[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / volumetricSpotlightVertexShader

# Variable: volumetricSpotlightVertexShader

> `const` **volumetricSpotlightVertexShader**: "\n  varying vec3 vWorldPosition;\n  varying vec3 vNormal;\n  varying vec3 vViewDirection;\n  \n  void main() \{\n      vec4 worldPos = modelMatrix \* vec4(position, 1.0);\n      vWorldPosition = worldPos.xyz;\n      vNormal = normalize(normalMatrix \* normal);\n      vViewDirection = normalize(cameraPosition - worldPos.xyz);\n      gl\_Position = projectionMatrix \* modelViewMatrix \* vec4(position, 1.0);\n  \}\n"

Defined in: [godRays.ts:119](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/godRays.ts#L119)
