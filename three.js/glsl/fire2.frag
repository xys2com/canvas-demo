
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution; // 画布宽高
uniform float u_time; // 

float random (in vec2 st) {
    return fract(sin(dot(st,vec2(12.9898,78.233)))* 43758.5453123);
}

float graynoise (in vec2 st) {
    vec2 i = floor(st); 
    vec2 f = fract(st);

    float a = random(i); //
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));


    vec2 f3 = f * f * f;
    vec2 p = ((6. * f - 15.) * f + 10.) * f3;// 更加平滑的插值   
    return  (b - a) * p.x + a + 
            (c - a) * p.y * (1.0 - p.x) +
            (d - b) * p.x *  p.y;
}
mat2 rotz(float angle)
{
    mat2 m;
    m[0][0] = cos(angle); m[0][1] = -sin(angle);
    m[1][0] = sin(angle); m[1][1] = cos(angle);
    return m;
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float fbm(vec2 uv){
  vec2 _uv = uv * 128.;
  float n0 = vec3(graynoise(_uv)).r;
  float n = (n0- 0.5) * 0.5;
    // n += (n1 - 0.5) * 0.5 * 0.5;
    // n += (n2 - 0.5) * 0.5 * 0.5 * 0.5;
    
	return n + 0.5;
}
void main() {
    
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 _uv = uv;
    uv -= vec2(0.5);
    uv.y /= u_resolution.x / u_resolution.y;
    vec2 centerUV = uv;
    
    float variationH = fbm(vec2(u_time * .3)) * 1.1;
    
    // 速度
    vec2 offset = vec2(0.0, -u_time * 0.15);
    
    // 频率
    float f = fbm(uv * 0.1 + offset); // 分形转换
    float l = max(0.1, length(uv)); // 归一化
	uv += rotz( ((f - 0.5) / l) * smoothstep(-0.2, .4, _uv.y) * 0.45) * uv;    
    
    // 宽度
    float flame = 1.3 - length(uv.x) * 5.0;
    
    // 底部
    float blueflame = pow(flame * .9, 15.0);
    blueflame *= smoothstep(.2, -1.0, _uv.y);
    blueflame /= abs(uv.x * 2.0);
    blueflame = clamp(blueflame, 0.0, 1.0);
    
    // 总体
    flame *= smoothstep(1., variationH * 0.5, _uv.y);
	flame = clamp(flame, 0.0, 1.0);
    flame = pow(flame, 3.);
    flame /= smoothstep(1.1, -0.1, _uv.y);    
	
    // 颜色
    vec4 col = mix(vec4(1.0, 1., 0.0, 0.0), vec4(1.0, 1.0, .6, 0.0), flame);
    col = mix(vec4(1.0, .0, 0.0, 0.0), col, smoothstep(0.0, 1.6, flame));
    gl_FragColor = col;
    
	// 底部特殊处理
    vec4 bluecolor = mix(vec4(0.0, 0.0, 1.0, 0.0), gl_FragColor, 0.95);
    gl_FragColor = mix(gl_FragColor, bluecolor, blueflame);
    
    gl_FragColor *= flame;
    gl_FragColor.a = flame;
    
    float haloSize = 0.5;
    float centerL = 1.0 - (length(centerUV + vec2(0.0, 0.1)) / haloSize);
    vec4 halo = vec4(.8, .3, .3, 0.0) * 1.0 * fbm(vec2(u_time * 0.035)) * centerL + 0.02;
    vec4 finalCol = mix(halo, gl_FragColor, gl_FragColor.a);
    gl_FragColor = finalCol;

    // 添加灰噪
    gl_FragColor *= mix(rand(uv) + rand(uv * .45), 1.0, 0.9);
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
    
    
}