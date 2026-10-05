'use strict';
/* =========================================================
   scenes.js — 320x200 painted backdrops for dialogue screens.
   Returns {cv, lights, particles, fog} (lights/particles are
   animated by the engine on top of the static painting).
   ========================================================= */
(()=>{
const {Cv,ramp:R,hash:HS,noise:NS,fbm:FB,clamp:CL,mix}=U;
const SW=320,SH=200;
function sky(c,stops,y1=SH){ /* stops: [[y,hex],...] dithered gradient */
  for(let y=0;y<y1;y++){let a=stops[0],b=stops[stops.length-1];for(let i=0;i<stops.length-1;i++){if(y>=stops[i][0]&&y<=stops[i+1][0]){a=stops[i];b=stops[i+1];break}}
    const t=(y-a[0])/Math.max(1,b[0]-a[0]),A=U.rgb(a[1]),B=U.rgb(b[1]);
    for(let x=0;x<c.w;x++){const tt=CL(t+(U.bayer(x,y)-.5)*.16,0,1);c.px(x,y,[A[0]+(B[0]-A[0])*tt,A[1]+(B[1]-A[1])*tt,A[2]+(B[2]-A[2])*tt])}}}
function ridge(c,y0,amp,fx,seed,base,o={}){const rp=R(base,6,.24),fog=o.fog?U.rgb(o.fog):null,fd=o.fade||60;
  for(let x=0;x<c.w;x++){const h=y0+(FB(x*fx+seed*7,seed,seed,4)-.5)*amp*2+(o.slope?x*o.slope:0);
    for(let y=Math.floor(h);y<c.h;y++){const d=y-h;let l=d<1.5?4.4:d<3?3.6:2.4-(d/60)*.8+(NS(x*.12,y*.3,seed)-.5)*.9+(U.bayer(x,y)-.5)*.5;
      let col=rp[CL(Math.round(l),0,5)];if(fog)col=mix(col,fog,CL(1-d/fd,0,1)*(o.fogAmt??.45));c.px(x,y,col)}}}
function cloud(c,x,y,w,h,base,seed){const r=R(base,5,.2);for(let i=0;i<7;i++){const cx=x+(HS(i,1,seed)-.5)*w,cy=y+(HS(i,2,seed)-.5)*h*.6,rr=h*(.5+HS(i,3,seed)*.5);c.shade(cx,cy,rr*1.7,rr*.8,r,{light:[-.4,-.8,.4],noise:.4,dither:.9,seed:i+seed})}}
function glow(c,x,y,r,col,a=.5){const[R_,G,B]=U.rgb(col);for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const d=Math.hypot(i,j)/r;if(d<1)c.px(x+i,y+j,[R_,G,B],a*Math.pow(1-d,2))}}
function stars(c,n,y1,seed,col='#fff'){for(let i=0;i<n;i++){const x=HS(i,1,seed)*c.w,y=HS(i,2,seed)*y1;c.px(x,y,col,.4+HS(i,3,seed)*.6);if(HS(i,4,seed)>.93){c.px(x+1,y,col,.4);c.px(x-1,y,col,.4);c.px(x,y+1,col,.4);c.px(x,y-1,col,.4)}}}
function moon(c,x,y,r,col='#f4f0e0'){const mr=R(col,5,.18);c.shade(x,y,r,r,mr,{light:[-.3,-.4,.8],dither:.4,noise:.3,seed:3});glow(c,x,y,r*3,col,.12)}
function forestSil(c,y0,base,seed,n,hgt){const r=R(base,5,.22);for(let i=0;i<n;i++){const x=(i+.5)*c.w/n+(HS(i,1,seed)-.5)*8,h=hgt*(.6+HS(i,2,seed)*.6),w=h*.34;
  for(let k=0;k<5;k++){const yy=y0-h+k*h*.2,ww=w*(.3+k*.18);c.region(x-ww,yy,x+ww,yy+h*.3,(px,py)=>{const t=(py-yy)/(h*.3);return Math.abs(px-x)<=ww*(.35+t*.65)},(px,py)=>r[CL(Math.round(1.6+(x-px)/ww*.9+(U.bayer(px,py)-.5)*.6),0,4)])}
  c.rect(x-1,y0-2,2,4,r[0])}}
function spr(cv,o,x,y){const k=cv.getContext('2d');k.imageSmoothingEnabled=false;k.drawImage(o.cv,Math.round(x-o.ax),Math.round(y-o.ay))}
function pillar(c,x,w,top,bot,base,seed,rune){const r=R(base,6,.26);for(let y=top;y<bot;y++)for(let i=0;i<w;i++){const u=i/w,l=2.3+(0.5-u)*2.4+(NS(i*.4,y*.08,seed)-.5)*.8+(U.bayer(x+i,y)-.5)*.5;let col=r[CL(Math.round(l),0,5)];
    const band=(y-top)%40;if(band<3||band>36)col=r[CL(Math.round(l)-1,0,5)];if(band===3||band===37)col=r[5];c.px(x+i,y,col)}
  if(rune)for(let y=top+6;y<bot-6;y+=12)for(let i=3;i<w-3;i+=4)if(HS(i,y,seed)<.5)c.rect(x+i,y,2,5,rune,.75)}
function arch(c,cx,by,w,h,base,seed){const r=R(base,6,.26);const R_=w/2;c.region(cx-R_-5,by-h-R_-6,cx+R_+5,by,(x,y)=>{const dx=x+.5-cx;if(Math.abs(dx)>R_+5)return false;if(y<by-h){return dx*dx+(y-(by-h))**2<=(R_+5)**2}return true},(x,y)=>{const dx=x+.5-cx,dd=y<by-h?Math.hypot(dx,y-(by-h)):Math.abs(dx);if(dd<R_)return null;return r[CL(Math.round(2.4+(cx-x)/12+(U.bayer(x,y)-.5)*.5),0,5)]})}

const SC={};
SC.shireDay=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#3f93e0'],[70,'#8fd0f4'],[140,'#f6e8b0'],[200,'#fff2c8']]);
  cloud(c,60,34,70,16,'#ffffff',3);cloud(c,210,24,80,14,'#fff4e8',8);cloud(c,150,56,50,10,'#fffaf0',5);
  ridge(c,112,10,.012,1,'#6aa8c0',{fog:'#e8f0f8',fade:80});ridge(c,128,12,.02,2,'#4a9a5a',{fog:'#d8f0d8',fade:60,fogAmt:.35});ridge(c,146,10,.03,3,'#3aa04a');
  const k=U.canvas(SW,SH);k.getContext('2d').drawImage(c.canvas(),0,0);const cv=k;
  spr(cv,OB.smial({door:'#c0392b'}),70,160);spr(cv,OB.hole({}),210,182);
  const k2=cv.getContext('2d');
  /* foreground flowers + path */
  const f=new Cv(SW,SH);ridge(f,176,5,.04,9,'#4aa83a');for(let i=0;i<110;i++){const x=HS(i,1,4)*SW,y=170+HS(i,2,4)*30;const col=U.pick(['#ff5a7a','#ffd23a','#fff','#c58bff','#ff9a3a'],U.rng(i));f.px(x,y,col);f.px(x+1,y,col);f.px(x,y-1,R(col,3)[2]);f.vline(x,y+1,3,'#2f7a2f')}
  k2.drawImage(f.canvas(),0,0);
  return{cv,lights:[{x:230,y:150,r:20,col:'#ffd890',a:.5}],particles:{type:'petal',n:22,col:['#ff9ab8','#ffe27a','#fff']}}};
