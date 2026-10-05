'use strict';
/* =========================================================
   story1.js — Chapters I–III: The Shire, Bree, Weathertop.
   All dialogue is original wording that follows the film's beats.
   Node format: {who,m,text,scene,side,ch:[{t,go,fx,if,tag}],next,fx}
   *asterisks* highlight a keyword in red.
   ========================================================= */
function chain(id,lines,end){lines.forEach((l,i)=>{const[who,m,text,x]=l;const nid=i?id+'_'+i:id;D[nid]=Object.assign({who,m,text},x||{});if(i<lines.length-1)D[nid].next=id+'_'+(i+1);else if(end)D[nid].next=end});return id}
const N=(t,x)=>['narrator','neutral',t,x];
function place(id,tx,ty,dir){const n=ent(id);if(n){n.x=tx*T;n.y=ty*T;if(dir)n.face=dir}}
const chooseTag=async(id)=>say(id);

/* ============ PROLOGUE & START ============ */
chain('prologue',[
 N('In the Second Age of Middle-earth, the Dark Lord *Sauron* forged a Ring in the fires of Mount Doom — a master Ring, to bind all others to his will.',{scene:'dark'}),
 N('Elves, Dwarves and Men stood against him. At the foot of the Mountain, Prince Isildur cut the Ring from Sauron\'s hand, and the Dark Lord was undone.'),
 N('But Isildur could not bring himself to destroy it. The Ring betrayed him, slipped away into a river, and was lost for an age.'),
 N('It was found by a creature called Gollum, who hid with it beneath the mountains for five hundred years... until, by chance, it passed to a very ordinary hobbit named *Bilbo Baggins*.',{scene:'shireDay'}),
 N('Tonight, in the green and peaceful Shire, Bilbo will celebrate his eleventy-first birthday. His heir, young Frodo, is about to learn that nothing will ever be ordinary again.'),
 ['frodo','smile','A fine day for a party. I ought to find *Gandalf* — he promised fireworks, and I would like to know how much trouble he has brought with him.']]);
async function storyStart(){flag('started');chapter(1);setTime('day');await say('prologue');objective('Find Gandalf near his fireworks cart, west of the stream.');toast('Tip: walk up to people and press E to talk.')}

/* ============ GANDALF ============ */
D.gIntro={who:'gandalf',m:'smile',scene:'shireDay',text:"Frodo Baggins! There you are. Look at you — a fine hobbit in the prime of life, and not a trace of dust on the brass buttons. How is my old friend Bilbo?",ch:[
 {t:'He is looking forward to tonight.',go:'gI_a'},
 {t:'Merry and Pippin are sniffing round your fireworks.',go:'gI_b'},
 {t:'Honestly? He has been strange lately.',go:'gI_c'}]};
D.gI_a={who:'gandalf',m:'happy',fx:()=>bond('gandalf',1),text:"Hah! Then we shall give him a night he never forgets. Fireworks, a dragon, and a few surprises I am rather proud of.",next:'gI_end'};
D.gI_b={who:'gandalf',m:'angry',fx:()=>{bond('gandalf',1);bond('merry',-1);bond('pippin',-1);flag('toldOnPranksters')},text:"Do they now? *Hmm.* Those two have the best intentions and the worst timing in all of Middle-earth. I shall keep an eye on my cart.",next:'gI_end'};
D.gI_c={who:'gandalf',m:'worried',fx:()=>{bond('gandalf',2);flag('toldGandalfWorry')},text:"Strange, you say? Hm. Bilbo has lived a long life, Frodo, and long lives leave... marks. Keep close to him tonight. I would like to speak with him, privately, once the party is done.",next:'gI_end'};
D.gI_end={who:'gandalf',m:'smile',text:"Go and enjoy yourself, my boy. When the lanterns are lit, find *Bilbo* at the Party Tree — he will want to begin.",fx:()=>{flag('gandalfIntro');objective('Go and find Bilbo at Bag End, then join the party.')}};
D.gWait={who:'gandalf',m:'smile',text:()=>F().gandalfIntro?"Bilbo is waiting at the gate of Bag End. Do not keep a birthday hobbit waiting.":"",ch:[{t:'I will go to him now.',go:null},{t:"Is there anything you aren't telling me?",go:'gWait2'}]};
D.gWait2={who:'gandalf',m:'neutral',text:"There is *always* something I am not telling you, Frodo. A wizard's habit. Today it is only the fireworks."};
async function shireGandalf(){
  if(!F().gandalfIntro)return'gIntro';
  if(!F().partyDone)return'gWait';
  if(F().partyDone&&!F().runesDone)return gandalfReturns();
  return'gandalfGoneNote'}
D.gandalfGoneNote={who:'gandalf',m:'stern',text:"Go, Frodo. Time is running short."};

/* ============ FIREWORKS CART / PRANK ============ */
D.fwcart={who:'narrator',scene:'shireDay',text:"A cart heaped with colourful rockets and crackers: *Gandalf's Fireworks*, each tied with a ribbon. A hand-lettered sign says DO NOT TOUCH. There are small footprints around it.",fx:()=>{flag('sawCart')}};
function prankStart(){return F().prankDone?'prankAfter':'prank1'}
D.prank1={who:'merry',m:'happy',scene:'shireDay',text:"Frodo! Perfect timing. Gandalf is round the front of the cart and Pippin has found the *biggest* rocket — a real dragon, with a fuse as long as my arm. Just a *teensy* test, before the party?",ch:[
 {t:'Take one — but nowhere near Lobelia\'s hat.',go:'prank_a',tag:'prank'},
 {t:'Absolutely not. Gandalf will turn you both into toads.',go:'prank_b'},
 {t:"I'll go and distract Gandalf for you.",go:'prank_c',tag:'prank'}]};
