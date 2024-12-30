#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;

// float length(vec2 d1) {
//    return sqrt(d1.x * d1.x + d1.y*d1.y);
// }

float circle(in vec2 st,in float r) {
  vec2 d = (st - vec2(st/2.));
  return 1. - smoothstep(r - (r *.01),r + (r*.01) , dot(d,d)*4.);
}


void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  vec3 c = vec3(circle(vec2(st), .5));
  gl_FragColor = vec4(c, 1.);
}