SC.shireDusk=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#1c1850'],[50,'#6a2a78'],[100,'#e0508a'],[140,'#ff9a50'],[200,'#ffd070']]);stars(c,40,60,5);
  cloud(c,80,60,80,14,'#ff9ab0',3);cloud(c,230,48,70,12,'#ffb890',6);
  ridge(c,120,10,.014,1,'#6a4a88',{fog:'#ffa070',fade:70});ridge(c,138,12,.02,2,'#3a6a58',{fog:'#ff9a70',fade:50,fogAmt:.3});ridge(c,154,8,.03,3,'#2a7a48');
  const cv=c.canvas();
  spr(cv,OB.partyTree(),240,190);spr(cv,OB.smial({door:'#2f9a4a'}),60,176);
  const f=new Cv(SW,SH);ridge(f,182,4,.05,9,'#2f8a3a');cv.getContext('2d').drawImage(f.canvas(),0,0);
  const L=[];for(let i=0;i<12;i++)L.push({x:20+i*26,y:110+Math.sin(i*.9)*8,r:18,col:['#ffb050','#ff6a8a','#7ad8ff','#ffe27a'][i%4],a:.55});
  return{cv,lights:L,particles:{type:'firework',n:6},fog:null}};
SC.bagend=()=>{const c=new Cv(SW,SH),wd=R('#7a4a28',6,.26),pl=R('#9a6a3c',6,.26);
  c.rect(0,0,SW,SH,(x,y)=>{const l=2.2+(y/SH)*.2+(NS(x*.02,y*.3,2)-.5)*.5;return wd[CL(Math.round(l+(U.bayer(x,y)-.5)*.5),0,5)]});
  for(let x=0;x<SW;x+=22)c.vline(x,0,150,wd[0]); /* wall boards */
  for(let y=150;y<SH;y++)for(let x=0;x<SW;x++){const row=Math.floor((y-150)/8),v=(y-150)%8;c.px(x,y,v===0?pl[0]:pl[CL(Math.round(2.4+(HS(row,0,1)-.5)+(NS(x*.05,y*.5,3)-.5)*.8),0,5)])}
  /* round window w/ garden */
  const wx=250,wy=70,wr=44;c.ell(wx,wy,wr+5,wr+5,wd[0]);c.shade(wx,wy,wr+4,wr+4,R('#3a2414',5),{light:[-.3,-.5,.7]});
  c.ell(wx,wy,wr,wr,(x,y)=>{const d=(y-(wy-wr))/(wr*2);if(d<.5)return R('#6ab8f0',4)[CL(Math.round(2.4-d*2+(U.bayer(x,y)-.5)*.6),0,3)];return R('#4aaa3a',5)[CL(Math.round(2+(d-.5)*2+(NS(x*.2,y*.2,2)-.5)*1.4+(U.bayer(x,y)-.5)*.5),0,4)]});
  for(let i=0;i<24;i++){const x=wx-34+HS(i,1,2)*68,y=wy+6+HS(i,2,2)*34;if(Math.hypot(x-wx,y-wy)<wr-3){const col=U.pick(['#ff5a7a','#ffd23a','#fff','#c58bff'],U.rng(i));c.px(x,y,col);c.px(x+1,y,col)}}
  c.vline(wx,wy-wr,wr*2,'#3a2414');c.hline(wx-wr,wy,wr*2,'#3a2414');c.vline(wx+1,wy-wr,wr*2,'#6a4a2a');
  glow(c,wx,wy,70,'#ffe9a0',.22);
  /* hearth */
  const hx=70,hy=150;c.rect(hx-34,hy-62,68,62,R('#8a8a96',5)[2]);for(let j=0;j<62;j+=8)for(let i=0;i<68;i+=12){const off=(j/8&1)*6;c.rect(hx-34+i+off,hy-62+j,11,7,R('#8a8a96',5)[1+(HS(i,j,3)*3|0)])}
  c.rect(hx-22,hy-42,44,42,'#1a0c08');c.shade(hx,hy-12,20,30,R('#ff7a1a',6),{light:[0,-.9,.4],dither:.9,mask:(x,y)=>y<hy});
  c.rect(hx-40,hy-66,80,6,R('#6a4a2a',5)[3]);[[-26,-76],[0,-74],[24,-78]].forEach(([dx,dy],i)=>{c.rect(hx+dx,hy+dy,8,10,R(['#c8a040','#9a4a3a','#4a7a9a'][i],4)[2]);c.hline(hx+dx,hy+dy,8,'#fff6')});
  glow(c,hx,hy-20,90,'#ff8a30',.28);
  /* bookshelf + kettle + lantern */
  c.rect(150,40,50,110,wd[0]);c.rect(152,42,46,106,wd[1]);[0,1,2,3].forEach(r=>{const y=46+r*26;c.rect(152,y+22,46,3,wd[3]);for(let i=0;i<9;i++){const bh=14+HS(i,r,2)*7,col=U.pick(['#8a3a3a','#3a5a8a','#3a7a4a','#c8a040','#6a3a7a'],U.rng(i+r*9));c.rect(154+i*5,y+22-bh,4,bh,col);c.vline(154+i*5,y+22-bh,bh,R(col,3)[2])}});
  return{cv:c.canvas(),lights:[{x:70,y:130,r:70,col:'#ff8a30',a:.35,flick:.15},{x:250,y:70,r:70,col:'#ffe9a0',a:.25}],particles:{type:'dust',n:30,col:['#ffe9a0']}}};
