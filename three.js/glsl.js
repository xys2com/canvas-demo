const glslVertexShader = `
varying vec3 pos;
uniform vec3 view_vector; // 视角
varying vec3 vNormal; // 法线
varying vec3 vPositionNormal;
void main() {
  pos = position;
  vNormal = normalize( normalMatrix * normal ); // 转换到视图空间
  vPositionNormal = normalize(normalMatrix * view_vector);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const glslVragmentShader = `
#ifdef GL_ES
precision mediump float;
uniform vec3 targetColor;
uniform float height;
varying vec3 pos;
uniform float b;
uniform float p;
uniform float s;
varying vec3 vNormal;
varying vec3 vPositionNormal;
#endif
void main() {
float a = pow(b + s * abs(dot(vNormal, vPositionNormal)), p );
  gl_FragColor = vec4(targetColor.xyz, a);
}`;
