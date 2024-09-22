#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0001;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

float sphereSDF(vec3 samplePoint) {
    return length(samplePoint) - 1.0;
}

float shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
    float depth = start;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
        float dist = sphereSDF(eye + depth * marchingDirection);
        if (dist < EPSILON) {
	    return depth;
        }
        depth += dist;
        if (depth >= end) {
            return end;
        }
    }
    return end;
}
            
vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
    vec2 xy = fragCoord - size / 2.0;
    float z = size.y / tan(radians(fieldOfView) / 2.0);
    return normalize(vec3(xy, -z));
}

vec3 estimateNormal(vec3 p) {
    return normalize(vec3(
        sphereSDF(vec3(p.x + EPSILON, p.y, p.z)) - sphereSDF(vec3(p.x - EPSILON, p.y, p.z)),
        sphereSDF(vec3(p.x, p.y + EPSILON, p.z)) - sphereSDF(vec3(p.x, p.y - EPSILON, p.z)),
        sphereSDF(vec3(p.x, p.y, p.z  + EPSILON)) - sphereSDF(vec3(p.x, p.y, p.z - EPSILON))
    ));
}

vec3 lambertIllumination(vec3 p, vec3 lightPos) {
    
    vec3 lightVector = normalize(lightPos - p);
    vec3 n = estimateNormal(p);
    return vec3(1.0, 0.0, 0.0) * max(0.0, dot(n, lightVector));
}


void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec3 dir = rayDirection(75., u_resolution.xy, fragCoord);
    vec3 eye = vec3(0.0, 0.0, 5.0);
    float dist = shortestDistanceToSurface(eye, dir, MIN_DIST, MAX_DIST);
    
    if (dist > MAX_DIST - EPSILON) {
        // Didn't hit anything
        fragColor = vec4(0.0, 0.0, 0.0, 0.0);
		return;
    }
    
    // The closest point on the surface to the eyepoint along the view ray
    vec3 p = eye + dist * dir;
    
    vec3 color = lambertIllumination(p, vec3(3.0, 2.0, 4.0));
    
    fragColor = vec4(color, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}