SC.road=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#7aa8c8'],[80,'#c8dcd8'],[140,'#f0ecd0'],[200,'#f0ecd0']]);cloud(c,160,30,200,12,'#ffffff',4);
  ridge(c,100,12,.014,5,'#7a98a0',{fog:'#e0ecf0',fade:70});forestSil(c,130,'#3a7a58',3,16,60);ridge(c,140,6,.03,3,'#3a8a4a',{fog:'#c8e4c0',fade:40});forestSil(c,160,'#2a6a40',5,10,80);
  const f=new Cv(SW,SH);for(let y=150;y<SH;y++)for(let x=0;x<SW;x++){const d=Math.abs(x-(150+(y-150)*.8))-(8+(y-150)*.9);if(d<0)f.px(x,y,R('#b8884a',5)[CL(Math.round(2+(NS(x*.1,y*.3,2)-.5)*2+(U.bayer(x,y)-.5)*.6),0,4)]);else f.px(x,y,R('#3a9a3a',5)[CL(Math.round(2.2+(NS(x*.1,y*.2,3)-.5)*1.6+(U.bayer(x,y)-.5)*.6),0,4)])}
  const cv=c.canvas();cv.getContext('2d').drawImage(f.canvas(),0,0);
  return{cv,lights:[],particles:{type:'leaf',n:16,col:['#c8e870','#e8c850']},fog:'#e8f0f0'}};
SC.bree=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#0c1030'],[80,'#1c2a5a'],[150,'#3a4a7a'],[200,'#4a5a8a']]);stars(c,50,70,3);moon(c,262,34,12);
  ridge(c,120,10,.02,4,'#1c2a48',{fog:'#2a3a68',fade:50});
  const cv=c.canvas(),k=cv.getContext('2d');k.imageSmoothingEnabled=false;
  const mk=(x,w,h,wall,roof,seed)=>{const hc=new Cv(w,h+40);const wl=R(wall,6,.24),rf=R(roof,6,.26);OBH.timberFrame(hc,0,30,w,h,wl,R('#3a2414',5),seed,{floors:2,cw:24,diag:1});
    const rp=new Cv(w+10,34);for(let j=0;j<34;j++){const t=j/34;for(let i=Math.round(t*w*.0);i<w+10-Math.round(t*0);i++){rp.px(i,j,rf[CL(Math.round(2.2-(j/34)*.8+(U.bayer(i,j)-.5)*.5+(((i>>2)+(j>>2))&1?.3:0)),0,5)])}}
    hc.stamp(rp,-5,2);OBH.rectWindow(hc,10,40,8,10,'#ffcf6a','#2a1a10',{shutters:'#3a5a8a'});OBH.rectWindow(hc,w-20,40,8,10,'#ffcf6a','#2a1a10',{shutters:'#3a5a8a'});OBH.rectWindow(hc,w/2-4,h-4,8,10,'#ffb84a','#2a1a10');OBH.archDoor(hc,Math.round(w*.3),h+30,10,18,'#6a3a1a');hc.outline(.25);k.drawImage(hc.canvas(),x,SH-h-26)};
  mk(8,92,70,'#c8a878','#7a3a2a',1);mk(110,100,86,'#d8c8a0','#3a4a5a',2);mk(222,100,76,'#b88a60','#6a4a2a',3);
  const g=new Cv(SW,SH);for(let y=170;y<SH;y++)for(let x=0;x<SW;x++)g.px(x,y,R('#6a6a78',5)[CL(Math.round(1.6+(NS(x*.2,y*.4,2)-.5)*2+(U.bayer(x,y)-.5)*.6),0,4)]);k.drawImage(g.canvas(),0,0);
  spr(cv,OB.lamp({}),60,190);spr(cv,OB.lamp({}),270,190);
  return{cv,lights:[{x:60,y:150,r:60,col:'#ffb050',a:.5,flick:.1},{x:270,y:150,r:60,col:'#ffb050',a:.5,flick:.1},{x:160,y:130,r:60,col:'#ffb84a',a:.3}],particles:{type:'dust',n:18,col:['#aab8ff']},fog:'#4a5a8a'}};
SC.pony=()=>{const c=new Cv(SW,SH),wd=R('#6a3e1e',6,.26);
  c.rect(0,0,SW,SH,(x,y)=>wd[CL(Math.round(2.0+(NS(x*.03,y*.2,3)-.5)*1.2+(U.bayer(x,y)-.5)*.5),0,5)]);
  for(let x=0;x<SW;x+=26)c.vline(x,0,160,wd[0]);for(let i=0;i<5;i++){const bx=i*70;c.rect(bx,0,10,160,wd[0]);c.rect(bx+1,0,8,160,R('#3a2210',4)[2])} c.rect(0,0,SW,12,R('#3a2210',4)[1]);
  for(let y=150;y<SH;y++)for(let x=0;x<SW;x++){const v=(y-150)%9;c.px(x,y,v===0?R('#8a5a2a',5)[0]:R('#a87438',5)[CL(Math.round(2.2+(HS(Math.floor((y-150)/9),x>>5,1)-.5)+(U.bayer(x,y)-.5)*.5),0,4)])}
  /* fireplace */
  c.rect(112,40,96,110,R('#7a7a88',5)[1]);for(let j=0;j<110;j+=9)for(let i=0;i<96;i+=14)c.rect(112+i+((j/9&1)*7),40+j,13,8,R('#7a7a88',5)[1+(HS(i,j,3)*3|0)]);
  c.rect(130,80,60,70,'#120804');c.shade(160,130,26,40,R('#ff7a1a',6),{light:[0,-.9,.4],dither:.9,mask:(x,y)=>y<150});glow(c,160,120,110,'#ff8a30',.3);
  /* hanging lanterns & mugs */
  [40,250,290].forEach((x,i)=>{c.vline(x,12,26+i*4,'#2a1a10');c.shade(x,44+i*4,6,8,R('#ffb84a',5),{light:[0,-.5,.8],dither:.3});c.rect(x-6,38+i*4,12,2,'#2a1a10')});
  const t=new Cv(SW,SH);[[20,170],[250,176]].forEach(([x,y])=>{t.rect(x,y-6,60,6,R('#a87438',5)[3]);t.rect(x+4,y,6,20,R('#6a4a22',4)[1]);t.rect(x+50,y,6,20,R('#6a4a22',4)[1]);for(let i=0;i<3;i++){t.rect(x+8+i*16,y-14,8,8,R('#d8d8e8',4)[2]);t.rect(x+8+i*16,y-14,8,2,'#fff');t.px(x+16+i*16,y-10,'#d8d8e8')}});
  const cv=c.canvas();cv.getContext('2d').drawImage(t.canvas(),0,0);
  return{cv,lights:[{x:160,y:110,r:110,col:'#ff8a30',a:.4,flick:.2},{x:40,y:50,r:40,col:'#ffb84a',a:.4,flick:.1},{x:250,y:54,r:40,col:'#ffb84a',a:.4,flick:.1}],particles:{type:'ember',n:20,col:['#ffb050','#ff7a1a']}}};
