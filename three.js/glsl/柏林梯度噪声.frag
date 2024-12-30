
#ifdef GL_ES
precision mediump float;
#endif
uniform float u_time;
uniform vec2 u_resolution;

vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

// Gradient Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/XdXGW8
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f*f*(3.0-2.0*f);

    return mix(
                mix(
                  dot(random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                  dot(random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ),
                u.x),
                mix(
                  dot(random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                  dot(random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ),
                u.x),
            u.y);
}
#define OCTAVES 1
// |noise(st)| + 0.5 * |noise(2*st)| + 0.25 * |noise(4*st)|
float fbm (in vec2 p) {
  float f = 0.0;
  p = p * 4.0;
  float a = 1.;
  for (int i = 0; i < OCTAVES; i++){
        f += a * noise(p);
        p = 4.0 * p;
        a /= 4.;
    };
    return f;
}
float domain_wraping( vec2 p )
{
    vec2 q = vec2( fbm(p) / 5., fbm(p) ) - sin(u_time*.05);

    vec2 r = vec2( fbm(p + q), fbm(p + q) ) - cos(u_time*.05);

    return fbm(p + r );
}
float dx = 0.05; // 计算函数偏x 的步长
float dy = 0.05; // 计算函数偏y 的步长

vec2 getBaseVec(vec2 uv) {
  return  1. / (sqrt(dot(uv,uv))) * uv;
}

float dfdx(vec2 uv) {
  vec2 _uv = vec2(uv.x + dx,uv.y);
  vec2 uv_ = vec2(uv.x - dx,uv.y);
  return (fbm(_uv) - fbm(uv_)) / ( 2.0 * dx);
}

float dfdy(vec2 uv) {
  vec2 _uv = vec2(uv.x ,uv.y + dy);
  vec2 uv_ = vec2(uv.x ,uv.y- dy);
  return (fbm(_uv) - fbm(uv_)) / ( 2.0 * dy);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    st *= 2.;

    float px = dfdx(st);
    float py = dfdy(st);

    // del 算子
    vec2 del = vec2(px, py);

    vec2 base = getBaseVec(st);
  
    // 梯度 
    // del * 基向量
    vec2 grad = vec2(del.x * base.x, del.y * base.y);
    
    // st *= del;

    vec2 rgb = vec2(grad * fbm(st + u_time/7.) * 0.5 + 0.5);
    // vec4 color = vec4(vec3(length(rgb)), 1.0);
    vec4 color = vec4(rgb,1., 1.0);
    gl_FragColor = color;
}