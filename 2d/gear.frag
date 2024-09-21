#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(0.0);

    vec2 pos = vec2(0.5) - st;

    float r = length(pos) * 2.0;
    float a = atan(pos.y, pos.x);

    float f = smoothstep(-0.5, 1.0, cos(a * 10. + u_time)) * 0.2 + 0.5;

    color = vec3(1. - step(f, r));

    gl_FragColor = vec4(color, 1.0);
}
