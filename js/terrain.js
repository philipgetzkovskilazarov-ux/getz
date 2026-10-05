'use strict';
/* =========================================================
   terrain.js — tile-grid DSL + per-pixel ground painter.
   Terrain boundaries are warped by noise so paths, ponds and
   cliffs look hand-drawn instead of blocky.
   ========================================================= */
const T=16;
const TERR=['grass','lush','dirt','cobble','flag','water','rock','plank','leaf','gravel','cliff','moss','sand','void','chasm','stairs','snow'];
const TID={};TERR.forEach((n,i)=>TID[n]=i);
const BLOCK=new Set([TID.water,TID.cliff,TID.void,TID.chasm]);
const SOFT=new Set([TID.grass,TID.lush,TID.dirt,TID.sand,TID.gravel,TID.leaf,TID.moss,TID.snow,TID.rock]);
/* default palettes — each map overrides pieces of this */
const PAL0={grass:'#5fae3c',lush:'#3f9a45',dirt:'#b88a4e',cobble:'#9a9aa6',flag:'#b9b2a2',water:'#2f9fd8',rock:'#575a72',plank:'#a8743c',leaf:'#d8a53a',gravel:'#a39a86',cliff:'#8a7a68',moss:'#4b9a62',sand:'#e0c88c',void:'#05030a',chasm:'#0a0614',stairs:'#c8bfa8',snow:'#eef3ff'};

class MapGrid{
  constructor(w,h,pal={},seed=1){this.w=w;this.h=h;this.t=new Uint8Array(w*h);this.pal=Object.assign({},PAL0,pal);this.seed=seed;this.solids=[];this.fillT('grass')}
  fillT(n){this.t.fill(TID[n])}
  at(x,y){x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=this.w||y>=this.h)return TID.void;return this.t[y*this.w+x]}
  set(x,y,n){if(x>=0&&y>=0&&x<this.w&&y<this.h)this.t[y*this.w+x]=TID[n]}
  rect(n,x,y,w,h){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)this.set(i,j,n);return this}
  circ(n,cx,cy,r){return this.ell(n,cx,cy,r,r)}
  ell(n,cx,cy,rx,ry,wob=0,seed=3){for(let j=Math.floor(cy-ry-1);j<=cy+ry+1;j++)for(let i=Math.floor(cx-rx-1);i<=cx+rx+1;i++){const dx=(i+.5-cx)/rx,dy=(j+.5-cy)/ry,w=wob?(U.noise(i*.7,j*.7,seed)-.5)*wob:0;if(dx*dx+dy*dy+w<=1)this.set(i,j,n)}return this}
  /* thick polyline brush */
  path(n,pts,r=1.5,wob=0){for(let k=0;k<pts.length-1;k++){const[a,b]=[pts[k],pts[k+1]],len=Math.max(1,Math.hypot(b[0]-a[0],b[1]-a[1]))*2;for(let s=0;s<=len;s++){const x=U.lerp(a[0],b[0],s/len),y=U.lerp(a[1],b[1],s/len),rr=r+(wob?(U.noise(x*.5,y*.5,9)-.5)*wob:0);this.ell(n,x,y,rr,rr)}}return this}
  /* raised plateau edge: puts a 2-tile tall cliff face along the south side of a rect */
  ledge(x,y,w,h,faceH=2){this.rect('cliff',x,y+h,w,faceH);return this}
  walkable(px,py){return !BLOCK.has(this.at(px/T,py/T))}
}

/* ---------- texture functions: (ramp, X, Y, frame) -> rgb ---------- */
const hs=U.hash,nz=U.noise,fb=U.fbm,bay=U.bayer;
const cl=(v)=>v<0?0:v>4?4:Math.round(v);
function texGrass(R,X,Y,lush){const n=fb(X/30,Y/30,1,3),m=nz(X/7,Y/7,2),g=hs(X,Y,3);let l=(lush?1.8:2.15)+(n-.5)*1.9+(m-.5)*1.05;if(g<.05)l+=1.2;else if(g>.96)l-=1.1;l+=(bay(X,Y)-.5)*.7;return R[cl(l)]}
function texDirt(R,X,Y){const n=fb(X/20,Y/20,4,3);let l=2+(n-.5)*2.4+(hs(X,Y,5)-.5)*.9;
  const cx=Math.floor(X/5),cy=Math.floor(Y/5);if(hs(cx,cy,6)<.07){const px=cx*5+Math.floor(hs(cx,cy,7)*3),py=cy*5+Math.floor(hs(cx,cy,8)*3);if(X>=px&&X<px+2&&Y===py)l=hs(cx,cy,9)<.5?3.9:0.2}
  return R[cl(l+(bay(X,Y)-.5)*.5)]}
