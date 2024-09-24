// Author @patriciogv - 2015

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

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

float circle(in vec2 _st, in float _radius){
    vec2 l = _st - vec2(0.5);
    return 1. - smoothstep(_radius - (_radius * 0.01),
                           _radius + (_radius * 0.01),
                           dot(l, l) * 4.0);
}

struct Tile {
    vec2 st;
    vec2 index;
};

Tile make_tiles(vec2 st, float n, float m) {
    Tile result;
    result.st = vec2(st.x * n, st.y * m);
    result.index = vec2(floor(result.st));
    result.st = fract(result.st);
    
    return result;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);
	
    Tile tile = make_tiles(st, 3., 3.);
	st = tile.st;
    
    if (tile.index.y == 1.0 || tile.index.x == 1.0) {
        color = draw_rect(vec2(0.5, 0.5), vec2(0.5, 0.5), vec3(1.0), st);
    }
    else {
        color = vec3(circle(st, 0.5));
    }
    
    gl_FragColor = vec4(color, 1.0);
}