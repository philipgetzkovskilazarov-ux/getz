'use strict';
/* =========================================================
   puzzles.js — eight mini-games. puzzle(name,opts) -> Promise.
   ========================================================= */
const PZ={};
function puzzle(name,opts={}){return new Promise(res=>{const prev=mode;mode='puzzle';const pb=$('pbody');pb.innerHTML='';$('panel').classList.add('on');window.PZKey=null;
  const done=r=>{$('panel').classList.remove('on');pb.innerHTML='';window.PZKey=null;window.PZStop&&window.PZStop();window.PZStop=null;mode=prev==='puzzle'?'busy':prev;if(r===true||(r&&r.ok))G.solved[name]=true;(r&&r.ok)||r===true?sfx.win():sfx.lose();res(r)};
  PZ[name](pb,done,opts)})}
function hd(pb,title,desc){pb.innerHTML=`<h2>${title}</h2><div class="note">${desc}</div><div id="pz"></div><div id="pmsg" class="note" style="min-height:1.5em;color:#ffd070"></div><div id="pbtns"></div>`;return{pz:pb.querySelector('#pz'),msg:pb.querySelector('#pmsg'),btns:pb.querySelector('#pbtns')}}
function btn(parent,label,fn,alt){const b=document.createElement('button');b.className='btn'+(alt?' alt':'');b.textContent=label;b.onclick=fn;parent.appendChild(b);return b}
function cvEl(w,h,scale=2){const c=document.createElement('canvas');c.width=w;c.height=h;c.style.cssText=`width:${w*scale}px;height:${h*scale}px;image-rendering:pixelated;border:.2em solid #e8a838;background:#000;display:block;margin:.3em auto`;return c}

/* ---------- 1 · RUNES ---------- */
const GLYPH={S:[[3,0,3,10],[3,1,8,4],[3,6,8,9]],A:[[1,0,1,10],[1,0,7,5],[1,10,7,5]],U:[[1,0,1,10],[8,0,8,10],[1,10,8,10]],R:[[2,0,2,10],[2,1,8,3],[8,3,2,5],[2,5,8,10]],O:[[4,0,0,5],[0,5,4,10],[4,10,8,5],[8,5,4,0]],N:[[1,10,1,0],[1,0,8,10],[8,10,8,0]],E:[[2,0,2,10],[2,2,7,2],[2,5,6,5],[2,8,7,8]],L:[[2,0,2,10],[2,10,8,10],[2,5,5,5]],M:[[0,10,0,0],[0,0,4,5],[4,5,8,0],[8,0,8,10]],T:[[0,1,8,1],[4,1,4,10],[2,10,6,10]]};
function drawGlyph(x,L,px,py,s,col='#ffcc55'){x.strokeStyle=col;x.lineWidth=Math.max(1,s/6);x.lineCap='round';x.beginPath();GLYPH[L].forEach(([a,b,c,d])=>{x.moveTo(px+a*s/10,py+b*s/10);x.lineTo(px+c*s/10,py+d*s/10)});x.stroke()}
PZ.runes=(pb,done)=>{const{pz,msg,btns}=hd(pb,'🔥 THE RING IN THE FIRE',"Gandalf: <i>\"The Ring is cool in the fire, and fiery letters appear — in the old tongue of Elvish script. Read them aloud, Frodo. Match each rune to its letter and spell the name written there.\"</i>");
  const ANS='SAURON',legend=U.shuffle(['S','A','U','R','O','N','E','L','M','T']);let guess=ANS.split('').map(()=>'?');
  const c1=cvEl(300,60,2);pz.appendChild(c1);const x=c1.getContext('2d');
  const t0=performance.now();let raf;const draw=()=>{x.clearRect(0,0,300,60);const g=x.createLinearGradient(0,0,300,0);g.addColorStop(0,'#3a1a0a');g.addColorStop(.5,'#8a3a10');g.addColorStop(1,'#3a1a0a');x.fillStyle=g;x.fillRect(0,0,300,60);
    ANS.split('').forEach((L,i)=>{const gl=.6+.4*Math.sin((performance.now()-t0)/300+i);x.globalAlpha=gl;drawGlyph(x,L,18+i*46,16,28,'#ffd060');x.globalAlpha=1});raf=requestAnimationFrame(draw)};draw();window.PZStop=()=>cancelAnimationFrame(raf);
  const row=document.createElement('div');row.style.cssText='display:flex;gap:.6em;justify-content:center;margin:.4em 0';pz.appendChild(row);
  const slots=ANS.split('').map((_,i)=>{const b=document.createElement('button');b.className='btn';b.style.cssText='width:3em;font-size:1.6em;margin:0';b.textContent='?';b.onclick=()=>{const cur=legend.indexOf(guess[i]);guess[i]=legend[(cur+1)%legend.length];b.textContent=guess[i];sfx.pick()};row.appendChild(b);return b});
  const lg=cvEl(400,46,2);pz.appendChild(lg);const lx=lg.getContext('2d');lx.fillStyle='#1a1008';lx.fillRect(0,0,400,46);legend.forEach((L,i)=>{drawGlyph(lx,L,10+i*39,6,22,'#e8c070');lx.fillStyle='#fff';lx.font='bold 11px monospace';lx.textAlign='center';lx.fillText(L,21+i*39,42)});
  btn(btns,'Read it aloud',()=>{const ok=guess.filter((g,i)=>g===ANS[i]).length;if(ok===ANS.length){msg.textContent='The letters blaze: a name from the Black Speech made plain.';setTimeout(()=>done(true),700)}else{msg.textContent=`${ok} of ${ANS.length} runes are right. The fire is fading...`;sfx.lose()}});
  btn(btns,'Let it fade',()=>done(false),true);window.PZKey=k=>{if(k==='escape')done(false)}};

