'use strict';
(()=>{
/* =========================================================
   objects.js — procedural pixel-art props & buildings.
   Each painter returns {cv,w,h,ax,ay,solid:[x,y,w,h],lights:[],emit:[]}
   ax/ay = anchor (bottom-centre) inside the sprite; solid is relative to anchor.
   ========================================================= */
const OB={};
const {Cv,ramp:RP,rng:RNG,hash:HS}=U;
const SH=[22,12,58]; // shadow tint (blue-violet)
function done(c,o={}){c.outline(o.k||.3);return Object.assign({cv:c.canvas(),w:c.w,h:c.h,ax:c.w>>1,ay:c.h-2,solid:null,lights:[],emit:[]},o)}
function gshadow(c,cx,cy,rx,ry,a=.3){c.ell(cx,cy,rx,ry,SH,a)}
function blob(c,cx,cy,rx,ry,ramp,seed,rag=.55,light,bias=0){c.shade(cx,cy,rx,ry,ramp,{noise:.5,dither:1.15,seed,light,bias,mask:(x,y,dx,dy)=>dx*dx+dy*dy<1-rag*.5*HS(x,y,seed+7)})}
function canopy(c,cx,cy,rx,ry,ramp,seed,n,rmin,rmax){const r=RNG(seed),pts=[];
  for(let i=0;i<n;i++){const a=r()*6.283,d=Math.sqrt(r())*.95+.05;pts.push([cx+Math.cos(a)*d*rx,cy+Math.sin(a)*d*ry,rmin+r()*(rmax-rmin)])}
  pts.sort((a,b)=>a[1]-b[1]);
  pts.forEach(([x,y,rad],i)=>{const b=-(y-cy)/ry*-.16-.1;blob(c,x,y,rad,rad*.86,ramp,seed+i,.7,[-.5,-.7,.5],b);
    /* bright leaf flecks on the sunny upper-left of every clump */
    for(let k=0;k<5;k++){const fx=x-rad*.45+HS(i,k,seed)*rad*.6,fy=y-rad*.5+HS(i,k+9,seed)*rad*.45;if(c.solid(fx,fy)){c.px(fx,fy,ramp[ramp.length-1]);c.px(fx+1,fy,ramp[ramp.length-2]);c.px(fx,fy+1,ramp[ramp.length-2])}}
    for(let k=0;k<4;k++){const fx=x+rad*.1+HS(i,k+3,seed)*rad*.6,fy=y+rad*.2+HS(i,k+5,seed)*rad*.5;if(c.solid(fx,fy)){c.px(fx,fy,ramp[0]);c.px(fx+1,fy+1,ramp[0])}}})}
function speckle(c,ramp,seed,amt=.1){const hi=ramp[ramp.length-1],mid=ramp[ramp.length-2];for(let y=0;y<c.h;y++)for(let x=0;x<c.w;x++){if(c.solid(x,y)){const h=HS(x,y,seed);if(h<amt)c.px(x,y,hi);else if(h<amt*1.7&&HS(x+1,y,seed)<.5)c.px(x,y,mid)}}}
function bricks(c,x,y,w,h,ramp,seed=1,bw=6,bh=3){for(let j=0;j<h;j+=bh){const off=((j/bh)&1)*(bw>>1);for(let i=-off;i<w;i+=bw){const t=HS(i+9,j,seed),col=ramp[1+Math.floor(t*3)];for(let jj=0;jj<bh-1;jj++)for(let ii=0;ii<bw-1;ii++){const px=x+i+ii,py=y+j+jj;if(px>=x&&px<x+w&&py<y+h)c.px(px,py,jj===0?ramp[Math.min(4,1+Math.floor(t*3)+1)]:col)}
  }}for(let j=0;j<h;j+=bh)for(let i=0;i<w;i++)c.px(x+i,y+j+bh-1,ramp[0])}
function planksV(c,x,y,w,h,ramp,seed=1,pw=4){for(let i=0;i<w;i+=pw){const t=HS(i,seed,2);for(let j=0;j<h;j++)for(let ii=0;ii<pw;ii++){const px=x+i+ii;if(px>=x+w)continue;c.px(px,y+j,ii===0?ramp[0]:ii===pw-1?ramp[1]:ramp[2+(t>.5?1:0)-(HS(px,j,seed)<.05?1:0)])}}}
function shingles(c,x0,y0,w,h,ramp,seed=1,sw=5,sh=4,scal=true){for(let j=0;j<h;j+=sh){const off=((j/sh)&1)*(sw>>1);for(let i=-off;i<w;i+=sw){const t=HS(i,j,seed),k=1+Math.floor(t*2.6);for(let jj=0;jj<sh;jj++)for(let ii=0;ii<sw;ii++){const px=x0+i+ii,py=y0+j+jj;if(px<x0||px>=x0+w||py>=y0+h)continue;
  const edge=scal&&jj>=sh-1&&(ii<1||ii>=sw-1||jj===sh-1)?0:(jj===0?Math.min(4,k+1):(jj===sh-2&&scal?k-1<0?0:k-1:k));c.px(px,py,ramp[edge])}}}}
function timberFrame(c,x,y,w,h,wall,beam,seed,o={}){ /* plaster wall + dark timber lattice */
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const n=U.fbm((x+i)/9,(y+j)/9,seed,2),l=2+(n-.5)*1.8+(HS(x+i,y+j,seed)-.5)*.6;c.px(x+i,y+j,wall[U.clamp(Math.round(l+(U.bayer(i,j)-.5)*.5),0,wall.length-1)])}
  const floors=o.floors||1,fh=h/floors,bw=o.bw||3;
  for(let f=0;f<=floors;f++){const yy=Math.min(y+h-bw,y+Math.round(f*fh));for(let i=0;i<w;i++)for(let k=0;k<bw;k++)c.px(x+i,yy+k,k===0?beam[3]:beam[1+(k===bw-1?-1:0)+1-1]||beam[1])}
  const cols=Math.max(2,Math.round(w/(o.cw||22)));for(let k=0;k<=cols;k++){const xx=Math.min(x+w-bw,x+Math.round(k*w/cols));for(let j=0;j<h;j++)for(let i=0;i<bw;i++)c.px(xx+i,y+j,i===0?beam[3]:i===bw-1?beam[0]:beam[1])}
  if(o.diag)for(let f=0;f<floors;f++)for(let k=0;k<cols;k++){const x0=x+Math.round(k*w/cols)+bw,x1=x+Math.round((k+1)*w/cols),y0=y+Math.round(f*fh)+bw,y1=y+Math.round((f+1)*fh);if((k+f)%2===0)c.line(x0,y1-1,x1,y0,beam[1]);else c.line(x0,y0,x1,y1-1,beam[1])}}
function roundWindow(c,cx,cy,r,glow,frame){const gl=RP(glow,5),fr=RP(frame,5);
  c.ell(cx,cy,r+2,r+2,fr[0]);c.shade(cx,cy,r+1.5,r+1.5,fr,{light:[-.4,-.5,.7]});
  c.ell(cx,cy,r-.5,r-.5,(x,y,dx,dy)=>gl[U.clamp(Math.round(3.4-Math.hypot(dx,dy)*2.4+(dy<0?.5:0)+(U.bayer(x,y)-.5)*.6),0,4)]);
  c.vline(cx,cy-r+1,r*2-1,fr[1]);c.hline(cx-r+1,cy,r*2-1,fr[1]);c.px(cx-r*.45,cy-r*.45,'#fff8d8');c.px(cx-r*.45+1,cy-r*.45,'#fff8d8',.6)}
function rectWindow(c,x,y,w,h,glow,frame,o={}){const gl=RP(glow,5),fr=RP(frame,5);
  c.rect(x-1,y-1,w+2,h+2,fr[0]);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=3.3-(j/h)*1.7+(i/w<.5?.3:0)+(U.bayer(x+i,y+j)-.5)*.7;c.px(x+i,y+j,o.dark?RP('#243a5a',5)[U.clamp(Math.round(1+(1-j/h)*1.5),0,4)]:gl[U.clamp(Math.round(k),0,4)])}
  const cx=Math.floor(w/2);c.vline(x+cx,y,h,fr[1]);if(h>8)c.hline(x,y+Math.floor(h/2),w,fr[1]);
  c.hline(x-1,y+h,w+2,fr[3]);c.hline(x-2,y-2,w+4,fr[2]);
  if(o.shutters){const sh=RP(o.shutters,4);c.rect(x-4,y,3,h,sh[2]);c.rect(x+w+1,y,3,h,sh[2]);c.vline(x-4,y,h,sh[3]);c.vline(x+w+3,y,h,sh[0]);for(let j=1;j<h;j+=2){c.hline(x-4,y+j,3,sh[1]);c.hline(x+w+1,y+j,3,sh[1])}}
  if(o.box){const bx=RP('#7a4a28',4);c.rect(x-1,y+h+1,w+2,3,bx[2]);c.hline(x-1,y+h+1,w+2,bx[3]);for(let i=0;i<w;i+=2){c.px(x+i,y+h,U.pick(['#ff6a8a','#ffd23a','#ff9a3a','#ffffff']));c.px(x+i,y+h-1,'#2f8f3a')}}}