function texCobble(R,X,Y){const S=8;const gx=Math.floor(X/S),gy=Math.floor(Y/S);let d1=1e9,d2=1e9,id=0;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const cx=gx+i,cy=gy+j,fx=(cx+.2+hs(cx,cy,1)*.6)*S,fy=(cy+.2+hs(cx,cy,2)*.6)*S,d=Math.hypot(X-fx,Y-fy);if(d<d1){d2=d1;d1=d;id=hs(cx,cy,3)}else if(d<d2)d2=d}
  const e=d2-d1;if(e<1.3)return R[0];let l=2+(id-.5)*1.6+(e>1.3&&e<2.4?.7:0)-(d1/S)*.9+(nz(X/3,Y/3,4)-.5)*.5;return R[cl(l+(bay(X,Y)-.5)*.4)]}
function texFlag(R,X,Y){const u=X%16,v=Y%16,tx=Math.floor(X/16),ty=Math.floor(Y/16),tone=hs(tx,ty,2);
  if(u===0||v===0)return R[0];if(u===1||v===1)return R[4];let l=2+(tone-.5)*1.3+(fb(X/6,Y/6,3)-.5)*1.1;
  if(hs(tx,ty,5)<.25){const cx=hs(tx,ty,6)*10+3,cy=hs(tx,ty,7)*10+3;if(Math.abs(u-cx-(v-cy)*.6)<.5&&Math.abs(v-cy)<5)return R[0]}return R[cl(l+(bay(X,Y)-.5)*.4)]}
function texPlank(R,X,Y){const row=Math.floor(Y/4),v=Y%4;if(v===0)return R[0];const off=Math.floor(hs(row,0,1)*40);if((X+off)%28===0)return R[0];if(v===1)return R[3];let l=2+(hs(row,0,2)-.5)*1.2+(fb(X/14,Y/2,5)-.5)*1;if(hs(Math.floor((X+off)/28),row,7)<.07&&(X+off)%28>3&&(X+off)%28<7&&v===2)l=0;return R[cl(l)]}
function texWater(R,X,Y,f){const w=Math.sin(X*.33+f*1.57+Math.sin(Y*.21+f*.8)*2.2)+Math.sin(Y*.52-f*1.2+X*.07);let l=1.3+w*.55+(fb(X/22,Y/22,8)-.5)*1.7;let c=R[cl(l)];if(w>1.72&&hs(X,Y,f)>.35)return R[4];return c}
function texRock(R,X,Y){const n=fb(X/14,Y/14,3,3);let l=1.7+(n-.5)*3+(hs(X,Y,2)-.5)*.8;if(Math.abs(fb(X/9,Y/9,11,2)-.5)<.012)l=0;return R[cl(l+(bay(X,Y)-.5)*.5)]}
function texCliff(R,X,Y){const n=nz(X/3.2,Y/17,3),n2=nz(X/9,Y/6,5);let l=1.5+(n-.5)*3.2+(n2-.5)*1.4;const row=Y%16;if(row<2)l+=1.6;if(row>12)l-=1.3;if(hs(X,Y,1)<.04)l+=1;return R[cl(l+(bay(X,Y)-.5)*.5)]}
function texLeaf(R,X,Y){let l=2+(fb(X/25,Y/25,2)-.5)*2.4+(hs(X,Y,3)-.5)*.8;const cx=Math.floor(X/4),cy=Math.floor(Y/4);if(hs(cx,cy,4)<.12){const k=hs(cx,cy,5);l=k<.3?4:k<.6?0.5:3.2;if((X+Y)%2)l=2.2}return R[cl(l+(bay(X,Y)-.5)*.5)]}
function texGravel(R,X,Y){let l=2+(fb(X/12,Y/12,2)-.5)*1.5+(hs(X,Y,3)-.5)*1.8;return R[cl(l)]}
function texMoss(R,X,Y){let l=2+(fb(X/12,Y/12,6)-.5)*2.6+(hs(X,Y,3)-.5)*.8;return R[cl(l+(bay(X,Y)-.5)*.6)]}
function texSand(R,X,Y){let l=2.3+(fb(X/18,Y/6,2)-.5)*1.6+(hs(X,Y,3)-.5)*.5;if(Math.sin(Y*.5+fb(X/10,Y/10,3)*6)>.92)l-=.8;return R[cl(l+(bay(X,Y)-.5)*.5)]}
function texStairs(R,X,Y){const v=Y%5;if(v===0)return R[4];if(v===1)return R[3];if(v===4)return R[0];return R[cl(2+(hs(X>>2,Y>>2,3)-.5))]}
function texVoid(R,X,Y){return R[0]}
function texChasm(R,X,Y,f){const n=fb(X/18,Y/18,5,3);return R[cl(0.2+n*1.4)]}
function texSnow(R,X,Y){return R[cl(3+(fb(X/20,Y/20,3)-.5)*2+(hs(X,Y,1)-.5))]}

