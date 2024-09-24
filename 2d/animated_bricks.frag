// Author @patriciogv ( patriciogonzalezvivo.com ) - 2015

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define M_PI 3.14159265
#define M_HALF_PI M_PI / 2.0
#define M_THREE_PI_HALF 3.0 * M_PI / 2.0

vec2 brickTile(vec2 _st, float _zoom){
    _st *= _zoom;

    float offset_dir_x = floor(mod(_st.y, 2.0)) > 1e-4 ? 1.0 : -1.0;
    float offset_dir_y = floor(mod(_st.x, 2.0)) > 1e-4 ? 1.0 : -1.0;

    float time = mod(u_time, 2.0 * M_PI);
    float sin_time = sin(u_time);
    if (time >= 0.0 && time < M_HALF_PI) {
        _st.y += offset_dir_y * sin_time;
    }
    else if (time >= M_HALF_PI && time < M_PI) {
        _st.x += offset_dir_x * sin_time;
    }
    else if (time >= M_PI && time < M_THREE_PI_HALF) {
        _st.y += offset_dir_y * sin_time;
    }
    else {
        _st.x += offset_dir_x * sin_time;
    }

    return fract(_st);
}

float box(vec2 _st, vec2 _size){
    _size = vec2(0.5) - _size * 0.5;
    vec2 uv = smoothstep(_size, _size + vec2(1e-4), _st);
    uv *= smoothstep(_size, _size + vec2(1e-4), vec2(1.0) - _st);
    return uv.x * uv.y;
}

void main(void){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    // Modern metric brick of 215mm x 102.5mm x 65mm
    // http://www.jaharrison.me.uk/Brickwork/Sizes.html
    st /= vec2(2.15, 0.65) / 1.5;

    // Apply the brick tiling
    st = brickTile(st,5.0);

    color = vec3(box(st, vec2(0.9)));

    // Uncomment to see the space coordinates
    // color = vec3(st,0.0);

    gl_FragColor = vec4(color,1.0);
}