function archDoor(c,cx,by,w,h,wood,o={}){const dw=RP(wood,5),R=w/2;
  c.region(cx-R-1,by-h-R,cx+R+1,by,(x,y)=>{const dx=x+.5-cx;if(Math.abs(dx)>R+1)return false;if(y<by-h)return dx*dx+(y-(by-h))*(y-(by-h))<=(R+1)*(R+1);return true},(x,y)=>dw[0]);
  c.region(cx-R,by-h-R+1,cx+R,by,(x,y)=>{const dx=x+.5-cx;if(Math.abs(dx)>R)return false;if(y<by-h)return dx*dx+(y-(by-h))*(y-(by-h))<=R*R;return true},(x,y)=>{const i=Math.floor(x-(cx-R));return i%4===0?dw[1]:(i%4===3?dw[3]:dw[2+(HS(x,y,5)<.1?-1:0)])});
  c.hline(cx-R+1,by-Math.floor(h*.6),w-2,dw[0]);c.hline(cx-R+1,by-Math.floor(h*.2),w-2,dw[0]);
  c.px(cx+R-3,by-Math.floor(h*.45),'#ffd23a');c.px(cx+R-3,by-Math.floor(h*.45)+1,'#b88a20');
  c.rect(cx-R-1,by,w+2,2,RP('#8a8a96',4)[2]);c.hline(cx-R-1,by,w+2,'#c8c8d4')}
function lanternGlyph(c,x,y,col,r=2){const R=RP(col,4);c.shade(x,y,r,r*1.2,R,{light:[0,-.2,.9],dither:.3});c.px(x,y-r-1,'#3a2a1a');c.px(x,y,[255,250,210])}
function post(c,x,y,h,col='#7a5230'){const R=RP(col,4);for(let j=0;j<h;j++){c.px(x,y-j,R[1]);c.px(x+1,y-j,R[2]);c.px(x+2,y-j,R[3]);}}