/* ---------- 2 · HIDE FROM THE RIDER ---------- */
PZ.hide=(pb,done,opts)=>{const{pz,msg,btns}=hd(pb,'🐎 OFF THE ROAD!',"A Black Rider sweeps the lane. Move <kbd>WASD</kbd> / arrows one square at a time, <kbd>Space</kbd> to crouch and wait. Riders see the 5 squares in their row and the squares just above and below. <b>Roots (brown)</b> hide you. <kbd>R</kbd> puts on the Ring — it hides you completely, but at a cost.");
  const COLS=10,ROWS=6,CS=40,cover=new Set(['2,1','2,4','4,2','5,4','6,1','8,3','8,0','4,5','6,3','9,5']);
  const cvs=cvEl(COLS*CS,ROWS*CS,1);pz.appendChild(cvs);const x=cvs.getContext('2d');
  let p={x:0,y:3},R=[{c:3,y:0,d:1},{c:7,y:5,d:-1}],ring=false,used=false,over=false,turn=0;
  const sees=(r,px,py)=>(py===r.y&&Math.abs(px-r.c)<=2)||(px===r.c&&Math.abs(py-r.y)<=1);
  const draw=()=>{x.fillStyle='#3a5a3a';x.fillRect(0,0,COLS*CS,ROWS*CS);for(let i=0;i<COLS;i++)for(let j=0;j<ROWS;j++){x.fillStyle=(i+j)%2?'#44683f':'#3c5e38';x.fillRect(i*CS,j*CS,CS,CS)}
    x.fillStyle='#a88858';x.fillRect(0,2*CS,COLS*CS,2*CS*0+CS);x.fillStyle='#b89868';x.fillRect(0,3*CS,COLS*CS,CS*0+CS*.0);
    cover.forEach(k=>{const[a,b]=k.split(',').map(Number);x.fillStyle='#5a3a1a';x.fillRect(a*CS+6,b*CS+14,CS-12,CS-22);x.fillStyle='#7a5a2a';x.fillRect(a*CS+10,b*CS+10,CS-20,8);x.fillStyle='#2f5a2a';x.fillRect(a*CS+8,b*CS+6,10,6)});
    R.forEach(r=>{for(let i=0;i<COLS;i++)for(let j=0;j<ROWS;j++)if(sees(r,i,j)){x.fillStyle='rgba(220,40,40,.28)';x.fillRect(i*CS,j*CS,CS,CS)}x.fillStyle='#14131e';x.beginPath();x.arc(r.c*CS+CS/2,r.y*CS+CS/2,15,0,7);x.fill();x.fillStyle='#e8f0ff';x.fillRect(r.c*CS+CS/2-5,r.y*CS+CS/2-3,3,3);x.fillRect(r.c*CS+CS/2+2,r.y*CS+CS/2-3,3,3)});
    x.fillStyle='#ffe27a';x.fillRect((COLS-1)*CS+CS-4,0,4,ROWS*CS);
    x.globalAlpha=ring?.45:1;x.fillStyle='#6a4a2a';x.beginPath();x.arc(p.x*CS+CS/2,p.y*CS+CS/2,10,0,7);x.fill();x.fillStyle='#f0c6a6';x.beginPath();x.arc(p.x*CS+CS/2,p.y*CS+CS/2-2,6,0,7);x.fill();x.fillStyle='#4a2e1e';x.fillRect(p.x*CS+CS/2-6,p.y*CS+CS/2-8,12,4);x.globalAlpha=1};
  const step=(dx,dy)=>{if(over)return;const nx=U.clamp(p.x+dx,0,COLS-1),ny=U.clamp(p.y+dy,0,ROWS-1);p={x:nx,y:ny};turn++;
    R.forEach(r=>{r.y+=r.d;if(r.y>=ROWS-1){r.y=ROWS-1;r.d=-1}if(r.y<=0){r.y=0;r.d=1}});
    const hidden=ring||cover.has(p.x+','+p.y);const seen=R.some(r=>sees(r,p.x,p.y));draw();
    if(seen&&!hidden){over=true;msg.textContent='The Rider turns its hooded head... it has seen you!';setTimeout(()=>done({ok:false,ring:used}),900);return}
    if(p.x===COLS-1){over=true;msg.textContent=ring?'You slip across — but something has noticed the Ring...':'Safe in the ditch beyond the road!';setTimeout(()=>done({ok:true,ring:used}),800)}};
  window.PZKey=k=>{if(k==='arrowup'||k==='w')step(0,-1);else if(k==='arrowdown'||k==='s')step(0,1);else if(k==='arrowleft'||k==='a')step(-1,0);else if(k==='arrowright'||k==='d')step(1,0);else if(k===' ')step(0,0);else if(k==='r'){ring=!ring;used=used||ring;msg.textContent=ring?'You slip on the Ring. The Riders cannot see you... but they can feel it.':'You take the Ring off.';draw()}};
  draw();msg.textContent=opts.tries?`Attempt ${opts.tries+1}. Watch their rhythm: they sweep up and down their column.`:'They sweep up and down. Use the roots to wait.';
  [['↑',0,-1],['←',-1,0],['↓',0,1],['→',1,0]].forEach(([l,a,b])=>btn(btns,l,()=>step(a,b),true));btn(btns,'Wait',()=>step(0,0));btn(btns,'💍 Ring',()=>window.PZKey('r'),true)};

