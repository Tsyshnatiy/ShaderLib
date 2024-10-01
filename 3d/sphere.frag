#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform float u_time;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0001;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

struct Sphere {
    vec3 pos;
    float r;
};

Sphere spheres[2];

vec3 random3(vec3 c) {
    float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
    vec3 r;
    r.z = fract(512.0*j);
    j *= .125;
    r.x = fract(512.0*j);
    j *= .125;
    r.y = fract(512.0*j);
    return r-0.5;
}

// float snoise(vec3 p) {
//     const float F3 =  0.3333333;
//     const float G3 =  0.1666667;

//     vec3 s = floor(p + dot(p, vec3(F3)));
//     vec3 x = p - s + dot(s, vec3(G3));

//     vec3 e = step(vec3(0.0), x - x.yzx);
//     vec3 i1 = e*(1.0 - e.zxy);
//     vec3 i2 = 1.0 - e.zxy*(1.0 - e);

//     vec3 x1 = x - i1 + G3;
//     vec3 x2 = x - i2 + 2.0*G3;
//     vec3 x3 = x - 1.0 + 3.0*G3;

//     vec4 w, d;

//     w.x = dot(x, x);
//     w.y = dot(x1, x1);
//     w.z = dot(x2, x2);
//     w.w = dot(x3, x3);

//     w = max(0.6 - w, 0.0);

//     d.x = dot(random3(s), x);
//     d.y = dot(random3(s + i1), x1);
//     d.z = dot(random3(s + i2), x2);
//     d.w = dot(random3(s + 1.0), x3);

//     w *= w;
//     w *= w;
//     d *= w;

//     return dot(d, vec4(52.0));
// }

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

mat4 rotation3d(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
    0.0,                                0.0,                                0.0,                                1.0
  );
}

float sceneSdf(vec3 samplePoint) {
    float result = MAX_DIST;
    float n = snoise(samplePoint + vec3(sin(u_time / 2.0))) * 0.1;
    
    for (int i = 0 ; i < 2 ; ++i) {
        vec3 v = samplePoint - spheres[i].pos;
        result = min(result, length(v) - spheres[i].r + n);
    }
    
    return result;
}

float shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
    float depth = start;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
        float dist = sceneSdf(eye + depth * marchingDirection);
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
        sceneSdf(vec3(p.x + EPSILON, p.y, p.z)) - sceneSdf(vec3(p.x - EPSILON, p.y, p.z)),
        sceneSdf(vec3(p.x, p.y + EPSILON, p.z)) - sceneSdf(vec3(p.x, p.y - EPSILON, p.z)),
        sceneSdf(vec3(p.x, p.y, p.z  + EPSILON)) - sceneSdf(vec3(p.x, p.y, p.z - EPSILON))
    ));
}

vec3 lambertIllumination(vec3 p, vec3 lightPos) {
    
    vec3 lightVector = normalize(lightPos - p);
    vec3 n = estimateNormal(p);
    return vec3(1.0, 0.0, 0.0) * max(0.0, dot(n, lightVector));
}


void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec3 dir = rayDirection(75., u_resolution.xy, fragCoord);
    vec3 eye = vec3(1.0, 1.0, 10.0);
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
    spheres[0] = Sphere(vec3(3.0, -2.0, -1.0), 1.416);
    spheres[1] = Sphere(vec3(0.0, 0.0, 0.0), 1.352);
    
    mat3 camera_dir = mat3(rotation3d(vec3(1.0, 1.0, 0.0), u_time / 2.0));
    for (int i = 0 ; i < 2; ++i) {
        spheres[i].pos = camera_dir * spheres[i].pos;
    }
    
    mainImage(gl_FragColor, gl_FragCoord.xy);
}