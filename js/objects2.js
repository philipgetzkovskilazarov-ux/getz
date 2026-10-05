'use strict';
/* =========================================================
   objects2.js — Bree, Weathertop, Rivendell, Moria, Lothlórien,
   Amon Hen props (extends OB from objects.js)
   ========================================================= */
(()=>{
const Cv=U.Cv,RP=U.ramp,HS=U.hash,CL=U.clamp,RNG=U.rng;
const {blob,speckle,bricks,planksV,shingles,timberFrame,roundWindow,rectWindow,archDoor,lanternGlyph,gshadow,done,trunk,post}=OBH;
/* ---------- BREE ---------- */
OB.house=(o={})=>{const W=o.w||96,fl=o.floors||2,wallH=fl*30,roofH=o.roofH||34,H=wallH+roofH+10,c=new Cv(W+12,H);const ox=6,wy=roofH+4,wl=RP(o.wall||'#d8c8a0',6,.24),bm=RP(o.beam||'#3a2414',5),rf=RP(o.roof||'#8a3a2a',6,.26),sd=o.seed||1;
  gshadow(c,ox+W/2+4,H-3,W*.5,5,.3);
  timberFrame(c,ox,wy,W,wallH,wl,bm,sd,{floors:fl,cw:o.cw||26,diag:o.diag!==false});
  /* stone foundation */
  bricks(c,ox,H-14,W,12,RP('#8a8a96',5),sd,6,4);c.hline(ox,H-14,W,'#c8c8d4');
  /* roof: steep, with overhang and scalloped tiles */
  c.poly([[0,wy+3],[W+12,wy+3],[W+2,wy-roofH+6],[10,wy-roofH+6]],(x,y)=>0);
  for(let j=0;j<roofH;j++){const y=wy+3-j,inset=Math.round(j*(o.pitch||.18));for(let i=inset;i<W+12-inset;i++){const sw=5,sh=4,off=((Math.floor(j/sh))&1)*2,t=HS(Math.floor((i+off)/sw),Math.floor(j/sh),sd+3),k=1+Math.floor(t*2.6),jj=j%sh;
      c.px(i,y,rf[CL(jj===0?k-1:jj===sh-1?Math.min(5,k+2):k+(i<W/2?.4:-.2)|0,0,5)]);if((i+off)%sw===0)c.px(i,y,rf[0])}}
  c.hline(0,wy+3,W+12,rf[0]);c.hline(2,wy+4,W+8,'#00000040');
  /* chimneys */
  if(o.chimney!==false){const cxp=ox+Math.round(W*.72);bricks(c,cxp,6,10,roofH-6+2,RP('#9a5a4a',5),sd,5,3);c.rect(cxp-1,4,12,3,RP('#8a8a96',5)[3]);c.hline(cxp-1,4,12,'#c8c8d4')}
  /* windows + door */
  const per=Math.max(1,Math.floor(W/34));
  for(let f=0;f<fl;f++)for(let k=0;k<per;k++){const wx=ox+8+Math.round(k*(W-16)/per)+(per>1?4:Math.round(W*.5-6)-ox-8+ox*0);if(f===0&&k===0)continue;rectWindow(c,wx,wy+8+f*30,10,12,o.glow||'#ffcf6a','#2a1a10',{shutters:o.shut||'#3a5a8a',box:f===1||o.box});}
  archDoor(c,ox+Math.round(W*.22)+3,H-14,12,22,o.door||'#6a3a1a');
  if(o.sign){const sx=ox+W-6,sy=wy+22;c.vline(sx+8,sy-6,3,'#2a1a10');c.hline(sx-2,sy-6,12,'#2a1a10');c.rect(sx-2,sy-3,13,12,RP('#d8b060',5)[2]);c.rect(sx-2,sy-3,13,1,'#2a1a10');c.rect(sx-2,sy+8,13,1,'#2a1a10');
    if(o.sign==='pony'){c.shade(sx+4,sy+3,3,2,RP('#f4f0e0',4),{dither:0});c.rect(sx+6,sy,2,2,'#f4f0e0');c.px(sx+7,sy-1,'#f4f0e0');c.vline(sx+1,sy+4,4,'#f4f0e0');c.vline(sx+6,sy+4,3,'#f4f0e0')}else{c.rect(sx+3,sy+1,5,6,RP('#c8a040',4)[2])}}
  const lights=[];for(let f=0;f<fl;f++)for(let k=0;k<per;k++)lights.push({x:-W/2+8+Math.round(k*(W-16)/per)+(per>1?4:Math.round(W*.5-6)-8)+5,y:-(H-wy-8-f*30-6),r:34,col:'#ffb84a',flicker:.05});
  return done(c,{ax:ox+W/2,ay:H-2,solid:[-W/2,-30,W,30],lights:lights.slice(0,6),emit:o.chimney===false?[]:[{x:Math.round(W*.72)+5-W/2,y:4-(H-2)}],doorX:-(W/2)+Math.round(W*.22)+3})};
OB.pony=()=>OB.house({w:170,floors:3,roof:'#5a3a2a',wall:'#d8c090',beam:'#2a1a10',roofH:40,seed:9,sign:'pony',glow:'#ffd070',shut:'#7a2a2a',box:true,door:'#4a2a14'});
OB.stall=(o={})=>{const W=48,H=50,c=new Cv(W,H),cs=o.cols||['#c0392b','#f4f0e0'];gshadow(c,W/2+2,H-3,20,3,.3);
  [4,W-6].forEach(x=>c.rect(x,14,3,H-18,RP('#7a5230',4)[2]));
  const R0=RP(cs[0],5),R1=RP(cs[1],5);for(let i=0;i<W;i+=6)c.poly([[i,10],[i+6,10],[i+6,22],[i+3,26],[i,22]],(i/6|0)%2?R1[2]:R0[2]);for(let i=0;i<W;i+=6){c.vline(i,10,12,(i/6|0)%2?R1[0]:R0[0],.5)}
  c.rect(2,32,W-4,6,RP('#9a6a34',5)[3]);c.hline(2,32,W-4,RP('#9a6a34',5)[4]);c.rect(4,38,W-8,10,RP('#7a5230',5)[1]);
  const fr=o.fruit||['#e84a4a','#f0c040','#8ad83a'];for(let i=0;i<9;i++){const col=fr[i%fr.length];c.shade(7+i*4.4,31,2.2,2.2,RP(col,4),{dither:0})}
  return done(c,{ax:W/2,ay:H-2,solid:[-20,-14,40,14]})};
OB.breeGate=()=>{const W=96,H=96,c=new Cv(W,H);gshadow(c,W/2,H-3,W*.48,4,.3);const wd=RP('#7a5230',6);
  [0,W-24].forEach(x=>{planksV(c,x,22,24,H-24,wd,x+1,4);c.rect(x-2,16,28,8,wd[3]);c.hline(x-2,16,28,wd[5]);for(let i=0;i<24;i+=4)c.poly([[x+i,22],[x+i+4,22],[x+i+2,14]],wd[4])});
  c.region(24,8,W-24,H-6,(x,y)=>y>=8+Math.abs(x-W/2)*.0&&(y>40||Math.abs(x-W/2)<24-(40-y)*.4),(x,y)=>0);
  c.rect(24,40,W-48,H-44,RP('#1a120c',4)[1]);c.hline(24,40,W-48,wd[0]);
  /* arch beam + lantern */
  c.rect(20,30,W-40,8,wd[3]);c.hline(20,30,W-40,wd[5]);c.hline(20,37,W-40,wd[0]);c.vline(W/2,38,10,'#2a1a10');lanternGlyph(c,W/2,52,'#ffb84a',3);
  return done(c,{ax:W/2,ay:H-2,solid:[-W/2,-10,24,10],lights:[{x:0,y:-44,r:60,col:'#ffb050',flicker:.1}],gap:true})};
OB.horse=(o={})=>{const cv=horseSprite(o.col||'#5a3a22');return{cv,w:40,h:30,ax:20,ay:28,solid:[-14,-8,28,8],lights:[],emit:[]}};
/* ---------- WEATHERTOP ---------- */
OB.ruinWall=(n=3,o={})=>{const W=n*16,H=36,c=new Cv(W,H),st=RP(o.col||'#6a6a8a',6,.26);gshadow(c,W/2+2,H-3,W/2,3,.3);
  c.region(0,6,W,H-2,(x,y)=>{const top=8+Math.floor(HS(x>>3,1,5)*10)+(HS(x>>2,2,5)<.2?4:0);return y>=top},(x,y)=>st[CL(Math.round(2.3+(W/2-x)/W*1.2+(HS(x>>2,y>>2,3)-.5)*1.1-(y%8===0?.8:0)+(U.bayer(x,y)-.5)*.5),0,5)]);
  for(let j=10;j<H;j+=8)c.hline(0,j,W,st[0],.5);for(let i=0;i<W;i+=7)c.vline(i+((i/7&1)*3),10,H-12,st[0],.4);
  if(o.moss)for(let i=0;i<W;i++)for(let j=6;j<14;j++)if(c.solid(i,j)&&HS(i,j,2)<.3)c.px(i,j,RP('#4a8a3a',4)[1+(HS(i,j,3)*3|0)]);
  return done(c,{ax:W/2,ay:H-2,solid:[-W/2,-12,W,12]})};
OB.ruinTower=()=>{const W=76,H=120,c=new Cv(W,H),st=RP('#6a6a8a',6,.26);gshadow(c,W/2+4,H-4,W*.45,5,.3);
  c.region(4,10,W-4,H-4,(x,y)=>{const top=14+Math.floor(HS(x>>3,1,7)*16);return y>=top},(x,y)=>st[CL(Math.round(2.2+(W/2-x)/W*1.5+(HS(x>>2,y>>2,3)-.5)*1.1-(y%9===0?.9:0)+(U.bayer(x,y)-.5)*.5),0,5)]);
  for(let j=14;j<H-4;j+=9)c.hline(4,j,W-8,st[0],.5);for(let i=4;i<W-4;i+=8)for(let j=14;j<H-4;j+=9)c.vline(i+(((j/9)|0)&1)*4,j,9,st[0],.4);
  c.rect(16,40,10,18,'#0a0c1c');c.rect(46,58,10,16,'#0a0c1c');c.rect(28,H-36,18,32,'#0a0c1c');c.region(28,H-44,46,H-36,(x,y)=>(x-37)**2/81+(y-(H-36))**2/81<=1,'#0a0c1c');
  return done(c,{ax:W/2,ay:H-4,solid:[-W/2+4,-18,W-8,18]})};
OB.campfire=()=>{const W=30,H=30,c=new Cv(W,H);gshadow(c,W/2,H-4,12,3,.35);for(let a=0;a<8;a++){const x=W/2+Math.cos(a/8*6.28)*9,y=H-7+Math.sin(a/8*6.28)*3;c.shade(x,y,3.2,2.6,RP('#6a6a7a',5),{light:[-.4,-.7,.5]})}
  c.line(W/2-7,H-6,W/2+6,H-9,'#5a3a1a');c.line(W/2+7,H-6,W/2-6,H-9,'#6a4a22');c.line(W/2-5,H-9,W/2+5,H-5,'#4a2a12');
  return done(c,{ax:W/2,ay:H-2,solid:[-8,-8,16,8],flame:{x:0,y:-10,s:1.6},lights:[{x:0,y:-14,r:110,col:'#ff8a30',flicker:.22}]})};
OB.log=()=>{const W=34,H=16,c=new Cv(W,H),b=RP('#6a4a2a',5);gshadow(c,W/2+1,H-2,15,2.4,.3);c.shade(W/2,H-6,15,5,b,{light:[-.3,-.8,.4],noise:.5});c.ell(3,H-6,2,4.4,b[3]);c.px(3,H-6,b[1]);return done(c,{ax:W/2,ay:H-2,solid:[-14,-6,28,6]})};
/* ---------- RIVENDELL ---------- */
OB.elfArch=(o={})=>{const W=o.w||64,H=o.h||80,c=new Cv(W,H),st=RP('#d8d0c0',6,.22),gd=RP('#e8c850',5);gshadow(c,W/2,H-3,W*.46,3,.25);
  c.rect(0,24,9,H-26,(x,y)=>st[CL(Math.round(2.6+(4-x)/6+(U.bayer(x,y)-.5)*.5),0,5)]);c.rect(W-9,24,9,H-26,(x,y)=>st[CL(Math.round(2.2+(W-5-x)/6+(U.bayer(x,y)-.5)*.5),0,5)]);
  c.region(0,0,W,30,(x,y)=>{const dx=x+.5-W/2,dy=y+.5-30;return dx*dx/((W/2)**2)+dy*dy/(30*30)<=1&&dy<=0&&(dx*dx/((W/2-9)**2)+dy*dy/(21*21)>=1)},(x,y)=>st[CL(Math.round(2.6+(W/2-x)/W*1.4+(y<8?.6:0)+(U.bayer(x,y)-.5)*.5),0,5)]);
  /* leaf-and-vine tracery */
  for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI,r=W/2-5,x=W/2+Math.cos(a)*r,y=30+Math.sin(a)*21;c.px(x,y,gd[3]);c.px(x+1,y,gd[2]);c.px(x,y+1,gd[1])}
  for(let j=30;j<H-4;j+=8){c.px(4,j,gd[3]);c.px(5,j+1,gd[2]);c.px(W-5,j,gd[3]);c.px(W-6,j+1,gd[2])}
  c.rect(0,H-4,W,4,st[1]);c.hline(0,H-4,W,st[5]);
  return done(c,{ax:W/2,ay:H-2,solid:[-W/2,-8,9,8]})};
OB.elfPavilion=()=>{const W=96,H=100,c=new Cv(W,H),st=RP('#e0d8c8',6,.22),rf=RP('#6a9aa8',6,.26),gd=RP('#e8c850',5);gshadow(c,W/2+3,H-4,W*.46,5,.3);
  c.shade(W/2,H-12,40,10,st,{light:[-.4,-.7,.5]});
  [10,28,W-33,W-15].forEach(x=>{c.rect(x,40,6,H-52,(xx,yy)=>st[CL(Math.round(2.6+(x+3-xx)/4+(U.bayer(xx,yy)-.5)*.5),0,5)]);c.hline(x-1,40,8,st[5]);c.hline(x-1,H-14,8,st[1])});
  c.poly([[0,42],[W,42],[W-12,20],[W/2+8,6],[W/2-8,6],[12,20]],(x,y)=>rf[CL(Math.round(2.4+(W/2-x)/W*1.8-(y/50)*.4+(((x>>2)+(y>>2))&1?.35:-.15)+(U.bayer(x,y)-.5)*.5),0,5)]);
  c.hline(0,42,W,gd[3]);c.hline(0,43,W,gd[1]);c.line(W/2,6,W/2,0,gd[3]);c.px(W/2,0,'#fff');
  for(let i=14;i<W-12;i+=9)c.px(i,40,gd[4]);
  return done(c,{ax:W/2,ay:H-4,solid:[-W/2+8,-14,W-16,14],lights:[{x:0,y:-50,r:70,col:'#fff0c0',flicker:.02}]})};
OB.elfRail=(n=3)=>{const W=n*16,H=22,c=new Cv(W,H),st=RP('#e0d8c8',6);c.rect(0,H-6,W,2,st[2]);c.hline(0,H-6,W,st[4]);for(let i=0;i<W;i+=8){c.rect(i+2,H-14,3,10,st[3]);c.px(i+3,H-15,st[4]);}c.rect(0,H-16,W,2,st[3]);c.hline(0,H-16,W,st[5]);for(let i=2;i<W;i+=8)c.px(i+3,H-9,'#e8c850');return done(c,{ax:W/2,ay:H-2,solid:[-W/2,-6,W,6]})};
OB.statue=()=>{const W=30,H=60,c=new Cv(W,H),st=RP('#d8d4cc',6,.22);gshadow(c,W/2+2,H-3,10,3,.3);c.rect(4,H-12,22,10,(x,y)=>st[CL(Math.round(2.6+(15-x)/10),0,5)]);c.hline(4,H-12,22,st[5]);
  c.shade(W/2,H-32,6,16,st,{light:[-.4,-.7,.5]});c.shade(W/2,H-50,4.6,5.4,st,{light:[-.4,-.7,.5]});c.poly([[W/2-12,H-34],[W/2-4,H-44],[W/2-2,H-26]],st[2]);c.poly([[W/2+12,H-34],[W/2+4,H-44],[W/2+2,H-26]],st[1]);c.line(W/2+9,H-46,W/2+9,H-14,'#9a8a60');
  return done(c,{ax:W/2,ay:H-2,solid:[-10,-10,20,10]})};
OB.elfLamp=(o={})=>{const W=18,H=56,c=new Cv(W,H),st=RP('#d8d0c0',5);gshadow(c,W/2+1,H-3,5,2,.3);c.rect(W/2-1,16,3,H-20,st[2]);c.rect(W/2-3,H-8,7,4,st[3]);
  c.poly([[W/2-5,8],[W/2+5,8],[W/2+3,18],[W/2-3,18]],RP('#ffe9a0',4)[3]);c.shade(W/2,12,3,4,RP('#fffbe0',4),{dither:0});c.poly([[W/2-6,8],[W/2,2],[W/2+6,8]],st[3]);
  return done(c,{ax:W/2,ay:H-2,solid:[-2,-3,4,3],lights:[{x:0,y:-44,r:o.r||62,col:o.col||'#ffe8a8',flicker:.03}]})};
OB.councilChair=()=>{const W=26,H=34,c=new Cv(W,H),st=RP('#d0c8b8',6,.22);gshadow(c,W/2+1,H-2,10,2.5,.3);c.rect(3,H-12,20,8,(x,y)=>st[CL(Math.round(2.4+(13-x)/10),0,5)]);c.hline(3,H-12,20,st[5]);c.rect(5,6,16,H-16,(x,y)=>st[CL(Math.round(2.6+(13-x)/12+(y<10?.5:0)),0,5)]);c.hline(5,6,16,st[5]);c.px(13,12,'#e8c850');c.px(12,13,'#e8c850');c.px(14,13,'#e8c850');return done(c,{ax:W/2,ay:H-2,solid:[-10,-8,20,8]})};
OB.fountain=()=>{const W=50,H=54,c=new Cv(W,H),st=RP('#d8d0c0',6,.22);gshadow(c,W/2+2,H-3,22,4,.3);c.shade(W/2,H-12,22,9,st,{light:[-.4,-.7,.5]});c.ell(W/2,H-15,18,6.5,RP('#3a9ad8',5)[1]);c.ell(W/2,H-15,16,5.2,(x,y,dx,dy)=>RP('#6ac8f0',5)[CL(Math.round(2+Math.sin(dx*6+dy*4)*.6+(U.bayer(x,y)-.5)*.6),0,4)]);
  c.rect(W/2-3,H-34,6,22,st[3]);c.shade(W/2,H-34,9,4,st,{light:[-.4,-.7,.5]});for(let i=0;i<14;i++){c.px(W/2-5+i*.8,H-38+Math.abs(i-7)*.5,'#bfe8ff',.8)}
  return done(c,{ax:W/2,ay:H-2,solid:[-20,-12,40,12],lights:[{x:0,y:-20,r:50,col:'#a8e0ff',flicker:.03}]})};
OB.banner=(o={})=>{const W=18,H=48,c=new Cv(W,H),b=RP(o.col||'#4a78c2',5);c.rect(2,0,14,2,'#8a6a30');c.poly([[3,2],[15,2],[15,40],[9,34],[3,40]],(x,y)=>b[CL(Math.round(2.4+(9-x)/6),0,4)]);c.shade(9,16,3,5,RP('#f0f4ff',4),{dither:0});return done(c,{ax:W/2,ay:H-4,solid:null,k:.3})};
/* ---------- MORIA ---------- */
OB.pillar=(o={})=>{const W=o.w||36,H=o.h||110,c=new Cv(W,H),st=RP(o.col||'#5a5a88',6,.26);
  for(let y=0;y<H-4;y++)for(let i=0;i<W;i++){const t=i/W;const w=W-(y<10?6-y*.5:0);if(i<(W-w)/2||i>W-(W-w)/2)continue;let l=2.3+(.5-t)*2.6+(U.noise(i*.4,y*.08,3)-.5)*.8+(U.bayer(i,y)-.5)*.5;const band=y%34;if(band<3)l-=.8;if(band===3)l+=1.2;c.px(i,y,st[CL(Math.round(l),0,5)])}
  for(let y=8;y<H-10;y+=12)for(let i=6;i<W-6;i+=5)if(HS(i,y,2)<.55)c.rect(i,y+3,2,5,'#7ad0ff',.65);
  c.rect(-2,H-8,W+4,8,(x,y)=>st[CL(Math.round(2.6+(W/2-x)/14),0,5)]);c.hline(0,H-8,W,st[5]);c.rect(-2,0,W+4,6,st[3]);c.hline(-2,0,W+4,st[5]);
  return done(c,{ax:W/2,ay:H-2,solid:[-W/2+3,-14,W-6,14],lights:o.glow?[{x:0,y:-60,r:50,col:'#7ad0ff',flicker:.04}]:[]})};
OB.brazier=(o={})=>{const W=22,H=40,c=new Cv(W,H),ir=RP('#4a4a5a',6);gshadow(c,W/2,H-3,8,2.5,.35);c.rect(W/2-2,18,4,H-22,ir[2]);c.rect(W/2-6,H-6,12,3,ir[3]);c.poly([[W/2-8,10],[W/2+8,10],[W/2+5,20],[W/2-5,20]],ir[3]);c.hline(W/2-8,10,16,ir[5]);
  return done(c,{ax:W/2,ay:H-2,solid:[-6,-5,12,5],flame:{x:0,y:-30,s:1.4},lights:[{x:0,y:-32,r:o.r||96,col:'#ff8a30',flicker:.25}]})};
OB.crystal=(o={})=>{const W=28,H=34,c=new Cv(W,H),col=RP(o.col||'#4ac8ff',6,.28);gshadow(c,W/2+1,H-3,10,2.5,.3);
  [[6,H-4,5,14],[13,H-4,7,26],[21,H-4,4,12],[10,H-4,4,10]].forEach(([x,y,w,h],i)=>c.poly([[x-w/2,y],[x-w/2+1,y-h*.7],[x,y-h],[x+w/2-1,y-h*.7],[x+w/2,y]],(px,py)=>col[CL(Math.round(3+(x-px)/w*1.4+(py-(y-h))/h*-1+(U.bayer(px,py)-.5)*.5),0,5)]));
  return done(c,{ax:W/2,ay:H-2,solid:[-8,-6,16,6],lights:[{x:0,y:-14,r:o.r||52,col:o.col||'#4ac8ff',flicker:.06}]})};
OB.skeleton=()=>{const W=34,H=18,c=new Cv(W,H),b=RP('#d8d0b8',5);c.shade(6,H-8,4,4,b,{dither:0});c.px(5,H-9,'#222');c.px(7,H-9,'#222');for(let i=0;i<4;i++)c.hline(10,H-9+i,10-i,b[2]);c.vline(10,H-12,8,b[3]);c.line(16,H-5,28,H-3,b[2]);c.line(18,H-10,30,H-8,b[1]);c.rect(26,H-6,6,2,'#6a6a7a');return done(c,{ax:W/2,ay:H-2,solid:null,k:.3})};
OB.tomb=()=>{const W=60,H=44,c=new Cv(W,H),st=RP('#9a9ab4',6,.24);gshadow(c,W/2+2,H-3,26,4,.3);
  c.shade(W/2,H-12,26,8,st,{light:[-.4,-.7,.5]});c.rect(6,H-26,48,16,(x,y)=>st[CL(Math.round(2.5+(30-x)/24+(y<H-24?.6:0)+(U.bayer(x,y)-.5)*.5),0,5)]);c.hline(6,H-26,48,st[5]);
  for(let i=0;i<10;i++){c.rect(12+i*4,H-22,2,6,'#c8e0ff',.7)}c.hline(10,H-16,40,'#c8e0ff',.5);
  return done(c,{ax:W/2,ay:H-2,solid:[-26,-12,52,12],lights:[{x:0,y:-18,r:44,col:'#9ac8ff',flicker:.05}]})};
OB.rubble=(o={})=>{const W=o.w||34,H=18,c=new Cv(W,H),st=RP(o.col||'#5a5a7a',6,.26);gshadow(c,W/2,H-2,W*.4,2.5,.3);for(let i=0;i<5;i++){c.shade(5+i*(W-10)/4,H-6-HS(i,1,2)*5,4+HS(i,2,2)*3,3+HS(i,3,2)*3,st,{light:[-.4,-.7,.5],noise:.6,seed:i})}return done(c,{ax:W/2,ay:H-2,solid:[-W*.4,-6,W*.8,6]})};
OB.stalagmite=()=>{const W=24,H=46,c=new Cv(W,H),st=RP('#4a4a6a',6,.26);c.poly([[2,H-3],[8,10],[12,0],[16,12],[22,H-3]],(x,y)=>st[CL(Math.round(2.4+(12-x)/10+(U.noise(x*.5,y*.2,3)-.5)*1.2+(U.bayer(x,y)-.5)*.5),0,5)]);return done(c,{ax:W/2,ay:H-2,solid:[-8,-6,16,6]})};
OB.chest=()=>{const W=24,H=22,c=new Cv(W,H),wd=RP('#7a4a28',5),gd=RP('#e8c850',4);gshadow(c,W/2,H-2,10,2,.3);c.rect(3,10,18,10,wd[2]);c.shade(W/2,10,9,5,wd,{light:[-.4,-.7,.5],mask:(x,y)=>y<10});c.hline(3,10,18,gd[2]);c.vline(8,6,14,gd[2]);c.vline(16,6,14,gd[2]);c.rect(10,11,4,4,gd[3]);return done(c,{ax:W/2,ay:H-2,solid:[-9,-8,18,8]})};
OB.durinDoor=()=>{const W=120,H=140,c=new Cv(W,H),st=RP('#2a3050',6,.24),sv=RP('#cfe8ff',4);
  c.region(4,10,W-4,H,(x,y)=>{const dx=x-W/2;return Math.abs(dx)<=50&&(y>62||dx*dx+(y-62)**2<=50*50)},(x,y)=>st[CL(Math.round(1.8+(W/2-x)/60+(y<30?.3:0)+(U.bayer(x,y)-.5)*.5),0,5)]);
  const ring=(r,ang0,ang1,col)=>{for(let a=ang0;a<ang1;a+=.012)c.px(W/2+Math.cos(a)*r,56+Math.sin(a)*r,col)};ring(30,0,6.3,sv[3]);ring(22,0,6.3,sv[2]);ring(5,0,6.3,sv[3]);
  c.vline(W/2,8,H-10,sv[2]);for(let s=-1;s<=1;s+=2){c.line(W/2+s*3,110,W/2+s*26,70,sv[3]);c.line(W/2+s*3,100,W/2+s*20,60,sv[2]);c.line(W/2+s*8,H-10,W/2+s*30,100,sv[2],.8);for(let k=0;k<4;k++)c.px(W/2+s*(30+k*3),44-k*3,sv[3])}
  for(let i=0;i<7;i++){const a=i/7*6.28;c.px(W/2+Math.cos(a)*14,56+Math.sin(a)*14,'#fff')}
  c.hline(W/2-40,30,80,sv[1],.5);for(let i=0;i<28;i++)c.px(W/2-38+i*2.7,26,sv[2],.8);
  return done(c,{ax:W/2,ay:H-2,solid:null,lights:[{x:0,y:-84,r:92,col:'#a8d0ff',flicker:.02}],k:.18})};
/* ---------- LOTHLÓRIEN / AMON HEN ---------- */
OB.flet=()=>{const W=70,H=64,c=new Cv(W,H),wd=RP('#d8d0b0',6,.22);gshadow(c,W/2+3,H-3,26,4,.25);
  c.rect(14,20,42,30,(x,y)=>wd[CL(Math.round(2.4+(35-x)/30+(U.noise(x*.3,y*.1,2)-.5)+(U.bayer(x,y)-.5)*.5),0,5)]);
  c.poly([[6,22],[W-6,22],[W/2,2]],(x,y)=>RP('#e8c050',6)[CL(Math.round(2.4+(W/2-x)/W*1.8-(y/20)*.3+(U.bayer(x,y)-.5)*.5),0,5)]);
  roundWindow(c,W/2,36,7,'#fff0a0','#8a7a50');c.rect(W/2-5,H-18,0,0,'#000');c.rect(8,50,54,5,wd[3]);c.hline(8,50,54,wd[5]);for(let i=10;i<W-8;i+=6)c.vline(i,55,6,wd[1]);
  return done(c,{ax:W/2,ay:H-2,solid:[-26,-10,52,10],lights:[{x:0,y:-28,r:56,col:'#fff0a0',flicker:.03}]})};
OB.lorienLamp=()=>OB.elfLamp({col:'#fff4b0',r:70});
OB.basin=()=>{const W=60,H=56,c=new Cv(W,H),st=RP('#a8a8c4',6,.24);gshadow(c,W/2+2,H-3,24,4,.3);c.shade(W/2,H-12,24,9,st,{light:[-.4,-.7,.5]});c.rect(W/2-5,H-30,10,22,(x,y)=>st[CL(Math.round(2.6+(W/2-x)/8),0,5)]);
  c.shade(W/2,H-32,22,7,st,{light:[-.4,-.7,.5]});c.ell(W/2,H-34,19,5.4,'#1a2a4a');c.ell(W/2,H-34,17,4.4,(x,y,dx,dy)=>RP('#9ae8ff',5)[CL(Math.round(2.4+Math.sin(dx*7+dy*3)*.7+(1-Math.hypot(dx,dy))*1.2),0,4)]);
  return done(c,{ax:W/2,ay:H-2,solid:[-22,-12,44,12],lights:[{x:0,y:-34,r:90,col:'#9ae8ff',flicker:.06}],glowDraw:true})};
OB.fern=()=>{const W=26,H=22,c=new Cv(W,H),g=RP('#3aa05a',5,.28);for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.42,L=10+HS(i,1,3)*4;for(let s=0;s<L;s++){const x=W/2+Math.cos(a)*s*.9,y=H-3+Math.sin(a)*s;c.px(x,y,g[CL(Math.round(2+s/L*2),0,4)]);if(s%2===0){c.px(x+1,y,g[3]);c.px(x-1,y,g[2])}}}return done(c,{ax:W/2,ay:H-1,solid:null,k:.3})};
OB.ruinPillar=(o={})=>{const W=26,H=o.h||70,c=new Cv(W,H),st=RP('#a8a498',6,.24);gshadow(c,W/2+2,H-3,10,3,.3);
  c.region(2,8,W-2,H-4,(x,y)=>y>=8+Math.floor(HS(x>>2,1,3)*8),(x,y)=>st[CL(Math.round(2.5+(W/2-x)/W*2+(U.noise(x*.4,y*.1,3)-.5)*.8+(y%12===0?-.8:0)+(U.bayer(x,y)-.5)*.5),0,5)]);c.rect(0,H-8,W,6,st[3]);c.hline(0,H-8,W,st[5]);
  if(o.moss)for(let i=0;i<W;i++)for(let j=H-30;j<H-8;j++)if(c.solid(i,j)&&HS(i,j,2)<.18)c.px(i,j,RP('#4a8a3a',4)[1+(HS(i,j,3)*3|0)]);
  return done(c,{ax:W/2,ay:H-3,solid:[-10,-8,20,8]})};
