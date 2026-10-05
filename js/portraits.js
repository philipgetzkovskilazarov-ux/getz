'use strict';
(()=>{
/* =========================================================
   portraits.js — big painted character busts (160x190) for the
   dialogue screen.  Faces are lit from a procedural height-field
   (nose, brow ridge, cheekbones, sockets, lips) so the shading is
   physically plausible; hair/beards use flow-noise strands.
   ========================================================= */
const PW=160,PH=190;
const {Cv:CV,noise:N_,rng:RG}=U;
const cl=U.clamp,lerp=U.lerp;

/* skin-specific ramp: warm reddish shadows, desaturated, never neon */
function skinRamp(hex){const[r,g,b]=U.rgb(hex);const out=[];const tint=[150,62,70];
  [.42,.58,.74,.89,1.0,1.1].forEach((f,i)=>{let R=r*f,G=g*f*.97,B=b*f*.93;if(f<1){const m=(1-f)*.42;R=R*(1-m)+tint[0]*m*f*1.3;G=G*(1-m)+tint[1]*m*f*1.3;B=B*(1-m)+tint[2]*m*f*1.3}else{R=Math.min(255,R+(f-1)*70);G=Math.min(255,G+(f-1)*55);B=Math.min(255,B+(f-1)*30)}out.push([R,G,B])});return out}
const RMP=(h,n=6,s=.26)=>U.ramp(h,n,s);

/* ---------- cast ---------- */
const CAST={
 gandalf:{name:'Gandalf',skin:'#d9a688',eye:'#79aed2',brow:'#b9bdc8',browW:7,age:.9,face:[28,34],cy:92,jaw:.3,hair:{style:'wild',col:'#aeb2c0'},beard:{style:'long',col:'#c8ccd8'},hat:{type:'wizard',col:'#767c94'},outfit:{type:'robe',col:'#8a90a6',under:'#d8d8e2'},nose:1.35,ears:0},
 frodo:{name:'Frodo',skin:'#f0c6a6',eye:'#3f8fe0',brow:'#3a2418',browW:4,age:0,face:[30,32],cy:92,jaw:.36,hair:{style:'curly',col:'#4a2e1e'},outfit:{type:'hobbit',col:'#6c5a38',under:'#efe6d0'},cloak:{col:'#6f8466'},ears:2,blush:.25,nose:.8},
 sam:{name:'Sam',skin:'#ecb890',eye:'#6a4a2a',brow:'#8a5a28',browW:5,age:.1,face:[32,32],cy:92,jaw:.3,hair:{style:'curly',col:'#a06c34'},outfit:{type:'hobbit',col:'#7a5a3a',under:'#e8dcc0'},ears:2,blush:.55,nose:.95},
 merry:{name:'Merry',skin:'#f0c2a0',eye:'#4a8a52',brow:'#7a3a22',browW:4,age:0,face:[30,32],cy:92,jaw:.34,hair:{style:'curly',col:'#8e4a28'},outfit:{type:'hobbit',col:'#3c6a4a',under:'#efe6d0'},ears:2,blush:.3,nose:.85},
 pippin:{name:'Pippin',skin:'#f2c6a2',eye:'#5a9a5c',brow:'#a88040',browW:4,age:0,face:[29,32],cy:92,jaw:.38,hair:{style:'curly',col:'#cfa458'},outfit:{type:'hobbit',col:'#8a4a3a',under:'#efe6d0'},ears:2,blush:.35,nose:.75},
 bilbo:{name:'Bilbo',skin:'#e6b894',eye:'#5a7ab0',brow:'#d8d8d8',browW:4,age:.7,face:[30,32],cy:92,jaw:.34,hair:{style:'wispy',col:'#e6e6ea'},outfit:{type:'waistcoat',col:'#7e2c4c',under:'#f4f0e4'},ears:2,blush:.2,nose:1.05},
 gaffer:{name:'Gaffer Gamgee',skin:'#d9a47c',eye:'#5a6a8a',brow:'#c8c8c8',browW:5,age:1,face:[29,33],cy:92,jaw:.3,hair:{style:'wispy',col:'#d0d0d0'},hat:{type:'straw',col:'#d8b860'},outfit:{type:'hobbit',col:'#6a5a3a',under:'#d8ccb0'},ears:2,nose:1.15},
 lobelia:{name:'Lobelia',skin:'#f0c6aa',eye:'#7a6a5a',brow:'#6a4a3a',browW:3,age:.5,face:[27,33],cy:92,jaw:.4,hair:{style:'bonnet',col:'#e8d8c0'},outfit:{type:'dress',col:'#8a4a8a',under:'#f4ecf0'},ears:2,nose:1.25},
 aragorn:{name:'Aragorn',skin:'#c8977a',eye:'#5a7a88',brow:'#241612',browW:7,age:.4,face:[28,37],cy:88,jaw:.3,hair:{style:'long',col:'#2a1a14'},beard:{style:'stubble',col:'#2a1a14'},outfit:{type:'coat',col:'#46423e',under:'#6a5a48'},cloak:{col:'#3c4a3a'},nose:1.2},
 boromir:{name:'Boromir',skin:'#d6a688',eye:'#6a7a5a',brow:'#4a2e1e',browW:7,age:.3,face:[29,36],cy:88,jaw:.26,hair:{style:'mid',col:'#5a3a26'},beard:{style:'short',col:'#5a3a26'},outfit:{type:'fur',col:'#6a4a30',under:'#a89878'},nose:1.15},
 legolas:{name:'Legolas',skin:'#f6dac4',eye:'#2fa6c4',brow:'#c8b060',browW:3,age:-.5,face:[26,37],cy:88,jaw:.42,hair:{style:'elf',col:'#e8d68e'},outfit:{type:'elf',col:'#586e48',under:'#8a9a6a'},cloak:{col:'#7a8a68'},ears:3,nose:.95},
 gimli:{name:'Gimli',skin:'#d8957a',eye:'#3a2a1a',brow:'#b8481e',browW:8,age:.5,face:[34,32],cy:92,jaw:.16,hair:{style:'none',col:'#b8481e'},beard:{style:'dwarf',col:'#bf4c20'},hat:{type:'helm',col:'#8a8e9c'},outfit:{type:'armor',col:'#5a5e6c',under:'#7a3a28'},nose:1.4},
 galadriel:{name:'Galadriel',skin:'#fbe6d6',eye:'#5cc0e0',brow:'#d8c070',browW:3,age:-.3,face:[26,36],cy:88,jaw:.42,hair:{style:'long',col:'#f2dc94'},hat:{type:'circlet',col:'#e8eef8'},outfit:{type:'gown',col:'#eceef8',under:'#fff'},ears:3,nose:.9,glow:'#bff0ff'},
 elrond:{name:'Elrond',skin:'#ecccae',eye:'#4a5c80',brow:'#1c1218',browW:4,age:.2,face:[27,37],cy:88,jaw:.34,hair:{style:'long',col:'#1c1218'},hat:{type:'circlet',col:'#d8e0f0'},outfit:{type:'robe',col:'#4c3c70',under:'#8a7ab0',trim:'#d8d0f0'},ears:3,nose:1.05},
 saruman:{name:'Saruman',skin:'#d6b8a4',eye:'#4a4a5a',brow:'#d8d8e0',browW:5,age:.7,face:[27,36],cy:88,jaw:.3,hair:{style:'long',col:'#d8d8e4'},beard:{style:'long',col:'#e4e4ee'},outfit:{type:'robe',col:'#d4d4e0',under:'#26262e'},nose:1.25},
 arwen:{name:'Arwen',skin:'#f9e2d0',eye:'#4a6a90',brow:'#1a1016',browW:3,age:-.4,face:[26,36],cy:88,jaw:.42,hair:{style:'long',col:'#1a1016'},hat:{type:'circlet',col:'#e8eef8'},outfit:{type:'gown',col:'#d8dcf0',under:'#f4f4ff'},ears:3,nose:.9},
 butterbur:{name:'Barliman Butterbur',skin:'#eab08e',eye:'#6a5a3a',brow:'#7a5a3a',browW:5,age:.5,face:[35,31],cy:94,jaw:.22,hair:{style:'balding',col:'#7a5a38'},beard:{style:'mustache',col:'#8a6a3a'},outfit:{type:'apron',col:'#7a5638',under:'#f2ead8'},blush:.55,nose:1.45},
 harry:{name:'Gate-keeper',skin:'#d6a688',eye:'#5a5a3a',brow:'#4a3a2a',browW:6,age:.4,face:[28,35],cy:90,jaw:.28,hair:{style:'short',col:'#4a3a2a'},beard:{style:'short',col:'#4a3a2a'},hat:{type:'cap',col:'#4a5a3a'},outfit:{type:'coat',col:'#4a4a3a',under:'#8a7a5a'},nose:1.15},
 rider:{name:'Black Rider',rider:true},
 narrator:{name:'',narrator:true}
};
const MOODS={neutral:{br:0,mo:0},smile:{br:0,mo:1},happy:{br:-1,mo:2},sad:{br:2,mo:-1},worried:{br:2,mo:-.5},angry:{br:-2,mo:-.7},stern:{br:-1,mo:-.3},surprised:{br:3,mo:3}};

function strand(x,y,fx,fy,sc=.5,seed=1){const a=Math.atan2(fy,fx),ca=Math.cos(a),sa=Math.sin(a),u=x*ca+y*sa,v=-x*sa+y*ca;return U.noise(v*sc,u*.08,seed)*.7+U.noise(v*sc*2.2,u*.19,seed+4)*.3}
const gauss=(x,y,bx,by,sx,sy,A)=>A*Math.exp(-(((x-bx)*(x-bx))/(sx*sx)+((y-by)*(y-by))/(sy*sy)));

/* ===================== MAIN BUST ===================== */
function paintBust(S,mood='neutral',talk=false,blink=false,t=0){
  const c=new CV(PW,PH);if(S.narrator)return c;if(S.rider)return paintRider(c,t);
  const M=MOODS[mood]||MOODS.neutral,cx=80,[rx,ry]=S.face,cy=S.cy,u=rx/26,skin=skinRamp(S.skin),age=S.age||0;
  const hair=S.hair?RMP(S.hair.col,7,.27):null;
  if(S.glow){for(let i=0;i<6;i++)c.ell(cx,cy+16,92-i*9,100-i*10,S.glow,.055)}
  backLayers(c,S,cx,cy,rx,ry,u,hair);
  neck(c,S,cx,cy,rx,ry,u,skin);
  outfit(c,S,cx,cy,rx,ry,u);
  ears(c,S,cx,cy,rx,ry,u,skin);
  face(c,S,cx,cy,rx,ry,u,skin,age);
  features(c,S,cx,cy,rx,ry,u,skin,M,talk,blink,age);
  if(S.beard)beard(c,S,cx,cy,rx,ry,u,M,talk);
  mouth(c,S,cx,cy,rx,ry,u,skin,M,talk);
  if(S.hair)frontHair(c,S,cx,cy,rx,ry,u,hair);
  if(S.hat)hat(c,S,cx,cy,rx,ry,u,t);
  c.outline(.24);return c}

/* ---------- things behind the head ---------- */
function backLayers(c,S,cx,cy,rx,ry,u,hair){
  if(S.cloak){const cr=RMP(S.cloak.col,6,.26),by=cy+ry-6;
    c.region(0,by-6,PW,PH,(x,y)=>{const dx=(x-cx)/(86),dy=(y-(by+88))/(86);return dx*dx+dy*dy<1},(x,y)=>cr[cl(Math.round(2.3+(cx-x)/110*1.5+Math.sin(x*.13+U.noise(x*.04,y*.04,3)*4)*.55+(U.bayer(x,y)-.5)*.6),0,5)]);
    c.region(cx-rx-6,by-14,cx+rx+6,by+14,(x,y)=>{const a=(x-cx)/(rx+4),b=(y-(by+2))/12;return a*a+b*b<1},(x,y)=>cr[cl(Math.round(1.5+(cx-x)/90+Math.sin(x*.4)*.5+(U.bayer(x,y)-.5)*.5),0,5)])}
  if(!S.hair)return;const st=S.hair.style;
  if(st==='long'||st==='elf'){const bot=st==='elf'?cy+ry+50:cy+ry+66;
    c.region(cx-rx-16*u,cy-ry-16,cx+rx+16*u,bot+4,(x,y)=>{const dx=Math.abs(x-cx);if(y<cy+4){const e=(dx/(rx+8*u))**2+((y-(cy-ry*.1))/(ry*1.1+6))**2;return e<1}
        const outer=rx+10*u-Math.pow((y-cy)/(bot-cy),2.2)*(st==='elf'?10:18)*u;return dx<outer&&y<bot},
      (x,y)=>{const s=strand(x,y,0,1,.5,2);return hair[cl(Math.round(1.0+s*3.2+(x<cx?.9:-.4)+(y<cy-ry*.5?.5:0)-(y>cy+ry+20?(y-cy-ry-20)*.012:0)),0,6)]})}
  if(st==='wild'){c.region(cx-rx-18*u,cy-ry*.5,cx+rx+18*u,cy+ry+36,(x,y)=>{const dx=Math.abs(x-cx);return dx<rx+14*u+Math.sin(y*.22)*3&&y>cy-ry*.5&&y<cy+ry+30-(dx<rx*.8?30:0)},(x,y)=>hair[cl(Math.round(strand(x,y,.15,1,.6,4)*3.8+(x<cx?.6:-.2)),0,6)])}
}
/* ---------- neck + ears ---------- */
function neck(c,S,cx,cy,rx,ry,u,skin){
  const nw=rx*.44,top=cy+ry*.5,chin=cy+ry;
  c.region(cx-nw-8,top,cx+nw+8,chin+24,(x,y)=>{const t=(y-chin)/20;const w=nw+Math.max(0,t)*7;return Math.abs(x-cx)<=w&&y>top},(x,y)=>{const sh=y<chin+2?-2.2:y<chin+6?-1.4:y<chin+10?-.6:0;const u2=(x-cx)/nw;return skin[cl(Math.round(2.1+sh-u2*.95+(U.bayer(x,y)-.5)*.6),0,5)]})}
function ears(c,S,cx,cy,rx,ry,u,skin){
  const ear=S.ears||0;
  [-1,1].forEach(s=>{const ex=cx+s*(rx*.98),ey=cy+3*u;
    if(ear>=2){const tip=ear===3?24:12;c.poly([[ex-s*3,ey-10*u],[ex+s*(9*u+ear*2),ey-tip*u],[ex+s*5,ey+6*u],[ex-s*3,ey+12*u]],(x,y)=>skin[cl(Math.round(2.4+(s<0?.7:-.7)+(y>ey+3?-.6:0)+(U.bayer(x,y)-.5)*.5),0,5)]);c.line(ex+s,ey-4*u,ex+s*6,ey-10*u,skin[1],.8);c.line(ex+s,ey,ex+s*4,ey+4,skin[1],.6)}
    else{c.shade(ex+s*2,ey,5.5*u,10*u,skin,{light:[-s*.4,-.6,.6]});c.px(ex+s*2,ey,skin[1]);c.px(ex+s*2,ey+1,skin[1])}})}

/* ---------- the face: height-field lit ---------- */
function faceMask(x,y,cx,cy,rx,ry,jaw){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;let w=dx;if(dy>0)w=dx/(1-jaw*Math.pow(dy,1.25));else w=dx/(1+.06*dy);return w*w+dy*dy<=1}
function face(c,S,cx,cy,rx,ry,u,skin,age){
  const nz=S.nose||1,jaw=S.jaw||.3;
  const H=(x,y)=>{const dx=(x-cx)/rx,dy=(y-cy)/ry;let h=Math.sqrt(Math.max(0,1-dx*dx*.78-dy*dy*.62))*.9;
    h+=gauss(x,y,cx,cy+3*u,3.4*u,9*u,.075*nz)+gauss(x,y,cx,cy+10*u,4.6*u*nz,3.6*u,.115*nz)+gauss(x-0,y,cx-5*u,cy+10*u,2.6*u,2.2*u,.05)+gauss(x,y,cx+5*u,cy+10*u,2.6*u,2.2*u,.05);
    h+=gauss(x,y,cx,cy-10*u,17*u,3*u,.085);                                   // brow ridge
    h-=gauss(x,y,cx-12*u,cy-4*u,6.5*u,4.2*u,.085)+gauss(x,y,cx+12*u,cy-4*u,6.5*u,4.2*u,.085); // sockets
    h+=gauss(x,y,cx-16*u,cy+6*u,5.5*u,5*u,.06)+gauss(x,y,cx+16*u,cy+6*u,5.5*u,5*u,.06);       // cheekbones
    h-=gauss(x,y,cx,cy+ry*.58+1,9*u,1.6,.06);h+=gauss(x,y,cx,cy+ry*.52,5.5*u,1.8*u,.04); // mouth line / upper lip
    h+=gauss(x,y,cx,cy+ry*.9,7*u,4*u,.055);h-=gauss(x,y,cx,cy+ry*.72,6*u,2.2*u,.05); // chin / lip-chin groove
    if(age>.2){h-=gauss(x,y,cx-9*u,cy+13*u,1.6,8,.03*age)+gauss(x,y,cx+9*u,cy+13*u,1.6,8,.03*age)}
    return h*ry*.55};
  const L=[-.55,-.62,.56],ll=Math.hypot(...L);
  c.region(cx-rx-1,cy-ry-1,cx+rx+1,cy+ry+1,(x,y)=>faceMask(x,y,cx,cy,rx,ry,jaw),(x,y)=>{
    const hx=(H(x+1,y)-H(x-1,y))*.5,hy=(H(x,y+1)-H(x,y-1))*.5,n=[-hx,-hy,1],nl=Math.hypot(...n);
    let l=(n[0]*L[0]+n[1]*L[1]+n[2]*L[2])/(nl*ll);l=(l-.55)*1.55+.6;
    const dx=(x-cx)/rx,dy=(y-cy)/ry;if(dx>.35)l-=.1*(dx-.35);if(dy>.8)l-=.18*(dy-.8)*3;
    return skin[cl(Math.round(l*5+(U.bayer(x,y)-.5)*.8),0,5)]});
  /* cast shadows */
  c.ell(cx+.5,cy+13*u*nz*.9+2,5.4*u*nz,1.9,skin[0],.45);               // under nose
  c.ell(cx,cy+ry*.72,6.5*u,1.7,skin[0],.28);                            // under lip
  if(S.blush)[-1,1].forEach(s=>c.ell(cx+s*16*u,cy+12*u,7.5*u,4.5*u,'#ff6a72',S.blush*.3));
  if(age>.25){const wc=skin[0];for(let k=0;k<3;k++)c.hline(cx-15*u+k*2,cy-ry*.66+k*3.4,30*u-k*4,wc,.22*Math.min(1,age+.2));
    [-1,1].forEach(s=>{c.line(cx+s*(rx*.8),cy-3,cx+s*(rx*.8+4),cy-1,wc,.55);c.line(cx+s*(rx*.8),cy,cx+s*(rx*.8+4),cy+2,wc,.4);c.line(cx+s*(rx*.8-1),cy+3,cx+s*(rx*.8+3),cy+5,wc,.3)})}
}
/* ---------- eyes + brows ---------- */
function features(c,S,cx,cy,rx,ry,u,skin,M,talk,blink,age){
  const eyeR=RMP(S.eye,5,.22),brR=RMP(S.brow,6,.24),lid=skin[0],bw=S.browW||4,sur=M.mo===3?1:0;
  [-1,1].forEach(s=>{const ex=cx+s*12.2*u,ey=cy-4*u+(s>0?.4:0),ew=6.8*u*(s>0?.96:1);
    const top=dx=>ey-4.4*u*Math.sqrt(Math.max(0,1-(dx/(ew+.5))**2))-sur*1.8,bot=dx=>ey+3*u*Math.sqrt(Math.max(0,1-(dx/(ew+.5))**2))+sur;
    if(blink){c.line(ex-ew,ey+1,ex+ew,ey+1,'#241418');c.line(ex-ew+2,ey+3,ex+ew-2,ey+3,skin[1],.7);return}
    for(let x=Math.floor(ex-ew);x<=Math.ceil(ex+ew);x++){const dx=x+.5-ex;const y0=Math.round(top(dx)),y1=Math.round(bot(dx));for(let y=y0;y<=y1;y++){const f=(y-y0)/Math.max(1,y1-y0);c.px(x,y,f<.28?'#bdb9c6':f>.8?'#e6e0e4':'#f8f4f2')}}
    const ix=ex+s*.3,iy=ey+.2*u,ir=3.7*u;
    c.region(ix-ir-1,iy-ir-1,ix+ir+1,iy+ir+1,(x,y)=>{const a=x+.5-ix,b=y+.5-iy;if(a*a+b*b>ir*ir)return false;return y>=Math.round(top(x+.5-ex))&&y<=Math.round(bot(x+.5-ex))},(x,y)=>{const a=x+.5-ix,b=y+.5-iy,d=Math.hypot(a,b)/ir;return eyeR[cl(Math.round(1.7+(b>0?1.3:-.3)*d*1.3-(d>.82?1.6:0)+(U.bayer(x,y)-.5)*.5),0,4)]});
    c.ell(ix,iy,1.9*u,1.9*u,'#0a0810');c.px(ix-2*u,iy-2*u,'#fff');c.px(ix-1*u,iy-2*u,'#fff',.7);c.px(ix+1.5*u,iy+1.5*u,eyeR[4],.9);
    for(let x=Math.floor(ex-ew);x<=Math.ceil(ex+ew);x++){const dx=x+.5-ex,y=Math.round(top(dx));c.px(x,y-1,'#2a1a1c');c.px(x,y,'#3a2224',.9);if(Math.abs(dx)<ew-1)c.px(x,y-3,lid,.5);const yb=Math.round(bot(dx));c.px(x,yb+1,skin[1],.7)}
    c.px(ex+s*(ew+.5),Math.round(ey),'#2a1a1c');
    if(S.ears===3){for(let k=0;k<5;k++)c.px(ex+s*(ew-1)+s*k*.7,top(ew-1)-1-k*.3,'#241418',.9)}
    /* brows */
    const by0=ey-10.5*u;
    c.region(ex-ew-2,by0-9,ex+ew+3,by0+9,(x,y)=>{const t=(x-ex)/(ew+1.5),o=s*t; /* o>0 => outer end */
        const arch=-2.6*(1-Math.min(1,Math.abs(t))**2);
        let tilt=0;if(M.br!==0)tilt=(o<0?1:-.35)*M.br*(M.br>0?-1.5:1.5)*(-1)*Math.min(1,(-o+1)/2)*(M.br>0?-1:-1);
        const mid=by0+arch+(M.br>0?(o<0?-M.br*1.4:M.br*.5):(M.br<0?(o<0?-M.br*1.7:M.br*.6):0))-(M.br===3?2.5:0);
        const th=bw*(1-Math.abs(t)*.38);return Math.abs(t)<=1.08&&y>=mid-th/2&&y<=mid+th/2},
      (x,y)=>brR[cl(Math.round(1.4+strand(x,y,1,0,.7,5)*2.6+(y<by0?.5:-.4)),0,5)])
  });
}
/* ---------- nose is in the height-field; mouth drawn separately so it can animate ---------- */
function mouth(c,S,cx,cy,rx,ry,u,skin,M,talk){
  const lipHex=S.skin==='#fbe6d6'||S.skin==='#f6dac4'?'#d07880':S.skin==='#c8977a'?'#9e5a4c':'#bf6a62',lip=RMP(lipHex,5,.22),w=(S.face[0]>31?9:7.6)*u,my=Math.round(cy+ry*.58),mo=M.mo;
  if(talk||mo===3){const h=mo===3?7:3.6*u;const ww=mo===3?w:w*.78;c.region(cx-ww,my-2,cx+ww,my+h+3,(x,y)=>{const a=(x+.5-cx)/(ww-.5),b=(y-my-h*.45)/(h*.62+.4);return a*a+b*b<=1},(x,y)=>y<my+1?'#f4eeee':y>my+h-1?'#d0665e':'#34101a');
    c.hline(cx-w+1,my-2,w*2-1,lip[1]);c.hline(cx-w+2,my-3,w*2-3,lip[2]);c.hline(cx-w+2,my+h+2,w*2-3,lip[3]);c.hline(cx-w+3,my+h+3,w*2-5,lip[2],.6);return}
  const curl=mo>0?Math.min(2,mo)*2.1:mo*2.4;
  for(let x=-w;x<=w;x++){const t=x/w,y=Math.round(my-(mo>=0?t*t*curl:t*t*curl*.9)),a=Math.abs(t);
    c.px(cx+x,y-1,a<.7?lip[1]:lip[2]);c.px(cx+x,y,lip[0]);if(a<.8){c.px(cx+x,y+1,lip[3]);if(a<.55)c.px(cx+x,y+2,lip[4],.9)}else c.px(cx+x,y+1,lip[2],.7)}
  if(mo>=2)for(let x=-w+3;x<=w-3;x++)c.px(cx+x,my-Math.round(((x/w)**2)*curl)+1,'#f4eeee');
  c.px(cx-w-1,my-Math.round(curl)+(mo>0?0:1),lip[0]);c.px(cx+w+1,my-Math.round(curl)+(mo>0?0:1),lip[0]);c.px(cx,my-3,lip[1],.5)}
/* ---------- beards ---------- */
function beard(c,S,cx,cy,rx,ry,u,M,talk){const b=S.beard,br=RMP(b.col,7,.27),st=b.style,my=Math.round(cy+ry*.58);
  const mouthHole=(x,y)=>Math.abs(x-cx)<8.5*u&&y>my-5&&y<my+(talk?10:6);
  if(st==='stubble'){c.region(cx-rx,cy+ry*.05,cx+rx,cy+ry+3,(x,y)=>{if(!faceMask(x,y,cx,cy,rx,ry,S.jaw||.3))return false;const dy=(y-cy)/ry;if(dy<.12)return false;if(mouthHole(x,y)&&Math.abs(x-cx)<7*u)return false;return true},(x,y)=>{const d=(y-cy)/ry;const p=.2*Math.min(1,(d-.1)*2.2)+.04;return U.hash(x,y,7)<p?br[3]:null});return}
  if(st==='mustache'){c.poly([[cx-17*u,my-6],[cx-2,my-10],[cx+2,my-10],[cx+17*u,my-6],[cx+21*u,my+1],[cx+12*u,my-2],[cx,my-5],[cx-12*u,my-2],[cx-21*u,my+1]],(x,y)=>br[cl(Math.round(2.6+(x<cx?.8:-.4)+(strand(x,y,1,.3,.7,2)-.5)*2.4),0,6)]);return}
  const dir=st==='long'?[0,1]:[.15,1];
  const test=(x,y)=>{const dx=(x-cx)/rx;
    if(st==='short'){const dd=(y-cy)/ry;if(dd<.3+(U.hash(x,y,5)-.5)*.12)return false;if(!faceMask(x,y,cx,cy,rx+1,ry+1,S.jaw||.3))return false;if(mouthHole(x,y)&&Math.abs(x-cx)<8*u)return false;if(dd<.5&&Math.abs(x-cx)<rx*.55)return false;return true}
    if(st==='long'){const top=cy+ry*.32,len=64+ry;if(y<top||y>top+len)return false;const t=(y-top)/len,half=rx*(1.05-.12*t)*(1-Math.pow(t,1.7)*.88)+(t<.15?3:0);if(Math.abs(x-cx)>half)return false;if(mouthHole(x,y)&&Math.abs(x-cx)<7.5*u)return false;return true}
    if(st==='dwarf'){const top=cy+2+Math.pow(Math.abs(x-cx)/rx,2)*16,len=100;if(y<top||y>top+len)return false;const t=(y-top)/len,half=rx*(1.12-.34*t)*(1-Math.pow(t,2.3)*.55)+4;if(Math.abs(x-cx)>half)return false;if(mouthHole(x,y)&&Math.abs(x-cx)<7.5*u)return false;return true}return false};
  c.region(cx-rx-8,cy,cx+rx+8,cy+130,test,(x,y)=>{const s=strand(x,y,dir[0],dir[1],.66,3),l=(x-cx)/rx;return br[cl(Math.round(1.1+s*3.4+(l<0?.9:-.4)+(U.bayer(x,y)-.5)*.5),0,6)]});
  if(st==='dwarf'){[-1,1].forEach(s=>{for(let k=0;k<5;k++){const bx=cx+s*(13+k*.4),by=cy+ry+10+k*13;for(let j=0;j<11;j++)for(let i=-4;i<=4;i++){const wob=Math.round(Math.sin((j+k*11)*.8)*1);c.px(bx+i+wob,by+j,br[((i+j+k*2)&3)<2?4:2])}c.rect(bx-4,by+11,9,2,'#8a90a4');c.hline(bx-4,by+11,9,'#e8ecf8')}})}
  if(st==='long'){for(let k=0;k<9;k++){const x=cx+(U.hash(k,1,5)-.5)*10;c.vline(x,cy+ry+60+k*.8,8,br[5],.55)}}
  /* moustache blending on top for long/short beards */
  if(st==='long')c.poly([[cx-16*u,my-5],[cx-2,my-9],[cx+2,my-9],[cx+16*u,my-5],[cx+22*u,my+8],[cx+10*u,my+1],[cx,my-3],[cx-10*u,my+1],[cx-22*u,my+8]],(x,y)=>br[cl(Math.round(3.1+(x<cx?.7:-.3)+(strand(x,y,1,.4,.7,6)-.5)*2),0,6)])}
/* ---------- hair in front of the face ---------- */
function frontHair(c,S,cx,cy,rx,ry,u,hair){const st=S.hair.style;
  if(st==='none'||st==='bonnet'){if(st==='bonnet')bonnet(c,S,cx,cy,rx,ry,u);return}
  if(st==='curly'){const r=RG(S.name.length*7+3),pts=[];
    for(let i=0;i<60;i++){const a=Math.PI*(1.0+i/59*1.0)+(r()-.5)*.12,rr=1.0+r()*.14;pts.push([cx+Math.cos(a)*(rx+4*u)*rr,cy+Math.sin(a)*(ry*1.0)*rr+2,6.5*u+r()*3.8*u])}
    for(let i=0;i<18;i++)pts.push([cx-rx+i*(rx*2/17)+(r()-.5)*3,cy-ry*.7+Math.sin(i*1.7)*3.5+r()*3,5.4*u+r()*2.8*u]);
    [-1,1].forEach(s=>{for(let k=0;k<6;k++)pts.push([cx+s*(rx+2+r()*3),cy-ry*.34+k*6.5,5*u+r()*2.2*u])});
    pts.sort((a,b)=>a[1]-b[1]);pts.forEach(([x,y,rad],i)=>{c.shade(x,y,rad,rad*.92,hair,{light:[-.5,-.7,.5],noise:.5,seed:i,dither:.9});for(let k=0;k<3;k++){c.px(x-rad*.45+k*2,y-rad*.45,hair[6]);c.px(x-rad*.3+k*2,y-rad*.25,hair[5])}});return}
  if(st==='wispy'){[-1,1].forEach(s=>{for(let k=0;k<8;k++){const x=cx+s*(rx+3-Math.abs(k-3.5)*.7),y=cy-12+k*3.8;c.shade(x,y,5.6,4.3,hair,{light:[-.5,-.7,.5],seed:k+s*9,noise:.5})}});for(let i=-11;i<=11;i+=2)c.vline(cx+i+Math.sin(i)*.7,cy-ry+3+Math.abs(i)*.45,4,hair[4],.85);return}
  if(st==='balding'){[-1,1].forEach(s=>{for(let k=0;k<6;k++)c.shade(cx+s*(rx-1),cy-8+k*4.2,4.6,3.9,hair,{light:[-.5,-.7,.5],seed:k+s*9,noise:.5})});return}
  const lineY=(x)=>{const a=Math.abs(x-cx);return st==='long'||st==='elf'?cy-ry*.72+a*.5+(x<cx-4?1:0):st==='mid'?cy-ry*.62+a*.55+Math.sin(x*.8)*1.4:cy-ry*.66+a*.5};
  const test=(x,y)=>{const dx=(x+.5-cx)/(rx+6),dy=(y+.5-cy)/(ry+4);const inSkull=dx*dx+dy*dy<1;if(inSkull&&y<lineY(x))return true;
    const a=Math.abs(x-cx);if((st==='long'||st==='elf'||st==='mid')&&a>rx-2&&a<rx+7*u&&y<cy+(st==='mid'?16:12)&&dx*dx+dy*dy<1.08)return true;if(st==='short'&&a>rx-3&&a<rx+4&&y<cy+2&&dx*dx+dy*dy<1.05)return true;return false};
  c.region(cx-rx-14,cy-ry-10,cx+rx+14,cy+24,test,(x,y)=>{const s=strand(x,y,x<cx?-.5:.5,1,.62,6);const e=1.2+s*3.3+(x<cx?.8:-.3)+(y<cy-ry*.82?.7:0);return hair[cl(Math.round(e+(U.bayer(x,y)-.5)*.6),0,6)]});
  if(st==='elf'){[-1,1].forEach(s=>{for(let j=0;j<60;j++){const x=cx+s*(rx+2)-s*(j>34?(j-34)*.14:0)+Math.sin(j*.3)*.7;c.px(x,cy-8+j,hair[j%7<2?5:4]);c.px(x+s,cy-8+j,hair[3])}for(let k=0;k<5;k++)c.px(cx+s*(rx-1)-s*k*.4,cy-8+k*2.6,'#d8c070')})}
}
function bonnet(c,S,cx,cy,rx,ry,u){const cr=RMP('#f2ead8',6,.22),tr=RMP('#8a4a8a',5);
  c.region(cx-rx-8,cy-ry-8,cx+rx+8,cy+10,(x,y)=>{const dx=(x+.5-cx)/(rx+5),dy=(y+.5-cy)/(ry+4);return dx*dx+dy*dy<1&&(y<cy-ry*.45+Math.abs(x-cx)*.6||Math.abs(x-cx)>rx-1)},(x,y)=>cr[cl(Math.round(2.4+(x<cx?.7:-.4)+Math.sin(x*.5)*.5+(U.bayer(x,y)-.5)*.5),0,5)]);
  c.region(cx-rx-8,cy-ry*.55,cx+rx+8,cy-ry*.3,(x,y)=>Math.abs(x-cx)<rx+4&&y<cy-ry*.36+Math.abs(x-cx)*.22&&y>cy-ry*.54+Math.abs(x-cx)*.36,(x,y)=>tr[cl(Math.round(2+(x<cx?.8:-.4)),0,4)])}
/* ---------- headgear ---------- */
function hat(c,S,cx,cy,rx,ry,u,t){const h=S.hat,hr=RMP(h.col,7,.26),top=cy-ry;
  if(h.type==='wizard'){const by=Math.round(cy-ry*.98),H=by-4,bend=30*u;
    const cone=(x,y)=>{const tt=(by-y)/H;if(tt<0||tt>1)return false;const ctr=cx+bend*Math.pow(tt,2.3)-4*u*tt,hw=(rx+4*u)*Math.pow(1-tt,.95)+2.2;return Math.abs(x-ctr)<=hw};
    c.region(cx-rx-20,by-H-4,cx+rx+60,by+4,cone,(x,y)=>{const tt=(by-y)/H,ctr=cx+bend*Math.pow(tt,2.3)-4*u*tt,hw=(rx+4*u)*Math.pow(1-tt,.95)+2.2,side=(x-ctr)/hw;const f=Math.sin(y*.2+side*2+U.noise(x*.08,y*.08,3)*3)*.5;return hr[cl(Math.round(2.4-side*1.5+f*.8+(U.bayer(x,y)-.5)*.6-(tt>.8?-.3:0)),0,6)]});
    /* brim */
    c.region(cx-rx-42*u,by-2,cx+rx+42*u,by+16,(x,y)=>{const a=(x-cx)/(rx+40*u),b=(y-by-6)/9;return a*a+b*b<=1},(x,y)=>{const a=(x-cx)/(rx+40*u);return hr[cl(Math.round(1.3+(1-Math.abs(a))*1.6+(y<by+4?1.2:0)-(a>0?.5:0)+(U.bayer(x,y)-.5)*.5),0,6)]});
    c.hline(cx-rx+2,by+8,rx*2-3,hr[0],.55);c.hline(cx-rx+6,by+3,rx*2-11,'#5a5f74',.0);
    c.hline(cx-rx-3,by-3,rx*2+6,hr[5],.6);return}
  if(h.type==='straw'){c.ell(cx,top+8,rx+18,9,hr[2]);c.shade(cx,top+5,rx-2,15,hr,{light:[-.5,-.7,.5],noise:.6});for(let i=-rx-16;i<=rx+16;i+=3)c.line(cx+i,top+8,cx+i*.9,top+14,hr[1],.6);c.hline(cx-rx+2,top+9,rx*2-4,'#8a4a2a');return}
  if(h.type==='cap'){c.shade(cx,top+6,rx+3,15,hr,{light:[-.5,-.7,.5],noise:.5});c.region(cx-rx-5,top+10,cx+rx+5,top+16,(x,y)=>Math.abs(x-cx)<rx+5,(x,y)=>hr[cl(Math.round(1.4+(x<cx?.6:-.3)),0,6)]);return}
  if(h.type==='helm'){const by=Math.round(cy-ry*.5);
    c.shade(cx,top+10,rx+4,28,hr,{light:[-.55,-.7,.45],noise:.3,dither:.7,mask:(x,y)=>y<by});
    c.region(cx-rx-5,by-4,cx+rx+5,by+3,(x,y)=>Math.abs(x-cx)<rx+5,(x,y)=>hr[cl(Math.round(3.0+(x<cx?1:-.8)+(y<by-1?.7:-.4)),0,6)]);
    for(let i=-rx;i<=rx;i+=7)c.px(cx+i,by-1,'#f0f4ff');
    c.poly([[cx-4,by],[cx+4,by],[cx+3,cy+4],[cx-3,cy+4]],(x,y)=>hr[cl(Math.round(3+(x<cx?1:-.7)),0,6)]);
    c.line(cx,top-8,cx,top+10,hr[5]);c.shade(cx,top-8,4,5,RMP('#c8a040',5),{dither:0});return}
  if(h.type==='circlet'){const gy=Math.round(cy-ry*.7);for(let x=-rx+3;x<=rx-3;x++){const y=gy+Math.round(Math.abs(x/rx)**2*7);c.px(cx+x,y,'#f4f8ff');c.px(cx+x,y+1,hr[4]);c.px(cx+x,y+2,hr[2],.8)}
    c.shade(cx,gy-1,3,3.6,RMP('#58c8ff',5),{dither:0,light:[-.5,-.7,.5]});c.px(cx-1,gy-2,'#fff');
    for(let k=1;k<=4;k++){c.line(cx-k*6,gy+k*.5+1,cx-k*6-2,gy-4+k*.3,'#e8f0ff',.9);c.line(cx+k*6,gy+k*.5+1,cx+k*6+2,gy-4+k*.3,'#e8f0ff',.9)}return}
}
/* ---------- clothing ---------- */
function outfit(c,S,cx,cy,rx,ry,u){const o=S.outfit,col=RMP(o.col,7,.25),und=RMP(o.under,6,.2),type=o.type,by=cy+ry+2;
  const body=(x,y)=>{const dx=(x-cx)/(76),dy=(y-(by+84))/(76);return dx*dx+dy*dy<1};
  const clothAt=(x,y,r,bias=0,seed=9)=>{const lit=(cx-x)/100*1.7,f=Math.sin(x*.15+U.noise(x*.03,y*.05,seed)*5)*.5;return r[cl(Math.round(2.5+lit-(y-by)/260+f*.9+bias+(U.bayer(x,y)-.5)*.55),0,r.length-1)]};
  const bodyType=type==='armor'?null:1;
  if(type!=='armor')c.region(cx-80,by,cx+80,PH,body,(x,y)=>clothAt(x,y,col));
  const neckPoly=(w,d,fn)=>c.poly([[cx-w,by+4],[cx+w,by+4],[cx+w*.28,by+d],[cx-w*.28,by+d]],fn);
  const undAt=(x,y,k=0)=>und[cl(Math.round(3.0+(x<cx?.7:-.5)-(y-by)/46+k+(U.bayer(x,y)-.5)*.5),0,5)];
  /* a few crisp fold lines keep large cloth areas from looking flat */
  const folds=(n,col2,al=.5)=>{for(let k=0;k<n;k++){const x0=cx-60+k*(120/(n-1||1));c.line(x0,by+36,x0+(k-n/2)*5,PH,col2,al)}};
  if(type==='robe'){neckPoly(26,40,(x,y)=>undAt(x,y));folds(6,col[0],.5);
    if(o.trim){for(let j=0;j<56;j++){c.px(cx-28-j*.55,by+j*1.05,o.trim);c.px(cx+28+j*.55,by+j*1.05,o.trim)}for(let i=0;i<30;i++)c.px(cx-42+i*2.9,by+44+Math.sin(i*.8)*1.5,o.trim,.85)}}
  if(type==='hobbit'||type==='waistcoat'){neckPoly(24,36,(x,y)=>undAt(x,y));
    const vl=[[cx-62,by+16],[cx-24,by-4],[cx-9,by+44],[cx-9,PH],[cx-76,PH]],vr=[[cx+62,by+16],[cx+24,by-4],[cx+9,by+44],[cx+9,PH],[cx+76,PH]];
    [vl,vr].forEach((v,i)=>c.poly(v,(x,y)=>col[cl(Math.round(2.4+(i?-.8:.7)+Math.sin(x*.18+y*.03)*.45+(U.bayer(x,y)-.5)*.5),0,6)]));
    c.line(cx-9,by+44,cx-24,by-4,col[0]);c.line(cx+9,by+44,cx+24,by-4,col[0]);
    [by+52,by+72,by+92].forEach(y=>c.shade(cx-7,y,3,3,RMP(type==='waistcoat'?'#f0c850':'#bda878',4),{dither:0}));
    c.poly([[cx-24,by-6],[cx-7,by+3],[cx-17,by+18],[cx-31,by+5]],und[4]);c.poly([[cx+24,by-6],[cx+7,by+3],[cx+17,by+18],[cx+31,by+5]],und[3]);
    c.line(cx-17,by+18,cx-7,by+3,und[1]);c.line(cx+17,by+18,cx+7,by+3,und[1])}
  if(type==='dress'){neckPoly(26,24,(x,y)=>undAt(x,y,.2));c.hline(cx-30,by+7,60,und[5]);for(let i=-30;i<=30;i+=4)c.px(cx+i,by+10,und[4]);folds(5,col[0],.45)}
  if(type==='coat'){neckPoly(21,32,(x,y)=>undAt(x,y,-.6));
    c.poly([[cx-32,by-12],[cx-11,by+2],[cx-19,by+36],[cx-42,by+12]],(x,y)=>col[cl(Math.round(3.0+(x<cx?.4:0)+Math.sin(y*.3)*.4),0,6)]);
    c.poly([[cx+32,by-12],[cx+11,by+2],[cx+19,by+36],[cx+42,by+12]],(x,y)=>col[cl(Math.round(2.0+Math.sin(y*.3)*.4),0,6)]);
    c.line(cx-11,by+2,cx-19,by+36,col[0]);c.line(cx+11,by+2,cx+19,by+36,col[0]);
    c.vline(cx,by+22,PH,col[0]);[by+42,by+66,by+90].forEach(y=>c.shade(cx,y,3,3,RMP('#a0a0b0',4),{dither:0}));
    c.line(cx-64,by+20,cx-16,by+70,col[0],.7);c.line(cx+64,by+20,cx+16,by+70,col[0],.7);folds(5,col[0],.4)}
  if(type==='fur'){neckPoly(24,28,(x,y)=>undAt(x,y,-.4));
    const fr=RMP(o.under,7,.27);c.region(cx-56,by-14,cx+56,by+30,(x,y)=>{const dx=(x-cx)/52,dy=(y-(by+10))/15;return dx*dx+dy*dy<1&&!(Math.abs(x-cx)<20&&y<by+12)},(x,y)=>fr[cl(Math.round(2.6+strand(x,y,1,.5,.55,4)*2.6-1.2+(x<cx?.8:-.3)+(U.bayer(x,y)-.5)*.6),0,6)]);
    for(let i=0;i<50;i++){const a=U.hash(i,1,7)*6.28,r2=U.hash(i,2,7);c.px(cx+Math.cos(a)*r2*62,by+8+Math.sin(a)*r2*22,fr[6])}
    c.line(cx-52,by+24,cx+30,PH,'#3a2a1c');c.line(cx-51,by+24,cx+31,PH,'#5a4430');c.line(cx-50,by+24,cx+32,PH,'#3a2a1c',.5);
    c.shade(cx+30,by+84,5.5,8,RMP('#e8e0c8',4),{dither:.3});c.hline(cx+26,by+76,8,'#b8a050')}
  if(type==='elf'){neckPoly(18,26,(x,y)=>col[cl(Math.round(2.8+(x<cx?.6:-.4)-(y-by)/70),0,6)]);
    c.line(cx-54,by+12,cx+16,PH,'#4a3220');c.line(cx-53,by+12,cx+17,PH,'#6a4a30');
    for(let k=0;k<3;k++){const fx=cx+40+k*6;c.line(fx,by-8,fx-5+k,by+26,'#8a7a5a');c.px(fx,by-9,'#d8d0b8');c.px(fx+1,by-10,'#c04a3a');c.px(fx,by-11,'#c04a3a')}
    c.shade(cx-8,by+15,3.5,4.5,RMP('#d8e0f0',4),{dither:.2,light:[-.5,-.7,.5]});[0,1].forEach(i=>c.line(cx-10+i*4,by+15,cx-7+i*4,by+9,'#f0f4ff'));folds(4,col[0],.4)}
  if(type==='armor'){c.region(cx-80,by-6,cx+80,PH,body,(x,y)=>{const m=((x*2+y*2)%6<2)?1:0;return col[cl(Math.round(2.4+(cx-x)/80*1.4+(m?.9:-.4)+(U.bayer(x,y)-.5)*.4),0,6)]});
    [-1,1].forEach(s=>{c.shade(cx+s*60,by+16,23,15,RMP('#9aa0b2',7),{light:[-.5,-.7,.5],noise:.2,dither:.6});for(let k=0;k<4;k++)c.px(cx+s*60-9+k*6,by+8,'#f0f4ff')});
    neckPoly(18,18,(x,y)=>und[cl(Math.round(2.2-(y-by)/30),0,5)]);c.hline(cx-70,by+54,140,col[0],.6)}
  if(type==='gown'){neckPoly(21,42,(x,y)=>RMP('#f4e2d6',5)[cl(Math.round(3.2-(y-by)/40),0,4)]);folds(8,col[1],.5);
    for(let i=0;i<50;i++){const x=cx+(U.hash(i,3,2)-.5)*130,y=by+12+U.hash(i,4,2)*96;c.px(x,y,'#fff');c.px(x+1,y,'#fff',.5);c.px(x,y-1,'#fff',.5)}
    for(let i=-26;i<=26;i++){const y=by+10+Math.round((i*i)/20);c.px(cx+i,y,'#eaf6ff');c.px(cx+i,y+1,'#9ad8f0',.8)}c.shade(cx,by+32,3.6,4.6,RMP('#7ae0ff',5),{dither:0})}
  if(type==='apron'){neckPoly(22,26,(x,y)=>undAt(x,y,-.3));c.poly([[cx-36,by+26],[cx+36,by+26],[cx+40,PH],[cx-40,PH]],(x,y)=>und[cl(Math.round(2.9+(x<cx?.7:-.4)+Math.sin(x*.2)*.4),0,5)]);c.line(cx-30,by+4,cx-36,by+26,und[0]);c.line(cx+30,by+4,cx+36,by+26,und[0])}
}
function paintRider(c,t){const rb=RMP('#1b1a28',7,.22);
  c.region(0,76,PW,PH,(x,y)=>{const dx=(x-80)/84,dy=(y-210)/110;return dx*dx+dy*dy<1},(x,y)=>rb[cl(Math.round(1.8+(80-x)/90+(strand(x,y,0,1,.18,5)-.5)*2.4),0,6)]);
  c.region(30,6,130,130,(x,y)=>{const dx=(x-80)/46,dy=(y-72)/66;return dx*dx+dy*dy<1||(y>118&&Math.abs(x-80)<50)},(x,y)=>rb[cl(Math.round(1.6+(80-x)/70+(strand(x,y,.1,1,.3,2)-.5)*2),0,6)]);
  c.ell(80,76,21,30,'#040308');c.ell(80,76,15,25,'#000');
  c.px(69,70,'#eef4ff');c.px(91,70,'#eef4ff');c.px(68,70,'#a8c0ff',.6);c.px(92,70,'#a8c0ff',.6);c.px(69,69,'#a8c0ff',.4);c.px(91,69,'#a8c0ff',.4);
  for(let i=0;i<30;i++){const x=50+U.hash(i,1,2)*60,y=36+((U.hash(i,2,2)*100+t*12)%100);c.px(x,y,'#8a8ac8',.22)}
  c.outline(.4);return c}

/* ---------- cache & public API ---------- */
const PCACHE=new Map();
function portrait(name,mood='neutral',talk=false,blink=false){const key=name+'|'+mood+'|'+(talk?1:0)+(blink?1:0);let v=PCACHE.get(key);if(!v){const S=CAST[name]||CAST.narrator;v=paintBust(S,mood,talk,blink,0).canvas();PCACHE.set(key,v)}return v}
window.CAST=CAST;window.portrait=portrait;window.paintBust=paintBust;window.PW=PW;window.PH=PH;

})();