/* ---------- 3 · GANDALF'S LETTER ---------- */
PZ.letter=(pb,done)=>{const{pz,msg,btns}=hd(pb,"✉ GANDALF'S TORN LETTER","A mouse has nibbled the page and the words have scattered. Tap words in the right order to rebuild each line.");
  const lines=[["Trust","the","Ranger","named","Strider;","he","is","a","friend."],["Leave","Bree","by","morning,","and","do","not","use","the","Ring."],["Danger","hunts","you."]];let li=0,built=[],bank=[];
  const bankEl=document.createElement('div'),buildEl=document.createElement('div');bankEl.style.cssText=buildEl.style.cssText='display:flex;flex-wrap:wrap;gap:.3em;margin:.4em 0;min-height:2.6em';buildEl.style.background='#eadbb4';buildEl.style.padding='.3em .5em';buildEl.style.border='.15em solid #5a4020';buildEl.style.color='#2a1c10';buildEl.style.fontSize='1.3em';buildEl.style.borderRadius='.3em';pz.append(buildEl,bankEl);
  const lineEl=document.createElement('div');lineEl.className='note';pz.prepend(lineEl);
  const init=()=>{bank=U.shuffle(lines[li].map((w,i)=>({w,i})));built=[];render();lineEl.textContent=`Line ${li+1} of ${lines.length}`};
  const render=()=>{buildEl.innerHTML=built.length?'':'<i style="opacity:.5">(tap the words below)</i>';built.forEach((t,k)=>{const b=document.createElement('button');b.className='btn alt';b.style.margin=0;b.textContent=t.w;b.onclick=()=>{built.splice(k,1);bank.push(t);render()};buildEl.appendChild(b)});
    bankEl.innerHTML='';bank.forEach((t,k)=>{const b=document.createElement('button');b.className='btn';b.style.margin=0;b.textContent=t.w;b.onclick=()=>{bank.splice(k,1);built.push(t);sfx.pick();render()};bankEl.appendChild(b)})};
  btn(btns,'Check the line',()=>{if(bank.length){msg.textContent='Use every scrap of the line.';return}const ok=built.every((t,k)=>t.i===k);if(ok){li++;if(li>=lines.length){msg.textContent='The letter is whole.';setTimeout(()=>done(true),600)}else{msg.textContent='That reads true. Next line...';init()}}else{const n=built.filter((t,k)=>t.i===k).length;msg.textContent=`${n} of ${built.length} words are in the right place.`;sfx.lose()}});
  btn(btns,'Reset line',init,true);btn(btns,'Give up',()=>done(false),true);init();window.PZKey=k=>{if(k==='escape')done(false)}};

