'use strict';
(()=>{const Cv=U.Cv;
/* =========================================================
   chars.js — overworld character sprites (24x32), 4 directions,
   3 frames (idle / step A / step B), procedurally shaded.
   ========================================================= */
const SPEC={
 frodo:{cls:'hobbit',skin:'#f0c6a6',hair:{s:'curly',c:'#4a2e1e'},shirt:'#efe6d0',vest:'#6c5a38',pants:'#5a4a38',cloak:null},
 frodoCloak:{cls:'hobbit',skin:'#f0c6a6',hair:{s:'curly',c:'#4a2e1e'},shirt:'#efe6d0',vest:'#6c5a38',pants:'#5a4a38',cloak:'#6f8466',hood:false},
 sam:{cls:'hobbit',skin:'#ecb890',hair:{s:'curly',c:'#a06c34'},shirt:'#e8dcc0',vest:'#7a5a3a',pants:'#6a5a3a',pack:'#8a6a3a'},
 merry:{cls:'hobbit',skin:'#f0c2a0',hair:{s:'curly',c:'#8e4a28'},shirt:'#efe6d0',vest:'#3c6a4a',pants:'#5a4a38'},
 pippin:{cls:'hobbit',skin:'#f2c6a2',hair:{s:'curly',c:'#cfa458'},shirt:'#efe6d0',vest:'#8a4a3a',pants:'#5a4a38'},
 bilbo:{cls:'hobbit',skin:'#e6b894',hair:{s:'wisp',c:'#e6e6ea'},shirt:'#f4f0e4',vest:'#7e2c4c',pants:'#4a4a5a'},
 gaffer:{cls:'hobbit',skin:'#d9a47c',hair:{s:'wisp',c:'#d0d0d0'},shirt:'#d8ccb0',vest:'#6a5a3a',pants:'#5a4a38',hat:{k:'straw',c:'#d8b860'}},
 lobelia:{cls:'hobbit',skin:'#f0c6aa',hair:{s:'bonnet',c:'#e8d8c0'},shirt:'#8a4a8a',vest:'#8a4a8a',pants:'#8a4a8a',dress:true},
 hobbitA:{cls:'hobbit',skin:'#f0c4a0',hair:{s:'curly',c:'#6a4a2a'},shirt:'#efe6d0',vest:'#b0603a',pants:'#5a4a38'},
 hobbitB:{cls:'hobbit',skin:'#e8b890',hair:{s:'curly',c:'#c09040'},shirt:'#efe6d0',vest:'#3a7a8a',pants:'#6a5a3a'},
 hobbitC:{cls:'hobbit',skin:'#f4cdb0',hair:{s:'curly',c:'#2a1a14'},shirt:'#f4ecd0',vest:'#c0a030',pants:'#4a4a3a'},
 hobbitKid:{cls:'hobbit',kid:true,skin:'#f4cdb0',hair:{s:'curly',c:'#a86a30'},shirt:'#efe6d0',vest:'#d0504a',pants:'#5a4a38'},
 gandalf:{cls:'man',skin:'#d9a688',hair:{s:'long',c:'#aeb2c0'},beard:{c:'#c8ccd8',len:9},shirt:'#8a90a6',vest:'#8a90a6',pants:'#7a8096',cloak:'#7d839a',hat:{k:'wizard',c:'#767c94'},staff:true,tall:1},
 aragorn:{cls:'man',skin:'#c8977a',hair:{s:'long',c:'#2a1a14'},beard:{c:'#2a1a14',len:2},shirt:'#46423e',vest:'#46423e',pants:'#3a3630',cloak:'#3c4a3a',sword:true},
 boromir:{cls:'man',skin:'#d6a688',hair:{s:'mid',c:'#5a3a26'},beard:{c:'#5a3a26',len:2},shirt:'#6a4a30',vest:'#6a4a30',pants:'#3a2e24',fur:'#a89878',shield:true},
 legolas:{cls:'man',skin:'#f6dac4',hair:{s:'long',c:'#e8d68e'},shirt:'#586e48',vest:'#586e48',pants:'#4a5a40',cloak:'#7a8a68',bow:true,ears:true},
 gimli:{cls:'dwarf',skin:'#d8957a',hair:{s:'none',c:'#b8481e'},beard:{c:'#bf4c20',len:8},shirt:'#5a5e6c',vest:'#5a5e6c',pants:'#4a3a38',hat:{k:'helm',c:'#8a8e9c'},axe:true},
 galadriel:{cls:'man',skin:'#fbe6d6',hair:{s:'long',c:'#f2dc94'},shirt:'#eceef8',vest:'#eceef8',pants:'#eceef8',dress:true,ears:true,glow:true},
 elrond:{cls:'man',skin:'#ecccae',hair:{s:'long',c:'#1c1218'},shirt:'#4c3c70',vest:'#4c3c70',pants:'#4c3c70',dress:true,ears:true,circlet:true},
 arwen:{cls:'man',skin:'#f8e0cc',hair:{s:'long',c:'#1a1016'},shirt:'#d8dcf0',vest:'#d8dcf0',pants:'#d8dcf0',dress:true,ears:true,circlet:true},
 butterbur:{cls:'man',fat:true,skin:'#eab08e',hair:{s:'bald',c:'#7a5a38'},beard:{c:'#8a6a3a',len:1},shirt:'#f2ead8',vest:'#f2ead8',pants:'#5a4a38',apron:true},
 harry:{cls:'man',skin:'#d6a688',hair:{s:'short',c:'#4a3a2a'},beard:{c:'#4a3a2a',len:2},shirt:'#4a4a3a',vest:'#4a4a3a',pants:'#3a3028',hat:{k:'cap',c:'#4a5a3a'}},
 breeA:{cls:'man',skin:'#d6a688',hair:{s:'short',c:'#7a5a38'},shirt:'#8a5a3a',vest:'#6a4a30',pants:'#4a3a2a'},
 breeB:{cls:'man',skin:'#e0b090',hair:{s:'mid',c:'#3a2a1a'},shirt:'#4a6a8a',vest:'#3a5a7a',pants:'#3a3a3a',beard:{c:'#3a2a1a',len:2}},
 breeC:{cls:'man',skin:'#c89878',hair:{s:'short',c:'#2a1a14'},shirt:'#a04a3a',vest:'#7a3a2a',pants:'#3a2a1a',hat:{k:'cap',c:'#6a4a2a'}},
 breeD:{cls:'man',skin:'#e8bc9c',hair:{s:'long',c:'#8a4a2a'},shirt:'#5a8a5a',vest:'#3a6a3a',pants:'#6a4a3a',dress:true},
 elfA:{cls:'man',skin:'#f6dac4',hair:{s:'long',c:'#d8c880'},shirt:'#c8b060',vest:'#a89040',pants:'#7a6a40',ears:true,dress:true},
 elfB:{cls:'man',skin:'#f0d4bc',hair:{s:'long',c:'#5a3a24'},shirt:'#5a8a8a',vest:'#3a6a6a',pants:'#3a5a5a',ears:true},
 elfC:{cls:'man',skin:'#f8e0cc',hair:{s:'long',c:'#c0a060'},shirt:'#d8a0b0',vest:'#b87090',pants:'#b87090',ears:true,dress:true},
 dwarfA:{cls:'dwarf',skin:'#d8a080',hair:{s:'none',c:'#8a8a8a'},beard:{c:'#8a8a8a',len:8},shirt:'#6a5a4a',vest:'#6a5a4a',pants:'#3a3a3a',hat:{k:'helm',c:'#7a7e8c'}},
 rider:{cls:'man',skin:'#000',hair:{s:'none',c:'#000'},shirt:'#14131e',vest:'#14131e',pants:'#14131e',cloak:'#1b1a28',hood:'#1b1a28',wraith:true,tall:1},
 orc:{cls:'man',skin:'#4a5a3a',hair:{s:'none',c:'#222'},shirt:'#3a3030',vest:'#3a3030',pants:'#2a2420',hat:{k:'helm',c:'#4a4a52'},axe:true},
 farmer:{cls:'man',skin:'#dca880',hair:{s:'short',c:'#6a5a3a'},shirt:'#c0b090',vest:'#6a7a4a',pants:'#5a4a3a',hat:{k:'straw',c:'#d8b860'},beard:{c:'#6a5a3a',len:3}}
};
function charSprite(sp,dir,frame){
  const c=new Cv(24,34),R=U.ramp;
  const cls=sp.cls,hobbit=cls==='hobbit',dwarf=cls==='dwarf',fat=sp.fat;
  const kid=!!sp.kid;
  const legH=hobbit?(kid?4:5):dwarf?6:9,torsoH=hobbit?(kid?5:6):dwarf?8:9,bodyW=hobbit?8:dwarf?12:fat?13:8;
  const feetY=32,hipY=feetY-legH,shY=hipY-torsoH,headRy=hobbit?6.2:5.6,headRx=hobbit?6.2:5.2,headCy=shY-headRy+(hobbit?.5:1.5)+(sp.tall?0:0);
  const cx=12,bob=frame===0?0:(frame===1?-0:0);
  const skin=R(sp.skin,5,.24),hair=R(sp.hair.c,5,.28),shirt=R(sp.shirt,5,.25),vest=R(sp.vest,5,.25),pants=R(sp.pants,5,.22),boot=R('#4a3222',4);
  const side=dir==='right'||dir==='left';
  const stepL=frame===1?-1:frame===2?1:0;
  /* cloak (behind) */
  if(sp.cloak){const cr=R(sp.cloak,5,.26);const top=shY-1,bot=feetY-1-(frame?0:0);
    c.region(cx-bodyW/2-2,top,cx+bodyW/2+2,bot,(x,y)=>{const t=(y-top)/(bot-top),hw=bodyW/2+1+t*2.4;return Math.abs(x+.5-cx)<=hw&&(dir!=='up'?(Math.abs(x+.5-cx)>bodyW/2-1||y>hipY-1):true)},(x,y)=>cr[U.clamp(Math.round(2.2+(cx-x)/10-(y-top)/(bot-top)*.9+(U.bayer(x,y)-.5)*.6),0,4)])}
  /* legs */
  const lw=dwarf||fat?4:hobbit?3:3;
  if(sp.dress){const dr=R(sp.vest,5,.25);c.region(cx-bodyW/2-1,hipY-1,cx+bodyW/2+1,feetY-1,(x,y)=>{const t=(y-hipY)/(feetY-hipY);return Math.abs(x+.5-cx)<=bodyW/2+t*3},(x,y)=>dr[U.clamp(Math.round(2.4+(cx-x)/9+Math.sin(x*.9)*.5+(U.bayer(x,y)-.5)*.5),0,4)])}
  else{
    const L=[[cx-lw+(side?1:-1)+(side?0:0),0],[cx+(side?-1:1),0]];
    for(let k=0;k<2;k++){const lx=side?cx-2+(k?stepL*2:-stepL*2):cx-lw-(k?-lw-1:0)+(k?1:0),ly=hipY+(k===0?(stepL===1?-1:0):(stepL===-1?-1:0))*(side?0:1);
      const bx=side?lx:(k?cx+1:cx-lw-1);
      for(let j=0;j<legH-1;j++)for(let i=0;i<lw;i++){c.px(bx+i,hipY+j+(frame&&((k===0)===(frame===1))?-1:0),pants[U.clamp(Math.round(2.3+(i===0?.6:i===lw-1?-.7:0)-(j/legH)*.3),0,4)])}
      /* feet: hairy bare feet for hobbits, boots otherwise */
      const fy=feetY-1+(frame&&((k===0)===(frame===1))?-1:0);
      if(hobbit){for(let i=0;i<lw+1;i++){c.px(bx+i-(side&&dir==='left'?1:0),fy,skin[2]);c.px(bx+i,fy-1,(i+k)%2?'#7a5030':'#5a3a22')}c.px(bx+lw/2|0,fy,'#7a5030')}
      else{for(let i=0;i<lw+1;i++){c.px(bx+i+(side&&dir==='right'?1:0),fy,boot[1]);c.px(bx+i,fy-1,boot[2])}}}
  }
  /* torso */
  const tw=bodyW,tx0=cx-tw/2;
  c.region(tx0,shY,tx0+tw,hipY+1,(x,y)=>{const dx=Math.abs(x+.5-cx);return dx<=tw/2&&(fat?true:!(y<shY+1&&dx>tw/2-1))},(x,y)=>{const t=(x-tx0)/tw;let r=shirt;if(sp.vest&&sp.vest!==sp.shirt&&dir==='down'&&Math.abs(x+.5-cx)>1)r=vest;return r[U.clamp(Math.round(2.4+(.5-t)*1.5-(y-shY)/(hipY-shY+1)*.5+(U.bayer(x,y)-.5)*.55),0,4)]});
  if(sp.apron&&dir!=='up')c.rect(cx-3,shY+3,6,hipY-shY-1,'#fff8ee');
  if(dir==='down'){ /* shirt V / buttons */
    if(sp.vest!==sp.shirt){c.px(cx,shY+1,shirt[3]);c.px(cx-1,shY,shirt[4]);c.px(cx,shY+2,shirt[3])}else c.px(cx,shY+2,shirt[1]);
    if(!hobbit)for(let j=2;j<torsoH;j+=3)c.px(cx,shY+j,shirt[1])}
  c.hline(tx0,hipY-1,tw,'#3a2a1c');if(dir!=='up')c.px(cx,hipY-1,'#c8a040'); /* belt */
  if(sp.fur&&dir!=='up'){const fr=R(sp.fur,5,.28);for(let i=-tw/2;i<tw/2;i++){c.px(cx+i,shY-1,fr[(i&1)?4:3]);c.px(cx+i,shY,fr[2+((i+1)&1)])}}
  /* arms */
  const armY=shY+1,armL=hobbit?torsoH-1:torsoH;
  if(!side){[-1,1].forEach((s,k)=>{const sw=(frame&&(((k===0)===(frame===1)))?-1:0)*(hobbit?0:1);const ax=cx+s*(tw/2+.5)-(s<0?1:0);c.rect(ax,armY+sw,2,armL,shirt[s<0?3:1]);c.px(ax+(s<0?0:1)-0,armY+armL+sw,skin[2]);c.px(ax+(s<0?1:0),armY+armL+sw,skin[1])})}
  else{const ax=cx-1+(frame===1?1:frame===2?-1:0);c.rect(ax,armY,2,armL,shirt[2]);c.px(ax,armY+armL,skin[2]);c.px(ax+1,armY+armL,skin[1])}
  if(sp.pack&&(dir==='up'||side)){const pk=R(sp.pack,5);c.shade(cx,shY+3,5,5,pk,{light:[-.5,-.5,.6]});c.hline(cx-4,shY+1,8,'#e8dcc0')}
  /* head */
  const hy=headCy;
  if(dir!=='up'||true){
    if(sp.beard&&dir!=='up'){const br=R(sp.beard.c,5,.27),len=sp.beard.len;
      c.region(cx-headRx,hy,cx+headRx,hy+headRy+len+1,(x,y)=>{const t=(y-hy)/(headRy+len);const hw=(side?headRx*.8:headRx)*(1-Math.pow(Math.max(0,(y-hy-headRy*.4)/(headRy*.6+len)),1.6)*.85);return t>.1&&Math.abs(x+.5-(side?cx+(dir==='right'?-1:1):cx))<=hw&&y>=hy+1},(x,y)=>br[U.clamp(Math.round(2.6+(cx-x)/9+(U.hash(x,y,3)-.5)*1.2),0,4)])}
    if(sp.hair.s==='long'&&dir!=='down'){const hr=hair;c.region(cx-headRx-1,hy,cx+headRx+1,hy+headRy+8,(x,y)=>Math.abs(x+.5-cx)<headRx+.5&&y<hy+headRy+(dir==='up'?7:5),(x,y)=>hr[U.clamp(Math.round(2.2+(cx-x)/8+(U.hash(x,y,2)-.5)),0,4)])}
    c.shade(cx+(dir==='right'?.5:dir==='left'?-.5:0),hy,headRx,headRy,sp.wraith?R('#000',5):skin,{light:[-.45,-.6,.65],dither:.5});
    if(sp.ears&&!side){c.px(cx-headRx-1,hy-1,skin[3]);c.px(cx-headRx-2,hy-3,skin[3]);c.px(cx+headRx,hy-1,skin[2]);c.px(cx+headRx+1,hy-3,skin[2])}
    if(hobbit&&!side){c.px(cx-headRx-.5,hy,skin[3]);c.px(cx+headRx-.5,hy,skin[2]);c.px(cx-headRx-.5,hy-1,skin[3]);c.px(cx+headRx-.5,hy-1,skin[2])}
    /* hair cap */
    const hs=sp.hair.s;
    if(hs!=='none'&&hs!=='bald'&&!sp.hood){
      const hr=hair,cap=(x,y)=>{const dx=(x+.5-cx)/(headRx+.9),dy=(y+.5-hy)/(headRy+.9);if(dx*dx+dy*dy>1)return false;
        if(dir==='up')return true;const line=hs==='curly'?hy-headRy*.25-(Math.abs(x+.5-cx)>headRx*.6?-2:0):hs==='wisp'||hs==='bonnet'?hy-headRy*.55:hy-headRy*.4+Math.abs(x+.5-cx)*.18;return y<line||(side&&((dir==='right'&&x<cx-1)||(dir==='left'&&x>cx))&&y<hy+3)};
      c.region(cx-headRx-2,hy-headRy-2,cx+headRx+2,hy+headRy,cap,(x,y)=>hr[U.clamp(Math.round(2.4+(cx-x)/7-(y-hy+headRy)/10+(hs==='curly'?Math.sin(x*1.7+y*1.3)*.7:0)+(U.bayer(x,y)-.5)*.5),0,4)]);
      if(hs==='curly'){for(let i=-headRx;i<=headRx;i+=2)c.px(cx+i+.5,hy-headRy-1+((i&2)?1:0),hr[3]);if(!side)for(let i=-2;i<=2;i++)c.px(cx+i,hy-headRy*.25+1,hr[1])}}
    if(sp.hair.s==='bonnet'){const cr=R('#f2ead8',5);c.region(cx-headRx-1,hy-headRy-1,cx+headRx+1,hy+1,(x,y)=>{const dx=(x+.5-cx)/(headRx+1),dy=(y+.5-hy)/(headRy+1);return dx*dx+dy*dy<1&&y<hy-1},(x,y)=>cr[U.clamp(Math.round(3+(cx-x)/8),0,4)])}
    /* face */
    if(dir==='down'){const ey=hy-.5,eg=sp.wraith?null:'#2a1a1a';if(sp.shades)c.rect(cx-3,ey,7,2,'#222');else if(!sp.wraith){c.px(cx-2,ey,eg);c.px(cx+2,ey,eg);c.px(cx-2,ey-1,'#fff',.0);c.px(cx-2,ey+0,eg)}
      if(sp.wraith){c.px(cx-2,hy-1,'#e8f0ff');c.px(cx+2,hy-1,'#e8f0ff')}
      if(!sp.wraith){c.px(cx,hy+1,skin[1]);c.px(cx-1,hy+3,skin[1],.8);c.px(cx,hy+3,'#a85a50',.9);c.px(cx+1,hy+3,skin[1],.8)}
      if(sp.blush)c.px(cx-3,hy+2,'#ff8a8a',.4)}
    if(side){const dxs=dir==='right'?1:-1;c.px(cx+dxs*2.5,hy-.5,'#2a1a1a');c.px(cx+dxs*(headRx),hy+.8,skin[1]);c.px(cx+dxs*3,hy+2.5,'#a85a50',.9)}
  }
  /* headwear */
  if(sp.hood){const hd=R(sp.hood,5,.2);c.region(cx-headRx-2,hy-headRy-3,cx+headRx+2,hy+headRy+1,(x,y)=>{const dx=(x+.5-cx)/(headRx+2),dy=(y+.5-hy)/(headRy+2.2);return dx*dx+dy*dy<1&&!(dir==='down'&&Math.abs(x+.5-cx)<3&&y>hy-3&&y<hy+4)},(x,y)=>hd[U.clamp(Math.round(1.8+(cx-x)/9+(U.bayer(x,y)-.5)*.5),0,4)])}
  if(sp.hat){const h=sp.hat,hr=R(h.c,5,.26);
    if(h.k==='wizard'){const by=hy-headRy*.7;c.ell(cx,by+1,headRx+5,2.2,hr[1]);c.region(cx-headRx-5,by-2,cx+headRx+5,by+3,(x,y)=>{const dx=(x+.5-cx)/(headRx+5),dy=(y+.5-by-1)/2.4;return dx*dx+dy*dy<=1},(x,y)=>hr[U.clamp(Math.round(2+(cx-x)/14+(y<by+1?.6:-.4)),0,4)]);
      for(let j=0;j<12;j++){const t=j/12,hw=(headRx+1.5)*(1-t)+.5,ctr=cx+Math.pow(t,2.2)*4;for(let i=-Math.ceil(hw);i<=Math.ceil(hw);i++)c.px(ctr+i,by-1-j,hr[U.clamp(Math.round(2.4-i/hw*1.2+(U.bayer(i,j)-.5)*.5),0,4)])}}
    if(h.k==='straw'){c.ell(cx,hy-headRy*.55,headRx+3,2,hr[2]);c.region(cx-headRx,hy-headRy-2,cx+headRx,hy-headRy*.5,(x,y)=>{const dx=(x+.5-cx)/headRx;return Math.abs(dx)<.85&&y<hy-headRy*.5},(x,y)=>hr[U.clamp(Math.round(2.6+(cx-x)/8),0,4)]);c.hline(cx-headRx+1,hy-headRy*.65,headRx*2-1,'#a04a2a')}
    if(h.k==='helm'){c.region(cx-headRx-1,hy-headRy-2,cx+headRx+1,hy-headRy*.2,(x,y)=>{const dx=(x+.5-cx)/(headRx+1.2),dy=(y+.5-hy+headRy*.2)/(headRy*.9);return dx*dx+dy*dy<1&&y<hy-headRy*.25},(x,y)=>hr[U.clamp(Math.round(2.6+(cx-x)/8-(y-hy)/16),0,4)]);c.px(cx,hy-headRy-3,'#c8a040');c.vline(cx,hy-headRy*.4,4,hr[3])}
    if(h.k==='cap'){c.region(cx-headRx-1,hy-headRy-1,cx+headRx+1,hy-headRy*.3,(x,y)=>{const dx=(x+.5-cx)/(headRx+1),dy=(y+.5-hy)/(headRy+1);return dx*dx+dy*dy<1&&y<hy-headRy*.35},(x,y)=>hr[U.clamp(Math.round(2.4+(cx-x)/8),0,4)])}}
  if(sp.circlet){c.hline(cx-headRx+1,hy-headRy*.55,headRx*2-1,'#f4f8ff');c.px(cx,hy-headRy*.55-1,'#58c8ff')}
  /* props */
  if(sp.staff){const sx=dir==='left'?cx-tw/2-3:cx+tw/2+3;c.vline(sx,shY-10,feetY-shY+8,'#7a5230');c.vline(sx+1,shY-10,feetY-shY+8,'#a07240');c.shade(sx+.5,shY-11,2,2.4,R('#e8f0ff',4),{dither:0})}
  if(sp.sword){const sx=dir==='left'?cx+tw/2:cx-tw/2-1;c.line(sx,hipY-2,sx+(dir==='left'?3:-3),hipY+5,'#9aa0b0');c.px(sx,hipY-2,'#c8a040')}
  if(sp.bow&&dir!=='down'||sp.bow&&dir==='down'){const bx=dir==='left'?cx+tw/2+1:cx-tw/2-2;c.line(bx,shY-4,bx-1,shY+5,'#8a6a40');c.line(bx-1,shY+5,bx,hipY+4,'#8a6a40');c.vline(bx+1,shY-3,hipY-shY+6,'#d8d0b8',.7)}
  if(sp.axe){const ax=dir==='left'?cx-tw/2-2:cx+tw/2+2;c.vline(ax,shY,6,'#6a4a2a');c.rect(ax-1,shY-1,3,3,'#b8bcc8')}
  if(sp.shield){const sx=dir==='right'?cx-tw/2-3:cx+tw/2+1;c.shade(sx+1.5,shY+5,3.5,4.5,R('#8a8a98',5),{dither:.2});c.px(sx+1,shY+5,'#d8c060')}
  if(sp.glow){/* faint aura baked in as pale outline */c.outline(0.5,'#dff4ff');return c}
  c.outline(.26);return c}
function makeSprites(key,spec=SPEC[key]){const o={};['down','up','right'].forEach(d=>{o[d]=[0,1,2].map(f=>charSprite(spec,d,f).canvas())});
  o.left=o.right.map(cv=>{const t=U.canvas(cv.width,cv.height),x=t.getContext('2d');x.translate(cv.width,0);x.scale(-1,1);x.drawImage(cv,0,0);return t});return o}
const SPR_CACHE={};
function sprites(key){return SPR_CACHE[key]||(SPR_CACHE[key]=makeSprites(key))}
/* animals / misc */
function horseSprite(col='#5a3a22'){const c=new Cv(40,30),R=U.ramp(col,5,.28),m=U.ramp('#201810',4);
  c.shade(19,17,12,6.5,R,{light:[-.4,-.7,.5]});c.shade(31,10,4.6,5.6,R,{light:[-.4,-.7,.5]});c.px(34,7,'#fff');c.rect(33,13,4,3,R[2]);
  [[10,22],[14,23],[24,22],[28,23]].forEach(([x,y],i)=>{c.rect(x,y,2,8,R[i%2?1:2]);c.rect(x,y+8,2,2,'#2a1a10')});
  c.poly([[8,10],[4,18],[7,19],[10,13]],m[2]);for(let i=0;i<6;i++)c.px(27+i%2,3+i*1.2,m[1+i%2]);c.rect(27,3,3,6,m[2]);
  c.rect(15,10,9,2,'#8a2a2a');c.outline(.28);return c.canvas()}
function boatSprite(){const c=new Cv(44,22),w=U.ramp('#8a5a30',5);c.region(2,8,42,20,(x,y)=>{const t=(x-2)/40,depth=11*Math.sin(Math.PI*Math.min(1,t*1.04))*.9+1;return y>=8+(20-8-depth)*.0&&y<=8+Math.min(11,depth)},(x,y)=>w[U.clamp(Math.round(2.5+(y-8)/-5+(x<20?.4:-.2)+(U.bayer(x,y)-.5)*.5),0,4)]);
  c.hline(3,8,38,w[4]);for(let i=6;i<40;i+=4)c.vline(i,9,8,w[0],.5);c.vline(20,0,9,'#6a4a2a');c.poly([[21,1],[34,6],[21,8]],'#e8e0cc');c.outline(.3);return c.canvas()}
window.SPEC=SPEC;window.sprites=sprites;window.horseSprite=horseSprite;window.boatSprite=boatSprite;

})();
