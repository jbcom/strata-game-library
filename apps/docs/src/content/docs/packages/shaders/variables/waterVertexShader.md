[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / waterVertexShader

# Variable: waterVertexShader

> `const` **waterVertexShader**: "\n  uniform float time;\n  varying vec2 vUv;\n  varying vec3 vWorldPos;\n  varying vec3 vNormal;\n  varying vec3 vViewDir;\n  \n  void main() \{\n    vUv = uv;\n    \n    vec3 pos = position;\n    \n    // Multi-layered wave displacement for more realistic water\n    float wave1 = sin(pos.x \* 0.5 + time) \* 0.05;\n    float wave2 = cos(pos.z \* 0.3 + time \* 1.3) \* 0.03;\n    float wave3 = sin(pos.x \* 1.2 - pos.z \* 0.8 + time \* 0.7) \* 0.02;\n    pos.y += wave1 + wave2 + wave3;\n    \n    // Calculate approximate normal from wave derivatives\n    float dx = cos(pos.x \* 0.5 + time) \* 0.025 + sin(pos.x \* 1.2 - pos.z \* 0.8 + time \* 0.7) \* 0.024;\n    float dz = -sin(pos.z \* 0.3 + time \* 1.3) \* 0.009 - cos(pos.x \* 1.2 - pos.z \* 0.8 + time \* 0.7) \* 0.016;\n    \n    vec3 tangentX = normalize(vec3(1.0, dx, 0.0));\n    vec3 tangentZ = normalize(vec3(0.0, dz, 1.0));\n    vNormal = normalize(cross(tangentZ, tangentX));\n    \n    vWorldPos = (modelMatrix \* vec4(pos, 1.0)).xyz;\n    \n    // Calculate view direction for fresnel\n    vec4 worldPos = modelMatrix \* vec4(pos, 1.0);\n    vViewDir = normalize(cameraPosition - worldPos.xyz);\n    \n    gl\_Position = projectionMatrix \* modelViewMatrix \* vec4(pos, 1.0);\n  \}\n"

Defined in: [water.ts:10](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/water.ts#L10)

Water shader - animated rippling water surface with procedural normal mapping

Lifted from Otterfall procedural rendering system.