OB.seat=()=>{const W=100,H=70,c=new Cv(W,H),st=RP('#b8b4a8',6,.24);gshadow(c,W/2+3,H-3,44,5,.3);
  for(let k=0;k<4;k++){const w=W-8-k*14,y=H-12-k*9;c.rect(4+k*7,y,w,9,(x,y2)=>st[CL(Math.round(2.4+(W/2-x)/W*1.6+(y2===y?1:0)-(y2===y+8?.7:0)+(U.bayer(x,y2)-.5)*.5),0,5)]);}
  c.shade(W/2,16,10,10,st,{light:[-.4,-.7,.5]});c.rect(W/2-12,12,24,14,(x,y)=>st[CL(Math.round(2.6+(W/2-x)/14),0,5)]);
  return done(c,{ax:W/2,ay:H-2,solid:[-W/2+8,-18,W-16,18]})};
OB.boat=()=>{const cv=boatSprite();return{cv,w:44,h:22,ax:22,ay:18,solid:[-18,-8,36,8],lights:[],emit:[]}};
OB.sack=()=>{const W=16,H=16,c=new Cv(W,H),b=RP('#c8a870',5);gshadow(c,W/2+1,H-2,6,2,.3);c.shade(W/2,H-6,5.5,6,b,{light:[-.4,-.7,.5],noise:.5});c.hline(5,H-11,6,b[0]);return done(c,{ax:W/2,ay:H-2,solid:[-5,-5,10,5]})};
OB.signpost=(o={})=>OB.sign(o);
OB.waterfall=(o={})=>{const W=o.w||24,H=o.h||64,c=new Cv(W,H),w=RP('#8ad0f0',6,.24);
  c.rect(0,0,W,H,(x,y)=>{const l=3.0+Math.sin(x*1.7+y*.15)*.7-(y/H)*.4+(U.noise(x*.5,y*.1,2)-.5)*.8+(U.bayer(x,y)-.5)*.6;return w[CL(Math.round(l),0,5)]});
  c.ell(W/2,H-2,W*.55,5,'#e8f6ff',.8);c.ell(W/2,H-1,W*.4,3,'#ffffff',.9);
  return{cv:c.canvas(),w:W,h:H,ax:W>>1,ay:H,solid:[-W/2,-4,W,6],lights:[],emit:[],fall:{w:W,h:H}}};
OB.tallGrass=()=>{const W=24,H=18,c=new Cv(W,H);for(let i=0;i<16;i++){const x=1+i*1.4,h=6+HS(i,1,3)*10,lean=(HS(i,2,3)-.5)*5;for(let j=0;j<h;j++)c.px(x+lean*j/h,H-2-j,RP(i%3?'#5aae3a':'#7ac84a',4)[CL(Math.round(1+j/h*2.4),0,3)])}return done(c,{ax:W/2,ay:H-1,solid:null,k:.3})};
})();
