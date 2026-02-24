[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / volumetricPointLightVertexShader

# Variable: volumetricPointLightVertexShader

> `const` **volumetricPointLightVertexShader**: "\n  varying vec3 vWorldPosition;\n  varying vec3 vNormal;\n  varying vec3 vViewDirection;\n  varying float vDistanceToCenter;\n  \n  uniform vec3 uLightPosition;\n  \n  void main() \{\n      vec4 worldPos = modelMatrix \* vec4(position, 1.0);\n      vWorldPosition = worldPos.xyz;\n      vNormal = normalize(normalMatrix \* normal);\n      vViewDirection = normalize(cameraPosition - worldPos.xyz);\n      vDistanceToCenter = length(worldPos.xyz - uLightPosition);\n      gl\_Position = projectionMatrix \* modelViewMatrix \* vec4(position, 1.0);\n  \}\n"

Defined in: [godRays.ts:192](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/godRays.ts#L192)