/* ---------- 4 · FIRE DEFENCE (Weathertop) ---------- */
PZ.fire=(pb,done)=>{const{pz,msg,btns}=hd(pb,'🔥 THE FIRE ON WEATHERTOP',"Wraiths close in. <b>Click</b> to hurl a burning brand at them; they flee from fire. Do not let more than two reach the flames!");
  const W=240,H=150,cv=cvEl(W,H,3);pz.appendChild(cv);const x=cv.getContext('2d');const C={x:W/2,y:H/2+4};
  let riders=[],shots=[],spawn=0,spawned=0,TOTAL=9,hits=0,misses=0,fin=false,last=performance.now(),mouse={x:W/2,y:20},cool=0,fl=0;
  cv.onmousemove=e=>{const r=cv.getBoundingClientRect();mouse={x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}};
  cv.onclick=e=>{cv.onmousemove(e);if(cool>0||fin)return;cool=.3;const a=Math.atan2(mouse.y-C.y,mouse.x-C.x);shots.push({x:C.x,y:C.y,vx:Math.cos(a)*190,vy:Math.sin(a)*190,l:0});sfx.pick()};
  const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;cool-=dt;fl+=dt;spawn-=dt;
    if(!fin&&spawned<TOTAL&&spawn<=0){spawn=2.4;spawned++;const a=Math.random()*6.28;riders.push({a,r:130,s:14+Math.random()*7,st:0,w:Math.random()*6})}
    riders.forEach(r=>{if(r.st===0){r.r-=r.s*dt;if(r.r<=24){r.st=1;misses++;sfx.zap();msg.textContent=`A blade bites! (${misses})`}}else{r.r+=60*dt}r.w+=dt});
    shots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.l+=dt;riders.forEach(r=>{if(r.st!==0)return;const rx=C.x+Math.cos(r.a)*r.r,ry=C.y+Math.sin(r.a)*r.r*.82;if(Math.hypot(s.x-rx,s.y-ry)<11){r.st=2;s.l=9;hits++;msg.textContent='A Rider shrieks and flees from the flame!'}})});
    shots=shots.filter(s=>s.l<1.4);riders=riders.filter(r=>r.r<150);
    if(!fin&&(misses>=3||(spawned>=TOTAL&&riders.length===0))){fin=true;setTimeout(()=>done({ok:misses<3,hits,misses:Math.min(3,misses)}),800)}
    /* draw */
    x.fillStyle='#0a1028';x.fillRect(0,0,W,H);for(let i=0;i<60;i++){x.fillStyle=`rgba(255,255,255,${.2+.4*((i*37)%7)/7})`;x.fillRect((i*53)%W,(i*29)%H,1,1)}
    x.fillStyle='#1a2a3a';x.beginPath();x.ellipse(C.x,C.y+8,120,60,0,0,7);x.fill();
    const g=x.createRadialGradient(C.x,C.y,4,C.x,C.y,50);g.addColorStop(0,'rgba(255,170,60,.7)');g.addColorStop(1,'rgba(255,100,20,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
    for(let k=0;k<5;k++){x.fillStyle=['#c01808','#ff4a10','#ff8a1a','#ffc040','#fff0a0'][k];const h=11-k*2+Math.sin(fl*14+k)*2;x.fillRect(C.x-4+k*.8,C.y-h,8-k*1.6,h)}
    x.fillStyle='#6a4a2a';x.fillRect(C.x-8,C.y,16,3);
    x.fillStyle='#f0c6a6';x.beginPath();x.arc(C.x-14,C.y+6,3,0,7);x.fill();x.fillStyle='#4a2e1e';x.fillRect(C.x-17,C.y+2,6,3);x.fillStyle='#6c5a38';x.fillRect(C.x-17,C.y+8,6,5);
    riders.forEach(r=>{const rx=C.x+Math.cos(r.a)*r.r,ry=C.y+Math.sin(r.a)*r.r*.82;x.globalAlpha=r.st===0?.95:.5;x.fillStyle='#14131e';x.beginPath();x.moveTo(rx,ry-12);x.lineTo(rx+7,ry+8);x.lineTo(rx-7,ry+8);x.fill();x.fillStyle='#e8f0ff';x.fillRect(rx-2,ry-6,1,1);x.fillRect(rx+1,ry-6,1,1);x.globalAlpha=1});
    shots.forEach(s=>{x.fillStyle='#ffd060';x.fillRect(s.x-1,s.y-1,3,3);x.fillStyle='#ff6a10';x.fillRect(s.x-2,s.y,1,1)});
    x.strokeStyle='#ffd070';x.beginPath();x.arc(mouse.x,mouse.y,4,0,7);x.stroke();
    if(!window.PZStop)return;requestAnimationFrame(loop)};
  window.PZStop=()=>{window.PZStop=null};requestAnimationFrame(loop);msg.textContent='Hits: 0 · Cuts: 0';
  const tick=setInterval(()=>{if(!window.PZStop){clearInterval(tick);return}if(!fin)msg.textContent=`Wraiths repelled: ${hits} · Cuts: ${misses}/3`},300);
  btn(btns,'Slip on the Ring instead',()=>{fin=true;done({ok:false,hits:0,misses:3,ring:true})},true)};

