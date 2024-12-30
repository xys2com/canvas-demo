
#ifdef GL_ES
precision mediump float;
#endif
uniform float u_time;
uniform vec2 u_resolution;

#define OCTAVES 6

vec2 random(vec2 st){
  st = vec2(dot(st,vec2(127.1,311.7)),dot(st,vec2(269.5,183.3)));
  return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f*f*(3.0-2.0*f);

    return mix(
                mix(
                  dot(random(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                  dot(random(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ),
                u.x),
                mix(
                  dot(random(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                  dot(random(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ),
                u.x),
            u.y);
}

float fbm (in vec2 p) {
  float f = 0.0;
  p = p * 2.;
  float a = 2.;
  for (int i = 0; i < OCTAVES; i++){
    p.x += u_time / 50. ;
    p.y += u_time / 80.;
    f += a * noise(p);
    p = 2.0 * p;
    a /= 2.;
  };
  return f;
}
float dx = 0.001; // 计算函数偏x 的步长
float dy = 0.001; // 计算函数偏y 的步长

float dfdx(vec2 uv) {
  vec2 _uv = vec2(uv.x + dx,uv.y);
  vec2 uv_ = vec2(uv.x - dx,uv.y);
  return (noise(_uv) - noise(uv_)) / ( 2.0 * dx);
}
float dfdy(vec2 uv) {
  vec2 _uv = vec2(uv.x ,uv.y + dy);
  vec2 uv_ = vec2(uv.x ,uv.y- dy);
  return (noise(_uv) - noise(uv_)) / ( 2.0 * dy);
}

void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    uv.x *= u_resolution.x/u_resolution.y;
    vec3 top = vec3(.8941, .3607, .3529);
    vec3 bottom = vec3(.9490, .8784, .4941);
    float hue = fbm(uv) * .5 + .5;
    float dist= distance(uv,vec2(0.,0.));
    gl_FragColor = vec4(mix(top, bottom,1. - uv.y),hue);
}