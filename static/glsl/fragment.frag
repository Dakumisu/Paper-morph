// #pragma glslify: snoise3 = require(glsl-noise/simplex/3d) 
// #pragma glslify: snoise = require(./function/simplex/3d.glsl)

precision highp float;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

#define PI 3.1415926535897932384626433832795

uniform float uTime;
uniform float uAlpha;
uniform float uOffset;
uniform float uStrength;
uniform float uScale;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uPixelRatio;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vPos;

float minSeparation = 1.0;
float maxSeparation = 3.0;
float minDistance = 0.5;
float maxDistance = 2.0;
int size = 1;
vec3 colorModifier = vec3(1.);
float outline = 0.;


void main() {
  vec2 uv = vUv;

  vec2 res = gl_FragCoord.xy / uResolution;
  res *= uPixelRatio;

  vec4 color = vec4(uColor, 1.);
  vec4 texture = texture2D(uTexture, uv);

  vec4 paper = color * texture;

  // paper.xy *= res;

  float noise = step(.25 + (uStrength * -2.), snoise(vec3(uTime * .1, (uv - .5) * uScale)) * (uOffset * .35));

  vec2 edgeBlur = smoothstep(0., .15, uv) * smoothstep(1., .85, uv);
  float radiaEdge = step(.5, 1. - distance(uv, vec2(.5)));

  float alpha = uAlpha * noise;
  alpha *= radiaEdge;
  paper.a = alpha;

  float maxOutlineX = (uv.x + 0.1) * alpha;
  float maxOutlineY = (uv.y + 0.1) * alpha;
  float minOutlineX = (uv.x - 0.1) * alpha;
  float minOutlineY = (uv.y - 0.1) * alpha;
  // vec2 outlineIn = uv * (1. - alpha);
  // vec2 outlineOut = uv * alpha;
  // if(outlineIn.x > 0. || outlineIn.y > 0.)
  //   outlineIn = vec2(1.);
  // if(outlineOut.x > 0. || outlineOut.y > 0.)
  //   outlineOut = vec2(0.);

  // vec2 test = mix(outlineIn, outlineIn, .5);
   
  // alpha *= edgeBlur.x * edgeBlur.y;


  // if(uv.x * alpha < .01)
  //   outline = 1.;
  // if(uv.x * alpha > 1. - .01)
  //   outline = 1.;
  // if(uv.y * alpha < .01)
  //   outline = 1.;
  // if(uv.y * alpha > 1. - .01)
  //   outline = 1.;

  float outlineX = step(.1, distance(minOutlineX, maxOutlineX));
  float outlineY = step(.1, distance(minOutlineY, maxOutlineY));

  vec2 finalOutline = vec2(mix(minOutlineX, maxOutlineX, .5), mix(minOutlineY, maxOutlineY, .5));

  gl_FragColor = vec4(paper.xy, paper.z, paper.a);
  // gl_FragColor = vec4(finalOutline, 0., 1.);
  // gl_FragColor = vec4(outlineX, outlineY, 0., 1.);
  // gl_FragColor = vec4(test, 0., 1.);
}