SC.weathertop=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#070a22'],[90,'#1a2450'],[150,'#2a3a6a'],[200,'#3a4a78']]);stars(c,80,100,7);moon(c,70,40,16,'#e8ecff');
  ridge(c,140,16,.014,6,'#1a2848',{fog:'#2a3a68',fade:50});
  const hill=new Cv(SW,SH);ridge(hill,150,12,.02,2,'#1c3a3a');const cv=hill.canvas();
  const k0=c.canvas();const k=k0.getContext('2d');k.drawImage(cv,0,0);k.imageSmoothingEnabled=false;
  /* ruined tower */
  const t=new Cv(SW,SH),st=R('#6a6a8a',6,.26);const wall=(x0,x1,y0,y1,seed)=>t.rect(x0,y0,x1-x0,y1-y0,(x,y)=>{const u=(x-x0)/(x1-x0);return st[CL(Math.round(2.2+(.5-u)*1.6+(NS(x*.3,y*.4,seed)-.5)*1.2+(((x>>3)+(y>>2))&1?.3:-.2)+(U.bayer(x,y)-.5)*.5),0,5)]});
  wall(190,230,70,160,2);wall(232,270,100,160,3);wall(160,190,120,160,4);
  /* jagged broken tops */
  for(let x=190;x<230;x++){const j=Math.floor(HS(x>>1,1,2)*10);t.rect(x,70,1,0,'#000')}
  for(let x=190;x<230;x+=6){t.rect(x,62+HS(x,1,5)*10,6,10,st[3])}t.rect(194,90,8,14,'#0a0c1c');t.rect(212,100,8,12,'#0a0c1c');
  for(let x=232;x<270;x+=7)t.rect(x,92+HS(x,2,5)*8,7,12,st[2]);
  k.drawImage(t.canvas(),0,0);
  const g=new Cv(SW,SH);ridge(g,172,6,.04,9,'#142a2a');k.drawImage(g.canvas(),0,0);
  return{cv:k0,lights:[{x:80,y:170,r:60,col:'#ff8a30',a:.5,flick:.25}],particles:{type:'ember',n:26,col:['#ffb050','#ff7a1a']},fog:'#4a5a8a'}};
SC.rivendell=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#6a98d0'],[60,'#c8c0e0'],[110,'#ffd8a0'],[200,'#ffe8b8']]);cloud(c,80,26,100,10,'#fff0e0',2);cloud(c,230,40,80,10,'#ffe4d0',4);
  ridge(c,70,28,.012,3,'#8a8ab0',{fog:'#f0e0d8',fade:80});ridge(c,92,22,.016,1,'#6a8a8a',{fog:'#e8e0c8',fade:70,fogAmt:.5});
  /* waterfalls */
  const wf=new Cv(SW,SH);[[210,0],[270,0]].forEach(([x,_],i)=>{for(let y=70;y<150;y++)for(let dx=-4-i;dx<=4+i;dx++){const l=3.2+Math.sin(y*.5+dx*1.7+i)*.7;wf.px(x+dx+(i?0:0),y,R('#8ad0f0',5)[CL(Math.round(l),0,4)])}});
  const cv=c.canvas(),k=cv.getContext('2d');k.imageSmoothingEnabled=false;k.drawImage(wf.canvas(),0,0);
  const f=new Cv(SW,SH);ridge(f,128,8,.03,4,'#5a8a58',{fog:'#e8d8a0',fade:50,fogAmt:.3});k.drawImage(f.canvas(),0,0);
  /* elven arches */
  const ar=new Cv(SW,SH);[[90,170,70,80],[200,176,56,60]].forEach(([x,by,w,h],i)=>{arch(ar,x,by,w,h,'#d8d0c0',i)});k.drawImage(ar.canvas(),0,0);
  spr(cv,OB.beech({w:100,h:110}),30,190);spr(cv,OB.beech({w:90,h:100,leaf:'#e8a030',seed:4}),290,194);
  const g=new Cv(SW,SH);ridge(g,184,4,.05,9,'#7a9a4a');k.drawImage(g.canvas(),0,0);
  return{cv,lights:[{x:160,y:90,r:100,col:'#ffe8b0',a:.3}],particles:{type:'leaf',n:30,col:['#e0742a','#e8a030','#c8501a']},fog:'#f0e4d0'}};
SC.council=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#7aa0d8'],[70,'#d8d0e8'],[130,'#ffe8c0'],[200,'#ffe8c0']]);ridge(c,80,22,.014,3,'#7a88b0',{fog:'#f4e8d8',fade:80});
  const cv=c.canvas(),k=cv.getContext('2d');k.imageSmoothingEnabled=false;spr(cv,OB.beech({w:110,h:120,seed:6}),40,150);spr(cv,OB.beech({w:100,h:110,leaf:'#e8a030',seed:8}),280,150);
  const f=new Cv(SW,SH);for(let y=130;y<SH;y++)for(let x=0;x<SW;x++){const t=(y-130)/70;f.px(x,y,R('#c8c0b0',6)[CL(Math.round(2.4+Math.sin(x*.08)*.3-t*.5+(NS(x*.1,y*.3,3)-.5)*.8+(U.bayer(x,y)-.5)*.5),0,5)])}
  for(let x=0;x<SW;x+=20)f.vline(x,130,70,R('#8a8478',5)[0],.3);for(let y=130;y<SH;y+=14)f.hline(0,y,SW,R('#8a8478',5)[0],.3);
  /* stone seats */
  [[100,166],[160,170],[220,166]].forEach(([x,y])=>{f.shade(x,y,20,10,R('#d0c8b8',6),{light:[-.4,-.7,.5]});f.rect(x-18,y-24,36,18,R('#e0d8c8',6)[3]);f.hline(x-18,y-24,36,'#fff')});
  k.drawImage(f.canvas(),0,0);
  return{cv,lights:[{x:160,y:100,r:120,col:'#fff0c0',a:.25}],particles:{type:'leaf',n:20,col:['#e0742a','#e8a030']},fog:null}};