D.prank_a={who:'pippin',m:'happy',fx:()=>{bond('merry',2);bond('pippin',2);flag('prank');flag('prankDone');bond('gandalf',-1,'Gandalf will not be pleased')},text:"Hah! Frodo Baggins is a *scoundrel*. We knew it all along. Don't worry, nothing could possibly go wrong.",next:'prank_end'};
D.prank_b={who:'merry',m:'sad',fx:()=>{bond('gandalf',1);bond('merry',-1);flag('prankDone')},text:"Toads! Honestly, Frodo. You have been spending too much time with Bilbo. *Fine.* We will be very good. Very, very good.",next:'prank_end'};
D.prank_c={who:'pippin',m:'happy',fx:()=>{bond('merry',2);bond('pippin',2);flag('prank');flag('prankDone')},text:"Ask him about his hat! Wizards love to talk about their hats. Right, Merry, go!",next:'prank_end'};
D.prank_end={who:'merry',m:'smile',text:"We shall see you at the party. Save us a seat near the *food*."};
D.prankAfter={who:'pippin',m:'smile',text:"We are being completely innocent over here. Stand a little to the left, you are blocking our view of the cart."};
async function shireMerry(){if(F().sawRoad&&!G.party.includes('merry'))return'mpJoin';if(!F().prankDone)return prankStart();return'prankAfter'}
async function shirePippin(){if(F().sawRoad&&!G.party.includes('pippin'))return'mpJoin';if(!F().prankDone)return prankStart();return'prankAfter'}

/* ============ BILBO & THE PARTY ============ */
D.bilbo0={who:'bilbo',m:'smile',scene:'shireDay',text:"Frodo, my boy! Look at the lanterns; look at the tents! Whatever else they say about the Bagginses, they know how to throw a party. Is Gandalf here yet?",ch:[
 {t:'He is, and he has brought fireworks.',go:'bilbo0_a'},
 {t:'Bilbo... you have been packing, haven\'t you?',go:'bilbo0_b',if:()=>F().gandalfIntro}]};
D.bilbo0_a={who:'bilbo',m:'happy',text:"Of course he has! Never a dull moment where that wizard is concerned. Go on, Frodo — I shall be along when the lanterns are lit.",fx:()=>{if(F().gandalfIntro)flag('bilboReady')}};
D.bilbo0_b={who:'bilbo',m:'sad',fx:()=>{bond('gandalf',0);flag('askedBilbo')},text:"Packing? Oh, a hobbit is always packing, Frodo. Hm. I feel... thin. Like butter scraped over too much bread. I need a holiday. A very long holiday.",ch:[{t:'Where will you go?',go:'bilbo0_c'},{t:"Don't be silly. Come to the party.",go:'bilbo0_a'}]};
D.bilbo0_c={who:'bilbo',m:'smile',text:"Oh, somewhere with mountains. *Adventures.* Remember them, Frodo, even when I am gone. Now off you go."};
async function shireBilbo(){
  if(F().partyDone&&!F().bilboGone)return null;
  if(!F().gandalfIntro)return'bilbo0';
  if(!F().partyStarted){await say('bilbo0');if(F().bilboReady||F().askedBilbo){flag('partyStarted');await partySequence()}return null}
  return'bilbo0'}
async function partySequence(){
  await transition(async()=>{setTime('dusk');M.npcs=null;G.px=47*T;G.py=14.8*T;G.dir='up';resetTrail();place('bilbo',49,13.6,'down');place('gandalf',45.6,15.2,'right')});
  chain('fw',[
   ['gandalf','happy',"Ladies and gentlehobbits! The fireworks!",{scene:'shireDusk'}],
   N('*Whoosh!* Rockets shoot up and burst into blossoms of red and gold. Hobbit children shriek with joy.'),
   N(F().prank?'Then something much bigger hisses into the sky, trailing smoke. It is shaped like a dragon — and it swoops straight through the party tent.':'A great silver dragon of sparks swirls above the crowd, to rapturous applause. Gandalf puffs his pipe, looking pleased.'),
   F().prank?['gandalf','angry',"MERRY! PIPPIN! *Those were not meant to be lit yet!*"]:['gandalf','happy',"Not bad. Not bad at all, for an old wizard."]]);
  await say('fw');
  if(F().prank){await say('fwPrank')}
  await say('bilboSpeech');
  await flash(300);hideNpc('bilbo');flag('bilboGone');
  await say('bilboGone');
  await bagEndRing()}