/* ---------------- TREES ---------------- */
function trunk(c,cx,by,tw,h,bark,seed,flare=4){for(let j=0;j<h;j++){const t=j/h,w=tw+(t>.8?(t-.8)/.2*flare:0)+(HS(0,j>>2,seed)<.3?1:0);for(let i=-Math.ceil(w/2);i<=Math.ceil(w/2);i++){const u=i/(w/2),k=Math.round(2.6+(-u)*1.5+(HS(cx+i,j>>1,seed)-.5)*1.4+(U.noise(i*.8,j*.15,seed)-.5)*2);c.px(cx+i,by-j,bark[U.clamp(k,0,bark.length-1)])}}
  for(let s=-1;s<=1;s+=2)for(let j=0;j<5;j++)c.px(cx+s*(Math.ceil(tw/2)+flare-1-Math.floor(j/2)),by-j,bark[0])}
OB.oak=(o={})=>{const W=o.w||64,H=o.h||78,c=new Cv(W,H),lf=RP(o.leaf||'#349038',6,.31),bark=RP(o.bark||'#7a5230',5),sd=o.seed||5;
  gshadow(c,W/2+4,H-5,W*.36,6,.32);trunk(c,W/2,H-4,8,34,bark,sd,5);
  const cx=W/2;canopy(c,cx,H*.38,W*.42,H*.3,lf,sd,Math.round(W*.45),W*.12,W*.2);
  return done(c,{ax:W/2,ay:H-4,solid:[-5,-8,10,8]})};
OB.birch=(o={})=>{const W=44,H=70,c=new Cv(W,H),lf=RP(o.leaf||'#7fc83a',6,.28),bark=RP('#e8e4d8',5,.2);gshadow(c,W/2+3,H-4,12,4,.3);
  for(let j=0;j<36;j++){const x=W/2+Math.round(Math.sin(j*.15)*1);for(let i=-2;i<=2;i++)c.px(x+i,H-5-j,i<0?bark[3]:i>1?bark[1]:bark[2]);if(HS(j,1,4)<.35)c.hline(x-2,H-5-j,3+Math.floor(HS(j,2,4)*2),'#3a3a3a')}
  canopy(c,W/2,H*.3,W*.34,H*.2,lf,3,16,6,10);
  return done(c,{ax:W/2,ay:H-4,solid:[-3,-6,6,6]})};
OB.pine=(o={})=>{const W=o.w||40,H=o.h||76,c=new Cv(W,H),lf=RP(o.leaf||'#2c7a4a',6,.28),bark=RP('#6a4426',4);gshadow(c,W/2+3,H-4,12,4,.3);
  c.rect(W/2-2,H-14,4,12,bark[2]);c.vline(W/2-2,H-14,12,bark[1]);
  for(let k=0;k<5;k++){const yy=H-14-k*13,w2=17-k*3;c.region(W/2-w2-1,yy-18,W/2+w2+1,yy,(x,y)=>{const t=(y-(yy-18))/18;return Math.abs(x+.5-W/2)<=t*w2+1},(x,y)=>{const t=(y-(yy-18))/18,sx=(x-W/2)/w2;return lf[U.clamp(Math.round(1.2+(-sx)*1.2+t*.9+(U.bayer(x,y)-.5)*1.2+(HS(x,y,k)-.5)),0,5)]})}
  for(let i=0;i<20;i++){const x=W/2+(HS(i,1,8)-.5)*W*.7,y=8+HS(i,2,8)*(H-24);if(c.solid(x,y))c.hline(x,y,2,lf[5])}
  return done(c,{ax:W/2,ay:H-4,solid:[-3,-6,6,6]})};
OB.deadtree=(o={})=>{const W=48,H=64,c=new Cv(W,H),bark=RP(o.bark||'#5a4a56',5,.25);gshadow(c,W/2+2,H-4,10,3,.3);trunk(c,W/2,H-4,6,34,bark,3,3);
  const br=(x,y,a,l,w)=>{for(let s=0;s<l;s++){const px=x+Math.cos(a)*s,py=y-Math.sin(a)*s;for(let i=0;i<w;i++)c.px(px,py+i,bark[2+(i===0?1:0)])}};
  [[W/2,H-34,1.2,16,2],[W/2,H-30,2.1,14,2],[W/2,H-24,.6,12,2],[W/2,H-40,1.7,12,2]].forEach(([x,y,a,l,w])=>{br(x,y,a,l,w);const ex=x+Math.cos(a)*l,ey=y-Math.sin(a)*l;br(ex,ey,a+.6,6,1);br(ex,ey,a-.5,6,1)});
  return done(c,{ax:W/2,ay:H-4,solid:[-3,-6,6,6]})};