SC.moriaGate=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#050818'],[80,'#10183a'],[200,'#1c2850']]);stars(c,70,90,4);moon(c,250,32,10,'#dfe8ff');
  ridge(c,60,30,.012,6,'#1a2038',{fog:'#2a3860',fade:90});
  const cliff=new Cv(SW,SH);for(let y=40;y<SH;y++)for(let x=60;x<260;x++){const l=2+(NS(x*.07,y*.03,3)-.5)*3+(U.bayer(x,y)-.5)*.5-(x-60)/200*.6;cliff.px(x,y,R('#4a4a68',6)[CL(Math.round(l),0,5)])}
  const cv=c.canvas(),k=cv.getContext('2d');k.imageSmoothingEnabled=false;k.drawImage(cliff.canvas(),0,0);
  /* Doors of Durin: tall arch, moon-silver tracery */
  const d=new Cv(SW,SH);const cxd=160;d.region(cxd-46,60,cxd+46,160,(x,y)=>{const dx=x-cxd;return Math.abs(dx)<=44&&(y>100||dx*dx+(y-100)**2<=44*44)},(x,y)=>R('#2a3050',5)[CL(Math.round(1.6+(cxd-x)/50+(U.bayer(x,y)-.5)*.5),0,4)]);
  for(let a=0;a<2*Math.PI;a+=.01){const r1=28;d.px(cxd+Math.cos(a)*r1,86+Math.sin(a)*r1,'#cfe8ff')}
  d.line(cxd,56,cxd,150,'#cfe8ff');for(let k2=-1;k2<=1;k2+=2){d.line(cxd+k2*10,130,cxd+k2*30,100,'#cfe8ff',.8);d.line(cxd+k2*10,110,cxd+k2*24,80,'#cfe8ff',.6)}
  for(let i=0;i<7;i++){const a=i/7*6.28,x=cxd+Math.cos(a)*10,y=86+Math.sin(a)*10;d.px(x,y,'#fff');d.px(x+1,y,'#cfe8ff')}
  d.hline(cxd-44,66,88,'#9ac0ff',.4);for(let i=0;i<26;i++)d.px(cxd-40+i*3.1,72,'#9ac0ff',.7);
  glow(d,cxd,86,60,'#9ac8ff',.18);k.drawImage(d.canvas(),0,0);
  /* lake + holly trees */
  const l=new Cv(SW,SH);for(let y=160;y<SH;y++)for(let x=0;x<SW;x++)l.px(x,y,R('#1a3a58',5)[CL(Math.round(1.3+Math.sin(x*.3+y*.8)*.5+(NS(x*.05,y*.3,3)-.5)*.9+(U.bayer(x,y)-.5)*.5),0,4)]);k.drawImage(l.canvas(),0,0);
  spr(cv,OB.deadtree({}),30,170);spr(cv,OB.deadtree({}),290,178);
  return{cv,lights:[{x:160,y:90,r:80,col:'#9ac8ff',a:.35,flick:.05}],particles:{type:'dust',n:20,col:['#9ac0ff']},fog:'#2a3860'}};
SC.moria=()=>{const c=new Cv(SW,SH);c.rect(0,0,SW,SH,(x,y)=>R('#161a30',6)[CL(Math.round(1.2+(y/SH)*.8+(NS(x*.04,y*.05,3)-.5)*.6),0,5)]);
  /* receding rows of pillars */
  for(let row=0;row<4;row++){const sc=1-row*.2,base=R(['#6a6a98','#5a5a88','#4a4a78','#3a3a68'][row],6,.26);const w=Math.round(30*sc);for(let i=-1;i<6;i++){const x=Math.round(i*(78*sc)+(row%2)*30+(row*9));pillar(c,x,w,0,SH-30+row*8,['#7a7aa8','#6a6a98','#5a5a88','#46467a'][row],row*5+i,row<2?'#8ad0ff':null)}}
  /* floor */
  for(let y=SH-34;y<SH;y++)for(let x=0;x<SW;x++){const t=(y-(SH-34))/34;c.px(x,y,R('#4a4a68',6)[CL(Math.round(1.4+t*.5+(NS(x*.1,y*.4,3)-.5)*.8+(U.bayer(x,y)-.5)*.5),0,5)])}
  /* blue crystal glow & braziers */
  [[60,SH-30],[250,SH-30]].forEach(([x,y])=>{glow(c,x,y-10,50,'#ff8a30',.5)});
  const cv=c.canvas();
  return{cv,lights:[{x:60,y:150,r:70,col:'#ff8a30',a:.55,flick:.2},{x:250,y:150,r:70,col:'#ff8a30',a:.5,flick:.2},{x:160,y:60,r:90,col:'#7aa8ff',a:.25}],particles:{type:'dust',n:30,col:['#8aa8ff']},fog:'#2a2a50'}};