D.fwPrank={who:'pippin',m:'surprised',text:"We ran. Honestly, Frodo, it was the *tent* that moved.",next:'fwPrank2'};
D.fwPrank2={who:'lobelia',m:'angry',name:'Lobelia',text:"Hmph! Baggins, your friends have ruined my hat. And these cakes *taste* of smoke.",ch:[{t:'I am so sorry, Lobelia. I shall make it up to you.',go:null,fx:()=>bond('heart',1)},{t:"It is an improvement, if you ask me.",go:null,fx:()=>{bond('heart',-1);toast('Lobelia is not amused.')}}]};
chain('bilboSpeech',[
 ['bilbo','happy',"My dear Bagginses and Boffins! Tooks and Brandybucks! Thank you all for coming to my party. I have called you here to make an announcement...",{scene:'shireDusk',side:'center'}],
 ['bilbo','smile',"Eleventy-one years is far too short a time to live among such excellent and admirable hobbits. I know *half* of you half as well as I should like, and I like less than half of you half as well as you deserve."],
 ['bilbo','sad',"I regret to announce that this is the end. I am going. I am leaving *now*. Goodbye!"],
 N('Bilbo slips something into his pocket. There is a bright flash, a puff of smoke... and the old hobbit has vanished into thin air. The crowd gasps, then bursts into confused applause.')]);
D.bilboGone={who:'gandalf',m:'worried',scene:'shireDusk',text:"*Hm.* So he has gone and done it. Frodo, I must go to Bag End at once. Come with me.",fx:()=>objective('Follow Gandalf to Bag End.')};
async function bagEndRing(){
  await transition(async()=>{place('gandalf',13,15.3,'up');G.px=14.5*T;G.py=15.5*T;G.dir='up';resetTrail()});
  await say('bagend1');flag('hasRing');updateHud();ringUp(0);sfx.ring();await wait(400);
  await say('bagend2');objective('');
  await transition(async()=>{setTime('day');flag('partyDone');hideNpc('gandalf');flag('gandalfGone');chapter(1);G.px=14*T;G.py=16.2*T;G.dir='down';resetTrail()});
  await say('years');flag('gandalfGone',false);delete G.flags['hide_gandalf'];place('gandalf',14,17.2,'up');objective('Gandalf has returned. Speak with him at Bag End.')}
chain('bagend1',[
 ['gandalf','stern',"Bilbo! You had that Ring in your pocket, did you not? Do not do this. Leave it behind.",{scene:'bagend'}],
 ['bilbo','angry',"What are you talking about? The Ring is mine. It was *given* to me. My own... my *precious*."],
 ['gandalf','stern',"Bilbo Baggins. Leave it here."],
 ['bilbo','sad',"*...You're right.* I know you're right. I'm tired, Gandalf. Take it. No — Frodo will have it. I've left it on the mantel, in an envelope. Look after the boy."],
 N('Bilbo walks out into the evening with a staff over his shoulder and a song on his lips. Something small and golden rattles onto the floor behind him. Frodo bends down and picks it up. It is strangely heavy... and warm.')]);
D.bagend2={who:'gandalf',m:'worried',text:"Frodo. Listen carefully. Tell *no one* what you hold. Keep it secret, and keep it safe. I must find out what it is — and I must do it quietly. Do not use it, whatever you do. I shall be gone a while.",ch:[
 {t:'You are frightening me, Gandalf.',go:'bagend3'},
 {t:'I will keep it safe. I promise.',go:'bagend4',fx:()=>bond('gandalf',1)}]};
D.bagend3={who:'gandalf',m:'smile',text:"Good. A little fear is a very sensible thing. It means you understand how much is at stake.",next:'bagend5'};
D.bagend4={who:'gandalf',m:'smile',text:"I know you will, Frodo. You have your uncle's heart — and, thankfully, a good deal more of his sense.",next:'bagend5'};
D.bagend5={who:'narrator',text:"Gandalf rides out of the Shire, his grey cloak flapping. Frodo watches him go until he is a speck on the long road."};
chain('years',[
 N('Seventeen years pass in the Shire. Frodo Baggins, now the master of Bag End, keeps the Ring in a chest — and does as he was told, tells no one.',{scene:'shireDay'}),
 N('Then, one grey evening, there is a knock at the round green door.')]);

/* ============ GANDALF RETURNS / RUNES ============ */
async function gandalfReturns(){
  await say('gRet');
  const ok=await puzzle('runes');
  if(ok){bond('gandalf',2,'Gandalf is impressed');await say('gRunesOk')}else await say('gRunesFail');
  flag('runesDone');chapter(1);
  await say('gSam');await say('gLeave');
  hideNpc('gandalf');flag('gandalfGone');joinParty('sam');hideNpc('sam');
  place('merry',52.4,22.2,'left');place('pippin',53.8,22.6,'left');flag('sawRoad');
  objective('Take the Ring east out of the Shire. Merry and Pippin are waiting by the road.');return null}
chain('gRet',[
 ['gandalf','stern',"Frodo. We have not much time. Is it safe? Bring me the Ring.",{scene:'bagend',side:'right'}],
 ['frodo','worried',"It is here, in the fire... as you told me. Gandalf, I have not touched it in all these years."],
 ['gandalf','neutral',"Good. Leave the Ring in the heart of the fire — it is the only way to see what is written. I have come a long way to learn the truth. Look: letters, in the old Elvish script. *Read them, Frodo.* The fire will fade in a moment."]]);
