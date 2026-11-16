/* Personality Stars - shaders.js  (GLSL ES 3.0)  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const H = `#version 300 es
precision highp float; precision highp int; precision highp sampler2D; precision highp sampler2DShadow;
`;
  const U = `
uniform mat4 uViewProj; uniform vec3 uCamPos; uniform float uTime;
uniform vec3 uLightDir; uniform vec3 uLightCol; uniform vec3 uSunDir; uniform vec3 uSunCol;
uniform vec3 uAmbTop; uniform vec3 uAmbBot; uniform vec3 uSkyTop; uniform vec3 uSkyHor; uniform float uNight;
uniform float uFogDen; uniform float uFogStart; uniform float uIndoor;
uniform mat4 uShadowMat; uniform sampler2DShadow uShadowMap; uniform float uShadowOn; uniform float uShadowTexel; uniform float uShadowSoft; uniform float uShadowNO;
uniform vec4 uPLPos[8]; uniform vec4 uPLCol[8]; uniform int uPLN;
`;
  const F = `
float hash12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float hash13(vec3 p3){ p3=fract(p3*.1031); p3+=dot(p3,p3.zyx+31.32); return fract((p3.x+p3.y)*p3.z); }
vec2 hash22(vec2 p){ vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)); p3+=dot(p3,p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash12(i),hash12(i+vec2(1,0)),u.x), mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),u.x), u.y); }
vec3 skyColor(vec3 d){
  float y=d.y;
  vec3 c=mix(uSkyHor,uSkyTop,pow(clamp(y,0.0,1.0),0.42));
  c=mix(c,uSkyHor*0.82,clamp(-y*2.5,0.0,1.0));
  float sd=max(dot(d,uSunDir),0.0);
  c+=uSunCol*(pow(sd,5.0)*0.20+pow(sd,40.0)*0.35)*(1.0-uNight*0.85)*(1.0-uIndoor);
  return c;
}
float shadowAt(vec3 wp, vec3 n){
  if(uShadowOn<0.5) return 1.0;
  vec4 sp=uShadowMat*vec4(wp+n*uShadowNO,1.0);
  vec3 p=sp.xyz/sp.w*0.5+0.5;
  if(p.x<=0.0||p.x>=1.0||p.y<=0.0||p.y>=1.0||p.z>=1.0) return 1.0;
  float z=p.z-0.0008, s=0.0;
  if(uShadowSoft>0.5){
    for(int x=-1;x<=1;x++) for(int y=-1;y<=1;y++) s+=texture(uShadowMap,vec3(p.xy+vec2(float(x),float(y))*uShadowTexel*1.25,z));
    s/=9.0;
  } else s=texture(uShadowMap,vec3(p.xy,z));
  vec2 e=abs(p.xy-0.5)*2.0;
  return mix(s,1.0,smoothstep(0.8,0.98,max(e.x,e.y)));
}
vec3 pointLights(vec3 alb, vec3 n, vec3 wp){
  vec3 c=vec3(0.0);
  for(int i=0;i<8;i++){ if(i>=uPLN) break;
    vec3 L=uPLPos[i].xyz-wp; float d=length(L); float a=clamp(1.0-d/uPLPos[i].w,0.0,1.0); a*=a;
    c+=alb*uPLCol[i].rgb*a*(0.3+0.7*max(dot(n,L/max(d,0.001)),0.0)); }
  return c;
}
vec3 shade(vec3 alb, vec3 n, vec3 wp, float sh){
  float ndl=dot(n,uLightDir);
  float l=smoothstep(-0.03,0.16,ndl)*sh;
  vec3 amb=mix(uAmbBot,uAmbTop,n.y*0.5+0.5);
  return alb*(amb+uLightCol*l)+pointLights(alb,n,wp);
}
vec3 applyFog(vec3 c, vec3 wp){
  vec3 v=wp-uCamPos; float d=length(v);
  float f=1.0-exp(-max(d-uFogStart,0.0)*uFogDen);
  f*=mix(0.35,1.0,exp(-max(wp.y-10.0,0.0)*0.004));
  return mix(c,skyColor(v/max(d,0.001)),clamp(f,0.0,1.0));
}
`;
  // ---------- 地形 ----------
  const terrainVS = H + U + `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNrm; layout(location=2) in vec4 aCol;
#ifdef DEPTH
uniform mat4 uLightVP; void main(){ gl_Position=uLightVP*vec4(aPos,1.0); }
#else
out vec3 vWP; out vec3 vN; out vec4 vC;
void main(){ vWP=aPos; vN=aNrm; vC=aCol; gl_Position=uViewProj*vec4(aPos,1.0); }
#endif
`;
  const depthFS = H + `out vec4 o; void main(){ o=vec4(1.0); }`;
  const terrainFS = H + U + F + `
in vec3 vWP; in vec3 vN; in vec4 vC; out vec4 o;
void main(){
  vec3 n=normalize(vN); vec3 alb=vC.rgb;
  float d=vnoise(vWP.xz*0.07)*0.55+vnoise(vWP.xz*0.45)*0.3+vnoise(vWP.xz*2.3)*0.15;
  alb*=0.84+0.3*d;
  float sh=shadowAt(vWP,n);
  if(vWP.y<0.0){
    float dep=-vWP.y;
    alb=mix(alb,vec3(0.10,0.36,0.42),clamp(dep*0.10,0.0,0.85));
    float ca=pow(vnoise(vWP.xz*0.9+uTime*0.5)*vnoise(vWP.xz*1.3-uTime*0.4+7.0),1.5);
    alb+=vec3(0.35,0.55,0.5)*ca*clamp(1.0-dep*0.08,0.0,1.0)*sh;
  }
  vec3 c=shade(alb,n,vWP,sh);
  if(vC.a>0.01){ float p=0.75+0.25*sin(uTime*2.0+vWP.x*0.3+vWP.z*0.2); c+=vec3(2.6,0.85,0.25)*vC.a*p; }
  o=vec4(applyFog(c,vWP),1.0);
}`;
  // ---------- 静的メッシュ (インスタンス対応) ----------
  const meshVS = H + U + `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNrm; layout(location=2) in vec4 aCol;
layout(location=4) in vec4 aI0; layout(location=5) in vec4 aI1;
uniform mat4 uModel;
vec3 rotY(vec3 p,float a){ float c=cos(a),s=sin(a); return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z); }
#ifdef DEPTH
uniform mat4 uLightVP;
#else
out vec3 vWP; out vec3 vN; out vec4 vC;
#endif
void main(){
  vec3 p=rotY(aPos*aI1.x,aI0.w);
  float sw=aI1.z*max(aPos.y,0.0);
  p.x+=sin(uTime*1.3+aI0.x*0.13+aI0.z*0.07)*sw*0.025; p.z+=cos(uTime*1.1+aI0.z*0.11)*sw*0.02;
  vec4 wp=uModel*vec4(p+aI0.xyz,1.0);
#ifdef DEPTH
  gl_Position=uLightVP*wp;
#else
  vWP=wp.xyz; vN=mat3(uModel)*rotY(aNrm,aI0.w);
  float t=aI1.y; vC=vec4(aCol.rgb*(0.86+0.28*t),aCol.a);
  gl_Position=uViewProj*wp;
#endif
}`;
  const meshFS = H + U + F + `
in vec3 vWP; in vec3 vN; in vec4 vC; out vec4 o;
uniform vec3 uTint; uniform float uNightGlow;
void main(){
  vec3 n=normalize(vN); if(!gl_FrontFacing) n=-n;
  vec3 alb=vC.rgb*uTint;
  float sh=shadowAt(vWP,n);
  vec3 c=shade(alb,n,vWP,sh);
  float V=1.0-max(dot(n,normalize(uCamPos-vWP)),0.0);
  c+=alb*pow(V,4.0)*0.18*uLightCol;
  c+=alb*vC.a*(1.6+uNightGlow*1.4);
  o=vec4(applyFog(c,vWP),1.0);
}`;
  // ---------- スキンメッシュ (キャラクター) ----------
  const skinVS = H + U + `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNrm; layout(location=2) in vec4 aCol; layout(location=3) in float aBone;
uniform mat4 uBones[30]; uniform mat4 uModel; uniform float uOutline;
#ifdef DEPTH
uniform mat4 uLightVP;
void main(){ mat4 B=uBones[int(aBone+0.5)]; gl_Position=uLightVP*(uModel*(B*vec4(aPos,1.0))); }
#else
out vec3 vWP; out vec3 vN; out vec4 vC; out vec3 vLP;
void main(){
  mat4 B=uBones[int(aBone+0.5)];
  vec4 wp=uModel*(B*vec4(aPos,1.0));
  vec3 n=normalize(mat3(uModel)*(mat3(B)*aNrm));
  if(uOutline>0.0){ float d=length(wp.xyz-uCamPos); wp.xyz+=n*uOutline*(0.75+d*0.035); }
  vWP=wp.xyz; vN=n; vC=aCol; vLP=aPos;
  gl_Position=uViewProj*wp;
}
#endif
`;
  const skinFS = H + U + F + `
in vec3 vWP; in vec3 vN; in vec4 vC; in vec3 vLP; out vec4 o;
uniform vec4 uFlash; uniform float uDissolve; uniform vec3 uEmis; uniform float uOutlinePass; uniform vec3 uOutlineCol; uniform float uAlpha;
void main(){
  if(uDissolve>0.0){ float k=vnoise(vWP.xz*5.0+vWP.y*7.0)*0.7+vnoise(vWP.xy*13.0)*0.3; if(k<uDissolve) discard; }
  if(uOutlinePass>0.5){ o=vec4(applyFog(uOutlineCol*(uAmbTop*0.5+uLightCol*0.5+0.2),vWP),1.0); return; }
  vec3 n=normalize(vN); vec3 alb=vC.rgb;
  float sh=shadowAt(vWP,n);
  float ndl=dot(n,uLightDir);
  float l=smoothstep(0.0,0.08,ndl)*mix(0.15,1.0,sh);
  vec3 amb=mix(uAmbBot,uAmbTop,n.y*0.5+0.5);
  vec3 c=alb*(amb*1.05+uLightCol*l*0.85)+pointLights(alb,n,vWP);
  vec3 V=normalize(uCamPos-vWP);
  float rim=pow(1.0-max(dot(n,V),0.0),3.5);
  c+=rim*(uLightCol*0.35+uAmbTop*0.35)*smoothstep(0.2,0.6,rim);
  c+=alb*vC.a*uEmis*2.4;
  if(uDissolve>0.0){ float k=vnoise(vWP.xz*5.0+vWP.y*7.0)*0.7+vnoise(vWP.xy*13.0)*0.3; c+=vec3(1.6,1.2,2.4)*smoothstep(uDissolve+0.08,uDissolve,k); }
  c=mix(c,uFlash.rgb,uFlash.a);
  o=vec4(applyFog(c,vWP),uAlpha);
}`;
  // ---------- 空 ----------
  const fsVS = H + `out vec2 vUV; void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2)); vUV=p; gl_Position=vec4(p*2.0-1.0,0.0,1.0); }`;
  const skyVS = H + `out vec2 vNdc; void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2))*2.0-1.0; vNdc=p; gl_Position=vec4(p,0.99999,1.0); }`;
  const skyFS = H + U + F + `
in vec2 vNdc; out vec4 o; uniform mat4 uInvVP; uniform float uCloudQ; uniform vec3 uMoonDir;
float fbmC(vec2 p, int oc){ float s=0.0,a=0.5; for(int i=0;i<6;i++){ if(i>=oc) break; s+=a*vnoise(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return s; }
void main(){
  vec4 a=uInvVP*vec4(vNdc,1.0,1.0); vec3 d=normalize(a.xyz/a.w-uCamPos);
  vec3 c=skyColor(d);
  if(uIndoor<0.5){
    float sd=dot(d,uSunDir);
    c+=uSunCol*smoothstep(0.99935,0.99965,sd)*7.0*(1.0-uNight);
    float md=dot(d,uMoonDir);
    c+=vec3(0.85,0.9,1.0)*smoothstep(0.99915,0.99945,md)*1.8*uNight;
    c+=vec3(0.3,0.38,0.55)*pow(max(md,0.0),60.0)*0.4*uNight;
    if(uNight>0.01 && d.y>0.0){
      vec3 sp=d*220.0; vec3 id=floor(sp); float h=hash13(id);
      if(h>0.9955){ vec3 f=fract(sp)-0.5; float s=smoothstep(0.3,0.0,length(f))*(0.55+0.45*sin(uTime*1.7+h*300.0)); c+=vec3(0.9,0.95,1.0)*s*uNight*1.6*d.y; }
      c+=vec3(0.25,0.18,0.45)*pow(1.0-abs(dot(d,normalize(vec3(0.4,0.3,0.86)))),12.0)*0.25*uNight;
    }
    if(uCloudQ>0.0 && d.y>-0.02){
      vec2 uv=d.xz/(max(d.y,0.0)+0.11)*0.9+vec2(uTime*0.004,uTime*0.0025);
      int oc=uCloudQ>1.5?6:3;
      vec2 w=vec2(fbmC(uv*0.7,oc),fbmC(uv*0.7+5.2,oc));
      float n=fbmC(uv+w*0.8,oc);
      float cov=smoothstep(0.48,0.78,n);
      float thick=smoothstep(0.5,0.95,n);
      vec3 lit=uLightCol*0.75+uAmbTop*0.55+0.08;
      vec3 cc=mix(vec3(1.0),mix(uSkyTop,vec3(0.55,0.58,0.68),0.5),thick*0.55)*lit;
      cc+=uSunCol*pow(max(sd,0.0),10.0)*0.6*(1.0-thick)*(1.0-uNight);
      c=mix(c,cc,cov*smoothstep(-0.02,0.14,d.y)*0.92);
    }
  }
  o=vec4(c,1.0);
}`;
  // ---------- 水 / 溶岩 ----------
  const waterVS = H + U + `
layout(location=0) in vec3 aPos; uniform vec3 uOrigin; uniform float uLevel; uniform float uLava;
out vec3 vWP;
void main(){
  vec2 xz=aPos.xz+uOrigin.xz; float d=length(aPos.xz);
  float h=(sin(xz.x*0.21+uTime*1.1)*0.08+sin(xz.y*0.17-uTime*0.9)*0.07+sin((xz.x+xz.y)*0.37+uTime*1.7)*0.04)*clamp(1.0-d/300.0,0.0,1.0);
  if(uLava>0.5) h=sin(xz.x*0.3+uTime*0.6)*0.15+sin(xz.y*0.25-uTime*0.5)*0.15;
  vWP=vec3(xz.x,uLevel+h,xz.y); gl_Position=uViewProj*vec4(vWP,1.0);
}`;
  const waterFS = H + U + F + `
in vec3 vWP; out vec4 o; uniform sampler2D uHeight; uniform float uHalf; uniform float uCell; uniform float uRes; uniform float uLevel; uniform float uLava; uniform float uFancy;
float terrH(vec2 xz){ vec2 g=(xz+uHalf)/uCell; if(g.x<0.0||g.y<0.0||g.x>uRes-1.01||g.y>uRes-1.01) return -45.0;
  ivec2 i=ivec2(floor(g)); vec2 f=fract(g);
  float a=texelFetch(uHeight,i,0).r,b=texelFetch(uHeight,i+ivec2(1,0),0).r,c=texelFetch(uHeight,i+ivec2(0,1),0).r,e=texelFetch(uHeight,i+ivec2(1,1),0).r;
  return mix(mix(a,b,f.x),mix(c,e,f.x),f.y); }
float wh(vec2 p){ return sin(p.x*0.21+uTime*1.1)*0.08+sin(p.y*0.17-uTime*0.9)*0.07+sin((p.x+p.y)*0.37+uTime*1.7)*0.04
  +(vnoise(p*0.55+uTime*vec2(0.30,0.22))-0.5)*0.14+(vnoise(p*1.9-uTime*vec2(0.28,0.41))-0.5)*0.05*uFancy; }
void main(){
  vec3 V=uCamPos-vWP; float dist=length(V); V/=dist;
  if(uLava>0.5){
    vec2 p=vWP.xz*0.12; float n=vnoise(p+uTime*0.05)*0.6+vnoise(p*2.7-uTime*0.08)*0.4;
    float crust=smoothstep(0.45,0.62,vnoise(p*1.6+vec2(uTime*0.03,0.0)));
    vec3 c=mix(vec3(3.2,1.1,0.2),vec3(4.0,2.4,0.6),n); c=mix(c,vec3(0.12,0.05,0.04),crust*0.85);
    o=vec4(applyFog(c,vWP),1.0); return;
  }
  float depth=uLevel-terrH(vWP.xz);
  float e=0.18; vec2 p=vWP.xz;
  vec3 n=normalize(vec3(wh(p-vec2(e,0.0))-wh(p+vec2(e,0.0)),2.0*e,wh(p-vec2(0.0,e))-wh(p+vec2(0.0,e))));
  n=normalize(mix(vec3(0.0,1.0,0.0),n,clamp(1.0-dist/350.0,0.15,1.0)));
  float fres=0.02+0.98*pow(1.0-max(dot(n,V),0.0),5.0);
  vec3 refl=skyColor(reflect(-V,n));
  vec3 shallow=vec3(0.22,0.74,0.72), deep=vec3(0.02,0.18,0.34);
  vec3 wc=mix(shallow,deep,smoothstep(0.0,10.0,depth));
  float sh=shadowAt(vWP,vec3(0.0,1.0,0.0));
  wc*=(uAmbTop*0.95+uLightCol*0.5*sh)+pointLights(vec3(0.6),n,vWP);
  vec3 c=mix(wc,refl,clamp(fres,0.0,1.0)*0.82);
  vec3 Hh=normalize(uLightDir+V); c+=uLightCol*pow(max(dot(n,Hh),0.0),280.0)*3.5*sh*(1.0-uIndoor);
  float fm=smoothstep(0.9,0.0,depth)*smoothstep(0.35,0.75,vnoise(p*1.4+uTime*0.45)*0.7+0.35*sin(depth*10.0-uTime*2.4)+0.2);
  c=mix(c,(uAmbTop+uLightCol*0.85*sh),clamp(fm,0.0,1.0)*0.85);
  float alpha=clamp(mix(0.22,0.93,smoothstep(0.0,6.0,depth))+fres*0.45+fm*0.6,0.0,1.0);
  if(depth<-0.4) discard;
  o=vec4(applyFog(c,vWP),alpha);
}`;
  // ---------- 草 ----------
  const grassVS = H + U + `
layout(location=0) in vec3 aPos;
uniform sampler2D uHeight; uniform sampler2D uSplat; uniform float uHalf; uniform float uCell; uniform float uRes;
uniform int uGrid; uniform float uSpacing; uniform vec3 uCenter; uniform vec3 uPlayer; uniform float uRadius;
out vec3 vWP; out vec3 vCol; out float vT;
float hh(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float terrH(vec2 xz){ vec2 g=clamp((xz+uHalf)/uCell,vec2(0.0),vec2(uRes-1.01)); ivec2 i=ivec2(floor(g)); vec2 f=fract(g);
  float a=texelFetch(uHeight,i,0).r,b=texelFetch(uHeight,i+ivec2(1,0),0).r,c=texelFetch(uHeight,i+ivec2(0,1),0).r,e=texelFetch(uHeight,i+ivec2(1,1),0).r;
  return mix(mix(a,b,f.x),mix(c,e,f.x),f.y); }
void main(){
  int ix=gl_InstanceID%uGrid, iz=gl_InstanceID/uGrid;
  vec2 cell=floor(uCenter.xz/uSpacing)+vec2(float(ix),float(iz))-float(uGrid)*0.5;
  vec2 r=vec2(hh(cell),hh(cell+17.3));
  vec2 p=(cell+r)*uSpacing;
  vec2 g=clamp((p+uHalf)/uCell,vec2(0.0),vec2(uRes-1.0));
  vec4 sp=texture(uSplat,(g+0.5)/uRes);
  float dist=length(p-uCamPos.xz);
  float keep=step(hh(cell*1.37+3.1),sp.r)*(1.0-smoothstep(uRadius*0.62,uRadius,dist));
  float h=terrH(p); if(h<0.4) keep=0.0;
  float sc=(0.5+0.75*hh(cell+5.7))*keep*(0.7+0.6*sp.b);
  float ang=hh(cell+9.1)*6.2832; float c=cos(ang), s=sin(ang);
  vec3 lp=vec3(aPos.x*0.42, aPos.y*0.5, aPos.z*0.42)*sc;
  lp=vec3(c*lp.x+s*lp.z,lp.y,-s*lp.x+c*lp.z);
  float t=aPos.y; vT=t;
  vec2 wind=vec2(sin(uTime*1.6+p.x*0.12+p.y*0.07),cos(uTime*1.25+p.y*0.11))*0.28+vec2(0.12,0.05)*sin(uTime*0.6+p.x*0.02);
  vec2 aw=p-uPlayer.xz; float pd=length(aw); float push=smoothstep(1.4,0.0,pd)*step(abs(uPlayer.y-h),2.0);
  vec3 wp=vec3(p.x,h,p.y)+lp;
  wp.xz+=(wind*0.7+aw/max(pd,0.01)*push*0.9)*t*t*sc;
  wp.y-=push*t*0.35*sc;
  vWP=wp;
  vec3 base=mix(vec3(0.20,0.42,0.12),vec3(0.12,0.30,0.10),sp.g);
  vec3 tip=mix(vec3(0.62,0.82,0.36),vec3(0.42,0.66,0.28),sp.g);
  float fl=step(0.975,hh(cell+31.7))*sp.b;
  vec3 fc=mix(vec3(1.0,0.92,0.45),vec3(0.95,0.55,0.75),step(0.5,hh(cell+2.2)));
  vCol=mix(base,mix(tip,fc,fl*step(0.8,t)),t)*(0.88+0.24*hh(cell+4.4));
  gl_Position=uViewProj*vec4(wp,1.0);
}`;
  const grassFS = H + U + F + `
in vec3 vWP; in vec3 vCol; in float vT; out vec4 o;
void main(){
  float sh=shadowAt(vWP,vec3(0.0,1.0,0.0));
  float l=mix(0.25,1.0,sh)*smoothstep(-0.1,0.3,uLightDir.y+0.2);
  vec3 c=vCol*(mix(uAmbBot,uAmbTop,0.7)*1.05+uLightCol*l*0.8)+pointLights(vCol,vec3(0,1,0),vWP);
  vec3 V=normalize(uCamPos-vWP); c+=vCol*uLightCol*pow(max(dot(-V,uLightDir),0.0),6.0)*0.5*vT*sh;
  o=vec4(applyFog(c,vWP),1.0);
}`;
  // ---------- パーティクル ----------
  const partVS = H + U + `
layout(location=0) in vec4 aP; layout(location=1) in vec4 aC; layout(location=2) in float aK;
uniform float uScale; out vec4 vC; flat out float vK;
void main(){ vec4 cp=uViewProj*vec4(aP.xyz,1.0); gl_Position=cp; gl_PointSize=clamp(aP.w*uScale/max(cp.w,0.1),1.0,300.0); vC=aC; vK=aK; }`;
  const partFS = H + `
in vec4 vC; flat in float vK; out vec4 o;
void main(){ vec2 q=gl_PointCoord*2.0-1.0; float r=dot(q,q); float a;
  if(vK<0.5) a=smoothstep(1.0,0.0,r);
  else if(vK<1.5){ a=max(smoothstep(0.18,0.0,abs(q.x))*(1.0-abs(q.y)),smoothstep(0.18,0.0,abs(q.y))*(1.0-abs(q.x)))+smoothstep(0.25,0.0,r)*0.8; }
  else if(vK<2.5){ a=smoothstep(1.0,0.75,r)*0.9; }
  else { a=smoothstep(1.0,0.0,r); a=a*a; }
  if(a<0.01) discard;
  o=vec4(vC.rgb,vC.a*clamp(a,0.0,1.0)); }`;
  // ---------- VFX (斬撃・予兆・光柱・魔法陣) ----------
  const vfxVS = H + U + `
layout(location=0) in vec3 aPos; uniform mat4 uModel; uniform int uMode; uniform vec4 uArc; uniform vec3 uSize;
out vec2 vUV; out vec3 vWP;
void main(){
  vec3 lp;
  if(uMode==0){ float a=mix(uArc.x,uArc.y,aPos.x); float r=mix(uArc.z,uArc.w,aPos.y); lp=vec3(sin(a)*r,0.0,cos(a)*r); vUV=aPos.xy; }
  else if(uMode==2){ lp=vec3(aPos.x*uSize.x,aPos.y*uSize.y,aPos.z*uSize.z); vUV=vec2(atan(aPos.z,aPos.x),aPos.y); }
  else { lp=vec3(aPos.x*uSize.x,0.0,aPos.z*uSize.z); vUV=aPos.xz; }
  vec4 wp=uModel*vec4(lp,1.0); vWP=wp.xyz; gl_Position=uViewProj*wp;
}`;
  const vfxFS = H + U + F + `
in vec2 vUV; in vec3 vWP; out vec4 o; uniform int uMode; uniform vec4 uColor; uniform float uProg; uniform vec4 uShape;
void main(){
  vec4 c=uColor; float a=0.0;
  if(uMode==0){
    float u=vUV.x, v=vUV.y;
    float head=uProg*1.35;
    float tail=smoothstep(head-0.75,head,u)*step(u,head);
    float prof=smoothstep(0.0,0.55,v)*smoothstep(1.0,0.82,v);
    a=tail*prof*(1.0-smoothstep(0.75,1.0,uProg));
    c.rgb=mix(c.rgb,vec3(1.0),smoothstep(0.55,0.95,v)*0.7);
  } else if(uMode==1){ // 予兆 shape: x=type(0円 1扇 2矩形 3リング) y=angle/inner z=len
    vec2 p=vUV; float inside=0.0, edge=0.0; float r=length(p);
    if(uShape.x<0.5){ inside=step(r,1.0); edge=smoothstep(0.9,1.0,r)*inside; }
    else if(uShape.x<1.5){ float ang=abs(atan(p.x,p.y)); inside=step(r,1.0)*step(ang,uShape.y); edge=max(smoothstep(0.92,1.0,r),smoothstep(uShape.y-0.06,uShape.y,ang))*inside; }
    else if(uShape.x<2.5){ inside=step(abs(p.x),1.0)*step(0.0,p.y)*step(p.y,1.0); edge=max(smoothstep(0.88,1.0,abs(p.x)),smoothstep(0.96,1.0,p.y))*inside; r=p.y; }
    else { inside=step(r,1.0)*step(uShape.y,r); edge=(smoothstep(0.93,1.0,r)+smoothstep(uShape.y+0.06,uShape.y,r))*inside; }
    float fill=step(r,uProg)*inside;
    a=inside*0.16+fill*0.26+edge*0.75;
    a*=c.a;
  } else if(uMode==2){
    float y=vUV.y; a=smoothstep(0.0,0.15,y)*(1.0-y)*(1.0-y)*(0.5+0.4*sin(vUV.x*6.0+uTime*3.0+y*8.0))*0.7;
    a*=c.a;
  } else if(uMode==3){ // 衝撃波リング
    float r=length(vUV); float w=0.12; a=smoothstep(uProg-w,uProg,r)*smoothstep(uProg+0.02,uProg-0.01,r)*(1.0-uProg)*c.a;
  } else { // 魔法陣
    vec2 p=vUV; float r=length(p); float ang=atan(p.y,p.x)+uTime*0.6*uShape.x;
    float ring=smoothstep(0.035,0.0,abs(r-0.95))+smoothstep(0.025,0.0,abs(r-0.78))+smoothstep(0.02,0.0,abs(r-0.45));
    float spokes=smoothstep(0.03,0.0,abs(sin(ang*3.0)*r))*step(0.45,r)*step(r,0.78);
    float glyph=step(0.5,vnoise(vec2(ang*8.0,r*10.0)))*step(0.8,r)*step(r,0.93)*0.6;
    float star=smoothstep(0.03,0.0,abs(r*cos(mod(ang,1.2566)-0.6283)-0.4))*step(r,0.78);
    a=(ring+spokes+glyph+star)*step(r,1.0)*c.a*uProg;
  }
  if(a<0.004) discard;
  o=vec4(c.rgb,clamp(a,0.0,1.0));
}`;
  // ---------- ポストプロセス ----------
  const brightFS = H + `in vec2 vUV; out vec4 o; uniform sampler2D uTex; uniform float uThresh; uniform vec2 uTexel;
void main(){ vec3 c=vec3(0.0); c+=texture(uTex,vUV+uTexel*vec2(-1,-1)).rgb; c+=texture(uTex,vUV+uTexel*vec2(1,-1)).rgb; c+=texture(uTex,vUV+uTexel*vec2(-1,1)).rgb; c+=texture(uTex,vUV+uTexel*vec2(1,1)).rgb; c*=0.25;
  float l=max(c.r,max(c.g,c.b)); o=vec4(c*smoothstep(uThresh,uThresh+0.5,l),1.0); }`;
  const blurFS = H + `in vec2 vUV; out vec4 o; uniform sampler2D uTex; uniform vec2 uDir;
void main(){ vec3 c=texture(uTex,vUV).rgb*0.227; c+=texture(uTex,vUV+uDir*1.385).rgb*0.316; c+=texture(uTex,vUV-uDir*1.385).rgb*0.316; c+=texture(uTex,vUV+uDir*3.23).rgb*0.07; c+=texture(uTex,vUV-uDir*3.23).rgb*0.07; o=vec4(c,1.0); }`;
  const compFS = H + `in vec2 vUV; out vec4 o; uniform sampler2D uScene; uniform sampler2D uBloom; uniform float uBloomStr; uniform float uFXAA; uniform vec2 uTexel;
uniform float uExposure; uniform float uSat; uniform float uContrast; uniform float uVig; uniform float uLowHP; uniform float uTime; uniform float uFade; uniform vec3 uFadeCol; uniform float uUnder; uniform float uAwaken;
vec3 fxaa(vec2 uv){
  vec3 rgbNW=texture(uScene,uv+vec2(-1,-1)*uTexel).rgb, rgbNE=texture(uScene,uv+vec2(1,-1)*uTexel).rgb, rgbSW=texture(uScene,uv+vec2(-1,1)*uTexel).rgb, rgbSE=texture(uScene,uv+vec2(1,1)*uTexel).rgb, rgbM=texture(uScene,uv).rgb;
  vec3 L=vec3(0.299,0.587,0.114); float lNW=dot(rgbNW,L),lNE=dot(rgbNE,L),lSW=dot(rgbSW,L),lSE=dot(rgbSE,L),lM=dot(rgbM,L);
  float lMin=min(lM,min(min(lNW,lNE),min(lSW,lSE))), lMax=max(lM,max(max(lNW,lNE),max(lSW,lSE)));
  vec2 dir=vec2(-((lNW+lNE)-(lSW+lSE)),((lNW+lSW)-(lNE+lSE)));
  float red=max((lNW+lNE+lSW+lSE)*0.03125,0.0078125); float rcp=1.0/(min(abs(dir.x),abs(dir.y))+red);
  dir=clamp(dir*rcp,vec2(-8.0),vec2(8.0))*uTexel;
  vec3 A=0.5*(texture(uScene,uv+dir*(1.0/3.0-0.5)).rgb+texture(uScene,uv+dir*(2.0/3.0-0.5)).rgb);
  vec3 B=A*0.5+0.25*(texture(uScene,uv+dir*-0.5).rgb+texture(uScene,uv+dir*0.5).rgb);
  float lB=dot(B,L); return (lB<lMin||lB>lMax)?A:B; }
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }
void main(){
  vec3 c=uFXAA>0.5?fxaa(vUV):texture(uScene,vUV).rgb;
  c+=texture(uBloom,vUV).rgb*uBloomStr;
  if(uUnder>0.5){ c=mix(c,vec3(0.05,0.3,0.42)*(0.6+0.4*c),0.55); }
  c*=uExposure;
  c=mix(c,aces(c*1.08),0.72);
  float g=dot(c,vec3(0.299,0.587,0.114)); c=mix(vec3(g),c,uSat);
  c=(c-0.5)*uContrast+0.5;
  vec2 q=vUV-0.5; float vig=1.0-dot(q,q)*uVig; c*=vig;
  if(uLowHP>0.0){ float e=smoothstep(0.25,0.75,length(q)*1.3); c=mix(c,vec3(0.55,0.02,0.02),e*uLowHP*(0.55+0.45*sin(uTime*5.0))); }
  if(uAwaken>0.0){ float e=smoothstep(0.3,0.8,length(q)*1.3); c=mix(c,c*vec3(1.2,0.7,0.78)+vec3(0.08,0.0,0.02),e*uAwaken*0.45); }
  c=mix(c,uFadeCol,uFade);
  o=vec4(clamp(c,0.0,1.0),1.0);
}`;
  PS.SHADERS = {
    terrain: [terrainVS, terrainFS], terrainD: ['#define DEPTH\n', terrainVS, depthFS],
    mesh: [meshVS, meshFS], meshD: ['#define DEPTH\n', meshVS, depthFS],
    skin: [skinVS, skinFS], skinD: ['#define DEPTH\n', skinVS, depthFS],
    sky: [skyVS, skyFS], water: [waterVS, waterFS], grass: [grassVS, grassFS],
    part: [partVS, partFS], vfx: [vfxVS, vfxFS],
    bright: [fsVS, brightFS], blur: [fsVS, blurFS], comp: [fsVS, compFS]
  };
})(window.PS);