SC.bridge=()=>{const c=new Cv(SW,SH);c.rect(0,0,SW,SH,(x,y)=>R('#1a1020',6)[CL(Math.round(1+(y/SH)*1.2+(NS(x*.05,y*.06,5)-.5)*.8),0,5)]);
  /* chasm glow from below */
  for(let y=100;y<SH;y++)for(let x=0;x<SW;x++){const t=(y-100)/100;if(NS(x*.04,y*.05,2)<.6+t*.3)c.px(x,y,R('#ff5a10',6)[CL(Math.round(1+t*3.4+(NS(x*.1,y*.2,3)-.5)*1.4+(U.bayer(x,y)-.5)*.6),0,5)],.85)}
  /* bridge */
  c.rect(0,84,SW,10,R('#6a6a90',5)[2]);c.hline(0,84,SW,R('#9a9ac0',5)[4]);c.hline(0,93,SW,'#0a0610');
  /* balrog silhouette w/ flame */
  const bz=new Cv(SW,SH);const bx=210,by=40;bz.shade(bx,by+30,36,40,R('#0a0408',5),{dither:0});bz.poly([[bx-36,by+10],[bx-70,by-30],[bx-46,by-4],[bx-20,by-10],[bx-30,by-40],[bx-12,by-20]],'#0a0408');bz.poly([[bx+36,by+10],[bx+70,by-30],[bx+46,by-4]],'#0a0408');
  bz.shade(bx,by,14,16,R('#0a0408',5),{dither:0});bz.px(bx-5,by-3,'#ffcf40');bz.px(bx+5,by-3,'#ffcf40');bz.poly([[bx-10,by-12],[bx-14,by-26],[bx-4,by-14]],'#0a0408');bz.poly([[bx+10,by-12],[bx+14,by-26],[bx+4,by-14]],'#0a0408');
  for(let i=0;i<120;i++){const a=HS(i,1,3)*6.28,r=30+HS(i,2,3)*50,x=bx+Math.cos(a)*r*1.3,y=by+30+Math.sin(a)*r*.9;if(y<95)bz.px(x,y,['#ff9a20','#ff5a10','#ffd040'][i%3],.5+HS(i,3,3)*.5)}
  const cv=c.canvas(),k=cv.getContext('2d');k.drawImage(bz.canvas(),0,0);
  return{cv,lights:[{x:210,y:70,r:130,col:'#ff5a10',a:.55,flick:.35}],particles:{type:'ember',n:50,col:['#ff9a20','#ff5a10','#ffd040']},fog:null}};
SC.lorien=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#8ad0c0'],[70,'#e8f0b0'],[200,'#ffe890']]);
  const cv=c.canvas(),k=cv.getContext('2d');k.imageSmoothingEnabled=false;
  for(let i=0;i<6;i++){const o=OB.mallorn({w:90+i%2*20,h:150+i%3*10});k.globalAlpha=.55+i*.07;spr(cv,o,24+i*58+((i%2)*12),180+((i%3)*6)-i*2)}k.globalAlpha=1;
  const l=new Cv(SW,SH);for(let i=0;i<5;i++){const x=40+i*60;for(let y=0;y<SH;y++)for(let dx=-10;dx<=10;dx++){const a=(1-Math.abs(dx)/10)*.14*(1-y/SH);l.px(x+dx+y*.25,y,'#fff8c0',a)}}k.drawImage(l.canvas(),0,0);
  const g=new Cv(SW,SH);ridge(g,176,4,.05,9,'#d8a83a');k.drawImage(g.canvas(),0,0);
  return{cv,lights:[{x:160,y:80,r:140,col:'#fff0a0',a:.3}],particles:{type:'leaf',n:30,col:['#ffe27a','#ffd040','#fff0a0']},fog:null}};
SC.mirror=()=>{const c=new Cv(SW,SH);c.rect(0,0,SW,SH,(x,y)=>R('#0a1020',6)[CL(Math.round(.8+(y/SH)*.8+(NS(x*.05,y*.05,3)-.5)*.6),0,5)]);
  for(let i=0;i<8;i++)c.line(i*46,0,i*46+20,SH,R('#1a2a4a',4)[1],.5);
  const st=R('#9a9ab4',6,.26);c.shade(160,152,52,16,st,{light:[-.4,-.7,.5]});c.rect(150,130,20,28,(x,y)=>st[CL(Math.round(2.4+(160-x)/20+(U.bayer(x,y)-.5)*.5),0,5)]);
  c.ell(160,128,46,12,R('#3a4a6a',5)[1]);c.ell(160,128,42,10,(x,y,dx,dy)=>R('#9ae0ff',5)[CL(Math.round(2+Math.sin((dx*5+dy*3))*.7+(1-Math.hypot(dx,dy))*1.4+(U.bayer(x,y)-.5)*.6),0,4)]);
  glow(c,160,120,110,'#9ae8ff',.3);c.rect(0,170,SW,30,'#06080f');
  const cv=c.canvas();return{cv,lights:[{x:160,y:122,r:130,col:'#9ae8ff',a:.55,flick:.08}],particles:{type:'dust',n:40,col:['#cfffff']},fog:null}};
SC.amonhen=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#4a88d0'],[70,'#a8d0f0'],[140,'#f4f0d0'],[200,'#f4f0d0']]);cloud(c,90,30,120,12,'#fff',2);
  ridge(c,100,22,.012,4,'#7a90a8',{fog:'#e8f0f4',fade:80});
  /* river + two distant statues (silhouette) */
  const rv=new Cv(SW,SH);for(let y=120;y<SH;y++)for(let x=0;x<SW;x++)rv.px(x,y,R('#4aa0d8',5)[CL(Math.round(2+Math.sin(x*.2+y*.9)*.4+(NS(x*.05,y*.3,3)-.5)+(U.bayer(x,y)-.5)*.5),0,4)]);
  const cv=c.canvas(),k=cv.getContext('2d');k.imageSmoothingEnabled=false;
  [[30,0],[290,0]].forEach(([x])=>{const s=new Cv(60,110),st=R('#6a7a8a',5);s.rect(10,40,40,70,(xx,yy)=>st[CL(Math.round(2+(30-xx)/30+(U.bayer(xx,yy)-.5)*.5),0,4)]);s.shade(30,28,14,16,st,{light:[-.4,-.6,.5]});s.rect(2,50,10,16,st[1]);s.rect(48,50,10,16,st[1]);k.drawImage(s.canvas(),x-30,22)});
  k.drawImage(rv.canvas(),0,0);
  const f=new Cv(SW,SH);ridge(f,160,8,.03,9,'#6a8a48');k.drawImage(f.canvas(),0,0);
  const o=new Cv(SW,SH);const st2=R('#a8a498',6,.26);[[60,170,26,70],[120,176,22,50],[250,172,28,80]].forEach(([x,by,w,h],i)=>o.rect(x,by-h,w,h,(xx,yy)=>st2[CL(Math.round(2.4+(x-xx)/w*1.2+(NS(xx*.3,yy*.2,i)-.5)*.8+(U.bayer(xx,yy)-.5)*.5),0,5)]));k.drawImage(o.canvas(),0,0);
  spr(cv,OB.oak({w:80,h:100}),290,196);spr(cv,OB.oak({w:70,h:90}),20,198);
  return{cv,lights:[],particles:{type:'leaf',n:16,col:['#c8e870','#e8c850']}}};