D.gRunesOk={who:'gandalf',m:'angry',scene:'bagend',text:"*Sauron.* It is his name; it is *his* Ring. The One Ring, forged in the fires of Mount Doom, the very thing he lost when Isildur cut it from his hand. The Dark Lord's spirit never truly died. He has been waiting, Frodo, and now his servants know where to look.",next:'gRunes2'};
D.gRunesFail={who:'gandalf',m:'worried',scene:'bagend',text:"The fire fades before you can finish — but I read it long ago in the libraries of Minas Tirith, and I know what it says. It is the Ring of the Enemy, Frodo. *Sauron's* Ring. The One.",next:'gRunes2'};
D.gRunes2={who:'frodo',m:'worried',text:"But... why is it here? Why has it come to *me*? I wish it had never come to me, Gandalf. I wish none of this had happened.",next:'gRunes3'};
D.gRunes3={who:'gandalf',m:'smile',text:"So do all who live to see such times. But that is not for them to decide. All we have to decide is what to do with the time that is given to us. You must leave the Shire, Frodo — and leave quickly. The Nine are abroad, the Black Riders. Take the road east to Bree. I shall meet you at the *Prancing Pony*. Take someone you trust."};
chain('gSam',[
 N('A rustle outside the round window. A curly head pops up, then another startled face: Samwise Gamgee, who was supposed to be pruning the roses.',{scene:'bagend'}),
 ['sam','sad',"I wasn't — that is — I never heard nothin', Mr. Frodo! Honest I didn't. Only some, you know, about a Ring, and the end of the world, and..."]]);
D.gSam_1.ch=[
 {t:'Samwise Gamgee! Eavesdropping again?',go:'gSam_a'},
 {t:"Sam, you will come with me. And you will listen.",go:'gSam_b'},
 {t:'Not a word of this, Sam. Not to anyone.',go:'gSam_c'}];
D.gSam_a={who:'sam',m:'sad',fx:()=>{bond('sam',-1);bond('heart',-1)},text:"I'm sorry, Mr. Frodo, I know I shouldn't. But the Gaffer always says I'm bound to be too curious for my own good.",next:'gSam_end'};
D.gSam_b={who:'sam',m:'happy',fx:()=>{bond('sam',2,'Sam is deeply loyal now');bond('heart',1)},text:"Me, Mr. Frodo? *Leave the Shire?* I'd walk to the ends of the world, if it meant I'd see an elf. And — er — if it meant you won't go alone.",next:'gSam_end'};
D.gSam_c={who:'sam',m:'neutral',fx:()=>{bond('sam',1);flag('samSilenced')},text:"Not a word, Mr. Frodo. Cross my heart. Though if you're going somewhere dangerous, you'll not be going without me. That's a promise too.",next:'gSam_end'};
D.gSam_end={who:'gandalf',m:'smile',text:"Well, there it is. Master Samwise, you shall go with Frodo. And mind you keep him *out of trouble*."};
D.gLeave={who:'gandalf',m:'stern',scene:'bagend',text:"Now go. Leave by the back, and do not travel by the main road. I have one more errand: an old friend in Isengard, who may help us. Meet me at the Prancing Pony in Bree. *Do not put it on.* Not for any reason.",fx:()=>{chapter(1)}};

/* ============ NEIGHBOURS ============ */
chain('gaffer1',[['gaffer','neutral',"Ahh, Mr. Frodo. Terrible times. Dwarves coming through; strange folk about. Mr. Bilbo wouldn't have stood for it. And my Sam, he's gone off all peculiar, talking about elves.",{scene:'shireDay'}]]);
D.gaffer1.ch=[{t:'Sam will be fine, Gaffer.',go:null,fx:()=>bond('heart',1)},{t:'Strange folk? What strange folk?',go:'gaffer2'}];
D.gaffer2={who:'gaffer',m:'worried',text:"Dark riders on the road, folk say. Asking questions. But what do I know. I'm only a gardener, and old Hamfast Gamgee at that."};
chain('lobelia1',[['lobelia','angry',"The Bagginses think they're so much better than the rest of us. Dratted Bilbo and his dratted party. I shall take what is mine, mark my words.",{scene:'shireDay'}]]);
D.lobelia1.ch=[{t:'Good evening, Lobelia. Have a slice of cake.',go:'lobelia2'},{t:'Move along, Lobelia. Nobody wants your cutlery.',go:'lobelia3'}];
D.lobelia2={who:'lobelia',m:'smile',fx:()=>bond('heart',1,'A small kindness'),text:"Oh. Well. That is... very *civil*. Hmph. I shall have two."};
D.lobelia3={who:'lobelia',m:'angry',fx:()=>{bond('heart',-1);flag('lobeliaFoe')},text:"How *dare* you! I shall remember this, Frodo Baggins."};
chain('hobA',[['pippin','happy',"The cake is the best I've ever tasted, and I've tasted a great many cakes.",{scene:'shireDusk',name:'Hobbit'}]]);
chain('hobB',[['merry','smile',"Have you seen the dragon? It was *magnificent*. I'd follow that wizard to the ends of the world for another one.",{scene:'shireDusk',name:'Hobbit'}]]);
chain('hobC',[['sam','smile',"Seven courses, and not a single one burnt! You'd hardly believe it came from a Baggins kitchen.",{scene:'shireDusk',name:'Hobbit'}]]);
chain('hobK',[['pippin','surprised',"Mister Frodo! Are the fireworks going to go off again? I want a dragon! Can I have one?",{scene:'shireDusk',name:'Hobbit child'}]]);
chain('hobD',[['sam','smile',"Morning, Mr. Frodo! Lovely weather for a smoke, if you smoke pipe-weed. Which I don't. Much.",{scene:'shireDay',name:'Neighbour'}]]);
chain('ptree',[N('The great Party Tree, strung with paper lanterns. Underneath, hobbits dance on the planks, eat, and argue about the dragon.',{scene:'shireDusk'})]);
async function shireSam(){return null}
D.samGarden={who:'sam',m:'smile',scene:'shireDay',text:"Just seeing to the roses, Mr. Frodo. Nothing a good bit o' muck won't fix."};
async function shireDoor(){await say(F().partyDone&&!F().runesDone?'bagDoorWait':'bagDoor');return null}
D.bagDoor={who:'narrator',scene:'shireDay',text:"The round green door of Bag End, polished brass knob catching the light. Home."};
D.bagDoorWait={who:'narrator',scene:'bagend',text:"The door is open. A tall grey figure is waiting inside by the hearth."};

