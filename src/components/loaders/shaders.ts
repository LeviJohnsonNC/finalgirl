/** Decorative effects only. Request progress never enters these shaders. */
export const vertexShader = `
attribute vec2 position;
varying vec2 uv;
void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }
`;
const common = `
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
export const bloodShader = common + `
float dripField(vec2 p) {
  float drip=1.;
  for(int i=0;i<3;i++){
    float fi=float(i);
    float x=.375+fi*.11;
    float start=.53+fi*.012;
    float age=max(0.,time-12.-fi*15.);
    float lengthening=(.40-fi*.04)*age/(age+65.+fi*18.);
    float bend=.004*sin(p.y*18.+fi);
    float stem=segment(p,vec2(x,start),vec2(x+bend,start+lengthening))-(.005-fi*.00065);
    float bead=length((p-vec2(x+bend,start+lengthening))*vec2(1.,.8))-(.016-fi*.002);
    float d=smin(stem,bead,.009);
    if(age>0.) drip=min(drip,d);
  }
  return drip;
}
void main(){
  // Texture occupies the upper part of the canvas; drips have reserved room below.
  vec2 p=vec2(uv.x,1.-uv.y);
  vec2 tex=vec2(p.x,(p.y-.025)/.90);
  vec4 base=texture2D(artwork,tex);
  base.a*=step(0.,tex.y)*step(tex.y,1.);
  vec2 center=vec2(.47,.49);
  float angle=atan(tex.y-center.y,tex.x-center.x);
  float arrival=length((tex-center)*vec2(1.,.95))+.035*sin(angle*7.+seed)+.035*cloud(tex*14.);
  // A slow tail keeps exposing new photographic edges over multi-minute waits.
  float growth=.18+.52*time/(time+65.);
  float mask=1.-smoothstep(growth-.022,growth+.014,arrival);
  base.a*=mask;
  float drip=dripField(p);
  float da=1.-smoothstep(-.001,.002,drip);
  float epsilon=.001;
  vec2 slope=vec2(dripField(p+vec2(epsilon,0.))-drip,dripField(p+vec2(0.,epsilon))-drip)/epsilon;
  vec3 normal=normalize(vec3(slope,.55));
  float spec=pow(max(0.,dot(normal,normalize(vec3(-.55,-.65,.7)))),24.);
  float edge=exp(-abs(drip+.002)*240.);
  vec3 dc=vec3(.19,.003,.007)+edge*vec3(.22,.012,.008)+spec*vec3(.65,.43,.34);
  vec3 color=mix(dc,base.rgb,base.a);
  float alpha=max(da,base.a);
  // Continuous arrivals remain legible even at laptop sizes. Each lane has
  // a different cadence/seed; the stain itself never resets or shrinks.
  for(int i=0;i<3;i++){
    float fi=float(i),period=3.7+fi*1.37;
    float clock=max(0.,time-fi*1.3);
    float cycle=floor(clock/period),age=mod(clock,period);
    vec2 hit=vec2(.39+.18*hash(vec2(cycle+seed,fi+2.)),.40+.10*hash(vec2(fi+4.,cycle+seed)));
    float fall=smoothstep(.0,1.35,age);
    vec2 beadPos=hit-vec2(.012*(1.-fall),.27*(1.-fall));
    float radius=.013+.007*hash(vec2(fi+seed,cycle));
    vec2 beadShape=(p-beadPos)*vec2(1.,mix(.72,1.,fall));
    float bead=1.-smoothstep(radius-.002,radius+.002,length(beadShape));
    float contact=bead*(1.-smoothstep(1.35,1.85,age))*step(fi*1.3,time);
    float shine=pow(max(0.,1.-length((p-beadPos+vec2(.004,.006))*65.)),4.);
    color=mix(color,vec3(.31,.006,.011)+vec3(.65,.40,.30)*shine,contact);
    alpha=max(alpha,contact);
    float settled=max(0.,age-1.35);
    float ring=exp(-pow((length(p-hit)-settled*.065)*110.,2.))*exp(-settled*2.5)*step(1.35,age);
    color+=vec3(.32,.06,.035)*ring*base.a;
  }
  // Very small wet-light movement, no global pulsing or shape wobble.
  color*=.97+.03*sin(p.x*11.+p.y*8.+time*.31);
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
