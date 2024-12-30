#ifdef GL_ES
precision mediump float;
#endif
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// float dir(vec2 point, int i) {
//   float xs = float(i + 1) / 183.5 * 4.;
//   float xy = float(i + 1) / 127.5 * 4.;
//   // float =
//   point.x += (u_time * xs);
//   return point.x;
// }

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

vec2 pointcoe[4];

    vec3 color = vec3(.0);

    pointcoe[0] = vec2(1.,-1.);
    pointcoe[1] = vec2(-1.,1.);
    pointcoe[2] = vec2(1.,-1.);
    pointcoe[3] = vec2(-1.,1.);
    // Cell positions
    vec2 point[4];
    point[0] = vec2(0.83,0.75);
    point[1] = vec2(0.60,0.07);
    point[2] = vec2(0.28,0.64);
    point[3] =  vec2(0.31,0.26);
    
    for (int i = 0; i < 4; i++) {
      float xs = float(i + 1) / 183.5 * 4.;
      float xy = float(i + 1) / 127.5 * 4.;

      point[i].x += (u_time * xs) * pointcoe[i].x;
      point[i].y += (u_time * xy) * pointcoe[i].y;

      if(point[i].x >= 1.) {
        pointcoe[i].x *= -1.;
      }
      if(point[i].x <= 0.) {
        pointcoe[i].x *= -1.;
      }

      if(point[i].y >= 1.) {
        pointcoe[i].y *= -1.;
      }
      if(point[i].y <= 0.) {
        pointcoe[i].y *= -1.;
      }
    }

    // point[4] = u_mouse/u_resolution;

    float m_dist = 1.;  // minimum distance
    vec2 m_point;        // minimum position

    // Iterate through the points positions
    for (int i = 0; i < 4; i++) {
        float dist = distance(st, point[i]);
        if ( dist < m_dist ) {
            // Keep the closer distance
            m_dist = dist;

            // Kepp the position of the closer point
            m_point = point[i];
        }
    }

    // Add distance field to closest point center
    color += m_dist*2.;

    // tint acording the closest point position
    color.rg = m_point;

    // Show isolines
    color -= abs(sin(80.0*m_dist))*0.07;

    // Draw point center
    color += 1.-step(.02, m_dist);

    gl_FragColor = vec4(color,1.0);
}