/* ============ THE ROAD / BLACK RIDER ============ */
D.mpJoin={who:'merry',m:'happy',scene:'road',text:"Frodo! We heard you were going away. Well — we are coming with you. Don't try to talk us out of it. We have been planning this since breakfast.",ch:[
 {t:'It is dangerous. You should stay, both of you.',go:'mpJ_a'},
 {t:"I'm glad. I could not do this alone.",go:'mpJ_b',fx:()=>{bond('merry',1);bond('pippin',1)}}]};
D.mpJ_a={who:'pippin',m:'angry',fx:()=>{bond('merry',-1);bond('pippin',-1)},text:"If you are going to be a hero, we shall be *heroes' sidekicks*. Done. We are coming.",next:'mpJoined'};
D.mpJ_b={who:'pippin',m:'happy',text:"That's more like it. Besides, the three of us make better company than Sam alone, no offence, Sam.",next:'mpJoined'};
D.mpJoined={who:'sam',m:'smile',text:"None taken, Mr. Pippin. Let's get on before the Gaffer finds out.",fx:()=>{joinParty('merry');joinParty('pippin');flag('readyToLeave');hideNpc('merry');hideNpc('pippin');objective('Follow the road east, out of the Shire.')}};
chain('roadRiders',[
 N('As the sun slips down, the hobbits quicken their step along the lane. Sam stops suddenly.',{scene:'road'}),
 ['sam','worried',"Mr. Frodo. Listen. There's hoofbeats... and something else. Like someone *sniffing*."],
 ['frodo','worried',"Quick! Off the road! Into the ditch, all of you."]]);
async function storyRoad(){
  flag('readyToLeave');await say('roadRiders');
  let tries=0,res;do{res=await puzzle('hide',{tries});tries++}while(!res.ok&&tries<3);
  if(!res.ok){ringUp(8,'You slip on the Ring in panic.');flag('usedRing')}else if(res.ring){ringUp(5,'The Ring whispers as it hides you.')}
  chain('roadAfter',[N(res.ok?'The rider turns his black horse, sniffs once more, and — at last — passes by. The hobbits breathe again.':'A cold darkness closes over you. Then the rider is gone, as suddenly as he came, and Merry drags you from the road.',{scene:'road'}),
    ['sam','worried',"That wasn't no ordinary traveller, Mr. Frodo. That was a thing out of the dark. What does it want?"],
    ['frodo','worried',"It wants what I am carrying. Come on. Bree is just ahead, and Gandalf will be waiting."]]);
  await say('roadAfter');
  chapter(2);await go('bree',3,21,'right')}

/* ============ BREE ============ */
D.harry1={who:'harry',m:'stern',scene:'bree',text:"Halt! Strange hours for hobbits. What's your business in Bree, little folk?",ch:[
 {t:'Frodo Baggins of Hobbiton.',go:'gate_real'},
 {t:'Underhill. We are travelling on a short holiday.',go:'gate_alias'},
 {t:'That is no concern of yours.',go:'gate_rude'}]};
D.gate_real={who:'harry',m:'neutral',fx:()=>{flag('realName');bond('trust',-1)},text:"Baggins? Hm. Rings a bell... never mind. In you go. The inn at the end of the street has beds a-plenty.",next:'gate_end'};
D.gate_alias={who:'harry',m:'smile',fx:()=>{flag('alias');bond('trust',1)},text:"Underhill, aye. Well, Master Underhill, take the main street; the Prancing Pony is the big place on your left. Mind the horses.",next:'gate_end'};
D.gate_rude={who:'harry',m:'angry',fx:()=>{bond('heart',-1)},text:"Humph. Well, there's no law against rudeness in Bree, only against stealing. Move along.",next:'gate_end'};
D.gate_end={who:'sam',m:'worried',text:"Mr. Frodo, it's ever so dark in here. And look at the size of them folk! Let's find Mr. Gandalf and get a roof over our heads.",fx:()=>objective('Find Gandalf at the Prancing Pony.')};
async function storyBreeArrive(){flag('breeArrived');chapter(2);await say('harry1');return null}
async function breeButterbur(){if(F().breeInnDone)return'butterbur_after';await breePonyDoor();return null}
D.butterbur_after={who:'butterbur',m:'smile',scene:'pony',text:"Mind how you go, Master Underhill — or whatever you're called. The roads are not what they were. Not what they were at all."};
D.ponyShut={who:'butterbur',m:'worried',scene:'pony',text:"Bolted for the night, sir. Folk say there were *strangers* in the rooms. I don't like it."};
D.breeA={who:'harry',m:'neutral',name:'Townsman',scene:'bree',text:"Hobbits in Bree? We've not seen halfling folk this far east in many a year. They say there are *shadows* on the road."};
D.breeB={who:'harry',m:'smile',name:'Merchant',scene:'bree',text:"Ripe apples, fresh from the south! Or if you're after better, there's a spiced cider. Only a copper, little master."};
D.breeC={who:'harry',m:'stern',name:'Horse-trader',scene:'bree',text:"Best ponies this side of the river. Folk keep asking for black ones lately. I don't sell black ones to the likes of *them*."};
D.breeD={who:'butterbur',m:'worried',name:'Villager',scene:'bree',text:"That inn has been busier than usual. Strange folk keep asking about halflings. Oh — hello. You're a halfling. Dear me."};
async function breePonyDoor(){if(F().breeInnDone)return;if(F().ponyStarted)return;flag('ponyStarted');await ponyScene();return null}
chain('ponyArrive',[
 ['butterbur','smile',"Welcome, welcome to the Prancing Pony! Barliman Butterbur at your service. Rooms, ale, hot suppers. What'll it be?",{scene:'pony'}],
 ['frodo','neutral',"We are looking for a grey wizard named Gandalf. He told us he would be waiting here."],
 ['butterbur','worried',"Gandalf? I've not seen him for months, sir. Truth be told, I'd forgot he was coming... *forgot* things lately, you see. Rooms for the four of you, then, under what name?"]]);