/* ---------- 5 · ATHELAS (Rivendell healing) ---------- */
PZ.athelas=(pb,done)=>{const{pz,msg,btns}=hd(pb,'🌿 THE HEALING BREW',"Elrond: <i>\"A Morgul-blade seeks the heart. Brew <b>one leaf, one bark and one flower</b> — and take care that none of them is a poison.\"</i> Aragorn: <i>\"The weed of the old ruins: kingsfoil. Bark from the river willow. And the meadow's golden star.\"</i>");
  const H={leaf:[['Mint','a sweet leaf from wet ground'],['Hemlock','a green leaf with purple spots — a deadly poison'],['Kingsfoil (athelas)','a pale-green leaf from old roadsides and ruins, smelling of fresh rain']],
    bark:[['Oak-bark','grey bark from a dry hill'],['Willow-bark','silver bark from the river-bank, cooling a fever'],['Alder-bark','dark bark that stains the water black']],
    flower:[['Foxglove','pink bells that hang like thimbles — a poison'],['Elanor','a golden star of the meadows, strengthening the heart'],['Pale-bell','white bells from the hills, which sweeten but do nothing']]};
  const sel={leaf:null,bark:null,flower:null},ANS={leaf:2,bark:1,flower:1};
  Object.keys(H).forEach(cat=>{const row=document.createElement('div');row.style.cssText='display:flex;gap:.4em;margin:.3em 0;flex-wrap:wrap';const lab=document.createElement('div');lab.style.cssText='width:5em;color:#e8c878';lab.textContent=cat.toUpperCase();row.appendChild(lab);
    H[cat].forEach(([n,d],i)=>{const c=document.createElement('div');c.className='card';c.style.cssText='flex:1;min-width:11em;margin:0;cursor:pointer;font-size:1em';c.innerHTML=`<b>${n}</b><br><small>${d}</small>`;c.onclick=()=>{sel[cat]=i;[...row.querySelectorAll('.card')].forEach((e,k)=>e.classList.toggle('sel',k===i));sfx.pick()};row.appendChild(c)});pz.appendChild(row)});
  let tries=0;btn(btns,'Brew it',()=>{if(Object.values(sel).some(v=>v===null)){msg.textContent='Choose one of each.';return}tries++;const okAll=Object.keys(ANS).every(k=>sel[k]===ANS[k]);
    if(okAll){msg.textContent='The brew steams with a green, healing smell.';setTimeout(()=>done(true),700)}else if(Object.keys(sel).some(k=>(k==='leaf'&&sel[k]===1)||(k==='flower'&&sel[k]===0))){msg.textContent='Poison! Frodo coughs and gasps — Elrond catches the cup. Choose again, carefully.';sfx.zap()}
    else if(tries>=3){msg.textContent='It is a weak draught.';setTimeout(()=>done(false),800)}else{msg.textContent='Not quite right. The wound is still cold. Try again.';sfx.lose()}});
  window.PZKey=k=>{};};

