#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
float random(vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233)))* 43758.5453);
}
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
void main() {
  vec2 st = gl_FragCoord.xy/u_resolution;
  float dist=distance(st,vec2(0.5,0.5));
  // vec4 diffuseColor = vec4(0.7608, 0.502, 1.0, 1.0);
  vec4 diffuseColor = vec4(random(vec2(1)), random(vec2(1.)),random(vec2(1)),random(vec2(1)));
  if(dist < 0.002){
      gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    }else if(dist >= 0.002 && dist < 1.){
      gl_FragColor.rgb = diffuseColor.rgb;
      float coefficient =  1.0 - dist*20.;
      float cd =(coefficient );
      gl_FragColor.a=diffuseColor.a*cd;
    }
}