OB.mallorn=(o={})=>{const W=o.w||120,H=o.h||150,c=new Cv(W,H),lf=RP(o.leaf||'#e8b83a',6,.27),bark=RP('#bdb8b0',5,.22);gshadow(c,W/2+6,H-8,W*.28,8,.3);
  /* vast silvery trunk with buttress roots */
  for(let j=0;j<H*.62;j++){const t=j/(H*.62),w=14+(t>.7?(t-.7)/.3*16:0)-(t<.2?0:0);for(let i=-Math.ceil(w/2);i<=Math.ceil(w/2);i++){const u=i/(w/2);const k=Math.round(2.4+(-u)*1.6+(U.noise(i*.5,j*.12,5)-.5)*2.6+(HS(i,j>>1,3)-.5));c.px(W/2+i,H-8-j,bark[U.clamp(k,0,4)])}}
  const cx=W/2;canopy(c,cx,H*.3,W*.46,H*.24,lf,11,Math.round(W*.6),W*.07,W*.12);
  for(let i=0;i<40;i++){const x=cx+(HS(i,1,9)-.5)*W*.9,y=6+HS(i,2,9)*H*.5;if(c.solid(x,y)){c.px(x,y,'#fff6c0');c.px(x+1,y,lf[5])}}
  return done(c,{ax:W/2,ay:H-8,solid:[-12,-10,24,10]})};
OB.beech=(o={})=>OB.oak(Object.assign({leaf:o.leaf||'#e0742a',bark:'#6a4a3a',seed:o.seed||13,w:o.w||70,h:o.h||82},o));
OB.bush=(o={})=>{const W=o.w||28,H=o.h||20,c=new Cv(W,H),lf=RP(o.leaf||'#3f9a3a',6,.3);gshadow(c,W/2+2,H-3,W*.42,3,.3);
  blob(c,W*.3,H*.55,W*.3,H*.4,lf,1);blob(c,W*.7,H*.55,W*.3,H*.4,lf,2);blob(c,W*.5,H*.38,W*.32,H*.38,lf,3);
  for(let i=0;i<(o.flowers||0);i++){const x=W*.15+HS(i,1,o.seed||4)*W*.7,y=4+HS(i,2,o.seed||4)*H*.55;if(c.solid(x,y)){const f=U.pick(o.fc||['#ff6a8a','#ffd23a','#fff','#c58bff'],RNG(i+(o.seed||4)));c.px(x,y,f);c.px(x+1,y,f);c.px(x,y-1,'#ffe27a')}}
  speckle(c,lf,3,.08);return done(c,{ax:W/2,ay:H-2,solid:[-W*.35,-6,W*.7,6]})};
OB.hedge=(n=2)=>{const W=n*16,H=24,c=new Cv(W,H),lf=RP('#2f8a3a',6,.28);gshadow(c,W/2,H-3,W*.48,3,.3);
  for(let i=0;i<n*2;i++)blob(c,8+i*8,H*.5,9,H*.42,lf,i+2,.5);speckle(c,lf,5,.1);return done(c,{ax:W/2,ay:H-2,solid:[-W/2+1,-8,W-2,8]})};
OB.flowerbed=(o={})=>{const W=o.w||36,H=o.h||18,c=new Cv(W,H),soil=RP('#6a4423',4),cols=o.cols||['#ff5a7a','#ffd23a','#ffffff','#c58bff','#ff9a3a','#5ac8ff'];
  c.ell(W/2,H-6,W*.48,6,soil[1]);c.ell(W/2,H-7,W*.45,5,soil[2]);
  for(let i=0;i<(o.n||26);i++){const x=3+HS(i,1,7)*(W-6),y=2+HS(i,2,7)*(H-6);const col=cols[Math.floor(HS(i,3,7)*cols.length)],R=RP(col,3,.22);c.vline(x,y+1,4,'#2f7a2f');c.px(x-1,y,R[1]);c.px(x+1,y,R[1]);c.px(x,y-1,R[2]);c.px(x,y+1,R[1]);c.px(x,y,'#ffe27a');c.px(x-1,y+3,'#3fa03a');c.px(x+1,y+2,'#3fa03a')}
  return done(c,{ax:W/2,ay:H-2,solid:null,k:.35})};
OB.fenceH=(n=3,o={})=>{const W=n*16,H=22,c=new Cv(W,H),wd=RP(o.col||'#d8c8a0',5);gshadow(c,W/2,H-2,W/2,2,.3);
  c.rect(0,H-14,W,2,wd[1]);c.hline(0,H-14,W,wd[3]);c.rect(0,H-8,W,2,wd[1]);c.hline(0,H-8,W,wd[3]);
  for(let i=0;i<W;i+=8){c.rect(i+1,H-18,4,16,wd[2]);c.vline(i+1,H-18,16,wd[3]);c.vline(i+4,H-18,16,wd[1]);c.px(i+2,H-19,wd[3]);c.px(i+3,H-19,wd[3]);c.hline(i+2,H-3,3,wd[0])}
  return done(c,{ax:W/2,ay:H-2,solid:[-W/2,-6,W,6],k:.32})};
OB.fenceV=(n=3,o={})=>{const W=10,H=n*16+6,c=new Cv(W,H),wd=RP(o.col||'#d8c8a0',5);
  for(let j=0;j<n*16;j+=8){c.rect(2,6+j,6,6,wd[2]);c.hline(2,6+j,6,wd[4]);c.vline(2,6+j,6,wd[3]);c.hline(2,11+j,6,wd[0])}
  c.vline(4,3,H-5,wd[1]);return done(c,{ax:5,ay:H-2,solid:[-4,-n*16,8,n*16],k:.32})};
OB.rock=(o={})=>{const W=o.w||26,H=o.h||20,c=new Cv(W,H),r=RP(o.col||'#8a8a9a',6,.3);gshadow(c,W/2+2,H-3,W*.45,3,.3);
  c.shade(W*.45,H*.55,W*.38,H*.42,r,{noise:.9,dither:1.2,seed:o.seed||3,mask:(x,y,dx,dy)=>dx*dx+dy*dy<1-.4*HS(x,y,9)});c.shade(W*.72,H*.65,W*.22,H*.3,r,{noise:.9,seed:5});
  if(o.moss)for(let i=0;i<W;i++)for(let j=0;j<H*.4;j++)if(c.solid(i,j)&&HS(i,j,2)<.5)c.px(i,j,RP('#4a9a3a',4)[1+Math.floor(HS(i,j,3)*3)]);
  return done(c,{ax:W/2,ay:H-2,solid:[-W*.4,-H*.5,W*.8,H*.5]})};