function terrainColor(t,R,X,Y,f){switch(TERR[t]){case'grass':return texGrass(R,X,Y,0);case'lush':return texGrass(R,X,Y,1);case'dirt':return texDirt(R,X,Y);case'cobble':return texCobble(R,X,Y);case'flag':return texFlag(R,X,Y);case'water':return texWater(R,X,Y,f);case'rock':return texRock(R,X,Y);case'plank':return texPlank(R,X,Y);case'leaf':return texLeaf(R,X,Y);case'gravel':return texGravel(R,X,Y);case'cliff':return texCliff(R,X,Y);case'moss':return texMoss(R,X,Y);case'sand':return texSand(R,X,Y);case'stairs':return texStairs(R,X,Y);case'chasm':return texChasm(R,X,Y,f);case'snow':return texSnow(R,X,Y);default:return texVoid(R,X,Y)}}

/* ---------- full-map ground render ---------- */
function renderGround(m){
  const W=m.w*T,H=m.h*T,g=new U.Cv(W,H),lab=new Uint8Array(W*H),ramps=TERR.map(n=>U.ramp(m.pal[n],5,n==='water'?.2:.27));
  /* pass 1: warped label map. Built surfaces (flag/plank/stairs/cobble) use a small warp so they stay crisp. */
  for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){
    const tx0=X>>4,ty0=Y>>4;const base=m.t[ty0*m.w+tx0];
    let tx=tx0,ty=ty0;
    const dx=(fb(X/10,Y/10,31,2)-.5)*9,dy=(fb(X/10+40,Y/10,33,2)-.5)*9;
    const sx=Math.floor((X+dx)/T),sy=Math.floor((Y+dy)/T);
    const st=m.at(sx,sy);
    /* crisp for architecture-like surfaces: never warp INTO or OUT OF flag/plank/stairs/cliff */
    const hard=t=>t===TID.flag||t===TID.plank||t===TID.stairs||t===TID.cliff||t===TID.void;
    lab[Y*W+X]=(hard(st)||hard(base))?base:st}
  const lp=(x,y)=>(x<0||y<0||x>=W||y>=H)?TID.void:lab[y*W+x];
  /* pass 2: colour */
  for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){
    const t=lab[Y*W+X];let col=terrainColor(t,ramps[t],X,Y,0);
    const n4=[lp(X+2,Y),lp(X-2,Y),lp(X,Y+2),lp(X,Y-2)];
    if(SOFT.has(t)){for(let k=0;k<4;k++){const nb=n4[k];if(nb!==t&&SOFT.has(nb)&&bay(X,Y)<.5){col=terrainColor(nb,ramps[nb],X,Y,0);break}}}
    else{ /* hard edge: dark rim toward ground, bright lip on top edge */
      if(t===TID.water||t===TID.chasm){for(let k=0;k<4;k++)if(n4[k]!==t&&n4[k]!==TID.void){const d1=[lp(X+1,Y),lp(X-1,Y),lp(X,Y+1),lp(X,Y-1)];if(d1[k]!==t){col=ramps[t][0]}else if(t===TID.water&&bay(X,Y)>.4)col=ramps[t][3];break}}
      if(t===TID.cliff&&lp(X,Y-1)!==TID.cliff)col=ramps[t][4];
      if((t===TID.flag||t===TID.plank||t===TID.cobble||t===TID.stairs)&&(lp(X+1,Y)!==t||lp(X,Y+1)!==t)&&(n4[0]!==TID.void&&n4[2]!==TID.void))col=ramps[t][0];
    }
    /* drop-shadow cast by cliff/flag onto soft ground below / right */
    if(SOFT.has(t)){const above=lp(X,Y-3),left=lp(X-2,Y);if((above===TID.cliff||above===TID.flag||above===TID.plank)&&Y%1===0){col=U.mix(col,[10,8,40],.35)}else if(left===TID.cliff&&bay(X,Y)<.7){col=U.mix(col,[10,8,40],.28)}}
    g.px(X,Y,col)}
  /* water frames */
  const wf=[];let hasWater=false;for(let i=0;i<lab.length;i++)if(lab[i]===TID.water){hasWater=true;break}
  if(hasWater){const wr=ramps[TID.water];for(let f=0;f<4;f++){const c=new U.Cv(W,H);for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++)if(lab[Y*W+X]===TID.water){const rim=lp(X+1,Y)!==TID.water||lp(X-1,Y)!==TID.water||lp(X,Y+1)!==TID.water||lp(X,Y-1)!==TID.water;c.px(X,Y,rim?wr[0]:texWater(wr,X,Y,f))}
    /* pale foam at north/west shore */
    for(let Y=1;Y<H-1;Y++)for(let X=1;X<W-1;X++)if(lab[Y*W+X]===TID.water&&(lab[(Y-1)*W+X]!==TID.water||lab[Y*W+X-1]!==TID.water)&&hs(X+f*5,Y,2)>.45)c.px(X,Y,wr[4]);
    wf.push(c.canvas())}}
  return{ground:g,water:wf,lab,W,H}
}
/* scatter decorative bits (flowers, tufts, pebbles...) straight onto the ground canvas */
function scatter(g,m,lab,spec,seed=1){
  const r=U.rng(seed),W=m.w*T,H=m.h*T;
  const terr=new Set((spec.on||['grass']).map(n=>TID[n]));
  const n=Math.floor(m.w*m.h*(spec.density||.5));
  for(let i=0;i<n;i++){const X=Math.floor(r()*W),Y=Math.floor(r()*H);if(!terr.has(lab[Y*W+X]))continue;
    if(spec.avoid&&spec.avoid(X,Y))continue;
    const col=U.pick(spec.cols||['#fff'],r);spec.draw(g,X,Y,col,r)}}
