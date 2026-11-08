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