D.ponyArrive_2.ch=[{t:'Underhill.',go:'pa_u'},{t:'Baggins.',go:'pa_b'}];
D.pa_u={who:'butterbur',m:'smile',fx:()=>{flag('alias');bond('trust',1)},text:"Underhill it is. Rooms at the back, quiet as a mouse. Make yourselves comfortable."};
D.pa_b={who:'butterbur',m:'neutral',fx:()=>{flag('realName');bond('trust',-1)},text:"Baggins? Oh, that's a good name. I'll put that down... though it's awfully loud in a room full of ears."};
chain('ponyCorner',[N('In a dark corner, a hooded man watches the hobbits over the rim of a tankard. His eyes catch the firelight: grey, tired and sharp as knives.',{scene:'pony'}),
 ['pippin','happy',"Merry! Over here! This ale is as good as the Green Dragon's, and the barman hasn't even *looked* at us. D'you know, I'm famous in these parts? Here, let me tell them..."]]);
D.ponyCorner_1.ch=[
 {t:'Pippin! Not a word — come here, quickly.',go:'pQuiet'},
 {t:'Let him have his fun; what harm can it do?',go:'pFun'},
 {t:"I'll speak with the stranger in the corner myself.",go:'pStrider'}];
D.pQuiet={who:'pippin',m:'sad',fx:()=>{bond('pippin',-0);bond('trust',1);flag('pippinQuiet')},text:"But... I wasn't going to say anything important. Just a *little* about Bilbo's party. Oh, fine. I'll hush.",next:'strider1'};
D.pFun={who:'narrator',scene:'pony',fx:()=>{bond('trust',-2);ringUp(4);flag('ringSlip')},text:"Pippin gets onto a table and begins, rather loudly, to describe the long-expected party — and Mr. Frodo Baggins of Bag End. The inn falls quiet. Frodo, desperate, leaps forward, trips, and the Ring slips onto his finger. He *vanishes*. Someone grabs his arm and drags him into the corner.",next:'strider1'};
D.pStrider={who:'frodo',m:'stern',fx:()=>{bond('aragorn',1);bond('trust',1)},text:"You have been watching us for an hour. If you have something to say, say it.",next:'strider1'};
chain('strider1',[
 ['aragorn','stern',"Care to explain what you are doing here? You have been remarkably careless. Folk in Bree do not often see hobbits — and certainly not ones with *that* in their pocket.",{name:'Strider',scene:'pony'}],
 ['aragorn','neutral',"Come now. You are being hunted. Are you frightened?"]]);
D.strider1_1.ch=[
 {t:"I am not afraid.",go:'sd_a'},
 {t:"Yes... but I do not know whom to trust.",go:'sd_b'},
 {t:"Who are *you* to lecture me?",go:'sd_c'}];
D.sd_a={who:'aragorn',m:'smile',name:'Strider',fx:()=>{bond('aragorn',1);bond('trust',-0)},text:"Good. That is the right answer — and the wrong one. You should be afraid. A little fear keeps hobbits alive. But I think you are braver than you know.",next:'sd_end'};
D.sd_b={who:'aragorn',m:'smile',name:'Strider',fx:()=>{bond('aragorn',2);bond('trust',1)},text:"That is the wisest thing you have said all night. I am called *Strider*, a Ranger of the North. I know Gandalf; he sent word. Trust me or do not — but I am the best chance you have.",next:'sd_end'};
D.sd_c={who:'aragorn',m:'angry',name:'Strider',fx:()=>{bond('aragorn',-1)},text:"I am the only one in this room who knows what is following you. But I shall hold my tongue — until it is too late.",next:'sd_end'};
D.sd_end={who:'aragorn',m:'stern',name:'Strider',text:"Gandalf will not come. There is something wrong. Come to my rooms; I will keep watch. The *Nine* are in Bree tonight."};
async function ponyScene(){
  await say('ponyArrive');await say('ponyCorner');
  await transition(async()=>{});
  await say('nightAttack');await bree_letter();
  flag('breeInnDone');flag('breeDone');flag('striderOutside');joinParty('aragorn');
  chapter(2);objective('Leave Bree by the east gate with Strider.');hideNpc('strider')}
