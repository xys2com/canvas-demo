
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution; // 画布宽高
uniform float u_time; // 

float random(float x)
{
    float y = fract(sin(x)*100000.0);
    return y;
}

float random2 (in vec2 st) {
    return fract(sin(dot(st,vec2(12.9898,78.233)))* 43758.5453123);
}

float lerp(float a, float b, float t){ // t∈[0,1]
    return a + t * (b - a);
}
// float random(float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }
float noise (in vec2 st) {
    vec2 i = floor(st); // 取整
    vec2 f = fract(st); // 取小数

    // 获取每个格子的顶点值
    float a = random2(i); //
    float b = random2(i + vec2(1.0, 0.0));
    float c = random2(i + vec2(0.0, 1.0));
    float d = random2(i + vec2(1.0, 1.0));
    
    // ——x————x1——————x2——

    // 平滑插值
    // 内置函数 smoothstep => 生成 0 - 1 的平滑过渡值
    // u = 3f² - 2f³; f∈[0,1]
    // vec2 u = f * f * (3. - 2. * f); // 与smoothstep相同的效果
    // vec2 u = smoothstep(0.,1.,f);

    // 更加平滑的插值   
    vec2 f3 = f * f * f;
    vec2 p = ((6. * f - 15.) * f + 10.) * f3; //6t^5 - 15t^4 + 10t^3

    // 0,1      1,1
    // c —————— d
    // |        |
    // |    p   |   // p(.5, .5)
    // |        |
    // a ——ba—— b
    // 0,0      1,0

    // 将四个角的值线性插值
    // mix函数混合参数1与参数2；而 参数1 的在混合中的比例为 参数3; 参数3∈[0,1]
    return  (b - a) * p.x + a + // mix(a, b, p.x) + //a b 基于 u.x 进行插值  ba 的线性值 = .5,0
            (c - a) * p.y * (1.0 - p.x) + //  0,.25
            (d - b) * p.x *  p.y;  //  0,.25
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 pos = vec2(st * 5.);
    
    // 噪声算法
    float n = noise(pos);

    gl_FragColor = vec4(n);
}
// void main( ){
//     vec2 st = gl_FragCoord.xy / u_resolution.xy;
//     st -= .5;
//     //st 取值为 -0.5 ~ 0.5 
//     // st.x *= gl_FragCoord.x / gl_FragCoord.y;
//     float r = length(st); //sqrt(st.x * st.x + st.y * st.y) 很多个圆
//     float c = smoothstep(.5,.1, r); // < 0.28 = 1  > 0.3 = 0
//     // gl_FragColor = vec4(.8,.2,0.3,1);
//     vec4 color = vec4(.8,.2,0.3,1);
//     gl_FragColor = color * c;
//     //   gl_FragColor.rgb = color.rgb;
//     //   gl_FragColor.a=color.a*c;

// }