OB.barrel=()=>{const W=14,H=18,c=new Cv(W,H),wd=RP('#9a6a34',5),fe=RP('#6a6a78',4);gshadow(c,W/2+1,H-2,6,2,.3);
  c.shade(W/2,H/2+1,6.5,8,wd,{light:[-.7,-.2,.6],dither:.4});for(let j=3;j<H-2;j+=1)if(j%4===0)c.hline(1,j,W-2,wd[0]);c.hline(1,4,W-2,fe[2]);c.hline(1,H-5,W-2,fe[2]);c.ell(W/2,3,5,1.6,wd[4]);return done(c,{ax:W/2,ay:H-2,solid:[-5,-6,10,6]})};
OB.crate=(o={})=>{const W=18,H=20,c=new Cv(W,H),wd=RP('#a8743c',5);gshadow(c,W/2+1,H-2,8,2,.3);planksV(c,1,5,16,13,wd,2,4);c.rect(1,5,16,2,wd[3]);c.hline(1,5,16,wd[4]);c.hline(1,17,16,wd[0]);
  for(let i=0;i<16;i++){c.px(1+i,5+Math.round(i*.8),wd[1]);}if(o.fruit){for(let i=0;i<5;i++){const f=RP(o.fruit,3,.2);c.shade(3+i*3,4,2,2,f,{dither:.2})}}return done(c,{ax:W/2,ay:H-2,solid:[-8,-8,16,8]})};
OB.haybale=()=>{const W=24,H=20,c=new Cv(W,H),hy=RP('#e0b84a',5);gshadow(c,W/2+2,H-2,10,3,.3);c.shade(W/2,H/2,11,8,hy,{light:[-.4,-.8,.4],noise:1,seed:2,dither:1});for(let i=0;i<30;i++){const x=2+HS(i,1,3)*20,y=3+HS(i,2,3)*13;if(c.solid(x,y))c.hline(x,y,3,hy[0])}c.vline(W/2-4,3,14,'#8a5a20');c.vline(W/2+4,3,14,'#8a5a20');return done(c,{ax:W/2,ay:H-2,solid:[-10,-8,20,8]})};
OB.sign=(o={})=>{const W=26,H=34,c=new Cv(W,H),wd=RP('#9a6a34',5);gshadow(c,W/2+1,H-2,6,2,.3);post(c,W/2-1,H-3,26);c.rect(3,4,20,10,wd[2]);c.hline(3,4,20,wd[4]);c.hline(3,13,20,wd[0]);c.vline(3,4,10,wd[3]);c.vline(22,4,10,wd[0]);for(let i=0;i<4;i++)c.hline(6,6+i*2,8+Math.floor(HS(i,o.seed||1,3)*8),wd[0]);return done(c,{ax:W/2,ay:H-2,solid:[-2,-4,4,4]})};
OB.lamp=(o={})=>{const W=18,H=48,c=new Cv(W,H),ir=RP('#3a3a48',4);gshadow(c,W/2+1,H-3,5,2,.3);c.rect(W/2-1,12,2,H-14,ir[2]);c.rect(W/2-3,H-6,6,3,ir[2]);c.hline(W/2-3,H-6,6,ir[3]);
  c.rect(W/2-4,5,8,9,RP('#ffb84a',4)[2]);c.shade(W/2,9,3,4,RP('#ffe9a0',4),{light:[0,0,1],dither:0});c.rect(W/2-5,3,10,2,ir[2]);c.rect(W/2-2,1,4,2,ir[3]);c.vline(W/2-4,5,9,ir[1]);c.vline(W/2+3,5,9,ir[1]);
  return done(c,{ax:W/2,ay:H-2,solid:[-2,-3,4,3],lights:[{x:0,y:-39,r:o.r||54,col:o.col||'#ffb050',flicker:.06}]})};
OB.torchPost=(o={})=>{const W=14,H=36,c=new Cv(W,H),wd=RP('#7a5230',4);gshadow(c,W/2,H-3,4,2,.3);c.rect(W/2-1,12,3,H-14,wd[2]);c.vline(W/2-1,12,H-14,wd[3]);c.rect(W/2-3,9,7,4,RP('#5a5a66',4)[2]);return done(c,{ax:W/2,ay:H-2,solid:[-2,-3,4,3],flame:{x:0,y:-26,s:1},lights:[{x:0,y:-26,r:o.r||60,col:o.col||'#ff8a30',flicker:.18}]})};
OB.well=()=>{const W=36,H=46,c=new Cv(W,H),st=RP('#9a9aa6',5),wd=RP('#7a4a28',5);gshadow(c,W/2+2,H-3,15,4,.3);
  c.shade(W/2,H-12,13,8,st,{light:[-.4,-.6,.5]});c.ell(W/2,H-17,10,4.5,RP('#14284a',4)[1]);c.ell(W/2,H-17,10,4.5,(x,y,dx,dy)=>dy<-.3?RP('#14284a',4)[1]:RP('#2a5a9a',4)[2],.9);
  bricks(c,W/2-12,H-14,24,8,st,3,5,3);c.shade(W/2,H-12,13,8,st,{mask:(x,y,dx,dy)=>dy<-.1&&dy>-.99&&Math.hypot(dx,dy)>.78,light:[-.4,-.6,.5]});
  c.rect(W/2-12,H-34,3,22,wd[2]);c.rect(W/2+9,H-34,3,22,wd[2]);c.vline(W/2-12,H-34,22,wd[3]);c.vline(W/2+11,H-34,22,wd[0]);
  c.poly([[W/2-17,H-33],[W/2,H-44],[W/2+17,H-33],[W/2+17,H-31],[W/2-17,H-31]],(x,y)=>RP('#b04a3a',5)[U.clamp(Math.round(2+(H-33-y)/-4+(x<W/2?.8:-.4)+(U.bayer(x,y)-.5)*.6),0,4)]);
  c.vline(W/2,H-32,8,wd[1]);c.rect(W/2-2,H-24,4,4,wd[1]);return done(c,{ax:W/2,ay:H-2,solid:[-14,-10,28,10]})};
