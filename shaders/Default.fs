varying lowp vec4 vColor;
//varying highp vec2 vTextureCoord;
// varying highp vec3 vLighting;

varying highp vec4 transformedNormal;
varying highp vec3 directionalVector;

uniform sampler2D uSampler;

void main(void) {
  //highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

  //gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
  //gl_FragColor = vColor;
  
  highp vec3 directionalLightColor = vec3(1, 1, 1);
  highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  
  highp float directional = max(dot(normalize(transformedNormal).xyz, normalize(directionalVector)), 0.0);
  highp vec3 vLighting = ambientLight + (directionalLightColor * directional);
  
  gl_FragColor = vec4(vColor.rgb * vLighting, vColor.a);
}