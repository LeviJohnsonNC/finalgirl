import { common, wetBloodLighting } from './shaders';
import { filmAngle, filmBottom, filmTop, framePitch, gateHeight, gateWidth, pullEnd, pullStart } from './openingFilmGeometry';

const glsl = (value: number) => value.toFixed(5);

export const openingFilmShader = common + wetBloodLighting + `
const float aspect = ${glsl(gateWidth / gateHeight)};
const float angle = ${glsl(filmAngle * Math.PI / 180)};
const float pitch = ${glsl(framePitch / gateHeight)};
const float top = ${glsl(filmTop / gateHeight)};
const float bottom = ${glsl(filmBottom / gateHeight)};
const vec2 source = vec2(0., .161);
const vec2 impactPoint = vec2(.012, .484);
const float fallDuration = .65;

vec2 filmPosition(vec2 p) {
  vec2 q = p - vec2(0., .5);
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * q + vec2(0., .5);
}

float filmTranslation(float t) {
  return -pitch * (1. - smoothstep(${glsl(pullStart)}, ${glsl(pullEnd)}, t));
}

float deposited(float t) {
  float count = 0.;
  for (int i=0; i<3; i++) {
    float lane = float(i), interval = 4.6 + 2.1 * lane;
    float age = t - .48 - lane * 1.73;
    if (age >= 0.) count += floor(age / interval) + smoothstep(fallDuration, fallDuration+.23, mod(age, interval));
  }
  return count;
}

float filmStock(vec2 p) {
  float perfX = abs(fract(p.x / (pitch / 8.)) - .5);
  float perfY = min(abs(p.y - top - .025), abs(p.y - bottom + .025));
  float holes = (1.-smoothstep(.16,.22,perfX)) * (1.-smoothstep(.011,.015,perfY));
  return smoothstep(top,top+.002,p.y) * (1.-smoothstep(bottom-.002,bottom,p.y)) * (1.-holes);
}

float pool(vec2 q, float mass, out vec3 color) {
  float radius = .004 + .144 * mass / (mass + 7.2);
  float theta = atan(q.y,q.x);
  float shape = 1. + .09*sin(theta*3.+seed) + .08*sin(theta*7.+seed*.3) + .13*(cloud(q*85.)-.5);
  float field = length(q * vec2(1., 1.1)) - radius * shape;
  vec2 tex = .5 + q / max(.026,radius*2.42);
  vec4 wet = texture2D(artwork, clamp(tex,0.,1.));
  float coverage = 1.-smoothstep(-.003,.0025,field);
  float body = 1.-smoothstep(.52,.96,length(q)/radius);
  vec3 transmission = mix(vec3(.44,.063,.015), vec3(.074,.007,.004), body);
  float edge = exp(-abs(field)*760.);
  float reflection = edge * pow(max(0.,dot(normalize(q+vec2(.00001)),vec2(-.60,-.80))),3.5);
  reflection *= .31+.69*cloud(q*320.);
  color = mix(transmission, wet.rgb*vec3(.90,.63,.44), wet.a*.30);
  color += reflection * vec3(.66,.35,.15)*.68;
  return coverage * (.48 + .40*body + wet.a*.08);
}

void main() {
  vec2 p = vec2((uv.x-.5)*aspect,1.-uv.y);
  vec2 fixedFilm = filmPosition(p);
  float translation = filmTranslation(time);
  vec2 stock = fixedFilm - vec2(translation,0.);
  vec2 center = filmPosition(impactPoint);
  float mass = deposited(time);
  vec3 color;
  float alpha = pool(stock-center, mass, color) * step(.4,mass);

  // The guide wipes a short wet track onto the stock while the reel advances.
  float contact = smoothstep(.17,.29,time);
  float end = -filmTranslation(min(time,.89)) + .022;
  float begin = -filmTranslation(.17);
  float smearSpan = min(.17, max(.001,begin-end));
  float smearEnd = max(.002, end-.022);
  float smear = segment(stock, vec2(smearEnd,top+.044),
    vec2(smearEnd+smearSpan,top+.047)) - (.002 + .003*contact);
  float smearAlpha = (1.-smoothstep(-.001,.002,smear)) * contact * (.55+.28*cloud(stock*145.));
  color = mix(color,vec3(.32,.039,.013),smearAlpha);
  alpha = max(alpha,smearAlpha);

  // Trails feed from the existing pool and lengthen over several minutes.
  float age = max(0.,time-16.);
  for (int i=0;i<2;i++) {
    float lane=float(i);
    float startAge=max(0.,age-22.*lane);
    vec2 root = center + vec2((lane-.5)*.093,.055);
    vec2 tip = root + vec2(.007*sin(lane+startAge*.012),(.145-.024*lane)*startAge/(startAge+62.));
    float trail=segment(stock,root,tip)-(.0047-.0008*lane);
    float bead=length((stock-tip)*vec2(1.,.8))-(.0095-.001*lane);
    float field=smin(trail,bead,.006);
    float a=(1.-smoothstep(-.001,.002,field))*smoothstep(0.,6.,startAge);
    vec3 wet = mix(vec3(.33,.041,.013),vec3(.10,.005,.003),(1.-smoothstep(-.003,.003,field)));
    color=mix(color,wet,a); alpha=max(alpha,a*.92);
  }
  alpha *= filmStock(stock);

  // A fixed bead and falling drops are in camera coordinates.
  vec2 guide = (p-source)/vec2(.008,.012);
  float filament = segment(p, source-vec2(.001,.027), source) - .0016;
  float thread = 1.-smoothstep(-.0006,.0018,filament);
  color=mix(color,vec3(.19,.025,.006),thread); alpha=max(alpha,thread*.8);
  float guideA = 1.-smoothstep(.79,1.04,length(guide));
  color=mix(color,wetBlood(guide*.85,.78,.65),guideA); alpha=max(alpha,guideA);
  for (int i=0;i<3;i++) {
    float lane=float(i), interval=4.6+2.1*lane;
    float elapsed=time-.48-lane*1.73;
    if (elapsed >= 0.) {
      float cycle=floor(elapsed/interval), a=mod(elapsed,interval);
      vec2 jitter=vec2(hash(vec2(seed+cycle,lane+2.)),hash(vec2(lane+4.,cycle+seed)))-.5;
      vec2 hit=impactPoint+jitter*min(.066,.018+.003*mass);
      float f=clamp(a/fallDuration,0.,1.);
      vec2 spot=mix(source,hit,f*f);
      float radius=.012+.004*hash(vec2(cycle+3.,seed+lane));
      vec2 q=(p-spot)/vec2(radius,radius*(1.+.46*f));
      float d=length(q);
      float coverage=(1.-smoothstep(.88,1.07,d))*(1.-smoothstep(fallDuration,fallDuration+.045,a));
      color=mix(color,wetBlood(q*.86,sqrt(max(0.,1.-d*d)),noise(p*145.)),coverage);
      alpha=max(alpha,coverage);
      if(a>=fallDuration && a<fallDuration+.33) {
        float t=a-fallDuration;
        vec2 delta=p-hit;
        float r=length(delta), theta=atan(delta.y,delta.x);
        float spikes=pow(max(0.,sin(theta*7.+seed+lane)),12.);
        float crest=(r-radius-t*.155)*340.;
        float crown=exp(-crest*crest)*spikes*exp(-t*12.);
        color=mix(color,vec3(.48,.083,.038),crown);
        alpha=max(alpha,crown*filmStock(stock));
        for (int j=0;j<3;j++) {
          float ray=float(j);
          float direction=ray*2.12+seed*.43+cycle*.23;
          vec2 velocity=vec2(cos(direction),sin(direction))*(.09+.054*ray);
          vec2 bead=p-hit-velocity*(t+.09)-vec2(0.,.18*t*t);
          float pin=(1.-smoothstep(.0015,.0038,length(bead)))*(1.-smoothstep(.19,.32,t));
          color=mix(color,vec3(.35,.039,.012),pin);
          alpha=max(alpha,pin*filmStock(stock));
        }
      }
    }
  }
  gl_FragColor=vec4(color,alpha);
}
`;