/* ---------- 6 · DOORS OF DURIN ---------- */
PZ.door=(pb,done,opts)=>{const{pz,msg,btns}=hd(pb,'🌙 THE DOORS OF DURIN',"Moonlight reveals the silver letters: <b>\"The Doors of Durin, Lord of Moria. Speak, friend, and enter.\"</b> Gandalf has been trying every Elvish word he can remember. Which one do you speak?");
  let tries=opts.hard?2:3,wrong=0;
  const cv=cvEl(160,60,3);pz.appendChild(cv);const x=cv.getContext('2d');
  const draw=()=>{x.fillStyle='#10163a';x.fillRect(0,0,160,60);for(let i=0;i<30;i++){x.fillStyle='rgba(255,255,255,.6)';x.fillRect((i*47)%160,(i*13)%24,1,1)}x.fillStyle='#2a3050';x.fillRect(40,20,80,40);x.beginPath();x.arc(80,22,40,Math.PI,0);x.fill();x.strokeStyle='#cfe8ff';x.lineWidth=1;x.beginPath();x.arc(80,28,15,0,7);x.stroke();x.beginPath();x.arc(80,28,6,0,7);x.stroke();x.beginPath();x.moveTo(80,2);x.lineTo(80,60);x.stroke();for(let i=0;i<3;i++){x.beginPath();x.moveTo(60+i*10,60);x.lineTo(66+i*8,44);x.stroke()}};draw();
  const gl=document.createElement('div');gl.className='card';gl.style.fontSize='1em';gl.innerHTML="<b>Gandalf's notebook</b> (Elvish words): <i>annon</i> — gate · <i>aear</i> — sea · <i>dúnadan</i> — man of the West · <i>mithrandir</i> — the Grey Pilgrim · <i>(the word for 'friend' is missing; every Elf and Dwarf already knows it)</i>";pz.appendChild(gl);
  const row=document.createElement('div');row.style.cssText='display:flex;gap:.4em;flex-wrap:wrap;margin:.4em 0';pz.appendChild(row);
  U.shuffle(['Annon','Mellon','Aear','Dúnadan','Mithrandir']).forEach(w=>{const b=btn(row,w,()=>{if(w==='Mellon'){msg.textContent='Silver lines blaze across the stone. The doors tremble — and swing open.';sfx.door();setTimeout(()=>done({ok:true,tries:wrong}),900)}else{wrong++;tries--;sfx.lose();msg.textContent=tries<=0?'The water ripples. Something stirs in the lake...':`"${w}" — nothing happens. The lake ripples.`;if(wrong>=2&&!opts.hard)msg.textContent+=' (Hint: it is the one word in the notebook that is missing.)';if(tries<=0){[...row.children].forEach(c=>c.disabled=true);setTimeout(()=>done({ok:false,tries:wrong}),1200)}b.disabled=true}})});
  window.PZKey=k=>{}};