SC.dark=()=>{const c=new Cv(SW,SH);c.rect(0,0,SW,SH,(x,y)=>R('#0a0612',6)[CL(Math.round(.6+(NS(x*.03,y*.03,3))*1.4+(U.bayer(x,y)-.5)*.5),0,5)]);return{cv:c.canvas(),lights:[{x:160,y:90,r:100,col:'#ff5a10',a:.25,flick:.3}],particles:{type:'ember',n:30,col:['#ff5a10','#ffa030']}}};
SC.eye=()=>{const c=new Cv(SW,SH);c.rect(0,0,SW,SH,'#050206');glow(c,160,90,90,'#ff4a10',.5);
  c.ell(160,90,34,60,'#ffb020');c.ell(160,90,26,56,'#ff6a10');c.ell(160,90,6,52,'#050206');for(let i=0;i<40;i++)c.px(160+(HS(i,1,2)-.5)*80,HS(i,2,2)*SH,'#ff9a20',.6);
  return{cv:c.canvas(),lights:[{x:160,y:90,r:140,col:'#ff4a10',a:.6,flick:.4}],particles:{type:'ember',n:60,col:['#ff9a20','#ff5a10']}}};
SC.lastAlliance=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#120404'],[50,'#5a0e08'],[100,'#c8401a'],[140,'#ff9a30'],[200,'#ffd070']]);
  /* ash clouds */
  for(let i=0;i<9;i++)cloud(c,20+i*38,50+Math.sin(i)*14,60,12,'#3a1410',i+7);
  /* Mount Doom */
  const mt=new Cv(SW,SH);mt.poly([[40,200],[112,92],[128,60],[152,60],[168,92],[250,200]],(x,y)=>{const t=(y-60)/140,l=1.2+(U.noise(x*.08,y*.07,3)-.5)*2+(U.bayer(x,y)-.5)*.5+(x<150?.5:-.2);return R('#3a2220',6)[CL(Math.round(l+t*.4),0,5)]});
  for(let k=0;k<6;k++){let x=140+k*2-5,y=62;for(let j=0;j<90;j++){x+=Math.sin(j*.25+k)*.8+(k-3)*.18;y+=1.1;mt.px(x,y,['#ff5a10','#ff9a20','#ffd040'][k%3],.9);mt.px(x+1,y,'#ff5a10',.5)}}
  glow(mt,140,60,40,'#ff6a20',.35);
  for(let i=0;i<60;i++){const x=150+U.hash(i,1,2)*70,y=14+U.hash(i,2,2)*50;mt.px(x+(60-y)*.3,y,'#8a5a4a',.35)}
  const cv=c.canvas(),k=cv.getContext('2d');k.imageSmoothingEnabled=false;k.drawImage(mt.canvas(),0,0);
  /* armies in silhouette */
  const ar=new Cv(SW,SH);const sil=R('#0a0404',4);
  for(let i=0;i<46;i++){const x=6+i*7+((i*13)%5),y=172+((i*7)%9),h=14+((i*11)%6);ar.rect(x,y-h,3,h,sil[1]);ar.px(x+1,y-h-1,sil[2]);ar.rect(x-1,y-h+3,5,2,sil[2]);ar.vline(x+(i%2?4:-2),y-h-14,h+14,sil[0]);ar.px(x+(i%2?4:-2),y-h-15,'#c0b8a8')}
  for(let b=0;b<5;b++){const x=30+b*68;ar.vline(x,120,50,sil[0]);ar.poly([[x,120],[x+14,126],[x,134]],b%2?'#7a1a1a':'#2a3a7a')}
  /* Sauron: towering armoured silhouette with a mace */
  const sx=246,sy=178,dk='#0c0606';
  ar.poly([[sx-20,sy-96],[sx-40,sy-34],[sx-8,sy-44]],R('#1a0a0a',4)[1]);                        // cape
  ar.rect(sx-10,sy-44,8,44,dk);ar.rect(sx+2,sy-44,8,44,dk);ar.rect(sx-12,sy-6,11,6,dk);ar.rect(sx+2,sy-6,12,6,dk);   // legs + boots
  ar.poly([[sx-20,sy-98],[sx+20,sy-98],[sx+15,sy-44],[sx-15,sy-44]],dk);                        // torso
  ar.shade(sx-22,sy-94,10,8,R('#14080a',4),{dither:0});ar.shade(sx+22,sy-94,10,8,R('#14080a',4),{dither:0});     // pauldrons
  for(let i=-1;i<=1;i++){ar.poly([[sx-22+i*7+14,sy-100],[sx-20+i*7+14,sy-112],[sx-18+i*7+14,sy-100]],dk);ar.poly([[sx+22+i*7-14,sy-100],[sx+24+i*7-14,sy-112],[sx+26+i*7-14,sy-100]],dk)}
  ar.shade(sx,sy-108,8.5,10,R('#14080a',4),{dither:0});                                          // helm
  for(let i=0;i<7;i++){const a2=-Math.PI+i*Math.PI/6+.2;ar.poly([[sx+Math.cos(a2)*8,sy-110+Math.sin(a2)*9],[sx+Math.cos(a2)*17,sy-110+Math.sin(a2)*20],[sx+Math.cos(a2+.18)*8,sy-110+Math.sin(a2+.18)*9]],dk)}
  ar.line(sx+18,sy-88,sx+36,sy-120,dk);ar.line(sx+19,sy-88,sx+37,sy-120,dk);ar.line(sx+20,sy-88,sx+38,sy-120,dk);ar.line(sx+14,sy-80,sx+24,sy-58,dk);ar.line(sx-18,sy-84,sx-26,sy-60,dk);ar.line(sx-19,sy-84,sx-27,sy-60,dk);
  ar.shade(sx+38,sy-124,7,7,R('#0c0606',4),{dither:0});for(let a2=0;a2<10;a2++)ar.line(sx+38,sy-124,sx+38+Math.cos(a2*.628)*12,sy-124+Math.sin(a2*.628)*12,dk);
  ar.px(sx-3,sy-108,'#ffb020');ar.px(sx+3,sy-108,'#ffb020');ar.px(sx-4,sy-108,'#ff6a10',.6);ar.px(sx+4,sy-108,'#ff6a10',.6);
  ar.outline(0,'#ff7a20');
  k.drawImage(ar.canvas(),0,0);
  /* Isildur and the shard, in the foreground light */
  const is=new Cv(SW,SH);is.shade(70,164,5,9,R('#c8b080',5),{light:[-.4,-.7,.5]});is.shade(70,152,4,4,R('#e8c8a0',5),{dither:0});is.line(74,156,92,132,'#e8e8f0');is.line(75,156,93,132,'#9aa0b0');is.rect(66,158,4,12,'#4a2a1a');is.outline(.3);k.drawImage(is.canvas(),0,0);
  return{cv,lights:[{x:140,y:60,r:110,col:'#ff7a20',a:.6,flick:.3},{x:244,y:90,r:60,col:'#ff4a10',a:.35,flick:.4}],particles:{type:'ember',n:60,col:['#ff9a20','#ff5a10','#ffd040']}}};
