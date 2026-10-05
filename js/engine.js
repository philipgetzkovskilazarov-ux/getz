'use strict';
/* =========================================================
   engine.js — world rendering, lighting, movement, followers,
   dialogue screen, cutscene helpers, music, HUD, save/load.
   ========================================================= */
const $=id=>document.getElementById(id);
const VW=480,VH=300;
let G=null,M=null,mode='title',scriptDepth=0;
const keys={};
const CAM={x:0,y:0};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const wait=sleep;
const cvs=$('game'),ctx=cvs.getContext('2d');ctx.imageSmoothingEnabled=false;
const LM=U.canvas(VW,VH),lctx=LM.getContext('2d');
const DIRV={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};

/* ================= state ================= */
function newGame(){return{map:'shire',px:14*T,py:16*T,dir:'down',sprite:'frodo',flags:{time:'day'},stats:{ring:0,sam:0,merry:0,pippin:0,gandalf:0,aragorn:0,boromir:0,legolas:0,gimli:0,frodoHP:3,trust:0,heart:0},party:[],inv:{},chapter:1,objective:'',solved:{},ringOn:false,t:0}}
const flag=(k,v=true)=>{G.flags[k]=v};
const F=()=>G.flags;
function bond(who,n,msg){G.stats[who]=(G.stats[who]||0)+n;if(msg)toast(msg+(n>0?' ▲':' ▼'))}
function ringUp(n,msg){G.stats.ring=U.clamp(G.stats.ring+n,0,100);if(msg)toast(msg,n>0?'warn':'');if(G.stats.ring>=100&&!G.flags.ringLost)ringLost()}
function objective(t){G.objective=t;$('qtext').textContent=t;$('quest').classList.toggle('hide',!t)}
function chapter(n){G.chapter=n}
function toast(t,cls=''){const d=document.createElement('div');d.className='toast '+cls;d.textContent=t;$('toasts').appendChild(d);setTimeout(()=>d.remove(),4600);while($('toasts').children.length>4)$('toasts').firstChild.remove()}
const pickR=(a)=>a[Math.floor(Math.random()*a.length)];

/* ================= sound & music ================= */
let AC=null,muted=false,master=null;
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.5;master.connect(AC.destination)}catch(e){}}return AC}
function tone(f,d=.1,type='triangle',v=.04,delay=0,dest){const a=ac();if(!a||muted)return;try{const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.04,d*.3));g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dest||master);o.start(t);o.stop(t+d+.05)}catch(e){}}
const sfx={blip:(f=300)=>tone(f,.04,'square',.012),pick:()=>tone(660,.07,'square',.03),win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.3,'triangle',.05,i*.12)),lose:()=>[300,240,180].forEach((f,i)=>tone(f,.25,'sawtooth',.04,i*.12)),zap:()=>[160,110,70].forEach((f,i)=>tone(f,.2,'sawtooth',.05,i*.07)),door:()=>[130,98,65].forEach((f,i)=>tone(f,.5,'sawtooth',.05,i*.1)),ring:()=>[440,466,440,415].forEach((f,i)=>tone(f,.5,'sine',.04,i*.2))};
const THEMES={
 shire:{root:62,scale:[0,2,4,7,9],tempo:.46,lead:'triangle',pad:1,density:.62,oct:1,swing:.1},
 bree:{root:57,scale:[0,2,4,5,7,9,10],tempo:.36,lead:'square',pad:1,density:.55,oct:1,vol:.5},
 dark:{root:45,scale:[0,1,3,5,7,8,10],tempo:.8,lead:'sine',pad:2,density:.2,oct:1},
 moria:{root:38,scale:[0,1,3,5,6,8,10],tempo:.9,lead:'sine',pad:2,density:.16,oct:0,drum:1},
 rivendell:{root:64,scale:[0,2,4,6,7,9,11],tempo:.55,lead:'sine',pad:1,density:.5,oct:1},
 lorien:{root:67,scale:[0,2,4,7,9],tempo:.65,lead:'sine',pad:1,density:.45,oct:2},
 amon:{root:60,scale:[0,2,3,5,7,8,10],tempo:.6,lead:'triangle',pad:1,density:.4,oct:1}};
const Music={cur:null,timer:null,step:0,
  set(name){if(this.cur===name)return;this.cur=name;clearInterval(this.timer);const th=THEMES[name];if(!th||!ac())return;this.step=0;let last=2;const mf=n=>440*Math.pow(2,(n-69)/12);
    const tick=()=>{if(muted||!AC||mode==='title'&&false)return;const s=this.step++,beat=th.tempo;
      if(th.pad&&s%8===0){const root=th.root-12;[0,7,th.scale[2]].forEach((o,i)=>tone(mf(root+o),beat*8.5,'sine',.014,i*.05))}
      if(th.drum&&s%4===0)tone(52,.5,'sine',.07);if(th.drum&&s%8===6)tone(46,.4,'sine',.05);
      if(Math.random()<th.density){last=U.clamp(last+Math.floor(Math.random()*5)-2,0,th.scale.length*2-1);const n=th.root+th.scale[last%th.scale.length]+Math.floor(last/th.scale.length)*12+(th.oct||0)*(Math.random()<.2?12:0);tone(mf(n),beat*2.2,th.lead,.03)}};
    this.timer=setInterval(tick,th.tempo*1000);tick()}};

/* ================= map loading ================= */
const MAPCACHE={};
function loadMap(id){if(MAPCACHE[id])return MAPCACHE[id];
  const def=MAPS[id],m=new MapGrid(def.w,def.h,def.pal,def.seed),L=new Layout(m,def.seed);def.build(m,L);
  const r=renderGround(m);const gc=r.ground;
  (def.decor||[]).forEach((sp,i)=>scatter(gc,m,r.lab,Object.assign({},sp,{draw:DECO[sp.draw]}),(sp.seed||1)+i*13));
  const objs=[],solids=[],lights=[],spriteCache={};
  L.objs.forEach(({name,tx,ty,o})=>{const args=Array.isArray(o)?o:[o||{}];const key=name+JSON.stringify(args);let meta=spriteCache[key];if(!meta){if(!OB[name]){console.warn('missing object',name);return}meta=spriteCache[key]=OB[name](...args)}
    const x=tx*T,y=ty*T;objs.push({meta,x,y,name});if(meta.solid)solids.push([x+meta.solid[0],y+meta.solid[1],meta.solid[2],meta.solid[3]]);(meta.lights||[]).forEach(l=>lights.push({x:x+l.x,y:y+l.y,r:l.r,col:l.col,fl:l.flicker||0,a:l.a||1,ph:Math.random()*10}))});
  objs.forEach(o=>{if(o.meta.cv&&o.meta.cv.getContext===undefined){}});
  const inst={def,m,ground:gc.canvas(),water:r.water,lab:r.lab,objs,solids,lights,fx:[],W:m.w*T,H:m.h*T,extra:[],tent:[]};
  inst.emit=[];objs.forEach(o=>(o.meta.emit||[]).forEach(e=>inst.emit.push({x:o.x+e.x,y:o.y+e.y,t:Math.random()*3})));
  MAPCACHE[id]=inst;return inst}