OB.cart=()=>{const W=56,H=40,c=new Cv(W,H),wd=RP('#9a6a34',5);gshadow(c,W/2,H-3,24,4,.3);
  planksV(c,6,14,40,14,wd,4,5);c.rect(4,12,44,3,wd[3]);c.hline(4,12,44,wd[4]);
  for(let i=0;i<7;i++)c.shade(10+i*5,13,3,3,RP(i%2?'#e0b84a':'#c8742a',4),{dither:.2});
  [[14,H-8],[40,H-8]].forEach(([x,y])=>{c.ell(x,y,8,8,RP('#5a3a1a',4)[1]);c.ell(x,y,6,6,RP('#8a5a2a',4)[2]);for(let a=0;a<8;a++){c.line(x,y,x+Math.cos(a*.785)*7,y+Math.sin(a*.785)*7,RP('#5a3a1a',4)[0])}c.ell(x,y,1.6,1.6,'#d8c8a0')});
  c.line(46,24,56,30,wd[1]);c.line(46,26,56,32,wd[0]);return done(c,{ax:W/2,ay:H-2,solid:[-22,-12,44,12]})};
OB.mushrooms=(o={})=>{const W=22,H=16,c=new Cv(W,H);[[6,12,4],[14,11,3],[10,8,5]].forEach(([x,y,r],i)=>{c.rect(x-1,y-1,2,r-1,'#f2e8d0');c.shade(x,y-r+1,r+1,r*.7,RP(o.col||'#d83a3a',4),{light:[-.5,-.7,.5]});c.px(x-1,y-r,'#fff');c.px(x+1,y-r+1,'#fff')});return done(c,{ax:W/2,ay:H-1,solid:null})};

/* ---------------- HOBBIT HOLE ---------------- */
OB.hole=(o={})=>{const W=o.w||120,H=o.h||96,c=new Cv(W,H),gr=RP(o.grass||'#4faf3a',6,.3),door=RP(o.door||'#2f9a4a',6,.26),brass=RP('#f0c040',4),earth=RP('#8a5a30',5),stone=RP('#a8a8b4',5);
  const cx=W/2,gy=H-6; gshadow(c,cx+4,gy+1,W*.48,6,.32);
  /* mound */
  c.shade(cx,gy,W*.47,H*.8,gr,{noise:.9,dither:1.1,seed:o.seed||3,mask:(x,y)=>y<gy});
  for(let i=0;i<120;i++){const x=cx+(HS(i,1,4)-.5)*W*.9,y=10+HS(i,2,4)*(gy-12);if(c.solid(x,y)){const k=HS(i,3,4);c.vline(x,y,2,k<.5?gr[5]:gr[0]);if(k<.12){const f=U.pick(['#ffe27a','#ff7aa8','#fff','#c58bff'],RNG(i));c.px(x,y-1,f)}}}
  /* earth-bank + stone threshold */
  c.ell(cx,gy-2,24,6,earth[1]);
  /* door */
  const dcy=gy-18,dr=o.dr||16;
  c.ell(cx,dcy,dr+3,dr+3,earth[0]);c.shade(cx,dcy,dr+2,dr+2,earth,{light:[-.3,-.5,.7],noise:.6,mask:(x,y,dx,dy)=>Math.hypot(dx,dy)>.82});
  c.shade(cx,dcy,dr,dr,door,{light:[-.35,-.45,.8],dither:.7});
  for(let i=-dr+3;i<=dr-3;i+=4)for(let j=-dr;j<=dr;j++){if(Math.hypot(i,j)<dr-1)c.px(cx+i,dcy+j,door[0])}
  c.hline(cx-dr+2,dcy-6,dr*2-4,brass[1]);c.hline(cx-dr+2,dcy+6,dr*2-4,brass[1]);c.hline(cx-dr+2,dcy-7,dr*2-4,brass[3]);c.hline(cx-dr+2,dcy+5,dr*2-4,brass[3]);
  c.shade(cx+6,dcy+1,2.5,2.5,brass,{light:[-.5,-.6,.6],dither:0});c.px(cx+5,dcy,'#fff6c0');
  c.hline(cx-dr-4,gy-1,dr*2+8,stone[3]);c.rect(cx-dr-3,gy,dr*2+6,2,stone[2]);
  /* round windows */
  const wx=o.wx||42;roundWindow(c,cx-wx,dcy-6,8,'#ffc84a','#6a4a2a');roundWindow(c,cx+wx,dcy-6,8,'#ffc84a','#6a4a2a');
  /* shutters */
  [-1,1].forEach(s=>{const x=cx+s*wx;c.shade(x+s*13,dcy-6,3,9,door,{light:[-.3,-.3,.8],dither:.3});c.shade(x-s*13,dcy-6,3,9,door,{light:[-.3,-.3,.8],dither:.3})});
  /* chimney */
  const chx=cx+(o.chx||26),chy=14;bricks(c,chx,chy,10,14,stone,3,5,3);c.rect(chx-1,chy-2,12,3,stone[3]);c.hline(chx-1,chy-2,12,stone[4]);c.rect(chx+1,chy-3,8,1,stone[0]);
  /* garden flowers at the foot */
  for(let i=0;i<(o.fl||26);i++){const side=i%2?1:-1,x=cx+side*(dr+6+HS(i,1,5)*(W*.36-dr)),y=gy-2-HS(i,2,5)*7;const f=U.pick(['#ff5a7a','#ffd23a','#fff','#c58bff','#ff9a3a'],RNG(i*3));c.px(x,y,f);c.px(x+1,y,f);c.px(x,y-1,RP(f,3)[2]);c.px(x,y+1,'#2f7a2f')}
  return done(c,{ax:cx,ay:H-2,solid:[-W*.42,-30,W*.84,30],lights:[{x:-wx,y:-24,r:42,col:'#ffb64a',flicker:.05},{x:wx,y:-24,r:42,col:'#ffb64a',flicker:.05}],emit:[{x:o.chx?o.chx+5:31,y:-H+12,type:'smoke'}],doorX:0,doorY:0})};
