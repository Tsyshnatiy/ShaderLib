#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Reference to
// http://thndl.com/square-shaped-shaders.html

float draw_regular_polygon(vec2 center, float size, int N, vec2 uv) {
    uv = uv + vec2(0.5, 0.5) - center;
    uv = uv * 2. - 1.;
    
    // Angle and radius from the current pixel
    float a = atan(uv.x, uv.y) + PI;
    float r = TWO_PI / float(N);

    // Shaping function that modulate the distance
    float d = cos(floor(0.5 + a / r) * r - a) * length(uv);
    
    return smoothstep(size, size + 0.01, d);
}

void main(){
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    float distance_field_tr1 = draw_regular_polygon(vec2(0.5, 0.4), 0.4, 4, st);
    float distance_field_tr2 = draw_regular_polygon(vec2(0.5, 0.3), 0.4, 3, st);
    float distance_field = max(distance_field_tr1, distance_field_tr2);
    vec3 color = vec3(1.0 - smoothstep(0.4, 0.41, distance_field));

    gl_FragColor = vec4(color, 1.0);
}