/* ================= entities ================= */
function mkNpc(d){return Object.assign({},d,{x:d.x*T,y:d.y*T,face:d.dir||'down',ph:Math.random()*6,ox:0,oy:0,moving:false})}
function npcsNow(){if(!M)return[];if(!M.npcs)M.npcs=M.def.npcs.map(mkNpc);return M.npcs.filter(n=>!G.flags['hide_'+n.id]&&(n.show?n.show():true)).concat(M.extra)}
function ent(id){if(id==='player')return PLAYER;return npcsNow().find(n=>n.id===id)||null}
const PLAYER={get x(){return G.px},set x(v){G.px=v},get y(){return G.py},set y(v){G.py=v},get face(){return G.dir},set face(v){G.dir=v},id:'player'};
let walkT=0,moving=false,trail=[];
function resetTrail(){trail=[];const[dx,dy]=DIRV[G.dir]||[0,1];for(let i=0;i<260;i++)trail.push({x:G.px-dx*i*1.7,y:G.py-dy*i*1.7,d:G.dir,m:false})}
function followers(){return G.party.map((k,i)=>{const p=trail[Math.min(trail.length-1,(i+1)*14)]||{x:G.px,y:G.py,d:G.dir,m:false};return{key:k,x:p.x,y:p.y,d:p.d,m:p.m}})}
const PARTYSPR={sam:'sam',merry:'merry',pippin:'pippin',gandalf:'gandalf',aragorn:'aragorn',legolas:'legolas',gimli:'gimli',boromir:'boromir'};

/* ================= collision ================= */
function blocked(x,y){const hw=4.5,hh=2.5;
  for(const[ox,oy]of[[-hw,-hh],[hw,-hh],[-hw,hh],[hw,hh]]){const tx=Math.floor((x+ox)/T),ty=Math.floor((y+oy)/T);if(tx<0||ty<0||tx>=M.m.w||ty>=M.m.h)return true;if(BLOCK.has(M.m.t[ty*M.m.w+tx]))return true}
  for(const s of M.solids)if(x+hw>s[0]&&x-hw<s[0]+s[2]&&y+hh>s[1]&&y-hh<s[1]+s[3])return true;
  for(const n of npcsNow())if(n.solid!==false&&Math.abs(x-n.x)<8&&Math.abs(y-n.y)<6)return true;
  return false}

/* ================= input ================= */
addEventListener('keydown',e=>{const k=e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)&&mode!=='title')e.preventDefault();
  ac();
  if(mode==='dlg'){dlgKey(k);return}
  if(mode==='puzzle'){if(window.PZKey)window.PZKey(k);return}
  if(mode==='journal'){if(k==='escape'||k==='j'){closeJournal()}return}
  if(mode==='title'){if(k==='enter')$('bnew').click();return}
  if(k==='m'){muted=!muted;toast(muted?'Sound off':'Sound on');if(!muted)Music.cur&&(()=>{const c=Music.cur;Music.cur=null;Music.set(c)})()}
  if(mode!=='play')return;
  keys[k]=true;
  if(k==='e'||k==='enter'||k===' ')interact();
  else if(k==='j')openJournal();
  else if(k==='r')toggleRing();
});
addEventListener('keyup',e=>{delete keys[e.key.toLowerCase()]});
addEventListener('blur',()=>{for(const k in keys)delete keys[k]});
$('djour').onclick=()=>openJournal(true);

function toggleRing(){if(!G.flags.hasRing){toast('You carry nothing worth hiding... yet.');return}
  G.ringOn=!G.ringOn;sfx.ring();if(G.ringOn){ringUp(3);toast('You slip on the Ring. The world drains of colour; something stirs far away.','warn');flag('usedRing')}else toast('You pull the Ring from your finger. The colours return.')}

/* ================= interaction ================= */
function nearestInteractive(){let best=null,bd=30;const px=G.px,py=G.py-6;
  for(const n of npcsNow()){if(!n.talk)continue;const d=Math.hypot(n.x-px,n.y-6-py);if(d<bd){bd=d;best={kind:'npc',n,label:'Talk to '+n.name}}}
  if(!G.ringOn)for(const f of followers()){const d=Math.hypot(f.x-G.px,f.y-G.py);if(d<20&&d<bd){bd=d;best={kind:'party',f,label:'Talk to '+f.key[0].toUpperCase()+f.key.slice(1)}}}
  for(const o of M.def.inter||[]){if(o.show&&!o.show())continue;const d=Math.hypot(o.x-G.px,o.y-G.py);if(d<o.r&&d<bd+14){bd=d;best={kind:'obj',o,label:o.label}}}
  return best}
