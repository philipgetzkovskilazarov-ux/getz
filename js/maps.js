'use strict';
/* =========================================================
   maps.js — the eight regions of Book One.
   Each map: terrain (painted with the MapGrid DSL), props,
   NPCs, exits, interactables and story triggers.
   Coordinates are tile units (16px); props anchor at tile bottom-centre.
   ========================================================= */
(()=>{
const MAPS={};
window.MAPS=MAPS;
const F=()=>G.flags;
/* ---- layout helper handed to every build() ---- */
class Layout{
  constructor(m,seed){this.m=m;this.objs=[];this.lights=[];this.rng=U.rng(seed||1);this.reserved=[]}
  obj(name,tx,ty,o){this.objs.push({name,tx,ty,o});return this}
  row(name,tx,ty,n,dx,o){for(let i=0;i<n;i++)this.obj(name,tx+i*dx,ty,o);return this}
  reserve(x,y,w,h){this.reserved.push([x,y,w,h]);return this}
  free(tx,ty,ok=['grass','lush','leaf','moss']){const t=TERR[this.m.at(tx,ty)];if(!ok.includes(t))return false;for(const[x,y,w,h]of this.reserved)if(tx>=x&&tx<x+w&&ty>=y&&ty<y+h)return false;return true}
  /* scatter props across a region, never on paths/water/reserved area */
  forest(name,x,y,w,h,n,o={},ok){const r=this.rng;let k=0,tries=0;const placed=[];
    while(k<n&&tries<n*40){tries++;const tx=x+r()*w,ty=y+r()*h;if(!this.free(Math.floor(tx),Math.floor(ty),ok))continue;
      if(placed.some(p=>Math.abs(p[0]-tx)<(o.gap||2.2)&&Math.abs(p[1]-ty)<(o.gapY||1.6)))continue;
      placed.push([tx,ty]);const oo=typeof o==='function'?o(r):o;this.obj(typeof name==='function'?name(r):name,tx,ty,oo.o||oo);k++}return this}
}
window.Layout=Layout;
const rectFree=(m,x,y,w,h,t)=>m.rect(t,x,y,w,h);

/* =================================================================
   1. THE SHIRE
   ================================================================= */
MAPS.shire={id:'shire',name:'The Shire — Hobbiton',w:64,h:46,seed:7,scene:'shireDay',music:'shire',weather:'petal',
 pal:{grass:'#58b83c',lush:'#3da64a',dirt:'#c4965a',water:'#38a8e4',plank:'#b07a40',flag:'#c0b8a4',gravel:'#a8a08a'},
 ambient:()=>({day:null,dusk:'#c79aa6',night:'#4a5a9a'})[F().time||'day'],
 build(m,L){m.fillT('grass');
  m.ell('lush',14,11,14,10,.5);m.ell('lush',48,14,11,9,.5);m.ell('lush',36,36,10,7,.5);m.ell('lush',8,34,8,6,.5);
  m.path('water',[[19,0],[20,10],[24,18],[27,24],[30,32],[33,46]],1.8,1.2);
  m.path('dirt',[[14,14],[14,21],[22,23],[34,23],[44,22],[63,23]],1.5,.8);
  m.path('dirt',[[30,25],[31,35]],1.2,.6);m.path('dirt',[[14,21],[8,22],[6,28]],1.1,.6);m.path('dirt',[[44,22],[47,15]],1.2,.6);m.path('dirt',[[56,22],[57,34]],1.0,.6);
  m.rect('plank',24,22,6,3);m.rect('plank',46,12,6,4);m.rect('flag',11,14,7,2);
  L.reserve(8,5,14,12).reserve(0,20,64,6).reserve(43,10,13,9).reserve(23,20,8,6);
  /* Bag End & neighbours */
  L.obj('hole',14,14.2,{w:168,h:134,dr:22,wx:58,chx:36,seed:5});L.obj('flowerbed',9.5,14.8,{w:40}).obj('flowerbed',18.7,14.8,{w:40,cols:['#ffd23a','#ff9a3a','#ff5a7a']});
  L.obj('fenceH',9,16.6,[4]).obj('fenceH',18,16.6,[4]);L.obj('lamp',11.4,16,{}).obj('lamp',16.6,16,{});
  L.obj('fenceH',27,22.4,[6,{col:'#b88a50'}]).obj('fenceH',27,25.4,[6,{col:'#b88a50'}]);L.obj('smial',5.5,23.5,{door:'#c0392b'});L.obj('smial',7,33,{door:'#2f6fc0'});L.obj('smial',31.5,36.5,{door:'#c8a020'});L.obj('smial',55,31.5,{door:'#8a3ab0'});L.obj('smial',38,31,{door:'#2f9a4a'});
  L.obj('flowerbed',33,37.6,{}).obj('barrel',26.5,19,[]).obj('crate',27.5,19,[{fruit:'#e84a4a'}]);
  L.obj('sign',16.5,22.6,{seed:2}).obj('fireworkCart',20.8,19.6,[]);L.obj('well',36,26.6,[]);
  /* Party field */
  L.obj('partyTree',49,10.7,[]);L.obj('tent',40,11,{cols:['#d83a3a','#f4f0e0']}).obj('tent',58,9.5,{cols:['#2f7fd0','#f4f0e0']}).obj('tent',60,17,{cols:['#e0a020','#f4f0e0']});
  L.obj('table',42.5,17.5,{n:5,seed:1}).obj('table',54.5,17.8,{n:5,seed:4}).obj('table',48,19.2,{n:4,seed:7});
  L.obj('bench',46,12.6,[2]).obj('bench',52,12.6,[2]);L.obj('lamp',44.5,10.6,{col:'#ffd070'}).obj('lamp',53.5,10.6,{col:'#ffd070'}).obj('lamp',44,18.6,{col:'#ffd070'}).obj('lamp',57,18.6,{col:'#ffd070'});
  L.obj('haybale',38,15.5,[]).obj('haybale',39.5,16,[]).obj('cart',60.5,13,[]);
  /* Trees & foliage */
  L.forest('oak',1,3,62,40,26,r=>({w:56+Math.floor(r()*18),h:66+Math.floor(r()*18),seed:Math.floor(r()*90)}),['grass','lush']);
  L.forest('birch',1,3,62,40,8,{},['grass','lush']);L.forest('bush',2,3,60,40,30,r=>({flowers:r()<.5?6:0,seed:Math.floor(r()*90),leaf:U.pick(['#3f9a3a','#4aa83a','#2f8a3a'],r)}),['grass','lush']);
  L.forest('rock',2,3,60,40,8,{moss:1},['grass','lush']);L.forest('mushrooms',2,3,60,40,6,{},['grass','lush']);
  L.forest('tallGrass',2,3,60,40,26,{},['grass','lush']);},
 decor:[{on:['grass','lush'],density:1.1,cols:['#ff5a7a','#ffd23a','#ffffff','#c58bff','#ff9a3a','#5ac8ff'],draw:'flower',seed:1},{on:['grass','lush'],density:3.4,cols:['#2f7a2f','#4aa83a'],draw:'tuft',seed:2},{on:['grass','lush'],density:.4,cols:['#ffe27a','#fff'],draw:'flower2',seed:3}],
 npcs:[
  {id:'gandalf',spr:'gandalf',por:'gandalf',name:'Gandalf',x:18.5,y:20.5,dir:'left',talk:()=>shireGandalf(),show:()=>!F().gandalfGone},
  {id:'bilbo',spr:'bilbo',por:'bilbo',name:'Bilbo',x:13,y:16.1,dir:'down',talk:()=>shireBilbo(),show:()=>!F().bilboGone},
  {id:'sam',spr:'sam',por:'sam',name:'Sam',x:30.5,y:34.5,dir:'down',talk:()=>shireSam(),show:()=>!G.party.includes('sam')},
  {id:'merry',spr:'merry',por:'merry',name:'Merry',x:22.4,y:20.8,dir:'left',talk:()=>shireMerry(),show:()=>!G.party.includes('merry')},
  {id:'pippin',spr:'pippin',por:'pippin',name:'Pippin',x:23.4,y:21.2,dir:'left',talk:()=>shirePippin(),show:()=>!G.party.includes('pippin')},
  {id:'gaffer',wander:22,spr:'gaffer',por:'gaffer',name:'Gaffer Gamgee',x:28.5,y:37,dir:'right',talk:()=>'gaffer1',show:()=>true},
  {id:'lobelia',wander:22,spr:'lobelia',por:'lobelia',name:'Lobelia',x:40.5,y:21,dir:'down',talk:()=>'lobelia1',show:()=>F().time!=='night'},
  {id:'hobA',wander:22,spr:'hobbitA',por:'pippin',name:'Hobbit',x:44,y:19.8,dir:'up',talk:()=>'hobA',show:()=>F().time==='dusk'},
  {id:'hobB',wander:22,spr:'hobbitB',por:'merry',name:'Hobbit',x:50,y:21.2,dir:'left',talk:()=>'hobB',show:()=>F().time==='dusk'},
  {id:'hobC',wander:22,spr:'hobbitC',por:'sam',name:'Hobbit',x:55.5,y:19.6,dir:'down',talk:()=>'hobC',show:()=>F().time==='dusk'},
  {id:'hobK',wander:22,spr:'hobbitKid',por:'pippin',name:'Hobbit child',x:47,y:21.5,dir:'down',talk:()=>'hobK',show:()=>F().time==='dusk'},
  {id:'hobD',wander:22,spr:'hobbitC',por:'sam',name:'Neighbour',x:6.5,y:25.5,dir:'down',talk:()=>'hobD',show:()=>F().time!=='night'}],
 exits:[{x:62.5,y:20,w:1.5,h:6,to:'bree',tx:3,ty:21,if:()=>false,msg:"Not yet. There is more to settle before you leave the Shire."}],
 inter:[{id:'bagdoor',x:14*16,y:14.4*16,r:20,label:'Bag End',act:()=>shireDoor(),show:()=>true},
        {id:'fwcart',x:20.8*16,y:19.4*16,r:22,label:'Gandalf\'s fireworks cart',act:()=>say('fwcart'),show:()=>!F().fireworksDone},
        {id:'ptree',x:49*16,y:10.5*16,r:30,label:'The Party Tree',act:()=>say('ptree'),show:()=>true}],
 triggers:[{id:'start',x:0,y:0,w:64,h:46,if:()=>!F().started,run:()=>storyStart()},{id:'eastRoad',x:58,y:20,w:5,h:6,if:()=>!!F().readyToLeave,run:()=>storyRoad()}],
 spawn:[14,16]};

/* =================================================================
   2. BREE
   ================================================================= */
MAPS.bree={id:'bree',name:'Bree',w:60,h:44,seed:11,scene:'bree',music:'bree',weather:'mist',
 pal:{grass:'#4a9a3c',lush:'#3a8a44',dirt:'#a8844e',cobble:'#8a8a9a',flag:'#a8a090',water:'#3a8ac0',plank:'#8a5a30'},
 ambient:()=>'#5a6aa8',
 build(m,L){m.fillT('grass');m.ell('lush',30,6,28,6,.4);
  m.path('dirt',[[0,21],[10,21],[60,21]],2.3,.6);m.rect('cobble',3,19,54,5);m.rect('flag',22,15,16,10);m.path('dirt',[[30,24],[30,43]],1.2,.5);m.path('dirt',[[12,19],[12,8]],1,.5);
  m.rect('cobble',3,19,54,5);
  L.reserve(0,17,60,9).reserve(22,10,16,9);
  /* the great hedge and ditch that ring the town */
  for(let x=0;x<60;x+=2){if(x<4||x>54)continue;L.obj('hedge',x+1,6.6,[2]);L.obj('hedge',x+1,41.6,[2])}
  L.obj('breeGate',3.5,19.1,[]);L.obj('breeGate',56.5,19.1,[]);
  /* north side of the street */
  L.obj('house',8,16.6,{w:84,wall:'#cdb88a',roof:'#8a3a2a',seed:1});L.obj('house',17,16.6,{w:76,floors:2,wall:'#d8c8a0',roof:'#4a5a6a',seed:2,sign:'mug'});
  L.obj('pony',30,16.4,[]);L.obj('house',42,16.6,{w:88,wall:'#b88a60',roof:'#6a4a2a',seed:4});L.obj('house',51,16.6,{w:72,floors:2,wall:'#d0b890',roof:'#7a3a3a',seed:5});
  /* south side */
  L.obj('house',9,29.5,{w:90,wall:'#d8c8a0',roof:'#6a4a2a',seed:6,sign:'mug'});L.obj('house',20,29.5,{w:78,wall:'#c0a070',roof:'#8a3a2a',seed:7});L.obj('house',41,29.6,{w:86,wall:'#cdb88a',roof:'#4a5a6a',seed:8});L.obj('house',51.5,29.6,{w:80,wall:'#b88a60',roof:'#7a3a3a',seed:9});
  /* plaza */
  L.obj('well',30,25.2,[]);L.obj('stall',23.5,26,{cols:['#c0392b','#f4f0e0']}).obj('stall',37,26,{cols:['#2f7fd0','#f4f0e0'],fruit:['#8ad83a','#f0c040']});
  L.obj('crate',21,23.8,[{fruit:'#e84a4a'}]).obj('barrel',39.5,23.8,[]).obj('barrel',40.4,24,[]).obj('horse',35.5,18.6,{col:'#5a3a22'}).obj('horse',38.8,18.7,{col:'#c8c0b0'});
  for(const x of[7,13,19,25,35,41,47,53])L.obj('lamp',x,22.4,{});
  L.obj('cart',14,25,[]);L.obj('haybale',46,24.6,[]);
  L.forest('oak',1,8,58,34,22,r=>({w:56+Math.floor(r()*14),h:66+Math.floor(r()*14),seed:Math.floor(r()*90),leaf:'#2f7a38'}),['grass','lush']);L.forest('bush',1,8,58,34,18,{},['grass','lush']);L.forest('pine',1,8,58,34,10,{},['grass','lush'])},
 decor:[{on:['grass','lush'],density:2,cols:['#ffffff','#ffd23a','#c58bff'],draw:'flower',seed:1},{on:['grass','lush'],density:3,cols:['#2f7a2f'],draw:'tuft',seed:2},{on:['grass','lush','dirt'],density:.6,cols:['#8a8a96'],draw:'pebble',seed:4}],
 npcs:[
  {id:'harry',spr:'harry',por:'harry',name:'Harry',x:6,y:20.4,dir:'right',talk:()=>'harry1',show:()=>true},
  {id:'butterbur',spr:'butterbur',por:'butterbur',name:'Barliman Butterbur',x:28,y:20.5,dir:'down',talk:()=>breeButterbur(),show:()=>true},
  {id:'breeA',wander:22,spr:'breeA',por:'harry',name:'Townsman',x:18,y:21.6,dir:'right',talk:()=>'breeA',show:()=>true},
  {id:'breeB',wander:22,spr:'breeB',por:'harry',name:'Merchant',x:23.5,y:27.4,dir:'down',talk:()=>'breeB',show:()=>true},
  {id:'breeC',wander:22,spr:'breeC',por:'harry',name:'Horse-trader',x:36,y:20.6,dir:'left',talk:()=>'breeC',show:()=>true},
  {id:'breeD',wander:22,spr:'breeD',por:'butterbur',name:'Villager',x:37.4,y:27.6,dir:'down',talk:()=>'breeD',show:()=>true},
  {id:'ch1',critter:'chicken',v:1,wander:30,x:14,y:26.4,solid:false},{id:'ch2',critter:'chicken',v:0,wander:30,x:46,y:25.8,solid:false},{id:'ct1',critter:'cat',v:1,wander:30,x:24.4,y:18.4,solid:false},{id:'ct2',critter:'cat',v:0,wander:30,x:44,y:19,solid:false},{id:'dg1',critter:'dog',v:0,wander:40,x:38.6,y:21.6,solid:false},
  {id:'strider',spr:'aragorn',por:'aragorn',name:'Strider',x:34,y:22.6,dir:'left',talk:()=>breeStrider(),show:()=>!!F().striderOutside&&!G.party.includes('aragorn')}],
 exits:[{x:0,y:19,w:1.5,h:5,to:'shire',tx:61,ty:23,if:()=>false,msg:"The road back to the Shire... but there is no turning back now."},
        {x:58.5,y:19,w:1.5,h:5,to:'weathertop',tx:4,ty:26,if:()=>!!F().breeDone,msg:"You should not leave Bree before Strider has spoken with you."}],
 inter:[{id:'ponydoor',x:30*16-60,y:17*16+10,r:30,label:'The Prancing Pony',act:()=>breePonyDoor(),show:()=>!F().breeInnDone},
        {id:'ponydoor2',x:30*16-60,y:17*16+10,r:30,label:'The Prancing Pony',act:()=>say('ponyShut'),show:()=>!!F().breeInnDone}],
 triggers:[{id:'breeArrive',x:2,y:19,w:5,h:5,if:()=>!F().breeArrived,run:()=>storyBreeArrive()}],
 spawn:[4,21]};

/* =================================================================
   3. WEATHERTOP
   ================================================================= */
MAPS.weathertop={id:'weathertop',name:'Weathertop',w:48,h:36,seed:21,scene:'weathertop',music:'dark',weather:'mist',
 pal:{grass:'#4a8a58',lush:'#3a7a52',dirt:'#8a7a60',flag:'#7a7a98',rock:'#555a78',cliff:'#6a6a88',gravel:'#7a7a88'},
 ambient:()=>'#4a5aa0',
 build(m,L){m.fillT('grass');m.ell('lush',24,18,26,16,.6);m.ell('gravel',24,17,14,10,.6);m.ell('flag',24,17,10,7,.5);m.circ('flag',24,17,6);
  m.path('dirt',[[0,26],[10,24],[18,22],[22,19]],1.4,.8);m.path('dirt',[[30,17],[40,12],[47,10]],1.4,.8);
  m.ell('cliff',24,17,15,11,.5);m.ell('gravel',24,17,13,9.4,.6);m.ell('flag',24,17,10,7,.5);m.path('gravel',[[8,26],[14,24],[18,21]],1.6,.6);m.path('gravel',[[30,16],[36,13]],1.6,.6);
  m.ell('flag',24,17,9,6,.4);L.reserve(14,10,20,14);
  const ring=[[14,12,4],[18,10,3],[24,9,2],[30,10,3],[34,13,4],[34,18,3],[32,22,3],[26,24,2],[20,24,3],[15,21,3],[13,17,2]];
  ring.forEach(([x,y,n],i)=>L.obj('ruinWall',x,y,[n,{moss:i%2===0}]));L.obj('ruinTower',34,12,[]);L.obj('ruinTower',14,22,[]);
  L.obj('campfire',24,18,[]);L.obj('log',20.5,19,[]).obj('log',27.5,19.4,[]).obj('log',24,21,[]);L.obj('sack',22,16,[]).obj('sack',26.5,16.4,[]);
  L.forest('deadtree',1,2,46,32,12,{},['grass','lush','gravel']);L.forest('rock',1,2,46,32,16,{moss:1},['grass','lush','gravel']);L.forest('pine',1,2,46,32,12,{},['grass','lush']);L.forest('tallGrass',1,2,46,32,22,{},['grass','lush'])},
 decor:[{on:['grass','lush'],density:2,cols:['#5a9a5a','#3a7a4a'],draw:'tuft',seed:2},{on:['gravel','grass'],density:1,cols:['#8a8a9a'],draw:'pebble',seed:3}],
 npcs:[{id:'aragorn',spr:'aragorn',por:'aragorn',name:'Strider',x:27,y:19.6,dir:'left',talk:()=>wtAragorn(),show:()=>!G.party.includes('aragorn')||true}],
 exits:[{x:46.5,y:8,w:1.5,h:6,to:'rivendell',tx:3,ty:22,if:()=>!!F().wtDone,msg:"The camp is quiet... for now. You should stay close to the fire."}],
 inter:[{id:'wtfire',x:24*16,y:17*16,r:30,label:'Campfire',act:()=>wtFire(),show:()=>true}],
 triggers:[{id:'wtArrive',x:0,y:22,w:12,h:8,if:()=>!F().wtArrived,run:()=>storyWeathertop()}],
 spawn:[4,26]};

/* =================================================================
   4. RIVENDELL
   ================================================================= */
MAPS.rivendell={id:'rivendell',name:'Rivendell — The Last Homely House',w:64,h:46,seed:31,scene:'rivendell',music:'rivendell',weather:'leaf',
 pal:{grass:'#79ac46',lush:'#559a4a',dirt:'#c8a460',flag:'#e0d8c6',leaf:'#e0a444',water:'#42b0d8',cliff:'#8a7a96',plank:'#c8a060',rock:'#7a7a90',cobble:'#c8bca8'},
 ambient:()=>({morn:'#fff0d8',day:'#fff6e8',eve:'#e8b8b0'})[F().rivTime||'morn'],
 build(m,L){m.fillT('lush');m.ell('grass',32,26,30,15,.5);m.ell('leaf',9,37,10,7,.6);m.ell('leaf',55,36,10,8,.6);m.ell('leaf',46,22,10,8,.5);m.ell('leaf',20,12,7,5,.5);
  m.rect('cliff',0,0,64,7);
  m.path('water',[[9,6],[10,14],[8,24],[12,34],[12,46]],2.2,1.2);m.path('water',[[54,6],[52,14],[55,24],[53,34],[51,46]],2,1.2);
  m.ell('water',30,7.4,3,1.4,.3);m.ell('water',20,8,2,1,.3);m.ell('water',44,8,2,1,.3);
  /* garden paths of pale flagstone, plazas only where something stands */
  m.path('flag',[[32,8],[32,40]],1.6,.3);m.path('flag',[[12,25],[52,25]],1.4,.3);m.ell('flag',32,20,7,5,.3);m.ell('cobble',32,20,5,3.4,.3);m.ell('flag',32,31.5,6,4,.3);m.ell('cobble',32,31.5,4,2.6,.3);
  m.ell('flag',32,11,6,3,.3);m.ell('flag',32,38,5,3,.3);m.circ('flag',46,22,7.4);m.circ('leaf',46,22,5.8);m.path('flag',[[38,22],[42,22]],1.4,.2);
  m.rect('plank',6,23,8,3);m.rect('plank',50,25,8,3);m.rect('plank',37,13,8,2);m.path('flag',[[20,12],[28,12]],1.1,.3);
  L.reserve(24,6,16,36).reserve(38,14,16,16).reserve(0,22,16,6).reserve(48,24,16,6);
  /* waterfalls spill from the cliff line */
  L.obj('waterfall',9,7.2,{w:40,h:112}).obj('waterfall',54,7.2,{w:40,h:112}).obj('waterfall',20,7.2,{w:18,h:100}).obj('waterfall',44,7.2,{w:18,h:100}).obj('waterfall',30,7.2,{w:14,h:90}).obj('waterfall',35,7.2,{w:14,h:90});
  L.obj('elfPavilion',32,19.8,[]);L.obj('fountain',32,31.8,[]);
  L.obj('elfArch',32,10.4,[{w:72,h:84}]);L.obj('elfArch',32,39.4,[{w:64,h:76}]);
  [[29,14],[35,14],[27,25.6],[37,25.6],[29,35],[35,35],[28,19.4],[36,19.4]].forEach(([x,y])=>L.obj('elfLamp',x,y,{}));
  L.obj('statue',27,13.6,[]).obj('statue',37,13.6,[]).obj('statue',27,30,[]).obj('statue',37,30,[]);
  L.obj('elfRail',5.2,22.4,[3]).obj('elfRail',8.6,22.4,[3]).obj('elfRail',49.4,24.4,[3]).obj('elfRail',53,24.4,[3]).obj('elfRail',39,12.6,[3]);
  [[43.5,19.2],[48.6,19.6],[51.6,23.2],[50.8,27.4],[46,29.2],[41.4,27.8],[40.4,23.2]].forEach(([x,y])=>L.obj('councilChair',x,y,[]));
  L.obj('banner',26.4,12.8,{col:'#4a78c2'}).obj('banner',37.8,12.8,{col:'#4a78c2'});
  L.obj('bench',20,27.8,[2]).obj('bench',45,35,[2]);
  L.forest('beech',1,8,62,36,18,r=>({w:64+Math.floor(r()*18),h:76+Math.floor(r()*14),seed:Math.floor(r()*90),leaf:U.pick(['#e0742a','#e8a030','#d85a28','#c8b030'],r)}),['lush','grass','leaf']);
  L.forest('bush',1,8,62,36,24,r=>({leaf:U.pick(['#c8602a','#e0a030','#5a9a4a'],r),flowers:3}),['lush','grass','leaf']);L.forest('fern',1,8,62,36,24,{},['lush','grass']);L.forest('rock',1,8,62,36,6,{moss:1},['lush','grass'])},
 decor:[{on:['lush','grass'],density:2.0,cols:['#ffffff','#ffd23a','#ff9ab0','#c8a0ff'],draw:'flower',seed:1},{on:['lush','grass','leaf'],density:3,cols:['#5a9a4a','#c88a3a'],draw:'tuft',seed:2},{on:['leaf','grass'],density:1.4,cols:['#e0742a','#e8a030','#c8501a'],draw:'leaf',seed:3}],
 npcs:[
  {id:'gandalf',spr:'gandalf',por:'gandalf',name:'Gandalf',x:33.8,y:25.6,dir:'down',talk:()=>rivGandalf(),show:()=>!G.party.includes('gandalf')},
  {id:'bilbo',spr:'bilbo',por:'bilbo',name:'Bilbo',x:21.4,y:27.6,dir:'right',talk:()=>rivBilbo(),show:()=>true},
  {id:'elrond',spr:'elrond',por:'elrond',name:'Elrond',x:40.5,y:20.2,dir:'down',talk:()=>rivElrond(),show:()=>true},
  {id:'arwen',spr:'arwen',por:'arwen',name:'Arwen',x:31,y:13.6,dir:'down',talk:()=>rivArwen(),show:()=>true},
  {id:'legolas',spr:'legolas',por:'legolas',name:'Legolas',x:48,y:19.6,dir:'down',talk:()=>rivLegolas(),show:()=>!G.party.includes('legolas')},
  {id:'gimli',spr:'gimli',por:'gimli',name:'Gimli',x:51.4,y:23.6,dir:'left',talk:()=>rivGimli(),show:()=>!G.party.includes('gimli')},
  {id:'boromir',spr:'boromir',por:'boromir',name:'Boromir',x:50.4,y:27.2,dir:'up',talk:()=>rivBoromir(),show:()=>!G.party.includes('boromir')},
  {id:'elfA',wander:22,spr:'elfA',por:'legolas',name:'Elf',x:24,y:30,dir:'down',talk:()=>'elfA',show:()=>true},
  {id:'elfB',wander:22,spr:'elfB',por:'elrond',name:'Elf',x:28.4,y:36.6,dir:'right',talk:()=>'elfB',show:()=>true},
  {id:'elfC',wander:22,spr:'elfC',por:'galadriel',name:'Elf',x:12,y:28,dir:'right',talk:()=>'elfC',show:()=>true}],
 exits:[{x:0,y:20,w:1.5,h:6,to:'weathertop',tx:44,ty:10,if:()=>false,msg:"The road behind you is long; there is no going back."},
        {x:28,y:44.4,w:8,h:1.6,to:'moriaGate',tx:22,ty:16,if:()=>!!F().fellowshipFormed,msg:"The Council has not yet decided what to do with the Ring."}],
 inter:[{id:'rivfount',x:32*16,y:31*16,r:30,label:'Fountain',act:()=>say('rivfount'),show:()=>true},
        {id:'council',x:46*16,y:23.4*16,r:34,label:'The Council ring',act:()=>rivCouncilStart(),show:()=>!!F().councilReady&&!F().councilDone}],
 triggers:[{id:'rivArrive',x:0,y:0,w:64,h:46,if:()=>!F().rivArrived,run:()=>storyRivendell()}],
 spawn:[32,26]};

/* =================================================================
   5. GATES OF MORIA
   ================================================================= */
MAPS.moriaGate={id:'moriaGate',name:'The West-gate of Moria',w:44,h:36,seed:41,scene:'moriaGate',music:'dark',weather:'mist',
 pal:{grass:'#3a6a58',lush:'#2f5a58',dirt:'#6a6a7a',gravel:'#6a6a88',rock:'#4a4a68',cliff:'#4a4a6c',water:'#1c4a72',flag:'#8a8aa8'},
 ambient:()=>'#4a5a9c',
 build(m,L){m.fillT('gravel');m.ell('grass',8,10,8,8,.6);m.ell('lush',36,12,8,8,.6);
  m.rect('cliff',0,0,44,10);m.ell('flag',22,12,6,3);m.rect('flag',18,10,8,3);m.path('gravel',[[22,13],[22,22]],2,.6);m.path('gravel',[[0,10],[14,14],[22,16]],1.5,.7);
  m.ell('water',22,30,22,8,.5);m.path('gravel',[[0,22],[10,20],[22,19],[34,20],[44,22]],1.4,.7);
  m.rect('water',0,34,44,2);L.reserve(14,8,16,12);
  L.obj('durinDoor',22,11.4,[]);L.obj('rock',12,13.5,{col:'#5a5a78'}).obj('rock',31,13.6,{col:'#5a5a78'});
  L.obj('deadtree',7,14,{}).obj('deadtree',37,14.4,{}).obj('deadtree',4,22,{}).obj('deadtree',40,23,{});
  L.forest('rock',1,11,42,22,16,{col:'#5a5a78',moss:1},['gravel','grass','lush']);L.forest('deadtree',1,11,42,22,6,{},['gravel','grass','lush']);L.forest('pine',1,11,12,22,5,{},['gravel','grass','lush']);L.forest('tallGrass',1,11,42,22,14,{},['grass','lush','gravel']);
  L.obj('rubble',14,18,{}).obj('rubble',30,17,{})},
 decor:[{on:['gravel','grass'],density:2,cols:['#7a7a8a','#5a5a70'],draw:'pebble',seed:2},{on:['grass','lush'],density:2,cols:['#3a6a58'],draw:'tuft',seed:3}],
 npcs:[
  ],
 exits:[{x:19,y:9,w:6,h:2,to:'moriaHall',tx:28,ty:46,if:()=>!!F().doorOpen,msg:"The Doors of Durin are shut tight, their silver tracery gleaming only faintly."}],
 inter:[{id:'door',x:22*16,y:11.2*16,r:34,label:'The Doors of Durin',act:()=>moriaDoor(),show:()=>!F().doorOpen}],
 triggers:[{id:'mgArrive',x:0,y:0,w:44,h:36,if:()=>!F().mgArrived,run:()=>storyMoriaGate()},{id:'watcher',x:16,y:18,w:12,h:6,if:()=>!!F().doorOpen&&!F().watcherDone,run:()=>storyWatcher()}],
 spawn:[20,6]};

/* =================================================================
   6. MORIA — KHAZAD-DUM
   ================================================================= */
MAPS.moriaHall={id:'moriaHall',name:'Moria — Khazad-dûm',w:60,h:52,seed:51,scene:'moria',music:'moria',weather:'dust',
 pal:{rock:'#4c4c70',flag:'#7a7aa0',cliff:'#34345a',chasm:'#08040e',gravel:'#5a5a7a',stairs:'#8a8aa8',plank:'#6a5a50',void:'#030206'},
 ambient:()=>'#2a2e56',
 build(m,L){m.fillT('void');
  m.rect('rock',22,40,12,12);m.rect('flag',24,40,8,12);
  m.rect('rock',12,18,36,26);m.rect('flag',14,20,32,22);
  m.rect('rock',1,27,14,12);m.rect('flag',2,28,12,10);m.rect('flag',12,31,3,3);
  m.rect('rock',26,6,8,14);m.rect('flag',26,6,8,6);m.rect('stairs',28,12,4,8);
  m.rect('chasm',34,0,26,18);m.rect('flag',34,8,22,3);m.rect('rock',54,4,6,12);m.rect('flag',55,6,5,6);
  L.reserve(12,18,36,26).reserve(0,26,16,14).reserve(26,4,34,16);
  /* great hall pillars */
  for(let r=0;r<4;r++)for(let c=0;c<5;c++){const x=17+c*7,y=24+r*5;if(c===2&&r===3)continue;L.obj('pillar',x,y,{h:110,glow:(r+c)%2===0})}
  L.obj('brazier',16,42,{}).obj('brazier',44,42,{}).obj('brazier',16,22,{}).obj('brazier',44,22,{}).obj('brazier',25,46,{}).obj('brazier',31.4,46,{});
  L.obj('crystal',20,40,{}).obj('crystal',40,40.4,{}).obj('crystal',2.6,36,{col:'#7ad0ff'}).obj('crystal',13.4,36.4,{col:'#a0e0ff'});
  L.obj('skeleton',30,36,{}).obj('skeleton',38,30.4,{}).obj('skeleton',24,29,{}).obj('rubble',34,38,{}).obj('rubble',22,27.5,{w:44}).obj('rubble',44,36,{});
  L.obj('tomb',8,32.4,[]).obj('chest',4.4,30.6,[]).obj('brazier',3,35,{r:80}).obj('brazier',13.2,29.2,{r:80});
  L.obj('stalagmite',24,50.6,{}).obj('stalagmite',31,50.6,{});
  L.obj('brazier',27,10.6,{}).obj('brazier',32.6,10.6,{}).obj('brazier',38,8.4,{}).obj('brazier',46,8.4,{}).obj('brazier',54,8.4,{}).obj('brazier',57.6,11.4,{})},
 decor:[{on:['rock','flag'],density:1.2,cols:['#6a6a90','#34345a'],draw:'pebble',seed:2},{on:['flag'],density:.5,cols:['#7ad0ff'],draw:'glint',seed:3}],
 npcs:[],
 exits:[{x:25,y:50.4,w:6,h:1.6,to:'moriaGate',tx:22,ty:11,if:()=>false,msg:"The Doors have fallen. There is no way back."},
        {x:57.6,y:5,w:2.4,h:8,to:'lorien',tx:3,ty:20,if:()=>!!F().bridgeDone,msg:"Beyond the bridge there is a light; but you are not there yet."}],
 inter:[{id:'tomb',x:8*16,y:31.2*16,r:30,label:"Balin's tomb",act:()=>moriaTomb(),show:()=>!F().tombDone},
        {id:'well',x:22*16,y:27*16,r:28,label:'Old well-shaft',act:()=>moriaWell(),show:()=>!F().wellDone},
        {id:'stairs',x:30*16,y:19.4*16,r:34,label:'The Great Stair',act:()=>moriaStairs(),show:()=>!!F().orcsComing&&!F().stairsDone}],
 triggers:[{id:'mhArrive',x:22,y:40,w:14,h:12,if:()=>!F().mhArrived,run:()=>storyMoriaHall()},
           {id:'bridgeT',x:44,y:7,w:3,h:5,if:()=>!!F().stairsDone&&!F().bridgeDone,run:()=>storyBridge()}],
 spawn:[28,46]};

/* =================================================================
   7. LOTHLÓRIEN
   ================================================================= */
MAPS.lorien={id:'lorien',name:'Lothlórien — Caras Galadhon',w:56,h:42,seed:61,scene:'lorien',music:'lorien',weather:'leaf',
 pal:{grass:'#a8b45c',lush:'#869e52',leaf:'#cfa844',dirt:'#c8a050',flag:'#ece8dc',water:'#58c0d8',cobble:'#d8d0b8',moss:'#6aa656'},
 ambient:()=>'#fff2c8',
 build(m,L){m.fillT('grass');m.ell('leaf',28,20,22,14,.6);m.ell('lush',10,34,9,6,.6);m.ell('moss',46,10,8,6,.6);m.ell('leaf',8,8,8,5,.6);m.ell('leaf',48,36,8,5,.6);
  m.path('flag',[[0,20],[12,20],[28,21],[44,20],[56,20]],2.2,.5);m.path('flag',[[28,21],[28,36]],1.8,.5);m.path('flag',[[28,21],[28,6]],1.8,.5);
  m.circ('flag',28,21,5);m.circ('cobble',28,21,3);m.ell('flag',44,32,7,5,.4);m.ell('cobble',44,32,5,3.4,.4);
  m.path('water',[[6,0],[10,10],[6,20],[8,30],[6,42]],1.6,1);
  m.rect('plank',4,19,8,3);L.reserve(0,18,56,5).reserve(24,4,8,34).reserve(37,26,14,12);
  L.obj('mallorn',10,12,{w:150,h:190}).obj('mallorn',44,11,{w:150,h:190}).obj('mallorn',16,36,{w:140,h:180}).obj('mallorn',40,6,{w:130,h:170});
  L.obj('flet',20,17,[]).obj('flet',36,17.4,[]).obj('flet',34,31,[]);
  [[22,19.4],[34,19.4],[22,23],[34,23],[26,30],[30,30],[26,8],[30,8],[40,30],[48,30],[41,35],[47,35]].forEach(([x,y])=>L.obj('lorienLamp',x,y,{}));
  L.obj('basin',44,31.5,[]);L.obj('fountain',28,22.5,[]);L.obj('elfRail',41,34.8,[3]);L.obj('statue',24.4,27,[]).obj('statue',31.6,27,[]);
  L.forest('mallorn',1,2,54,38,10,r=>({w:110+Math.floor(r()*40),h:150+Math.floor(r()*30)}),['leaf','grass','lush','moss']);
  L.forest('fern',1,2,54,38,28,{},['leaf','grass','moss']);L.forest('bush',1,2,54,38,18,r=>({leaf:U.pick(['#e0a830','#d89030','#a8b838'],r),flowers:4,fc:['#fff','#ffe27a','#ffffff']}),['leaf','grass','moss'])},
 decor:[{on:['leaf','grass','lush'],density:1.6,cols:['#ffe27a','#ffd040','#fff0a0','#e0a030'],draw:'leaf',seed:3},{on:['moss','grass'],density:1.5,cols:['#ffffff','#9ae8ff'],draw:'flower2',seed:4},{on:['leaf'],density:1.2,cols:['#fff0a0'],draw:'glint',seed:6}],
 npcs:[
  {id:'galadriel',spr:'galadriel',por:'galadriel',name:'Galadriel',x:44,y:29.6,dir:'down',talk:()=>lorGaladriel(),show:()=>true},
  {id:'celeborn',spr:'elrond',por:'elrond',name:'Celeborn',x:41.6,y:30.4,dir:'right',talk:()=>'celeborn',show:()=>true},
  {id:'haldir',spr:'elfB',por:'legolas',name:'Haldir',x:5,y:20.8,dir:'right',talk:()=>'haldir',show:()=>true},
  {id:'elfL1',wander:22,spr:'elfA',por:'galadriel',name:'Elf',x:26,y:25,dir:'down',talk:()=>'elfL1',show:()=>true},
  {id:'elfL2',wander:22,spr:'elfC',por:'galadriel',name:'Elf',x:32,y:13,dir:'down',talk:()=>'elfL2',show:()=>true},
  ],
 exits:[{x:54.6,y:18,w:1.4,h:6,to:'amonHen',tx:3,ty:18,if:()=>!!F().lorDone,msg:"The Lady has not yet bidden you farewell."}],
 inter:[{id:'mirror',x:44*16,y:30.6*16,r:34,label:"Galadriel's Mirror",act:()=>lorMirror(),show:()=>!!F().mirrorReady&&!F().mirrorDone},
        {id:'lightpuz',x:28*16,y:5.4*16,r:34,label:'Silver mirror-stones',act:()=>lorLightPuzzle(),show:()=>!F().lightDone}],
 triggers:[{id:'lorArrive',x:0,y:16,w:10,h:8,if:()=>!F().lorArrived,run:()=>storyLorien()}],
 spawn:[3,20]};

/* =================================================================
   8. AMON HEN
   ================================================================= */
MAPS.amonHen={id:'amonHen',name:'Amon Hen — The Hill of Sight',w:48,h:40,seed:71,scene:'amonhen',music:'amon',weather:'leaf',
 pal:{grass:'#5aa844',lush:'#3f9448',dirt:'#b89a62',flag:'#b8b4a8',water:'#3a96d8',gravel:'#a8a290',cliff:'#8a8a98',sand:'#e0cc98',rock:'#8a8a98'},
 ambient:()=>'#fff6e0',
 build(m,L){m.fillT('grass');m.ell('lush',24,14,22,12,.5);
  m.rect('water',0,30,48,10);m.ell('sand',24,29.4,26,2.4,.6);m.path('dirt',[[2,20],[14,19],[24,16],[24,8]],1.6,.8);m.path('dirt',[[10,29],[12,21]],1.2,.6);m.path('dirt',[[36,29],[34,20],[30,16]],1.2,.6);
  m.ell('flag',24,7,9,5,.4);m.rect('flag',22,4,5,8);m.ell('gravel',24,7,12,7,.5);m.ell('flag',24,7,8,4.4,.4);
  L.reserve(10,0,30,16).reserve(0,28,48,12);
  L.obj('seat',24,5.8,[]);L.obj('ruinPillar',16.6,10,{h:78,moss:1}).obj('ruinPillar',20,6,{h:90}).obj('ruinPillar',30.4,6.2,{h:84,moss:1}).obj('ruinPillar',33.6,10.4,{h:70,moss:1}).obj('ruinPillar',12,13,{h:60,moss:1}).obj('ruinPillar',37,14,{h:66});
  L.obj('boat',12,32.6,[]).obj('boat',17,33.4,[]).obj('boat',36,32.4,[]).obj('boat',40,33.4,[]);
  L.forest('oak',1,2,46,28,18,r=>({w:56+Math.floor(r()*18),h:66+Math.floor(r()*20),seed:Math.floor(r()*90)}),['grass','lush']);L.forest('birch',1,2,46,28,8,{},['grass','lush']);L.forest('bush',1,2,46,28,18,{flowers:4},['grass','lush']);L.forest('rock',1,2,46,28,10,{moss:1},['grass','lush','sand']);L.forest('fern',1,2,46,28,18,{},['grass','lush'])},
 decor:[{on:['grass','lush'],density:2.4,cols:['#ffffff','#ffd23a','#c58bff','#ff9ab0'],draw:'flower',seed:1},{on:['grass','lush'],density:3,cols:['#2f7a2f','#4aa83a'],draw:'tuft',seed:2}],
 npcs:[
  {id:'boromirA',spr:'boromir',por:'boromir',name:'Boromir',x:21,y:12.4,dir:'down',talk:()=>amonBoromir(),show:()=>!!F().amonBoromirHere},
  {id:'aragornA',spr:'aragorn',por:'aragorn',name:'Aragorn',x:14,y:22,dir:'right',talk:()=>'amonAra',show:()=>!F().frodoAlone},
  {id:'legolasA',spr:'legolas',por:'legolas',name:'Legolas',x:16,y:24.6,dir:'right',talk:()=>'amonLeg',show:()=>!F().frodoAlone},
  {id:'gimliA',spr:'gimli',por:'gimli',name:'Gimli',x:12.4,y:25,dir:'right',talk:()=>'amonGim',show:()=>!F().frodoAlone}],
 exits:[{x:0,y:16,w:1.4,h:6,to:'lorien',tx:52,ty:20,if:()=>false,msg:"There is no going back."}],
 inter:[{id:'seat',x:24*16,y:5.4*16,r:36,label:'Seat of Seeing',act:()=>amonSeat(),show:()=>!F().seatDone},
        {id:'boats',x:38*16,y:31.4*16,r:50,label:'Boats at the shore',act:()=>amonBoats(),show:()=>!!F().frodoAlone}],
 triggers:[{id:'amArrive',x:0,y:14,w:10,h:10,if:()=>!F().amArrived,run:()=>storyAmon()}],
 spawn:[3,18]};
})();