/* ---------- 7 · BROKEN STAIR ---------- */
PZ.stairs=(pb,done)=>{const{pz,msg,btns}=hd(pb,'🪜 THE STAIR OF KHAZAD-DÛM',"The great stair is crumbling. <b>Memorise the safe steps</b> as they flash, then tap the safe step on each landing from the bottom up. Three missteps and you fall!");
  const COLS=3,ROWS=7;let path=[];let c=1;for(let r=0;r<ROWS;r++){path.push(c);c=U.clamp(c+Math.floor(Math.random()*3)-1,0,COLS-1)}
  let phase='show',row=0,lives=3,shownUntil=performance.now()+3800;
  const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(3,5em);gap:.3em;justify-content:center;margin:.5em auto';pz.appendChild(grid);const cells=[];
  for(let r=ROWS-1;r>=0;r--)for(let k=0;k<COLS;k++){const b=document.createElement('button');b.className='btn';b.style.cssText='height:2.6em;margin:0;background:#5a5a78;border-color:#2a2a3a';b.dataset.r=r;b.dataset.c=k;b.onclick=()=>press(r,k,b);grid.appendChild(b);cells.push(b)}
  const paint=()=>{cells.forEach(b=>{const r=+b.dataset.r,k=+b.dataset.c;b.style.background=phase==='show'&&path[r]===k?'#ffd070':(b.dataset.done?'#6ac86a':b.dataset.bad?'#222':'#5a5a78')})};
  paint();msg.textContent='Remember the glowing steps...';
  const timer=setInterval(()=>{if(!window.PZStop)return;if(phase==='show'&&performance.now()>shownUntil){phase='play';paint();msg.textContent='Go! Climb from the bottom landing.'}},100);window.PZStop=()=>clearInterval(timer);
  function press(r,k,b){if(phase!=='play')return;if(r!==row){msg.textContent='Take the steps in order — from the bottom up.';return}
    if(path[r]===k){b.dataset.done=1;row++;sfx.pick();paint();if(row>=ROWS){phase='end';msg.textContent='You leap the final gap!';clearInterval(timer);setTimeout(()=>done({ok:true}),600)}}
    else{lives--;b.dataset.bad=1;sfx.zap();paint();msg.textContent=`The step crumbles! (${lives} lives left)`;if(lives<=0){phase='end';clearInterval(timer);setTimeout(()=>done({ok:false}),800)}}}
  window.PZKey=k=>{}};