async function interact(){const t=nearestInteractive();if(!t)return;
  if(G.ringOn){toast('No one answers. They cannot see you while you wear the Ring.');return}
  runScript(async()=>{if(t.kind==='npc'){const n=t.n;const dx=G.px-n.x,dy=G.py-n.y;n.face=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');const r=await n.talk();if(typeof r==='string')await say(r)}else if(t.kind==='party'){const r=await window.partyTalk(t.f.key);if(typeof r==='string')await say(r)}else{const r=await t.o.act();if(typeof r==='string')await say(r)}})}
async function runScript(fn){if(scriptDepth>0)return;scriptDepth++;const prev=mode;mode='busy';try{await fn()}catch(e){console.error(e);toast('Script error: '+e.message,'warn')}scriptDepth--;if(mode==='busy')mode='play';if(G&&M)save()}

/* ================= update ================= */
function update(dt){
  G.t+=dt;
  if(mode==='play'){
    let dx=0,dy=0;if(keys.a||keys.arrowleft)dx--;if(keys.d||keys.arrowright)dx++;if(keys.w||keys.arrowup)dy--;if(keys.s||keys.arrowdown)dy++;
    moving=!!(dx||dy);
    if(moving){if(Math.abs(dx)>=Math.abs(dy)&&dx)G.dir=dx<0?'left':'right';else if(dy)G.dir=dy<0?'up':'down';
      const l=Math.hypot(dx,dy),sp=(keys.shift?96:66)*dt;const mx=dx/l*sp,my=dy/l*sp;if(!blocked(G.px+mx,G.py))G.px+=mx;if(!blocked(G.px,G.py+my))G.py+=my;walkT+=dt*8;}
    checkTriggers();
  }
  if(G.ringOn&&mode==='play'){G.ringT=(G.ringT||0)+dt;if(G.ringT>2.2){G.ringT=0;ringUp(1)}}
  /* trail for followers (recorded in every mode so cutscene walks drag the party along) */
  const last=trail[0];if(!last||Math.hypot(G.px-last.x,G.py-last.y)>1.6){trail.unshift({x:G.px,y:G.py,d:G.dir,m:true});if(trail.length>300)trail.pop()}
  else if(moving===false&&last)last.m=false;
  const tx=U.clamp(G.px-VW/2,0,Math.max(0,M.W-VW)),ty=U.clamp(G.py-VH/2-8,0,Math.max(0,M.H-VH));
  CAM.x+=(tx-CAM.x)*Math.min(1,dt*6);CAM.y+=(ty-CAM.y)*Math.min(1,dt*6);
  /* fx: smoke, embers */
  for(const e of M.emit){e.t-=dt;if(e.t<0){e.t=.5+Math.random()*.7;M.fx.push({k:'smoke',x:e.x+(Math.random()-.5)*3,y:e.y,vx:4+Math.random()*4,vy:-9-Math.random()*5,l:0,max:3+Math.random()*1.5})}}
  for(const f of M.fx){f.l+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt}M.fx=M.fx.filter(f=>f.l<f.max);
  /* orcs close in while the Fellowship runs for the stair */
  for(const n of M.extra){if(n.spr==='orc'&&G.flags.orcsComing&&!G.flags.stairsDone){const dx=G.px-n.x,dy=G.py-n.y,d=Math.hypot(dx,dy);if(d>56){n.x+=dx/d*16*dt;n.y+=dy/d*16*dt;n.face=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');n.moving=true;n.walkT=(n.walkT||0)+dt*8}else n.moving=false}}
}
function checkTriggers(){if(scriptDepth>0)return;
  for(const t of M.def.triggers||[]){if(G.flags['trg_'+t.id])continue;const inside=G.px/T>=t.x&&G.px/T<=t.x+t.w&&G.py/T>=t.y&&G.py/T<=t.y+t.h;if(inside&&(!t.if||t.if())){flag('trg_'+t.id);runScript(()=>t.run());return}}
  let allowed=null,blockedMsg=null;
  for(const e of M.def.exits||[]){const inside=G.px/T>=e.x&&G.px/T<=e.x+e.w&&G.py/T>=e.y&&G.py/T<=e.y+e.h;if(!inside)continue;if(!e.if||e.if()){allowed=e;break}else if(!blockedMsg)blockedMsg=e}
  if(allowed){runScript(()=>go(allowed.to,allowed.tx,allowed.ty,allowed.dir))}
  else if(blockedMsg&&(G.t-(G.lastExitMsg||-99))>4){G.lastExitMsg=G.t;toast(blockedMsg.msg||'You cannot go that way yet.');const e=blockedMsg;const cx=e.x+e.w/2,cy=e.y+e.h/2;const ddx=G.px/T-cx,ddy=G.py/T-cy;const l=Math.hypot(ddx,ddy)||1;G.px+=ddx/l*14;G.py+=ddy/l*14}}

/* ================= map transition ================= */
async function go(id,tx,ty,dir){
  setFade(1);await sleep(750);
  M=loadMap(id);M.npcs=null;M.extra=[];G.map=id;G.px=tx*T;G.py=ty*T;if(dir)G.dir=dir;resetTrail();
  CAM.x=U.clamp(G.px-VW/2,0,Math.max(0,M.W-VW));CAM.y=U.clamp(G.py-VH/2,0,Math.max(0,M.H-VH));
  Music.set(M.def.music);initWeather();
  await sleep(150);setFade(0);showLoc(M.def.name);await sleep(500);save()}
function setFade(v){$('fade').style.opacity=v}
function showLoc(name){const l=$('loc');const parts=name.split(' — ');l.innerHTML=parts[0]+(parts[1]?'<small>'+parts[1]+'</small>':'');l.style.opacity=1;setTimeout(()=>l.style.opacity=0,3200)}
setTimeout(()=>{const h=$('hint');if(h)h.style.transition='opacity 3s',h.style.opacity=.0},45000);
async function flash(ms=600){const f=$('flash');f.style.opacity=1;await sleep(80);f.style.opacity=0;await sleep(ms)}
async function shake(ms=500,amp=3){const t0=performance.now();while(performance.now()-t0<ms){CAM.sx=(Math.random()-.5)*amp*2;CAM.sy=(Math.random()-.5)*amp*2;await sleep(30)}CAM.sx=CAM.sy=0}
/* scripted movement */
async function walkTo(who,tx,ty,speed=60){const e=typeof who==='string'?ent(who):who;if(!e)return;const x1=tx*T,y1=ty*T;
  while(true){const dx=x1-e.x,dy=y1-e.y,d=Math.hypot(dx,dy);if(d<2)break;const step=Math.min(d,speed/60);e.x+=dx/d*step;e.y+=dy/d*step;e.face=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');e.moving=true;if(e===PLAYER){moving=true;walkT+=.14}else{e.walkT=(e.walkT||0)+.14}await sleep(16)}
  e.moving=false;if(e===PLAYER)moving=false}
function face(who,dir){const e=typeof who==='string'?ent(who):who;if(e)e.face=dir}
function addNpc(d){const n=mkNpc(Object.assign({solid:false,show:()=>true},d));M.extra.push(n);return n}
function removeNpc(id){M.extra=M.extra.filter(n=>n.id!==id);if(M.npcs)M.npcs=M.npcs.filter(n=>n.id!==id)}
function hideNpc(id){const n=M.def.npcs.find(x=>x.id===id);if(n)G.flags['hide_'+id]=true}
function joinParty(k){if(!G.party.includes(k)){G.party.push(k);toast(k[0].toUpperCase()+k.slice(1)+' joins you.');}}
function setTime(t){flag('time',t)}

async function transition(fn){setFade(1);await sleep(750);await fn();await sleep(150);setFade(0);await sleep(650)}
/* ================= weather / particles ================= */
let WX=[];const FOG=(()=>{const c=new U.Cv(256,96);for(let y=0;y<96;y++)for(let x=0;x<256;x++){const n=U.fbm(x/36,y/20,5,3),a=Math.max(0,n-.42)*1.6*(1-Math.abs(y-48)/52);if(a>0)c.px(x,y,[255,255,255],Math.min(.55,a))}return c.canvas()})();
function initWeather(){WX=[];const k=M.def.weather;const n=k==='petal'||k==='leaf'?34:k==='dust'?60:k==='ember'?30:0;for(let i=0;i<n;i++)WX.push({x:Math.random()*VW,y:Math.random()*VH,p:Math.random()*6,s:.5+Math.random()})}
function drawWeather(t,dt){const k=M.def.weather;if(!k)return;
  if(k==='petal'||k==='leaf'){const cols=k==='petal'?['#ffb0c8','#fff','#ffe27a']:M.def.id==='lorien'?['#ffe27a','#ffd040','#fff0a0']:['#e0742a','#e8a030','#c8501a'];
    for(const p of WX){p.x+=(12+Math.sin(t*1.3+p.p)*10)*dt*p.s;p.y+=(10+p.s*8)*dt;if(p.y>VH+4){p.y=-4;p.x=Math.random()*VW}if(p.x>VW+4)p.x=-4;ctx.fillStyle=cols[(p.p*3|0)%3];ctx.fillRect(p.x|0,p.y|0,2,1);ctx.fillRect((p.x+1)|0,(p.y+1)|0,1,1)}}
  if(k==='dust'){ctx.globalCompositeOperation='lighter';for(const p of WX){p.x+=Math.sin(t*.4+p.p)*3*dt;p.y+=Math.cos(t*.3+p.p)*2*dt-1*dt;if(p.y<0)p.y=VH;if(p.x<0)p.x=VW;if(p.x>VW)p.x=0;ctx.fillStyle=`rgba(160,190,255,${.18+.15*Math.sin(t*2+p.p)})`;ctx.fillRect(p.x|0,p.y|0,1,1)}ctx.globalCompositeOperation='source-over'}
  if(k==='ember'){ctx.globalCompositeOperation='lighter';for(const p of WX){p.y-=(10+p.s*14)*dt;p.x+=Math.sin(t+p.p)*6*dt;if(p.y<0){p.y=VH;p.x=Math.random()*VW}ctx.fillStyle=`rgba(255,${120+p.s*60|0},30,.7)`;ctx.fillRect(p.x|0,p.y|0,1,1)}ctx.globalCompositeOperation='source-over'}
  if(k==='mist'){ctx.globalAlpha=.32;const sc=1.9;for(let i=0;i<4;i++){const ox=((t*(4+i*2)+i*140)%(256*sc+VW))-256*sc;ctx.drawImage(FOG,ox,40+i*70-(CAM.y*.08%40),256*sc,96*sc)}ctx.globalAlpha=1}}
/* flames */
function drawFlame(x,y,s,t,seed=0){const cols=['#c01808','#ff4a10','#ff8a1a','#ffc040','#fff0a0'];ctx.globalCompositeOperation='lighter';
  for(let i=0;i<cols.length;i++){const h=(11-i*2.2)*s*(1+.18*Math.sin(t*14+seed+i)),w=(6-i*1.1)*s;ctx.fillStyle=cols[i];for(let j=0;j<h;j++){const ww=w*Math.sin((j/h)*Math.PI*.9+.25)*(1-j/h*.2)+Math.sin(t*20+j+seed)*.5;ctx.globalAlpha=.55;ctx.fillRect(Math.round(x-ww/2+Math.sin(t*9+j*.5+seed)*.8*(j/h)),Math.round(y-j),Math.max(1,Math.round(ww)),1)}}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
const LSPR={};function lightSpr(r,col){const k=r+col;return LSPR[k]||(LSPR[k]=U.lightSprite(r,col))}
function drawLighting(t){const amb=M.def.ambient();const ring=G.ringOn;if(!amb&&!ring)return;
  lctx.globalCompositeOperation='source-over';lctx.fillStyle=amb||'#ffffff';lctx.fillRect(0,0,VW,VH);lctx.globalCompositeOperation='lighter';
  const cx=CAM.x,cy=CAM.y;
  for(const l of M.lights){const sx=l.x-cx,sy=l.y-cy;if(sx<-l.r||sx>VW+l.r||sy<-l.r||sy>VH+l.r)continue;const fl=l.fl?1+Math.sin(t*9+l.ph)*l.fl+Math.sin(t*23+l.ph*2)*l.fl*.6:1;lctx.globalAlpha=Math.min(1,.9*fl*l.a);const r=l.r*(1+(fl-1)*.3);lctx.drawImage(lightSpr(l.r,l.col),sx-r,sy-r,r*2,r*2)}
  /* party lantern / staff glow */
  const pl=amb?(G.party.includes('gandalf')&&M.def.id.startsWith('moria')?96:50):0;if(pl){lctx.globalAlpha=.8;const gp=followers().find(f=>f.key==='gandalf');if(gp){lctx.drawImage(lightSpr(110,'#cfe4ff'),gp.x-cx-110,gp.y-cy-24-110,220,220)}lctx.globalAlpha=.55;lctx.drawImage(lightSpr(pl,'#ffe8c0'),G.px-cx-pl,G.py-cy-12-pl,pl*2,pl*2)}
  for(const n of M.extra){if(n.glow){lctx.globalAlpha=.8;lctx.drawImage(lightSpr(n.glow,n.glowCol||'#ffffff'),n.x-cx-n.glow,n.y-cy-14-n.glow,n.glow*2,n.glow*2)}}
  lctx.globalAlpha=1;ctx.globalCompositeOperation='multiply';ctx.drawImage(LM,0,0);
  /* bloom */
  ctx.globalCompositeOperation='lighter';for(const l of M.lights){const sx=l.x-cx,sy=l.y-cy;if(sx<-l.r||sx>VW+l.r||sy<-l.r||sy>VH+l.r)continue;ctx.globalAlpha=.16*l.a;ctx.drawImage(lightSpr(l.r,l.col),sx-l.r*.7,sy-l.r*.7,l.r*1.4,l.r*1.4)}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}

/* ================= world render ================= */
function render(t,dt){
  ctx.fillStyle='#000';ctx.fillRect(0,0,VW,VH);if(!M)return;
  const cx=Math.round(CAM.x+(CAM.sx||0)),cy=Math.round(CAM.y+(CAM.sy||0));
  ctx.drawImage(M.ground,cx,cy,VW,VH,0,0,VW,VH);
  if(M.water.length)ctx.drawImage(M.water[Math.floor(t*2.2)%4],cx,cy,VW,VH,0,0,VW,VH);
  const list=[];
  for(const o of M.objs){const sx=o.x-cx,sy=o.y-cy,m=o.meta;if(sx<-m.w||sx>VW+m.w||sy<-8||sy>VH+m.h)continue;list.push({y:o.y,f:()=>{ctx.drawImage(m.cv,Math.round(sx-m.ax),Math.round(sy-m.ay));
      if(m.flame)drawFlame(Math.round(sx+m.flame.x),Math.round(sy+m.flame.y),m.flame.s,t,o.x);
      if(m.fall){drawFall(sx-m.fall.w/2,sy-m.fall.h,m.fall.w,m.fall.h,t)}}})}
  for(const n of npcsNow()){const sx=n.x-cx,sy=n.y-cy;if(sx<-30||sx>VW+30||sy<-10||sy>VH+40)continue;list.push({y:n.y,f:()=>drawNpc(n,sx,sy,t)})}
  followers().forEach(fl=>{list.push({y:fl.y-.1,f:()=>{const s=sprites(PARTYSPR[fl.key]||fl.key);const fr=fl.m?1+(Math.floor(walkT)+fl.key.length)%2:0;const sx=fl.x-cx,sy=fl.y-cy;shadow(sx,sy);ctx.drawImage(s[fl.d||'down'][fr],Math.round(sx-12),Math.round(sy-31))}})});
  list.push({y:G.py,f:()=>{const s=sprites(G.sprite);const fr=moving?1+Math.floor(walkT)%2:0;const sx=G.px-cx,sy=G.py-cy;shadow(sx,sy);if(G.ringOn)ctx.globalAlpha=.45;ctx.drawImage(s[G.dir][fr],Math.round(sx-12),Math.round(sy-31));ctx.globalAlpha=1}});
  list.sort((a,b)=>a.y-b.y).forEach(e=>e.f());
  /* smoke */
  for(const f of M.fx){const a=Math.max(0,1-f.l/f.max)*.45;ctx.fillStyle=`rgba(230,230,240,${a})`;const s=1+f.l;ctx.fillRect(Math.round(f.x-cx),Math.round(f.y-cy),s|0||1,s|0||1)}
  drawLighting(t);
  drawWeather(t,dt);
  if(G.ringOn){ctx.fillStyle='rgba(80,40,0,.25)';ctx.fillRect(0,0,VW,VH);const g=ctx.createRadialGradient(VW/2,VH/2,60,VW/2,VH/2,260);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(40,0,0,.65)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH)}
  else if(G.stats.ring>60){const a=(G.stats.ring-60)/100;const g=ctx.createRadialGradient(VW/2,VH/2,120,VW/2,VH/2,280);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(60,10,0,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH)}
}
function shadow(x,y){ctx.fillStyle='rgba(20,10,50,.32)';ctx.beginPath();ctx.ellipse(Math.round(x),Math.round(y),6,2.4,0,0,7);ctx.fill()}
function drawNpc(n,sx,sy,t){const sp=n.spr==='_none'?null:n.spr;if(n.draw){n.draw(ctx,sx,sy,t);return}if(!sp)return;
  if(n.dog)return;let d=n.face;const dist=Math.hypot(n.x-G.px,n.y-G.py);if(!n.moving&&dist<54&&n.lookAt!==false){const dx=G.px-n.x,dy=G.py-n.y;d=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')}
  const s=sprites(sp),bob=n.moving?0:(Math.sin(t*2+n.ph)>.72?-1:0),fr=n.moving?1+Math.floor((n.walkT||0))%2:0;shadow(sx,sy);if(n.alpha)ctx.globalAlpha=n.alpha;ctx.drawImage(s[d][fr],Math.round(sx-12),Math.round(sy-31+bob));ctx.globalAlpha=1;
  if(n.talk&&dist<40&&mode==='play'){ctx.fillStyle='#ffd070';ctx.fillRect(Math.round(sx)-1,Math.round(sy-38+Math.sin(t*5)),3,1);ctx.fillRect(Math.round(sx),Math.round(sy-37+Math.sin(t*5)),1,1)}}
function drawFall(x,y,w,h,t){ctx.save();ctx.beginPath();ctx.rect(Math.round(x),Math.round(y),w,h);ctx.clip();ctx.globalAlpha=.7;for(let i=0;i<w/3;i++){const off=((t*60*(.7+(i*37%7)/10)+i*29)%h);ctx.fillStyle=i%2?'#ffffff':'#bfe8ff';ctx.fillRect(Math.round(x+i*3),Math.round(y+off),1,7);ctx.fillRect(Math.round(x+i*3),Math.round(y+((off+h/2)%h)),1,5)}ctx.globalAlpha=1;ctx.restore()}

/* ================= dialogue system ================= */
const D={};let DL=null;let dlgScene=null;
const FRAME=(()=>{const c=new U.Cv(320,200);const slate=U.ramp('#2a3350',7,.24),gold=U.ramp('#e8a838',6),silver=U.ramp('#8ab4b0',7,.26);
  /* carved slate plate with a faint knotwork grain */
  for(let y=118;y<200;y++)for(let x=0;x<320;x++){const t=(y-118)/82;let l=2.2-t*.9+Math.sin(x*.11+Math.sin(y*.2)*1.4)*.22+(U.noise(x*.04,y*.1,3)-.5)*.5+(U.bayer(x,y)-.5)*.35;c.px(x,y,slate[U.clamp(Math.round(l),0,6)])}
  /* inset carved border + trim */
  for(let x=4;x<316;x++){c.px(x,128,slate[5]);c.px(x,129,slate[0]);c.px(x,195,slate[0]);c.px(x,196,slate[5])}for(let y=129;y<196;y++){c.px(4,y,slate[5]);c.px(5,y,slate[0]);c.px(314,y,slate[0]);c.px(315,y,slate[5])}
  for(let x=0;x<320;x++){c.px(x,115,gold[0]);c.px(x,116,gold[2]);c.px(x,117,gold[4]);c.px(x,118,gold[5]);c.px(x,119,gold[3]);c.px(x,120,gold[1]);c.px(x,121,gold[0])}
  for(let x=6;x<316;x+=12){const y=123;c.px(x,y,gold[4]);c.px(x-1,y+1,gold[3]);c.px(x+1,y+1,gold[3]);c.px(x,y+2,gold[2])}
  for(let x=0;x<320;x+=6){const y=125+Math.round(Math.sin(x*.35)*1.2);c.px(x+1,y,silver[4]);c.px(x+2,y,silver[3]);c.px(x+3,y+1,silver[2])}
  /* mallorn-leaf feathers fanning out of each lower corner */
  const leaf=(cx,cy,len,wid,ang,ramp,tip)=>{const ca=Math.cos(ang),sa=Math.sin(ang),pts=[];const prof=t=>wid*Math.sin(Math.PI*Math.pow(t,.75));for(let i=0;i<=14;i++){const t=i/14;pts.push([t*len,-prof(t)])}for(let i=14;i>=0;i--){const t=i/14;pts.push([t*len,prof(t)])}
    const P=pts.map(([x,y])=>[cx+x*ca-y*sa,cy+x*sa+y*ca]);c.poly(P,(x,y)=>{const u=((x-cx)*ca+(y-cy)*sa)/len,v=(-(x-cx)*sa+(y-cy)*ca)/wid;return ramp[U.clamp(Math.round(3.1-v*1.5+(1-u)*.5+(U.bayer(x,y)-.5)*.6),0,ramp.length-1)]});
    c.line(cx,cy,cx+ca*len*.96,cy+sa*len*.96,ramp[0],.9);for(let k=1;k<5;k++){const t=k/5,mx=cx+ca*len*t,my=cy+sa*len*t,w=prof(t)*.8;c.line(mx,my,mx+(ca*.5-sa*1)*w,my+(sa*.5+ca*1)*w,ramp[1],.5);c.line(mx,my,mx+(ca*.5+sa*1)*w,my+(sa*.5-ca*1)*w,ramp[1],.5)}
    if(tip)c.px(cx+ca*len,cy+sa*len,gold[5])};
  [1,-1].forEach(s=>{const bx=s>0?20:300,by=176;
    [[-118,40,7,silver],[-98,46,8,slate],[-78,44,8,silver],[-58,38,7,slate],[-38,30,6,silver],[-18,22,5,slate]].forEach(([deg,len,wid,ramp],i)=>{const a=(s>0?deg:180-deg)*Math.PI/180;leaf(bx,by,len,wid,a,ramp===silver?silver:slate,true)});
    [[-108,30,5],[-88,34,5],[-68,30,5]].forEach(([deg,len,wid])=>{const a=(s>0?deg:180-deg)*Math.PI/180;leaf(bx,by+2,len,wid,a,gold,false)});
    c.shade(bx,by+3,5.5,5.5,gold,{dither:0,light:[-.5,-.7,.5]});c.px(bx-2,by,'#fff')});
  /* outer frame */
  for(let i=0;i<3;i++){const col=i===0?'#080a14':i===1?'#44567a':'#1a2036';c.rect(i,i,320-i*2,1,col);c.rect(i,199-i,320-i*2,1,col);c.rect(i,i,1,200-i*2,col);c.rect(319-i,i,1,200-i*2,col)}
  return c.canvas()})();
const dcv=$('dcv'),dctx=dcv.getContext('2d');dctx.imageSmoothingEnabled=false;
function say(id){return new Promise(res=>{const prev=mode;mode='dlg';DL={res,prev,tag:null,last:null};$('dlg').classList.add('on');showNode(id)})}
const val=(v)=>typeof v==='function'?v():v;
function showNode(id){const n=D[id];if(!n){endDlg();return}
  DL.id=id;DL.n=n;if(n.fx)n.fx();
  DL.who=val(n.who)||'narrator';DL.mood=val(n.m)||'neutral';DL.side=n.side||'center';if(n.scene)DL.scene=n.scene;else if(!DL.scene)DL.scene=M?M.def.scene:'shireDay';
  const text=val(n.text)||'';DL.full=text;{const L=text.length;$('dtext').style.fontSize=L>210?'1.12em':L>165?'1.28em':L>120?'1.46em':'1.7em'}DL.pos=0;DL.typing=true;DL.ch=[];DL.sel=0;DL.t0=performance.now();
  const nm=(CAST[DL.who]&&CAST[DL.who].name)||'';$('dname').textContent=n.name||nm;$('dname').style.display=(n.name||nm)&&DL.who!=='narrator'?'flex':'none';
  $('dtext').className=DL.who==='narrator'?'nar':'';$('dtext').innerHTML='';$('dch').innerHTML='';$('dnext').style.display='none';
  $('dchap').textContent='BOOK I · '+['','I','II','III','IV','V','VI','VII','VIII'][G.chapter||1];
  $('dring').innerHTML=[0,1,2,3,4].map(i=>`<i class="${G.stats.ring>=(i+1)*20-5?'on':''}"></i>`).join('');
  dlgScene=scene(DL.scene)}
const fmtT=s=>s.replace(/\*([^*]+)\*/g,'<em>$1</em>');
function finishType(){DL.typing=false;$('dtext').innerHTML=fmtT(DL.full);const n=DL.n;const list=(n.ch||[]).filter(c=>!c.if||c.if());DL.ch=list;
  const box=$('dch');box.innerHTML='';box.className=list.length===1?'one':'';
  list.forEach((c,i)=>{const b=document.createElement('button');b.className='ch'+(i===0?' sel':'');b.innerHTML='<b>'+(i+1)+'</b>'+String(typeof c.t==='function'?c.t():c.t).replace(/\*/g,'');b.onmouseenter=()=>selChoice(i);b.onclick=()=>chooseAt(i);box.appendChild(b)});
  if(!list.length)$('dnext').style.display='block'}
function selChoice(i){DL.sel=i;[...$('dch').children].forEach((b,k)=>b.classList.toggle('sel',k===i))}
function chooseAt(i){if(!DL||DL.typing)return;const c=DL.ch[i];if(!c)return;sfx.pick();let go=c.go;if(c.tag)DL.tag=c.tag;
  if(c.fx){const r=c.fx();if(r==='close'){endDlg();return}if(typeof r==='string')go=r}
  if(go)showNode(go);else endDlg()}
function advance(){if(!DL)return;if(DL.typing){DL.pos=DL.full.length;finishType();return}if(DL.ch.length)return;if(DL.n.next)showNode(DL.n.next);else endDlg()}
function endDlg(){const d=DL;DL=null;$('dlg').classList.remove('on');mode=d.prev==='dlg'?'busy':d.prev;d.res(d.tag)}
function dlgKey(k){if(!DL)return;if(k==='enter'||k===' '||k==='e'){if(DL.ch.length&&!DL.typing)chooseAt(DL.sel);else advance()}
  else if(/^[1-4]$/.test(k)){if(DL.typing)advance();else chooseAt(+k-1)}
  else if(k==='arrowright'||k==='d')selChoice(Math.min(DL.ch.length-1,DL.sel+1));else if(k==='arrowleft'||k==='a')selChoice(Math.max(0,DL.sel-1));else if(k==='arrowdown'||k==='s')selChoice(Math.min(DL.ch.length-1,DL.sel+2));else if(k==='arrowup'||k==='w')selChoice(Math.max(0,DL.sel-2))}
$('dbub').addEventListener('click',()=>{if(DL&&(DL.typing||!DL.ch.length))advance()});
let blinkAt=0;
function sceneFx(c2,sc,t,dt){
  for(const l of sc.lights||[]){const fl=1+(l.flick?Math.sin(t*9+l.x)*l.flick+Math.sin(t*21+l.y)*l.flick*.6:0);c2.globalCompositeOperation='lighter';c2.globalAlpha=Math.min(1,(l.a||.4)*fl);c2.drawImage(lightSpr(l.r,l.col),l.x-l.r,l.y-l.r,l.r*2,l.r*2)}
  c2.globalAlpha=1;c2.globalCompositeOperation='source-over';
  const p=sc.particles;if(p){sc._p=sc._p||Array.from({length:p.n||20},(_,i)=>({x:Math.random()*320,y:Math.random()*200,s:.4+Math.random()*1.2,ph:Math.random()*6,i}));
    for(const q of sc._p){const ty=p.type;if(ty==='petal'||ty==='leaf'){q.x+=(10+Math.sin(t+q.ph)*8)*dt*q.s;q.y+=(8+q.s*10)*dt;if(q.y>200){q.y=-3;q.x=Math.random()*320}if(q.x>322)q.x=-2;c2.fillStyle=p.col[q.i%p.col.length];c2.fillRect(q.x|0,q.y|0,2,1);c2.fillRect((q.x+1)|0,(q.y+1)|0,1,1)}
      else if(ty==='ember'){q.y-=(9+q.s*13)*dt;q.x+=Math.sin(t+q.ph)*5*dt;if(q.y<0){q.y=200;q.x=Math.random()*320}c2.globalCompositeOperation='lighter';c2.fillStyle=p.col[q.i%p.col.length];c2.globalAlpha=.8;c2.fillRect(q.x|0,q.y|0,1,1);c2.globalAlpha=1;c2.globalCompositeOperation='source-over'}
      else if(ty==='dust'){q.x+=Math.sin(t*.5+q.ph)*3*dt;q.y+=Math.cos(t*.4+q.ph)*2*dt-1*dt;if(q.y<0)q.y=200;c2.globalCompositeOperation='lighter';c2.globalAlpha=.25+.2*Math.sin(t*2+q.ph);c2.fillStyle=p.col[0];c2.fillRect(q.x|0,q.y|0,1,1);c2.globalAlpha=1;c2.globalCompositeOperation='source-over'}
      else if(ty==='firework'){}}
    if(p.type==='firework'){sc._fw=sc._fw||[];if(Math.random()<dt*1.4)sc._fw.push({x:40+Math.random()*240,y:30+Math.random()*60,l:0,c:pickR(['#ff5a7a','#ffd23a','#7ad8ff','#8aff7a','#ff9aff'])});
      for(const f of sc._fw){f.l+=dt;const k=f.l/1.4;c2.globalCompositeOperation='lighter';for(let a=0;a<18;a++){const ang=a/18*6.28,r=k*28,x=f.x+Math.cos(ang)*r,y=f.y+Math.sin(ang)*r+k*k*14;c2.globalAlpha=Math.max(0,1-k);c2.fillStyle=f.c;c2.fillRect(x|0,y|0,1,1);c2.fillRect((x+Math.cos(ang))|0,(y+Math.sin(ang))|0,1,1)}c2.globalAlpha=1;c2.globalCompositeOperation='source-over'}sc._fw=sc._fw.filter(f=>f.l<1.4)}}
  if(sc.fog){c2.globalAlpha=.3;const sc2=1.4;for(let i=0;i<3;i++){const ox=((t*(5+i*3)+i*120)%(256*sc2+320))-256*sc2;c2.drawImage(FOG,ox,90+i*40,256*sc2,96*sc2)}c2.globalAlpha=1}}
function dlgFrame(t,dt){if(!DL)return;const n=DL.n;
  if(DL.typing){const prevK=Math.floor(DL.pos);DL.pos+=dt*58;const k=Math.floor(DL.pos);if(k>=DL.full.length)finishType();else{if(k!==prevK){const ch=DL.full[k-1];if(ch&&ch!==' '&&k%2===0)sfx.blip(DL.who==='trudi'?740:DL.who==='gandalf'?260:DL.who==='gimli'?190:320+(DL.who.length*14%80));if(/[.!?]/.test(DL.full[k-1]||'')&&DL.full[k]===' ')DL.pos-=.25*0+0}$('dtext').innerHTML=fmtT(DL.full.slice(0,k).replace(/\*[^*]*$/,m=>m))}}
  dctx.clearRect(0,0,320,200);const sc=dlgScene||scene('dark');dctx.save();dctx.translate(0,-46);dctx.drawImage(sc.cv,0,0);sceneFx(dctx,sc,t,dt);dctx.restore();
  if(DL.who!=='narrator'&&CAST[DL.who]){const talk=DL.typing&&Math.floor(t*9)%2===0,blink=(t%3.6)>3.5;const pc=portrait(DL.who,DL.mood,talk,blink);const bob=Math.round(Math.sin(t*1.6)*.7);
    const px=DL.side==='left'?10:DL.side==='right'?150:80;dctx.fillStyle='rgba(0,0,0,.28)';dctx.beginPath();dctx.ellipse(px+80,196,64,6,0,0,7);dctx.fill();
    /* soft backlight so the bust reads against any scene */
    dctx.globalCompositeOperation='lighter';dctx.globalAlpha=.1;dctx.drawImage(lightSpr(110,'#ffe8c0'),px+80-110,60-20,220,220);dctx.globalAlpha=1;dctx.globalCompositeOperation='source-over';
    dctx.drawImage(pc,px,-8+bob)}
  dctx.drawImage(FRAME,0,0)}
/* big portrait pixel cursor */
(()=>{const c=U.canvas(24,24),x=c.getContext('2d');const px=(a,b,col)=>{x.fillStyle=col;x.fillRect(a,b,1,1)};
  const hand=['..xx............','.x##x...........','.x##x...........','.x##x...xx......','.x##xxx#xx.xx...','.x##x##x##x##x..','xx###########x..','x#############x.','x#############x.','.x###########x..','..x##########x..','...x#########x..','....x########x..','.....xxxxxxxxx..'];
  hand.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='x')px(i+2,j+1,'#2a1206');else if(ch==='#')px(i+2,j+1,j<6?'#f2d8a8':'#d8b078')}));
  const url=c.toDataURL();const w=$('wrap');w.style.setProperty('--cur',`url(${url}) 4 2, auto`);w.style.setProperty('--cur-p',`url(${url}) 4 2, pointer`)})();

/* ================= HUD / journal / endings ================= */
const ringIcon=(()=>{const c=$('ringicon'),x=c.getContext('2d');const R=U.ramp('#e8b030',5);for(let a=0;a<6.28;a+=.03){const r=7;const px=10+Math.cos(a)*r,py=10+Math.sin(a)*r;x.fillStyle=U.hex(R[Math.round(2+Math.sin(a-2)*1.8)]);x.fillRect(Math.round(px),Math.round(py),2,2)}return c})();
let hudT=0,partyKey='';
function updateHud(){const rp=G.stats.ring;$('rbar').firstChild.style.width=rp+'%';$('ringbox').classList.toggle('hide',!G.flags.hasRing);
  const pk=G.party.join(',')+G.sprite;if(pk!==partyKey){partyKey=pk;const box=$('party');box.innerHTML='';G.party.forEach(k=>{const s=sprites(PARTYSPR[k]||k).down[0];const c=document.createElement('canvas');c.width=24;c.height=34;c.getContext('2d').drawImage(s,0,0);box.appendChild(c)})}
  const p=$('prompt');if(mode==='play'){const t=nearestInteractive();if(t&&!G.ringOn){p.style.display='block';p.innerHTML='<kbd>E</kbd>'+t.label}else p.style.display='none'}else p.style.display='none'}
function openJournal(fromDlg){if(mode==='dlg'&&!fromDlg)return;G._jprev=mode;mode='journal';$('jbody').innerHTML=window.journalHTML();$('journal').classList.add('on')}
function closeJournal(){$('journal').classList.remove('on');mode=G._jprev==='dlg'?'dlg':'play'}
window.closeJournal=closeJournal;
function ringLost(){flag('ringLost');runScript(async()=>{await say('ringLostEnd');endBook('ringlost')})}
function endBook(kind){mode='end';Music.set('dark');const b=window.endingHTML(kind);$('ebody').innerHTML=b;$('ending').classList.add('on');$('again').onclick=()=>{try{localStorage.removeItem('fotr1')}catch(e){}location.reload()}}

/* ================= save / load ================= */
function save(){try{const s=JSON.parse(JSON.stringify(G));localStorage.setItem('fotr1',JSON.stringify(s))}catch(e){}}
function loadSave(){try{const s=localStorage.getItem('fotr1');return s?JSON.parse(s):null}catch(e){return null}}

/* ================= main loop ================= */
let lastT=performance.now(),T0=performance.now();
function frame(now){const dt=Math.min(.05,(now-lastT)/1000);lastT=now;const t=(now-T0)/1000;
  if(mode==='title'){titleFrame(t,dt)}
  else if(G&&M){if(mode==='play'||mode==='busy'||mode==='dlg'||mode==='puzzle'||mode==='journal'){if(mode!=='dlg'&&mode!=='puzzle'&&mode!=='journal')update(dt);else{update(dt*.0001)}}
    render(t,dt);if(mode==='dlg')dlgFrame(t,dt);hudT--;if(hudT<=0){hudT=6;updateHud()}}
  requestAnimationFrame(frame)}
function titleFrame(t,dt){const tc=$('tcv').getContext('2d');tc.imageSmoothingEnabled=false;const sc=scene('shireDusk');tc.clearRect(0,0,320,200);tc.drawImage(sc.cv,0,0);sceneFx(tc,sc,t,dt)}
function fit(){const w=$('wrap').clientWidth;$('wrap').style.setProperty('--fs',(w/78)+'px')}
addEventListener('resize',fit);fit();

/* ================= start ================= */
async function startGame(state){G=state;await sleep(10);$('title').classList.remove('on');
  setFade(1);M=loadMap(G.map);M.npcs=null;M.extra=[];resetTrail();CAM.x=U.clamp(G.px-VW/2,0,Math.max(0,M.W-VW));CAM.y=U.clamp(G.py-VH/2,0,Math.max(0,M.H-VH));initWeather();
  mode='busy';Music.set(M.def.music);objective(G.objective);
  await sleep(300);setFade(0);showLoc(M.def.name);mode='play';
  if(!G.flags.started)checkTriggers()}
window.startGame=startGame;window.newGame=newGame;
