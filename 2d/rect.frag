#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

vec3 rect_mask(vec2 center, vec2 size, vec2 uv) {
    vec2 offset = vec2(0.5) - center;

    float blx = step((1. - size.x) / 2., uv.x + offset.x);
    float bly = step((1. - size.y) / 2., uv.y + offset.y);
    float trx = step((1. - size.x) / 2., 1.0 - uv.x - offset.x);
    float try = step((1. - size.y) / 2., 1.0 - uv.y - offset.y);
    return vec3(blx * bly * trx * try);   
}

vec3 draw_rect(vec2 center, vec2 size, vec3 color, vec2 uv) {
    return rect_mask(center, size, uv) * color; 
}

vec3 draw_rect_outline(vec2 center, vec2 size, vec3 color, vec2 outline, vec2 uv) {
    vec3 fill = rect_mask(center, size, uv);
    vec3 hole = rect_mask(center, size - outline, uv);
    return fill * (1. - hole) * color;
}

void main(){
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float w = 0.95;
    float h = 0.3;
    vec2 center = vec2(0.5, 0.2);
    vec3 color = draw_rect_outline(center, vec2(w, h), vec3(0.5, 0.1, 0.5), vec2(0.1, 0.1), st);
    gl_FragColor = vec4(color, 1.0);
}