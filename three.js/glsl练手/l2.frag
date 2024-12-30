#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;


float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 st = gl_FragCoord.xy;
    float r = random(st);
    gl_FragColor = vec4(r); // 将r作为RGB分量和透明度
}