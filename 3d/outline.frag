
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
// Raymarch Edge Detection by HLorenzi!
// Detects whether a ray that comes too close to a surface goes away.

#define EDGE_WIDTH 0.2
#define RAYMARCH_ITERATIONS 40

// Distance functions by iquilezles.org
float fSubtraction(float a, float b) {return max(-a,b);}
float fIntersection(float d1, float d2) {return max(d1,d2);}
void fUnion(inout float d1, float d2) {d1 = min(d1,d2);}
float pSphere(vec3 p, float s) {return length(p)-s;}
float pRoundBox(vec3 p, vec3 b, float r) {return length(max(abs(p)-b,0.0))-r;}
float pTorus(vec3 p, vec2 t) {vec2 q = vec2(length(p.xz)-t.x,p.y); return length(q)-t.y;}

float pCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 ); return length( pa - ba*h ) - r;
}

float distf(vec3 p)
{
	float d = 100000.0;
	
	fUnion(d, pRoundBox(vec3(0,0,10) + p, vec3(11,11,1), 1.0));
	fUnion(d, pSphere(vec3(10,10,0) + p, 8.0));
	
	return d;
}


vec4 raymarch(vec3 from, vec3 increment)
{
	const float maxDist = 200.0;
	const float minDist = 0.001;
	const int maxIter = RAYMARCH_ITERATIONS;
	
	float dist = 0.0;
	
	float lastDistEval = 1e10;
	float edge = 0.0;
	
	for(int i = 0; i < maxIter; i++) {
		vec3 pos = (from + increment * dist);
		float distEval = distf(pos);
		
		if (lastDistEval < EDGE_WIDTH && distEval > lastDistEval + 0.001) {
			edge = 1.0;
            break;
		}
        
		if (distEval < minDist) {
			break;
		}
		
		dist += distEval;
        lastDistEval = distEval;
	}
	
	return vec4(dist, 0.0, edge, 0);
}

vec4 getPixel(vec3 from, vec3 increment)
{
	vec4 c = raymarch(from, increment);
	return mix(vec4(1,1,1,1),vec4(0,0,0,1),c.z);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{	
	// pixel position	
	vec2 q = fragCoord.xy/u_resolution.xy;
    vec2 p = -1.0+2.0*q;
	p.x *= -u_resolution.x/u_resolution.y;
	
	// mouse
    vec2 mo = u_mouse.xy/u_resolution.xy;
	vec2 m = u_mouse.xy / u_resolution.xy;

	// camera position
	float dist = 50.0;
	vec3 ta = vec3(0, 0, 0);
	vec3 ro = vec3(1., 40., 25.);
	
	// camera direction
	vec3 cw = normalize( ta-ro );
	vec3 cp = vec3( 0.0, 0.0, 1.0 );
	vec3 cu = normalize( cross(cw, cp) );
	vec3 cv = normalize( cross(cu, cw) );
	vec3 rd = normalize( p.x * cu + p.y * cv + 2.500 * cw );
    
	// calculate color
	vec4 col = getPixel(ro, rd);
	fragColor = col;
	
}
void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}