OB.smial=(o={})=>OB.hole(Object.assign({w:88,h:72,dr:11,wx:30,chx:18,fl:14,door:o.door||'#c0392b',grass:o.grass||'#58b53c',seed:o.seed||8},o));

/* ---------------- PARTY ITEMS ---------------- */
OB.partyTree=()=>{const W=170,H=150,c=new Cv(W,H),lf=RP('#3fa83a',6,.3),bark=RP('#7a5230',5);gshadow(c,W/2+6,H-8,W*.3,8,.3);trunk(c,W/2,H-6,16,56,bark,7,8);
  const cx=W/2;canopy(c,cx,H*.32,W*.42,H*.22,lf,21,Math.round(W*.7),W*.07,W*.12);
  /* strings of paper lanterns & bunting */
  const cols=['#ff4a4a','#ffd23a','#4ac8ff','#7aff7a','#ff8ad8','#ffffff'],ls=[];
  for(let s=0;s<4;s++){const y0=34+s*14,x0=22+s*6,x1=W-22-s*6;for(let i=0;i<=14;i++){const t=i/14,x=U.lerp(x0,x1,t),y=y0+Math.sin(t*Math.PI)*9;if(i%1===0)c.px(x,y,'#2a2018');if(i%2===0&&i>0&&i<14){const col=cols[(i+s*2)%6];lanternGlyph(c,x,y+3,col,2);ls.push({x:x-cx,y:y+3-H+2,r:28,col,flicker:.03})}}}
  for(let i=0;i<9;i++){const t=i/8,x=U.lerp(34,W-34,t),y=100+Math.sin(t*Math.PI)*10;c.poly([[x-3,y],[x+3,y],[x,y+6]],cols[i%6])}
  return done(c,{ax:cx,ay:H-8,solid:[-14,-12,28,12],lights:ls.slice(0,10)})};
OB.tent=(o={})=>{const W=72,H=70,c=new Cv(W,H),cs=o.cols||['#d83a3a','#f4f0e0'];gshadow(c,W/2+3,H-4,W*.46,5,.3);
  const R0=RP(cs[0],5),R1=RP(cs[1],5);
  c.poly([[4,H-6],[W-4,H-6],[W-4,34],[4,34]],(x,y)=>{const i=Math.floor((x-4)/8);const R=i%2?R0:R1;const sh=(y-34)/(H-40);return R[U.clamp(Math.round(1.8+(sh<.1?1:0)-sh*.4+(U.bayer(x,y)-.5)*.5),0,4)]});
  for(let i=4;i<W-4;i+=8){c.vline(i,34,H-40,R0[0]);for(let k=0;k<4;k++)c.px(i+4,H-6-k,R0[0])}
  c.poly([[W/2,8],[W-2,34],[2,34]],(x,y)=>{const i=Math.floor(x/8);const R=i%2?R1:R0;const t=(y-8)/26;return R[U.clamp(Math.round(2.4-t*.8+(x<W/2?.5:-.3)+(U.bayer(x,y)-.5)*.7),0,4)]});
  for(let i=2;i<W;i+=8)c.line(W/2,8,i,34,R0[0]);
  c.px(W/2,7,'#ffd23a');c.vline(W/2,2,6,'#7a5a30');c.poly([[W/2,2],[W/2+9,5],[W/2,8]],'#ffd23a');
  c.rect(W/2-10,H-24,20,18,RP('#2a1810',4)[0]);c.rect(W/2-9,H-23,18,17,RP('#4a2a18',4)[1]);
  for(let i=4;i<W-4;i+=8){c.poly([[i,34],[i+8,34],[i+4,40]],(i/8|0)%2?R1[1]:R0[1])}
  return done(c,{ax:W/2,ay:H-4,solid:[-W*.42,-16,W*.84,16],lights:[{x:0,y:-20,r:40,col:'#ffa84a'}]})};
