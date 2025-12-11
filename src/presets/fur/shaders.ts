/**
 * Fur Shader - Multi-layer fur rendering
 */

export const furVertexShader = /* glsl */ `
  uniform float layerOffset;
  uniform float spacing;
  uniform float time;
  uniform float windStrength;
  uniform float gravityDroop;
  
  varying vec2 vUv;
  varying float vLayer;
  
  void main() {
      vUv = uv;
      vLayer = layerOffset;
      
      // Extrude along normal
      vec3 pos = position + normal * (layerOffset * spacing);
      
      // Wind effect on fur tips (more pronounced on outer layers)
      if (layerOffset > 0.5) {
          float windPhase = time * 2.0 + position.y * 4.0;
          pos.x += sin(windPhase) * 0.005 * layerOffset * windStrength;
      }

      // Gravity droop (fur hangs down)
      pos.y -= pow(layerOffset, 2.0) * gravityDroop;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const furFragmentShader = /* glsl */ `
  uniform vec3 colorBase;
  uniform vec3 colorTip;
  varying vec2 vUv;
  varying float vLayer;
  
  // Simple random function for fur tapering
  float rand(vec2 n) {
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }
  
  void main() {
      // Tapering effect - outer layers are more transparent
      float noise = rand(vUv * 50.0);
      float threshold = 0.4 + vLayer * 0.6;
      
      if (noise < threshold) {
          discard; // Create fur-like appearance
      }

      // Gradient from base to tip color
      vec3 col = mix(colorBase, colorTip, vLayer);
      
      // Fake ambient occlusion at roots (darker at base)
      col *= 0.5 + 0.5 * vLayer;

      gl_FragColor = vec4(col, 1.0);
  }
`;