SC.orthanc=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#06080e'],[60,'#141c2c'],[130,'#2a2c38'],[200,'#3a2a2a']]);
  for(let i=0;i<10;i++)cloud(c,16+i*34,36+(i%3)*18,70,14,'#3a4252',i+2);
  ridge(c,140,10,.02,3,'#1a2028',{fog:'#4a3a3a',fade:50});
  const t=new Cv(SW,SH),st=R('#1c1c26',6,.2);
  /* Orthanc: black faceted spire with four horns */
  t.poly([[132,170],[142,40],[150,18],[170,18],[178,40],[188,170]],(x,y)=>{const u=(x-132)/56,l=1.4+(.4-u)*1.5+(U.noise(x*.2,y*.05,3)-.5)*.8+(U.bayer(x,y)-.5)*.5+((x+y)%9===0?-.4:0);return st[CL(Math.round(l),0,5)]});
  [[138,40],[148,22],[172,22],[182,40]].forEach(([x,y],i)=>{t.poly([[x-5,y+12],[x+(i<2?-9:9),y-14],[x+4,y+12]],st[2])});
  t.rect(150,10,20,10,st[3]);t.px(160,8,'#ff9a30');
  for(let k=0;k<5;k++){const y=60+k*20;t.rect(156,y,8,10,'#ff9a30',.8);t.rect(157,y+1,6,8,'#ffd070',.9)}
  [[100,170],[220,170],[60,184],[260,184]].forEach(([x,y])=>{t.rect(x,y-8,22,8,'#ff5a10',.8);t.rect(x+2,y-12,18,4,'#ffa030',.7)});
  const cv=c.canvas(),k=cv.getContext('2d');k.imageSmoothingEnabled=false;k.drawImage(t.canvas(),0,0);
  const g=new Cv(SW,SH);ridge(g,176,6,.03,5,'#161218');k.drawImage(g.canvas(),0,0);
  return{cv,lights:[{x:160,y:100,r:90,col:'#ff9a30',a:.45,flick:.2},{x:100,y:170,r:60,col:'#ff5a10',a:.4,flick:.4},{x:220,y:170,r:60,col:'#ff5a10',a:.4,flick:.4}],particles:{type:'rain',n:90,col:['#8aa0c8']},fog:'#3a3a48'}};
SC.gollum=()=>{const c=new Cv(SW,SH);c.rect(0,0,SW,SH,(x,y)=>R('#14101a',6)[CL(Math.round(.8+(NS(x*.04,y*.05,3))*1.3+(U.bayer(x,y)-.5)*.5),0,5)]);
  for(let i=0;i<24;i++){const x=U.hash(i,1,4)*SW;c.poly([[x,0],[x+10,0],[x+4,20+U.hash(i,2,4)*40]],R('#1c1822',4)[1])}
  c.ell(160,150,70,16,R('#10101c',4)[1]);c.ell(160,148,60,12,(x,y,dx,dy)=>R('#2a5a6a',5)[CL(Math.round(1.3+Math.sin(dx*8+dy*4)*.5+(U.bayer(x,y)-.5)*.6),0,4)]);
  glow(c,160,120,40,'#ffd060',.25);c.ell(160,118,4,4,'#ffd060');c.ell(160,118,2.4,2.4,'#fff6a0');
  const cv=c.canvas();return{cv,lights:[{x:160,y:118,r:90,col:'#ffd060',a:.5,flick:.15}],particles:{type:'dust',n:20,col:['#ffe9a0']}}};
SC.caradhras=()=>{const c=new Cv(SW,SH);sky(c,[[0,'#5a6a88'],[70,'#9aaac4'],[130,'#d4dce8'],[200,'#eef2f8']]);
  for(let i=0;i<8;i++)cloud(c,10+i*44,40+(i%3)*14,70,14,'#e8eef8',i+11);
  const m=new Cv(SW,SH);const peak=(cx,top,w,col)=>m.poly([[cx-w,200],[cx-w*.55,top+36],[cx-w*.12,top+8],[cx,top],[cx+w*.15,top+12],[cx+w*.6,top+44],[cx+w,200]],(x,y)=>{const t=(y-top)/(200-top),u=(x-(cx-w))/(2*w);const l=3.4-u*1.6+(U.noise(x*.07,y*.06,3)-.5)*1.8+(U.bayer(x,y)-.5)*.5-t*.6;return R(col,6,.22)[CL(Math.round(l),0,5)]});
  peak(70,46,110,'#8a96ae');peak(230,34,120,'#7a88a2');peak(160,70,100,'#a4b0c4');
  for(let i=0;i<260;i++){const x=U.hash(i,1,7)*SW,y=70+U.hash(i,2,7)*110;if(m.solid(x,y))m.px(x,y,'#ffffff',.5+U.hash(i,3,7)*.5)}
  const cv=c.canvas(),k=cv.getContext('2d');k.imageSmoothingEnabled=false;k.drawImage(m.canvas(),0,0);
  /* the company, a line of tiny figures wading through the drifts */
  const f=new Cv(SW,SH);for(let i=0;i<9;i++){const x=40+i*18,y=170-i*3;f.rect(x,y-9,3,9,i<4?'#4a3a2a':'#2a2a38');f.px(x+1,y-10,'#d8b898');if(i===3){f.vline(x+3,y-14,14,'#7a5a3a')}f.hline(x-2,y+1,7,'#ffffff',.8)}k.drawImage(f.canvas(),0,0);
  const g=new Cv(SW,SH);ridge(g,184,6,.04,3,'#e8eef8');k.drawImage(g.canvas(),0,0);
  return{cv,lights:[],particles:{type:'snow',n:140,col:['#ffffff','#dfe8ff']},fog:'#ffffff'}};
const SCACHE={};
window.scene=name=>SCACHE[name]||(SCACHE[name]=(SC[name]||SC.dark)());
window.SCENES=Object.keys(SC);window.SW=SW;window.SH=SH;
})();