OB.table=(o={})=>{const n=o.n||4,W=n*16+8,H=34,c=new Cv(W,H),cl=RP('#f4f0e4',5),wd=RP('#7a4a28',4);gshadow(c,W/2+2,H-3,W*.46,3,.28);
  c.rect(3,H-9,3,7,wd[1]);c.rect(W-6,H-9,3,7,wd[1]);
  c.rect(0,14,W,10,(x,y)=>cl[2]);for(let i=0;i<W;i++){c.px(i,14,cl[4]);c.px(i,15,cl[3])}for(let j=14;j<24;j++){c.px(0,j,cl[1]);c.px(W-1,j,cl[1])}
  for(let i=0;i<W;i+=5){const h=3+Math.floor(HS(i,1,4)*3);c.vline(i,24,h,cl[1]);c.px(i,24+h,cl[0])}
  const fd=[['cake','#f8e0f0'],['pie','#c8742a'],['bread','#d8a050'],['fruit','#e84a4a'],['mug','#d8d8e8'],['pie','#e0a040'],['cake','#fff0a0'],['fruit','#8ad83a'],['bread','#b87a38'],['jug','#4a8ad8']];
  for(let i=0;i<n*2;i++){const x=6+i*(W-12)/(n*2-1||1),[k,col]=fd[(i+(o.seed||0))%fd.length],R=RP(col,4,.25);
    if(k==='cake'){c.shade(x,13,4,3,RP('#c07a50',4),{dither:.3});c.shade(x,11,4,2.4,R,{dither:.3});c.px(x,8,'#ff4a4a');c.px(x,7,'#ffd23a')}
    else if(k==='pie'){c.ell(x,13,5,2.4,'#e8e0d0');c.shade(x,12,4,2.5,R,{dither:.3});c.hline(x-2,11,4,R[0])}
    else if(k==='bread'){c.shade(x,12,5,2.6,R,{light:[-.3,-.7,.5]});c.px(x-2,11,R[0]);c.px(x+1,11,R[0])}
    else if(k==='fruit'){c.ell(x,13,5,2.4,'#e8e0d0');for(let f=0;f<3;f++)c.shade(x-2+f*2,11,1.6,1.6,R,{dither:0})}
    else if(k==='mug'){c.rect(x-2,8,4,6,R[3]);c.px(x+2,10,R[2]);c.hline(x-2,8,4,'#fff')}
    else c.shade(x,10,2.6,4,R,{dither:.2})}
  return done(c,{ax:W/2,ay:H-2,solid:[-W/2,-12,W,12],k:.3})};
OB.bench=(n=2)=>{const W=n*16,H=20,c=new Cv(W,H),wd=RP('#a8743c',5);gshadow(c,W/2,H-3,W/2,2,.3);c.rect(2,H-6,3,4,wd[1]);c.rect(W-5,H-6,3,4,wd[1]);c.rect(0,H-10,W,3,wd[3]);c.hline(0,H-10,W,wd[4]);c.hline(0,H-8,W,wd[0]);c.rect(1,H-15,W-2,2,wd[2]);c.rect(2,H-15,2,6,wd[1]);c.rect(W-4,H-15,2,6,wd[1]);return done(c,{ax:W/2,ay:H-2,solid:[-W/2,-6,W,6]})};
OB.fireworkCart=()=>{const c=new Cv(60,44),wd=RP('#7a4a28',5);gshadow(c,30,40,24,4,.3);planksV(c,6,22,44,14,wd,5,5);c.rect(4,20,48,3,wd[3]);
  const cols=['#ff4a4a','#4ac8ff','#ffd23a','#7aff7a','#ff8ad8'];for(let i=0;i<7;i++){const x=9+i*6,col=cols[i%5],R=RP(col,4);c.rect(x,6+(i%2)*3,3,18,R[2]);c.vline(x,6+(i%2)*3,18,R[3]);c.rect(x,6+(i%2)*3,3,3,'#f4f0e0');c.px(x+1,4+(i%2)*3,'#ffa030')}
  [[16,38],[44,38]].forEach(([x,y])=>{c.ell(x,y-2,7,7,RP('#5a3a1a',4)[1]);c.ell(x,y-2,5,5,RP('#8a5a2a',4)[2]);c.ell(x,y-2,1.5,1.5,'#d8c8a0')});
  return done(c,{ax:30,ay:42,solid:[-22,-12,44,12]})};
OB.stoneArch=(o={})=>{const W=o.w||56,H=o.h||64,c=new Cv(W,H),st=RP('#a8a8b4',5);gshadow(c,W/2,H-3,W*.48,4,.3);
  c.rect(0,18,10,H-20,st[2]);c.rect(W-10,18,10,H-20,st[2]);bricks(c,0,18,10,H-20,st,2,5,3);bricks(c,W-10,18,10,H-20,st,2,5,3);
  c.region(0,0,W,40,(x,y)=>{const dx=x+.5-W/2,dy=y+.5-30;return dx*dx/(W/2*W/2)+dy*dy/(26*26)<=1&&dy<0&&Math.abs(dx)>(W/2-12)},(x,y)=>st[U.clamp(Math.round(2.6-((y)/30)*1.4+(x<W/2?.5:-.4)+(U.bayer(x,y)-.5)*.6),0,4)]);
  return done(c,{ax:W/2,ay:H-2,solid:[-W/2,-8,10,8]})};
window.OB=OB;window.OBH={blob,speckle,bricks,planksV,shingles,timberFrame,roundWindow,rectWindow,archDoor,lanternGlyph,gshadow,done,trunk,post,SH};

})();