const DECO={
  flower:(g,X,Y,c,r)=>{const R=U.ramp(c,3,.22);g.px(X,Y+2,'#2f7a2f');g.px(X,Y+3,'#256224');g.px(X-1,Y,R[1]);g.px(X+1,Y,R[1]);g.px(X,Y-1,R[2]);g.px(X,Y+1,R[1]);g.px(X,Y,'#ffe27a')},
  flower2:(g,X,Y,c,r)=>{const R=U.ramp(c,3,.22);g.px(X,Y+1,'#2f7a2f');g.px(X,Y+2,'#256224');g.px(X-1,Y,R[2]);g.px(X+1,Y,R[1]);g.px(X,Y,R[2]);g.px(X,Y-1,R[1])},
  tuft:(g,X,Y,c,r)=>{const R=U.ramp(c,4,.3);g.px(X,Y,R[0]);g.px(X-1,Y,R[1]);g.px(X+1,Y,R[1]);g.px(X,Y-1,R[3]);g.px(X-1,Y-2,R[3]);g.px(X+1,Y-2,R[2]);g.px(X,Y-2,R[2])},
  clover:(g,X,Y,c)=>{const R=U.ramp(c,3,.2);g.px(X,Y,R[2]);g.px(X+1,Y,R[1]);g.px(X,Y+1,R[1]);g.px(X-1,Y,R[2])},
  pebble:(g,X,Y,c)=>{const R=U.ramp(c,4,.3);g.px(X,Y,R[2]);g.px(X+1,Y,R[1]);g.px(X,Y-1,R[3]);g.px(X+1,Y+1,R[0])},
  mushroom:(g,X,Y,c)=>{const R=U.ramp(c,3,.25);g.px(X,Y,'#f2e8d0');g.px(X,Y+1,'#d8caa8');g.px(X-1,Y-1,R[1]);g.px(X,Y-1,R[2]);g.px(X+1,Y-1,R[1]);g.px(X,Y-2,R[2]);g.px(X-1,Y-2,R[0])},
  leaf:(g,X,Y,c)=>{const R=U.ramp(c,3,.25);g.px(X,Y,R[2]);g.px(X+1,Y,R[1]);g.px(X+1,Y+1,R[0])},
  reed:(g,X,Y,c)=>{g.vline(X,Y-5,6,'#6d8a3a');g.vline(X+1,Y-4,5,'#8aa84a');g.px(X,Y-6,'#6a4a2a');g.px(X,Y-5,'#8a5a30')},
  glint:(g,X,Y,c)=>{g.px(X,Y,c);g.px(X+1,Y,c,.5);g.px(X-1,Y,c,.5);g.px(X,Y-1,c,.5);g.px(X,Y+1,c,.5)}
};
window.T=T;window.TERR=TERR;window.TID=TID;window.BLOCK=BLOCK;window.MapGrid=MapGrid;window.renderGround=renderGround;window.scatter=scatter;window.DECO=DECO;
