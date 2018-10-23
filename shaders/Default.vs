attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

uniform mat4 uNormalMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uLightViewMatrix;

varying highp vec4 transformedNormal;
varying lowp vec4 vColor;
varying lowp vec4 vShadowCoord;

void main(void) {

  mat4 basisMatrix = mat4(
    0.5, 0.0, 0.0, 0.0,
    0.0, 0.5, 0.0, 0.0,
    0.0, 0.0, 0.5, 0.0,
    0.5, 0.5, 0.5, 1.0
  );

  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
  vColor = aVertexColor;
  vShadowCoord = basisMatrix * (uProjectionMatrix * uLightViewMatrix * uModelMatrix) * aVertexPosition;

  transformedNormal = normalize(uNormalMatrix * vec4(aVertexNormal, 1.0));

}