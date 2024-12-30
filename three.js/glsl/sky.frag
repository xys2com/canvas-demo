#ifdef GL_ES
precision mediump float;
#endif
uniform float u_time;
uniform vec2 u_resolution;
#define saturate(x) clamp(x,0.,1.)
#define rgb(r,g,b) (vec3(r,g,b)/255.)

float rand(float x) { return fract(sin(x) * 71.5413291); }

float rand2(vec2 x) { return rand(dot(x, vec2(13.4251, 15.5128))); }

float noise(vec2 x)
{
    vec2 i = floor(x);
    vec2 f = x - i;
    f *= f*(3.-2.*f);
    return mix(mix(rand2(i), rand2(i+vec2(1,0)), f.x),mix(rand2(i+vec2(0,1)), rand2(i+vec2(1,1)), f.x), f.y);
}

float fbm(vec2 x)
{
    float r = 0.0, s = 1.0, w = 1.0;
    for (int i=0; i<5; i++)
    {
        s *= 2.0;
        w *= 0.5;
        r += w * noise(s * x);
    }
    return r;
}

float cloud(vec2 uv, float scalex, float scaley, float density, float sharpness, float speed)
{
    return pow(saturate(fbm(vec2(scalex,scaley)*(uv+vec2(speed,0)*u_time))-(1.0-density)), 1.0-sharpness);
}

vec3 render(vec2 uv)
{
    // sky
    vec3 color = mix(mix(vec3(.8941,.3608,.5647), vec3(1.), u_time/20.), rgb(mix(204., 0.,u_time/20.),235,255), uv.y);
    // sun
    vec2 spos = uv - vec2(0., 0.0 + u_time/15.);
    float sun = exp((-80. + u_time)*dot(spos,spos));
    vec3 scol = vec3(.9490, .8784, .4941) * sun * .9;
    color += scol;
    // clouds
    vec3 cl1 = mix(vec3(.9490, .8784, .4941), vec3(.8941,.3608,.5647),uv.y);
    float d1 = mix(0.9,0.1,pow(uv.y, 0.7));
    color = mix(color, cl1, cloud(uv,2.,8.,d1,0.4,0.04));
    color = mix(color, vec3(0.902, 0.902, 0.902), 8.*cloud(uv,14.,18.,0.9,0.75,0.02) * cloud(uv,2.,5.,0.6,0.15,0.01)*uv.y);
    color = mix(color, vec3(0.8, 0.8, 0.8), 5.*cloud(uv,12.,15.,0.9,0.75,0.03) * cloud(uv,2.,8.,0.5,0.0,0.02)*uv.y);
    // post
    color *= vec3(1.0, 0.8588, 0.8588)*1.04;
    color = mix(0.75*rgb(255,205,161), color, smoothstep(-0.1,0.3,uv.y));
    color = pow(color,vec3(1.3));
    return color;
}

void main( )
{
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x -= 0.5;
    uv.x *= u_resolution.x / u_resolution.y;
    
	gl_FragColor = vec4(render(uv),1.0);
}