chain('nightAttack',[
 N('That night, in the dark of the back rooms, soft footsteps climb the stairs. A heavy blade slashes down through four pillows... and finds only feathers.',{scene:'bree'}),
 ['aragorn','stern',"Four beds slashed to ribbons, and not a hobbit in them. *Good.* That was close — they will come back in numbers. Gather your things. We leave at first light.",{scene:'pony'}]]);
async function bree_letter(){
  await say('ltrIntro');const ok=await puzzle('letter');
  if(ok){bond('trust',2,'The letter is clear');flag('letterRead');await say('ltrOk')}else{flag('letterSmudged');await say('ltrBad')}}
chain('ltrIntro',[
 ['butterbur','sad',"Mr. Underhill! Mr. Frodo! Oh, thank goodness. I'm that sorry — I'd completely forgotten! A letter from Gandalf. Three months ago it was. Gave it me, told me not to lose it. I put it in my apron, and... well, a mouse got at it, bless it.",{scene:'pony'}],
 N('Barliman spreads the nibbled pieces on the counter. The sentences are all jumbled. Frodo smoothes out each scrap.')]);
D.ltrOk={who:'gandalf',m:'stern',name:'Gandalf (letter)',scene:'pony',text:"Trust the Ranger named Strider; he is a friend. Leave Bree by morning, and do not use the Ring. *Danger hunts you.*",next:'ltrOk2'};
D.ltrOk2={who:'sam',m:'worried',text:"Well, that settles it, Mr. Frodo. We're to trust him. Even if he does look like he's sleepin' in a hedge."};
D.ltrBad={who:'frodo',m:'worried',text:"Half of it is lost. I think it says to trust Strider, but I cannot be sure of the rest. *We shall have to decide for ourselves.*"};
async function breeStrider(){return'striderOutsideNote'}
D.striderOutsideNote={who:'aragorn',m:'stern',name:'Strider',scene:'bree',text:"No time for talk. Gate east, quickly, and keep your hoods up."};

/* ============ WEATHERTOP ============ */
chain('wtArrive',[
 N('They travel by marsh and moor for days, the Ranger keeping them off the roads. At last, at dusk, the broken ring of walls on Weathertop rises black against the sky.',{scene:'weathertop'}),
 ['aragorn','neutral',"We shall rest here, in the ruins. The old watchtower of Amon Sûl. Sam, take the others and find firewood. Keep to the stones and *keep your voices down*.",{scene:'weathertop'}],
 ['sam','smile',"Right you are, Mr. Strider. Though I'm good for more than chopping, you know. I can cook. Sausages, bacon, tomatoes — I've carried it all this way."]]);
async function storyWeathertop(){flag('wtArrived');chapter(3);G.party=G.party.filter(k=>k!=='aragorn');place('aragorn',27,19.6,'left');await say('wtArrive');objective('Talk to Strider by the campfire.');return null}
D.wtA1={who:'aragorn',m:'neutral',name:'Strider',scene:'weathertop',text:"Sit, Frodo. A short rest. You were braver than you knew, in Bree. Ask me anything you like — only be quick.",ch:[
 {t:'Who are you, really?',go:'wtA_who'},
 {t:'Where do you come from?',go:'wtA_home'},
 {t:'Is the Ring safe with me?',go:'wtA_ring'}]};
D.wtA_who={who:'aragorn',m:'smile',name:'Strider',fx:()=>{bond('aragorn',1);flag('wtAsked')},text:"A Ranger. One of the last. We guard these lands in secret; the people of the Shire hardly know we exist. They sleep soundly in their beds because of men like me.",next:'wtA_end'};
D.wtA_home={who:'aragorn',m:'sad',name:'Strider',fx:()=>{bond('aragorn',2);flag('wtAsked')},text:"A long way north and west, in a country that was once mine... and a great deal longer ago, in a house of silver tongues, in the valley of Rivendell. I may see it again. I may not.",next:'wtA_end'};
D.wtA_ring={who:'aragorn',m:'stern',name:'Strider',fx:()=>{bond('trust',1);flag('wtAsked')},text:"Safe? No. The Ring is the most dangerous thing in the world. Never wear it. Not once. Even holding it makes you a beacon for the Enemy. *If you must put it on to save your life*, remember: it is a hunter, and it watches you.",next:'wtA_end'};
D.wtA_end={who:'aragorn',m:'stern',name:'Strider',text:"I shall scout the hill. Stay by the fire. Whatever you hear, *do not* leave the circle of light.",fx:()=>{flag('wtTalked');G.party=G.party.filter(k=>k!=='aragorn');hide_ara();objective('Rest by the campfire. Something does not feel right.')}};
function hide_ara(){flag('hide_aragorn')}
async function wtAragorn(){if(F().wtTalked)return'wtA_gone';return'wtA1'}
D.wtA_gone={who:'narrator',scene:'weathertop',text:"The Ranger has gone to scout. Only his footprints remain in the dew."};
async function wtFire(){
  if(!F().wtTalked){await say('wtFireWait');return null}
  if(F().wtFight)return'wtRested';
  flag('wtFight');await weathertopFight();return null}
D.wtFireWait={who:'sam',m:'smile',scene:'weathertop',text:"Bacon's almost done, Mr. Frodo. Why don't you have a chat with Strider while we wait?"};
D.wtRested={who:'narrator',scene:'weathertop',text:"The fire pops and crackles. The night is very quiet. Far too quiet."};
chain('wtNight',[
 N('Pippin and Merry nod by the fire; Sam fries bacon and sings a little song about fools and dragons. Frodo sits with his back to the stones, and feels something cold run down his spine.',{scene:'weathertop'}),
 ['frodo','worried',"Sam... hold your tongue. Do you hear that? That *dry* sound... like breathing."],
 N('Beyond the firelight, pale shapes are climbing the broken walls. Five tall figures, black-robed, with swords that glow like frost. The Ring in Frodo\'s pocket burns.')]);
