#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

vec3 circle_mask(vec2 center, float r, vec2 uv) {
    vec2 offset = uv - center;
    return vec3(1. - step(r, length(offset))); 
}

vec3 draw_circle(vec2 center, float r, vec3 color, vec2 uv) {
    return circle_mask(center, r, uv) * color; 
}

vec3 draw_circle_outline(vec2 center, float r, vec3 color, float outline, vec2 uv) {
    vec3 fill = circle_mask(center, r, uv);
    vec3 hole = circle_mask(center, r - outline, uv);
    return fill * (1. - hole) * color;
}

void main(){
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float r = 0.2;
    vec2 center = vec2(0.3, 0.5);
    vec3 color = draw_circle_outline(center, r, vec3(0.5, 0.1, 0.5), 0.01, st);
    gl_FragColor = vec4(color, 1.0);
}