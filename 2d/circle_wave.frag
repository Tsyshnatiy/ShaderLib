#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265
#define TWO_PI PI * 2.

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float shape(vec2 st, float radius) {
    st = vec2(0.5) - st;
    float r = length(st) * 3.0;
    float a = atan(st.y, st.x);
    float m = abs(mod(a + u_time, TWO_PI) - PI);
    float f = radius + sin(a * 20.) * 0.05 * m;
    return 1. - smoothstep(f, f + 0.05, r);
}

float shapeBorder(vec2 st, float radius, float width) {
    return shape(st, radius) - shape(st, radius-width);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(1.0) * shapeBorder(st,0.8,0.05);

    gl_FragColor = vec4( 1.-color, 1.0 );
}
