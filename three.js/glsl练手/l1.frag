#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;
uniform float u_time;

vec2 random(in vec2 st){
  st = vec2(dot(st,vec2(127.1,311.7)),dot(st,vec2(269.5,183.3)));
  return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

float noise(vec2 uv) {
  vec2 f = floor(uv); // 整数部分
  vec2 c = fract(uv); // 小数部分

  // d4——————d3
  // |        | 
  // |        |   
  // |        |  
  // d1——————d2

  // 取得四个点位梯度值 伪随机 （webgl可以外部传入真随机）
  vec2 d1 = random(f);
  vec2 d2 = random(f + vec2(1., 0));
  vec2 d3 = random(f + vec2(1., 1.));
  vec2 d4 = random(f + vec2(0, 1.));

  // 平滑过渡值，用做混合
  vec2 sc = smoothstep(0.,1. , c);

  
  return mix(
            mix(
              dot(d1, c), 
              dot(d2, c - vec2(1., 0)), 
            sc.x), 
            mix(
              dot(d3, c - vec2(1.)), 
              dot(d4, c - vec2(0, 1.)),
            1. - sc.x),
          sc.y);
}

#define OCTAVES 6
float fbm(vec2 uv){
  float v = 0.;
  float coefficient = 2.;
  float amplitude = 1.; // 振幅减半
  // float frequency = 1.; // 频率翻倍
  for (int i = 0; i < OCTAVES; i++){
    v += amplitude * noise(uv);
    uv = coefficient * uv;
    amplitude = amplitude / coefficient;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy/ u_resolution.xy;
  uv = uv - vec2(u_time / 32., u_time / 77.);
  vec3 color = vec3(fbm(uv * 5.) * .5 + .5);
  gl_FragColor  = vec4(color,1.);
}