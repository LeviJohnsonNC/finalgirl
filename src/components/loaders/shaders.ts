/** Decorative effects only. Request progress never enters these shaders. */
export const vertexShader = `
attribute vec2 position;
varying vec2 uv;
void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }
`;
export const common = `
precision highp float;
varying vec2 uv;
uniform float time;
uniform float seed;
uniform sampler2D artwork;
uniform sampler2D photograph;
uniform float photoAspect;
uniform float portrait;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float cloud(vec2 p){return noise(p)*.57+noise(p*2.03)*.28+noise(p*4.1)*.15;}
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
float segment(vec2 p,vec2 a,vec2 b){vec2 q=p-a,v=b-a;return length(q-v*clamp(dot(q,v)/max(dot(v,v),.00001),0.,1.));}
`;
export const wetBloodLighting = `
vec3 wetBlood(vec2 nxy,float thickness,float variation){
  vec3 n=normalize(vec3(nxy,sqrt(max(.03,1.-dot(nxy,nxy)))));
  vec3 light=normalize(vec3(-.45,-.65,.85));
  float diffuse=max(0.,dot(n,light));
  float fresnel=pow(1.-max(0.,n.z),3.);
  // Dark absorbing core, translucent crimson rim, and a coherent softbox reflection.
  vec3 body=mix(vec3(.25,.009,.012),vec3(.065,.001,.004),thickness);
  body*=.75+.3*diffuse+.08*variation;
  vec3 halfLight=normalize(light+vec3(0.,0.,1.));
  float broad=pow(max(0.,dot(n,halfLight)),26.);
  float sharp=pow(max(0.,dot(n,halfLight)),145.);
  return body+vec3(.23,.012,.009)*fresnel+vec3(.62,.47,.37)*broad*.38+vec3(.95,.85,.72)*sharp*.78;
}
`;
export const bloodShader = common + wetBloodLighting + `
// A finite number of procedural lanes, no particle allocation or per-frame React work.
float deposited(float t) {
  float mass=0.;
  for(int i=0;i<3;i++){
    float f=float(i),period=4.6+f*1.83;
    float clock=max(0.,t-f*1.55);
    float cycle=floor(clock/period),age=mod(clock,period);
    mass+=cycle+smoothstep(1.22,1.65,age)*step(f*1.55,t);
  }
  return mass;
}
float extent(float t){float m=deposited(t);return .017+.66*m/(m+17.);}
float dripField(vec2 p) {
  float field=1.,g=extent(time);
  for(int i=0;i<3;i++){
    float f=float(i),age=max(0.,time-20.-f*14.);
    float x=.47+(f-1.)*.072;
    float root=.466+min(g*.49,.17);
    float reach=(.30-f*.026)*age/(age+110.);
    float width=(.0055-f*.0005)*(1.-.3*smoothstep(root+.02,root+.12,p.y));
    float tip=root+reach;
    float bend=.006*sin((p.y-root)*14.+f)*smoothstep(root,tip,p.y);
    float stem=segment(p,vec2(x,root-.018),vec2(x+bend,tip)) - width;
    // Surface tension: narrow neck, heavy rounded pendant, no pointed cartoon teardrop.
    float bead=length((p-vec2(x+bend,tip))*vec2(1.,.81))-(.014-f*.001);
    if(age>0.) field=min(field,smin(stem,bead,.012));
  }
  return field;
}

void main(){
  vec2 p=vec2(uv.x,1.-uv.y),center=vec2(.47,.466);
  vec2 tex=vec2(p.x,(p.y-.025)/.90);
  vec4 base=texture2D(artwork,tex);
  base.a*=step(0.,tex.y)*step(tex.y,1.);
  vec2 delta=(p-center)*vec2(1.,1.06);
  float angle=atan(delta.y,delta.x),g=extent(time);
  // Uneven wetting grows only when another drop lands. The first mark is truly tiny.
  float edge=length(delta)-g*(1.+.10*sin(angle*7.+seed)+.08*(cloud(p*23.)-.5));
  base.a*=1.-smoothstep(-.003,.003,edge);
  vec3 color=base.rgb;
  float alpha=base.a;
  float d=dripField(p),e=.0008;
  vec2 gradient=vec2(dripField(p+vec2(e,0.))-d,dripField(p+vec2(0.,e))-d)/e;
  float da=1.-smoothstep(-.0008,.0016,d);
  vec2 normal=gradient*clamp(1.+d/.010,0.,.97);
  vec3 liquid=wetBlood(normal,clamp(-d*90.,0.,1.),noise(p*250.));
  // Stems emerge from beneath the photographic stain rather than floating over it.
  color=mix(liquid,color,base.a); alpha=max(alpha,da);
  for(int i=0;i<3;i++){
    float f=float(i),period=4.6+f*1.83,clock=max(0.,time-f*1.55);
    float cycle=floor(clock/period),age=mod(clock,period);
    float visible=step(f*1.55,time);
    float hitTime=time-age+1.25;
    float spread=min(.055,extent(max(0.,hitTime-.1))*.42);
    vec2 hit=center+vec2(hash(vec2(cycle+seed,f+2.))-.5,hash(vec2(f+4.,cycle+seed))-.5)*spread;
    float fall=clamp(age/1.25,0.,1.);
    float radius=.013+.006*hash(vec2(f+seed,cycle));
    vec2 pos=hit-vec2(.008*(1.-fall),.34*(1.-fall*fall));
    // Gravity accelerates the drop; slight elongation develops just before impact.
    vec2 q=(p-pos)/vec2(radius,radius*(1.+.6*fall));
    float surface=length(q),contact=(1.-smoothstep(.92,1.08,surface))*visible*(1.-smoothstep(1.25,1.39,age));
    vec3 bead=wetBlood(q*.86,sqrt(max(0.,1.-surface*surface)),noise(p*180.));
    color=mix(color,bead,contact); alpha=max(alpha,contact);
    float impact=max(0.,age-1.25);
    // Tiny irregular impact crown and a local wet highlight, not luminous concentric rings.
    vec2 v=p-hit; float r=length(v),theta=atan(v.y,v.x);
    float crownRadius=radius+impact*.06;
    float crown=exp(-pow((r-crownRadius)*480.,2.))*pow(max(0.,sin(theta*9.+f)),5.);
    crown*=exp(-impact*12.)*step(1.25,age)*visible;
    color=mix(color,vec3(.42,.045,.026),crown*.55); alpha=max(alpha,crown*.7);
  }
  gl_FragColor=vec4(color,alpha);
}
`;
export const darkroomShader = common + `
vec2 cover(vec2 p,float aspect){
  float target=mix(1.63,.64,portrait);
  vec2 scale=vec2(min(1.,target/aspect),min(1.,aspect/target));
  return (p-.5)*scale+.5;
}
void main(){
  vec2 p=vec2(uv.x,1.-uv.y);
  vec3 tray=texture2D(artwork,p).rgb;
  vec2 lo=mix(vec2(.14,.205),vec2(.15,.145),portrait);
  vec2 hi=mix(vec2(.88,.87),vec2(.87,.905),portrait);
  vec2 q=(p-lo)/(hi-lo);
  float bounds=step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);
  float wall=smoothstep(0.,.10,min(min(q.x,1.-q.x),min(q.y,1.-q.y)));
  float a=q.x*17.+q.y*9.-time*.55;
  float b=q.x*-8.+q.y*21.+time*.39;
  vec2 normal=vec2(cos(a)*.6+cos(b)*.28,sin(a)*.45+sin(b)*.4);
  vec2 water=q+normal*.004*wall;
  // Paper sits slightly oblique below the surface, while the tray stays rigid.
  vec2 paper=water-.5;
  float tilt=mix(-.055,-.025,portrait);
  paper=mat2(cos(tilt),-sin(tilt),sin(tilt),cos(tilt))*paper;
  paper=paper/vec2(.92,.88)+.5;
  float sheet=smoothstep(-.002,.002,paper.x)*smoothstep(-.002,.002,1.-paper.x)*smoothstep(-.002,.002,paper.y)*smoothstep(-.002,.002,1.-paper.y);
  vec2 imageUV=(paper-.035)/.93;
  float inside=smoothstep(-.002,.002,imageUV.x)*smoothstep(-.002,.002,1.-imageUV.x)*smoothstep(-.002,.002,imageUV.y)*smoothstep(-.002,.002,1.-imageUV.y);
  vec3 photo=texture2D(photograph,cover(imageUV,photoAspect)).rgb;
  float gray=dot(photo,vec3(.299,.587,.114));
  // If no location photo is supplied, the neutral 1px texture becomes cloudy paper.
  float clouds=cloud(imageUV*3.9+seed*.13);
  float density=.08+.66*(1.-exp(-time/18.));
  float developing=smoothstep(clouds*.58,clouds*.58+.45,density);
  float value=mix(.58,pow(gray,.85)*.78+.025,developing);
  vec3 printColor=vec3(value*.84,value*.79,value*.70);
  printColor=mix(vec3(.67,.60,.49),printColor,inside);
  // Safelight and reflected liquid share the same wave normals.
  float reflection=pow(max(0.,normal.x*.55+normal.y*.45),16.)*.28;
  vec3 red=vec3(.10,.007,.003)*(1.-smoothstep(0.,.9,q.x));
  vec3 bath=mix(tray,printColor*.78,sheet*.95)+red*wall;
  bath+=vec3(.7,.39,.24)*reflection*wall;
  float haze=cloud(q*3.+vec2(time*.018,-time*.011));
  bath=mix(bath,vec3(.32,.27,.22),smoothstep(.42,.8,haze)*.22*wall);
  float glint=pow(max(0.,sin(q.y*34.+q.x*6.+sin(q.x*9.-time*.3)+time*.4)),32.);
  bath+=vec3(.35,.23,.15)*glint*pow(max(0.,1.-q.x*1.6),3.)*wall*.30;
  gl_FragColor=vec4(mix(tray,bath,bounds),1.);
}
`;
