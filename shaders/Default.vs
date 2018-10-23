attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

uniform mat4 uNormalMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uLightViewMatrix;

// varying highp vec2 vTextureCoord;
// varying highp vec3 vLighting;
varying highp vec4 transformedNormal;
// varying highp vec3 directionalVector;
varying lowp vec4 vColor;
varying lowp vec4 vShadowCoord;

void main(void) {
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
  vColor = aVertexColor;
  vShadowCoord = uProjectionMatrix * uLightViewMatrix * uModelMatrix * aVertexPosition;
  // vTextureCoord = aTextureCoord;

  // Apply lighting effect

  // highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  // highp vec3 directionalLightColor = vec3(1, 1, 1);
  // highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
  // directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  // highp vec4 transformedNormal = normalize(uNormalMatrix * vec4(aVertexNormal, 1.0));
  transformedNormal = normalize(uNormalMatrix * vec4(aVertexNormal, 1.0));

  // highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  // vLighting = ambientLight + (directionalLightColor * directional);
}