/* ---------- 8 · MIRRORS OF LÓRIEN ---------- */
PZ.mirrors=(pb,done)=>{const{pz,msg,btns}=hd(pb,'🔆 THE SILVER MIRROR-STONES',"Starlight enters from the left. Click a mirror to turn it between <b>/</b> and <b>\\</b>. Guide the beam through the stones to the crystal at the top right.");
  const COLS=10,ROWS=6,CS=36;const mirrors={'3,5':'\\','3,1':'\\','6,1':'/','6,4':'/','8,4':'\\','1,2':'/','5,3':'\\','7,2':'/','4,4':'/'};const walls=new Set(['2,0','4,0','9,1','5,5','7,5','0,0']);const target=[8,0];
  const cv=document.createElement('canvas');cv.width=COLS*CS;cv.height=ROWS*CS;cv.style.cssText='border:.2em solid #e8a838;background:#0a1020;display:block;margin:.3em auto;width:'+COLS*CS*1.4+'px';pz.appendChild(cv);const x=cv.getContext('2d');
  const trace=()=>{let cx=0,cy=5,dx=1,dy=0;const pts=[[0,5.5*CS/CS]];const path=[[cx,cy]];let hit=false;for(let n=0;n<80;n++){cx+=dx;cy+=dy;if(cx<0||cy<0||cx>=COLS||cy>=ROWS)break;path.push([cx,cy]);if(walls.has(cx+','+cy))break;if(cx===target[0]&&cy===target[1]){hit=true;break}const m=mirrors[cx+','+cy];if(m){[dx,dy]=m==='/'?[-dy,-dx]:[dy,dx]}}return{path,hit}};
  let t0=performance.now();const draw=()=>{const{path,hit}=trace();x.fillStyle='#0a1020';x.fillRect(0,0,COLS*CS,ROWS*CS);for(let i=0;i<COLS;i++)for(let j=0;j<ROWS;j++){x.strokeStyle='#1c2848';x.strokeRect(i*CS,j*CS,CS,CS)}
    walls.forEach(k=>{const[a,b]=k.split(',').map(Number);x.fillStyle='#4a4a6a';x.fillRect(a*CS+3,b*CS+3,CS-6,CS-6);x.fillStyle='#6a6a8a';x.fillRect(a*CS+3,b*CS+3,CS-6,6)});
    x.strokeStyle=hit?'#fff6a0':'#9ae8ff';x.lineWidth=3;x.shadowColor=hit?'#ffe27a':'#9ae8ff';x.shadowBlur=10;x.beginPath();path.forEach(([a,b],i)=>{const px=(a+.5)*CS,py=(b+.5)*CS;if(i===0)x.moveTo(px-CS,py);else x.lineTo(px,py)});x.stroke();x.shadowBlur=0;
    Object.entries(mirrors).forEach(([k,m])=>{const[a,b]=k.split(',').map(Number);x.fillStyle='#2a3a5a';x.fillRect(a*CS+4,b*CS+4,CS-8,CS-8);x.strokeStyle='#e8f4ff';x.lineWidth=4;x.beginPath();if(m==='/'){x.moveTo(a*CS+6,b*CS+CS-6);x.lineTo(a*CS+CS-6,b*CS+6)}else{x.moveTo(a*CS+6,b*CS+6);x.lineTo(a*CS+CS-6,b*CS+CS-6)}x.stroke()});
    x.fillStyle='#fff';x.fillRect(0,5*CS+CS/2-4,8,8);const tx=target[0]*CS+CS/2,ty=target[1]*CS+CS/2;x.fillStyle=hit?'#fff6a0':'#5a6a8a';x.beginPath();x.moveTo(tx,ty-14);x.lineTo(tx+10,ty);x.lineTo(tx,ty+14);x.lineTo(tx-10,ty);x.closePath();x.fill();
    return hit};
  cv.onclick=e=>{const r=cv.getBoundingClientRect(),a=Math.floor((e.clientX-r.left)/r.width*COLS),b=Math.floor((e.clientY-r.top)/r.height*ROWS),k=a+','+b;if(mirrors[k]){mirrors[k]=mirrors[k]==='/'?'\\':'/';sfx.pick();if(draw()){msg.textContent='The crystal blazes with white fire!';cv.onclick=null;setTimeout(()=>done(true),900)}}};
  draw();btn(btns,'Leave it',()=>done(false),true);window.PZKey=k=>{if(k==='escape')done(false)}};
window.puzzle=puzzle;
