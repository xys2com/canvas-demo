
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution; // 画布宽高
uniform float u_time; // 
// 二维随机向量
float random(vec2 st) {
    return fract(sin(dot(st,vec2(12.9898,78.233)))* 43758.5453123);
}
// 线性插值
float lerp(float a, float b, float t){ // t∈[0,1]
    return a + t * (b - a);
}
// 二维噪声
float noise2d (vec2 st) {
  vec2 uv_i = floor(st); // 向量值分别取整
  vec2 uv_f = fract(st); // 向量值分别取小数

  // 获得顶点值
  // c  d
  // a  b
  float a = random(uv_i);
  float b = random(uv_i + vec2(1.0, 0));
  float c = random(uv_i + vec2(0, 1.0));
  float d = random(uv_i + vec2(1.0, 1.0));

  // 针对每个像素点进行插值
  vec2 f_3 = uv_f*uv_f*uv_f;
  vec2 p = ((6. * uv_f - 15.) * uv_f + 10.) * f_3; 

  // 
  
  return mix(mix(dot(a,b),dot(a,b), p.x), mix(c,d, 1.0 - p.x), p.y);
}

void main () {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  vec2 pos = vec2(st * 5.) + vec2(u_time);
    
  float n = noise2d(pos);
  gl_FragColor = vec4(n);
}
