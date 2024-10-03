#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265
#define TWO_PI PI * 2.

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// 2D Random
float random(in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a) * u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float shape(vec2 st, float radius) {
	st = vec2(0.5) - st;
    float r = length(st) * 3.0;
    
    float n = noise(st * 10. + u_time * 2.);
    float f = radius + n;
    return 1. - smoothstep(f, f + 0.05, r);
}

float shapeBorder(vec2 st, float radius, float width) {
    return shape(st, radius) - shape(st, radius - width);
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(1.0) * shapeBorder(st,0.8,0.05);

	gl_FragColor = vec4( 1.-color, 1.0 );
}