D.wtNight_2.next='wtChoice';
D.wtChoice={who:'narrator',scene:'weathertop',text:"The Ring pulses against your chest; it *wants* to be worn. The Riders are almost in the circle of firelight. What do you do?",ch:[
 {t:'Hold fast. Fight with fire and stay hidden.',go:null,tag:'fight'},
 {t:'Slip on the Ring. Vanish.',go:null,tag:'ring'},
 {t:'Shout for Strider.',go:null,tag:'shout'}]};
async function weathertopFight(){
  await say('wtNight');const r=await say('wtChoice');let wound=0;
  /* spawn riders on the walls */
  ['rider'].forEach(()=>{[[17,14],[32,15],[30,21],[19,22],[24,12]].forEach(([x,y],i)=>addNpc({id:'r'+i,spr:'rider',por:'rider',name:'Nazgûl',x,y,dir:'down',alpha:.92,glow:34,glowCol:'#6a7ad8'}))});
  await wait(600);
  if(r==='ring'){ringUp(8,'You put on the Ring.');flag('usedRing');wound=2;await say('wtRingOn')}
  else{if(r==='shout'){bond('aragorn',-0);await say('wtShout')}const res=await puzzle('fire');wound=res.misses>=3?2:res.misses>=1?1:0;flag('fireScore',res.hits);
    if(res.misses>=3){await say('wtStab')}else if(res.misses>=1){await say('wtGraze')}else await say('wtNoWound')}
  G.stats.frodoHP=3-wound;
  await shake(500,2);await flash(300);
  M.extra=M.extra.filter(n=>!n.id.startsWith('r'));
  delete G.flags.hide_aragorn;place('aragorn',27,19.2,'left');
  await say('wtAfter');flag('wtDone');
  await ford()}
D.wtRingOn={who:'narrator',scene:'weathertop',text:"The Ring slides over your finger. The world turns to grey smoke, and the Riders swirl, huge and white-faced, their eyes burning. The Witch-king's blade drives down into your shoulder. Cold, so cold... A shriek tears the night."};
D.wtShout={who:'frodo',m:'surprised',scene:'weathertop',text:"STRIDER! Strider, help!"};
D.wtStab={who:'narrator',scene:'weathertop',text:"A sword flashes out of the dark. It strikes Frodo's shoulder; a splinter of cold steel stays inside. The firelight dwindles. Then a roar, a flaming brand, and Strider leaps among the Riders."};
D.wtGraze={who:'narrator',scene:'weathertop',text:"You hurl a flaming brand. Two Riders recoil, shrieking; a third slashes and grazes your arm. Cold seeps through the cut. Then Strider is there, a torch in each hand, driving the shadows back."};
D.wtNoWound={who:'narrator',scene:'weathertop',text:"Your flaming brands drive the Riders back one by one. Not a blade touches you. Then Strider leaps through the circle, a torch in each hand, and the Nazgûl break and flee into the night."};
chain('wtAfter',[
 ['aragorn','worried',()=>G.stats.frodoHP<3?"He is wounded — and with a Morgul-blade. It will turn him into a wraith unless we reach Rivendell in time. Sam, fetch the athelas — kingsfoil. Frodo, stay awake. Do not sleep.":"You fought like a hobbit with a dozen hearts. They will return — but not tonight. We must leave for Rivendell at once.",{scene:'weathertop'}],
 ['sam','worried',"I'll look after him, Mr. Strider. If it's the last thing I do."]]);
D.wtAfter_1.fx=()=>{bond('sam',1)};
async function ford(){
  await transition(async()=>{});
  await say('ford');
  chapter(4);G.sprite='frodoCloak';joinParty('aragorn');await go('rivendell',3,22,'right')}
chain('ford',[
 N('Days later, in the pale dawn, a white horse bursts from the trees of the Ford of Bruinen. A dark-haired elf-lady rides it hard, cloak streaming — and nine Black Riders thunder behind.',{scene:'rivendell'}),
 ['arwen','stern',"I am Arwen. I have come for the Ring-bearer. Strider, let me take him. My horse is swifter than yours, and I know the shortest road to my father's house.",{name:'Arwen',scene:'rivendell'}]]);
D.ford_1.ch=[
 {t:'I will go with her.',go:'ford_a',tag:'trustArwen'},
 {t:"No. I will not leave Strider.",go:'ford_b'}];
D.ford_a={who:'arwen',m:'smile',name:'Arwen',fx:()=>{bond('trust',1)},text:"Be not afraid, Frodo. If you want him, come and claim him! Ride with me... Noro lim, Asfaloth! *Faster!*",next:'ford_end'};
D.ford_b={who:'aragorn',m:'stern',name:'Strider',fx:()=>{bond('aragorn',1)},text:"Frodo — it is not about me. Go with her. *Go.* I swear I shall be just behind.",next:'ford_end'};
D.ford_end={who:'narrator',scene:'rivendell',text:"The white horse leaps the river. The Riders follow. Then the river answers: a great flood of white-maned water roars down the Ford, and the Nine are swept away. Frodo falls into darkness."};
