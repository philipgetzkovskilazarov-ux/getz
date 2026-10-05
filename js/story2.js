'use strict';
/* =========================================================
   story2.js — Chapters IV–VII: Rivendell, Moria, Lothlórien,
   Amon Hen; companion banter; journal; endings.
   ========================================================= */

/* ================= IV · RIVENDELL ================= */
chain('rivWake',[
 N('Frodo opens his eyes. Soft golden light slants through carved shutters; somewhere, water sings among the stones. There is a long, quiet moment before he realises he is alive.',{scene:'rivendell'}),
 ['gandalf','smile',"Welcome to *Rivendell*, Frodo. It is the tenth of the month; you have slept a long while. Elrond's healers have worked miracles... although I fear the shard is the least of what you carry.",{scene:'rivendell'}],
 ['frodo','surprised',"Gandalf! You did not come to Bree. We waited for you. Strider told us you were delayed, but..."]]);
D.rivWake_2.ch=[{t:'Where were you?',go:'rw_a'},{t:'I am only glad you are here.',go:'rw_b',fx:()=>bond('gandalf',1)}];
D.rw_a={who:'gandalf',m:'sad',text:"I was a prisoner, Frodo. Locked at the top of Orthanc by Saruman the White, the wisest of my order — who has gone over to the Enemy, and covets the Ring for himself. A great eagle carried me out. I did not forget you for a moment.",next:'rw_end'};
D.rw_b={who:'gandalf',m:'smile',text:"And I you. I would give a great deal to have been there. Saruman, the wisest of my order, has turned traitor, you see. I was his guest, rather against my will.",next:'rw_end'};
D.rw_end={who:'gandalf',m:'stern',text:"Rest. Then wander and speak with the guests who are gathering. Elrond has called a *Council*. Bilbo is here, too — he is somewhere among the garden terraces, much older and just as stubborn.",fx:()=>{objective('Explore Rivendell. Speak with Bilbo, and meet the guests gathering for the Council.',{npc:'bilbo'})}};
chain('rivHeal',[
 ['elrond','stern',"The wound is deep and cold. This is the work of a Morgul-blade; it seeks the heart. We have little time. Bring me the right herbs, Frodo — and your friends' trust.",{scene:'rivendell',name:'Elrond'}]]);
D.rivHeal.next='rivHeal2';
D.rivHeal2={who:'aragorn',m:'worried',name:'Aragorn',text:"I know the old remedy. Kingsfoil, brewed with bark and a flower from the meadows — but beware the poisons that look alike. Choose with care."};
D.healOk={who:'elrond',m:'smile',scene:'rivendell',text:"The fever breaks. It will pass; you are strong, Frodo Baggins — far stronger than you know. Another hour and I might have been too late.",fx:()=>{G.stats.frodoHP=3}};
D.healBad={who:'elrond',m:'worried',scene:'rivendell',text:"The draught was weak. You will mend, but slowly — and the shadow of the blade will linger in your shoulder. Do not trust it to remain quiet.",fx:()=>{flag('frail');ringUp(6)}};
async function storyRivendell(){flag('rivArrived');chapter(4);setTime('day');flag('hasRing');
  await say('rivWake');
  if(G.stats.frodoHP<3){await say('rivHeal');const ok=await puzzle('athelas');await say(ok?'healOk':'healBad')}
  objective('Explore Rivendell. Speak with Bilbo, and meet the guests gathering for the Council.',{npc:'bilbo'});return null}
async function rivGandalf(){
  if(F().councilDone)return'gandalfPostCouncil';
  if(F().councilReady)return'gandalfCouncilSoon';
  return'gandalfMid'}
D.gandalfMid={who:'gandalf',m:'smile',scene:'rivendell',text:()=>"Take your time, Frodo. Rivendell is the one place in the world where time slows to a stately walk. Speak with Bilbo, and with the strangers who have come to town. The Council begins when everyone is gathered. ("+(['metBilbo','metLegolas','metGimli','metBoromir'].filter(k=>F()[k]).length)+"/4)"};
D.gandalfCouncilSoon={who:'gandalf',m:'stern',scene:'council',text:"Everyone is gathered. Go to the stone circle on the eastern terrace; Elrond is waiting."};
D.gandalfPostCouncil={who:'gandalf',m:'smile',scene:'rivendell',text:"We leave when the Fellowship is ready. Bring warm cloaks, and as much hope as you can carry."};
function checkCouncil(){if(['metBilbo','metLegolas','metGimli','metBoromir'].every(k=>F()[k])&&!F().councilReady){flag('councilReady');objective('Go to the stone circle on the eastern terrace for the Council of Elrond.',{x:46,y:23.4});toast('The Council is ready to begin.')}}
chain('bil0',[
 ['bilbo','happy',"Frodo, my dear boy! *There* you are! I knew you would come, somehow. Look at me: grey as a badger and twice as grumpy. I have been writing a book. A *big* one.",{scene:'rivendell',side:'left'}],
 ['bilbo','smile',"Is that... is that the Ring? Forgive an old hobbit's curiosity. Might I just look at it? Only look?"]]);
D.bil0_1.ch=[
 {t:'Of course. Here it is.',go:'bil_show'},
 {t:'It is safer in my pocket, Bilbo. I am sorry.',go:'bil_no'},
 {t:'You gave it to me, Bilbo. Remember?',go:'bil_rem'}];
D.bil_show={who:'bilbo',m:'angry',scene:'rivendell',fx:()=>{ringUp(5,'The Ring stirs in Bilbo\'s hand.');bond('trust',-1);flag('bilboRingSlip')},text:"My precious... it's mine... it *calls* to me. Gah! *Take it away!* Frodo, I'm sorry — I'm so sorry. I did not mean... Oh, I'm an old fool. Put it away.",next:'bil_gift'};
D.bil_no={who:'bilbo',m:'smile',fx:()=>{bond('heart',1);ringUp(-2)},text:"No... no, you are quite right. I would only hurt myself. I *wanted* to. That is the worst of it. Wise lad.",next:'bil_gift'};
D.bil_rem={who:'bilbo',m:'sad',fx:()=>{bond('heart',1)},text:"I remember. Heavens, do I remember. I left it behind, didn't I? It was the hardest thing I ever did. And — and now you have it. Poor Frodo.",next:'bil_gift'};
D.bil_gift={who:'bilbo',m:'happy',scene:'rivendell',text:"Now, listen. I have two gifts for you. This little sword — I call it *Sting*; it glows blue when orcs are near — and this: a shirt of *mithril*, light as a feather, tough as dragon scales. Take them both, my boy.",ch:[
 {t:'I cannot take your sword, Bilbo!',go:'bil_g1'},{t:'Thank you, Bilbo. I will wear it proudly.',go:'bil_g2'}]};
D.bil_g1={who:'bilbo',m:'smile',text:"Nonsense. Take it. A hobbit with a sword is a most unlikely thing, and the unlikely tend to win.",next:'bil_end',fx:()=>{flag('hasSting');flag('hasMithril')}};
D.bil_g2={who:'bilbo',m:'happy',text:"Splendid! Splendid. It was always meant for you.",next:'bil_end',fx:()=>{flag('hasSting');flag('hasMithril');bond('heart',1)}};
D.bil_end={who:'bilbo',m:'smile',text:"Go on, now. And Frodo — *finish my story*. I should so like to know how it ends.",fx:()=>{flag('metBilbo');checkCouncil();toast('Received Sting and a mithril shirt.')}};
D.bilAfter={who:'bilbo',m:'smile',scene:'rivendell',text:"Rivendell is the sort of place a hobbit could happily grow old in. If one were not already old. Go on, Frodo."};
async function rivBilbo(){if(F().metBilbo)return'bilAfter';return'bil0'}
async function rivElrond(){if(F().councilDone)return'elrondAfter';return'elrond1'}
D.elrond1={who:'elrond',m:'stern',scene:'rivendell',text:"The Ring-bearer, awake and walking. Frodo Baggins, you have the heart of a hobbit — and I am sorry to say that the Ring has the heart of a serpent. Tomorrow, representatives of all the free peoples will decide its fate. Listen to everyone. Trust *yourself*.",ch:[
 {t:'Is it true that it cannot be destroyed here?',go:'elrond2'},{t:'I will listen.',go:null}]};
D.elrond2={who:'elrond',m:'sad',text:"It was made in the fires of Mount Doom; only there can it be unmade. Which means taking it into the very heart of Mordor. That is the burden — and I do not envy whoever bears it."};
D.elrondAfter={who:'elrond',m:'smile',scene:'rivendell',text:"You have taken a heavy road, Frodo. My blessing and my best remedies go with you."};
D.arwen1={who:'arwen',m:'smile',name:'Arwen',scene:'rivendell',text:"I am glad you are well, Frodo. The river answered when I called; I did only what the valley would do for any friend. Go with courage."};
async function rivArwen(){if(F().councilDone&&!F().arwenScene){flag('arwenScene');await say('arwenAra');return null}return'arwen1'}
chain('arwenAra',[
 N('On a quiet bridge above the falls, the elf-lady and the Ranger stand a long moment in silence. Frodo, passing by, stops respectfully out of earshot.',{scene:'rivendell'}),
 ['arwen','sad',"You will leave in the morning, and no one can promise that you will return. My father would have me sail West before the shadow comes. But I would sooner share one mortal life with you than all the ages of this world alone.",{scene:'rivendell',name:'Arwen'}],
 ['aragorn','sad',"You have given me the best of reasons to live, Arwen. Whatever happens on the road, remember that I kept faith.",{scene:'rivendell',name:'Aragorn'}],
 N('She puts a silver pendant, a star of white gems, into his hand and closes his fingers over it.',{scene:'rivendell'}),
 ['arwen','smile',"Take it. Wear it, and think of the evening-star that never sets.",{scene:'rivendell',name:'Arwen',fx:()=>{bond('aragorn',1,'Aragorn is grateful');flag('hasEvenstar')}}]]);
D.elfA={who:'legolas',m:'smile',name:'Elf',scene:'rivendell',text:"We sing about the sea in Rivendell, more than we should. It is a very long song, and none of us has finished it."};
D.elfB={who:'elrond',m:'smile',name:'Elf',scene:'rivendell',text:"You are the little one who rode on Arwen's horse. All the valley has been talking of nothing else since."};
D.elfC={who:'galadriel',m:'smile',name:'Elf',scene:'rivendell',text:"The leaves fall upward here, if you look at them the right way. Try it."};
D.rivfount={who:'narrator',scene:'rivendell',text:"The fountain sings softly. Silver coins glint in the water: wishes made by travellers a very long time ago."};
chain('leg0',[['legolas','smile',"Frodo Baggins! I am Legolas, son of Thranduil of Mirkwood. My father has sent me with news of the creature who once carried your Ring: Gollum has escaped our keeping.",{scene:'rivendell'}]]);
D.leg0.ch=[{t:'It is an honour to meet you, Legolas.',go:'leg_a'},{t:'Escaped? How is that possible?',go:'leg_b'}];
D.leg_a={who:'legolas',m:'smile',fx:()=>{bond('legolas',2);flag('metLegolas');checkCouncil()},text:"The honour is mine. Few have ever spoken so warmly to an elf of the Woodland Realm on first meeting. I think we shall be friends."};
D.leg_b={who:'legolas',m:'stern',fx:()=>{bond('legolas',1);flag('metLegolas');checkCouncil()},text:"The orcs ambushed my guards; he slipped away in the dark. I have a great many apologies to make to the Council. Do not worry — I am a good tracker, and he leaves a trail like a snail."};
async function rivLegolas(){return F().metLegolas?'legAfter':'leg0'}
D.legAfter={who:'legolas',m:'smile',scene:'rivendell',text:"I hear the Council will be loud. Dwarves, men, elves — we always are. Stay near Gandalf."};
chain('gim0',[['gimli','angry',"Hmph. A halfling. Another one! Do you know that elf there has been looking at me as if I were a sack of turnips? I am Gimli, son of Glóin. Remember the name; the Dwarves of Erebor are not to be trifled with.",{scene:'rivendell'}]]);
D.gim0.ch=[{t:'Do not mind the elf. I am glad to meet a dwarf.',go:'gim_a'},{t:'I have never met a dwarf. Do you really have an axe for everything?',go:'gim_b'}];
D.gim_a={who:'gimli',m:'happy',fx:()=>{bond('gimli',2);flag('metGimli');checkCouncil()},text:"Ha! Well said, master hobbit. You may be small, but you have more sense than half the people in this valley."};
D.gim_b={who:'gimli',m:'smile',fx:()=>{bond('gimli',1);flag('metGimli');checkCouncil()},text:"An axe for every occasion! One for firewood, one for trees, one for stubborn doors — and one for elves who ask too many questions."};
async function rivGimli(){return F().metGimli?'gimAfter':'gim0'}
D.gimAfter={who:'gimli',m:'stern',scene:'rivendell',text:"Keep your wits about you at the Council. Men talk too much, elves talk too long, and the Dwarves are expected to be gruff. I plan to be gruff."};
chain('bor0',[['boromir','smile',"You are the Ring-bearer. I am Boromir of Gondor, son of Denethor. I have ridden a hundred and ten days to reach Rivendell, searching for a dream's answer... and for the sake of my people.",{scene:'rivendell'}]]);
D.bor0.ch=[{t:'What was your dream?',go:'bor_a'},{t:'Gondor has stood long against the Enemy. We owe it a great deal.',go:'bor_b'},{t:'(Keep the Ring hidden and say nothing.)',go:'bor_c'}];
D.bor_a={who:'boromir',m:'sad',fx:()=>{bond('boromir',2);flag('metBoromir');checkCouncil()},text:"A voice crying in the dark: *'Seek for the sword that was broken.'* Gondor is a bulwark against Mordor, but we are bleeding. I hope the Council hears this."};
D.bor_b={who:'boromir',m:'happy',fx:()=>{bond('boromir',3);flag('metBoromir');checkCouncil()},text:"You are kind to say so. Few outside our borders ever remember. We have kept the line against the Shadow for a thousand years — and almost no one thanks us. I shall remember your words, Frodo."};
D.bor_c={who:'boromir',m:'neutral',fx:()=>{bond('boromir',-0);flag('metBoromir');checkCouncil()},text:"A cautious one. Good. In these times it is wise to be cautious... but I notice you are *carrying* something close to your heart. I shall not ask. For now."};
async function rivBoromir(){return F().metBoromir?'borAfter':'bor0'}
D.borAfter={who:'boromir',m:'smile',scene:'rivendell',text:"They say the heir of Isildur is hiding among the Rangers. A king... in this age? Well. I shall listen to what the Council has to say."};

/* ---------- THE COUNCIL ---------- */
function rivCouncilStart(){return councilScene()}
async function councilScene(){
  await say('cn1');
  flag('councilDone');await councilFinale()}
chain('cn1',[
 N('Under the trees of the eastern terrace, a circle of stone chairs. Elves, dwarves, men — and four small hobbits — gather in a hush. Elrond rises.',{scene:'council'}),
 ['elrond','stern',"Strangers from distant lands, friends of old. You have been summoned to answer the threat of *Mordor*. Middle-earth stands upon the brink. The Ring must be destroyed.",{scene:'council'}],
 ['gimli','angry',"Then what are we waiting for?!",{scene:'council'}],
 N('Gimli springs to his feet and brings his axe down on the Ring, which sits on a stone pedestal. The blade shatters. Gimli is hurled backward.'),
 ['elrond','stern',"The Ring cannot be destroyed, Gimli son of Glóin, by any craft that we here possess. It was forged in the fire of Mount Doom. Only there can it be unmade. It must be taken deep into Mordor and cast back into the Fire from whence it came.",{scene:'council'}],
 ['boromir','stern',"One does not simply stroll into Mordor. Its gates are guarded by more than orcs; a Great Eye watches night and day. It is folly. And... have you not thought what the Ring might *do* for us? In Gondor's hands it could be a weapon.",{scene:'council'}],
 ['aragorn','stern',"You cannot wield it. None of us can. The Ring answers only to Sauron. It has no other master.",{scene:'council',name:'Aragorn'}],
 ['boromir','angry',"And what would a Ranger know about this matter?",{scene:'council'}],
 ['legolas','stern',"This is no mere Ranger. He is *Aragorn*, son of Arathorn. You owe him your allegiance.",{scene:'council'}],
 ['boromir','sad',"Aragorn? The heir of Isildur?... Gondor has no king, Legolas. Gondor does not need a king.",{scene:'council'}]]);
D.cn1_9.next='cnArgue';
D.cnArgue={who:'narrator',scene:'council',text:"The Council dissolves into shouting. Dwarf against elf, man against ranger, Gandalf trying to be heard. The Ring pulses on its pedestal, growing heavier in your mind. Everyone is arguing and no one will win. What do you do?",ch:[
 {t:'I will take the Ring to Mordor.',go:'cnVol',tag:'early'},
 {t:'Wait. Let them tire themselves out first.',go:'cnWait'},
 {t:'Let Boromir carry it to Gondor.',go:'cnBor'}]};
D.cnWait={who:'narrator',scene:'council',fx:()=>{ringUp(5,'The Ring whispers inside your head.');bond('boromir',-0);flag('councilWaited')},text:"The shouting grows. Elrond's voice is lost. Boromir has a hand on his sword; Gimli is red as a coal. The Ring's whisper is louder now, a sly voice offering you peace if you would only *hand it over*. You grit your teeth.",next:'cnArgue2'};
D.cnArgue2={who:'narrator',scene:'council',text:"You cannot stand it any more.",ch:[{t:'I WILL TAKE IT! I will take the Ring to Mordor.',go:'cnVol',tag:'late'}]};
D.cnBor={who:'elrond',m:'stern',scene:'council',fx:()=>{bond('boromir',2);bond('trust',-1)},text:"No. Boromir is a good man, but this burden would devour him. Think again, Frodo.",next:'cnArgue'};
D.cnVol={who:'frodo',m:'stern',scene:'council',fx:()=>{flag('volunteered');bond('heart',2);bond('gandalf',2,'Gandalf is moved')},text:"I will take it. I will take the Ring to Mordor — though I do not know the way.",next:'cnVol2'};
D.cnVol2={who:'gandalf',m:'smile',scene:'council',text:"I will help you bear this burden, Frodo Baggins, as long as it is yours to bear.",next:'cnVol3'};
D.cnVol3={who:'aragorn',m:'stern',name:'Aragorn',scene:'council',text:"If by my life or death I can protect you, I will. You have my sword.",next:'cnVol4'};
D.cnVol4={who:'legolas',m:'smile',scene:'council',text:"And you have my bow.",next:'cnVol5'};
D.cnVol5={who:'gimli',m:'stern',scene:'council',text:"And my axe!",next:'cnVol6'};
D.cnVol6={who:'boromir',m:'sad',scene:'council',text:"You carry the fate of us all, little one. If this is indeed the will of the Council, then Gondor will see it done.",next:'cnVol7'};
D.cnVol7={who:'sam',m:'surprised',scene:'council',text:"Mr. Frodo's not going anywhere without *me!*",next:'cnVol8'};
D.cnVol8={who:'elrond',m:'smile',scene:'council',text:"No, indeed. It is hardly possible to separate you, even when he is summoned to a secret council and you are not.",next:'cnVol9'};
D.cnVol9={who:'merry',m:'happy',scene:'council',text:"Here! We are coming too! You would have to send us home tied up in a sack to stop us.",next:'cnVol10'};
D.cnVol10={who:'pippin',m:'happy',scene:'council',text:"Anyway, you need people of intelligence on this sort of mission... quest... thing.",next:'cnVol11'};
D.cnVol11={who:'elrond',m:'smile',scene:'council',text:"Then that makes *ten*. Ten Walkers against the ten Black Riders. Let it be so. You shall be the *Fellowship of the Ring*.",fx:()=>{G.party=['sam','merry','pippin','gandalf','aragorn','legolas','gimli','boromir'];['gandalf','legolas','gimli','boromir'].forEach(k=>flag('hide_'+k));flag('fellowshipFormed');chapter(5);objective('The Fellowship departs. Leave Rivendell through the southern arch.',{x:32,y:44,up:6})}};
async function councilFinale(){G.sprite='frodoCloak';flag('hasCloak')}
D.cnFin={who:'elrond',m:'smile',scene:'rivendell',text:"Wear these Elven cloaks, small ones; they will keep out the rain and the eyes of watchers. Go with my blessing. The Fellowship leaves at dawn.",next:'cnFin2'};
D.cnFin2={who:'narrator',scene:'rivendell',text:"Frodo fastens the leaf-clasp of the Elven cloak. A silver brooch gleams in the light. Behind the Fellowship, the last homely house grows small. There will be no turning back."};
/* the council cutscene needs the vol node to proceed properly into the finale: chain via 'cnVol11' next */
D.cnVol11.next='cnFin';

/* ================= V · MORIA ================= */
chain('mgArrive',[
 N('Cold, hungry and shaken, the Fellowship comes down off the mountain and travels by night to a still, black lake beneath sheer cliffs. Wolves howl somewhere behind them.',{scene:'moriaGate'}),
 ['gandalf','worried',"The West-gate of *Moria*. The Dwarf-road, once the proudest hall in Middle-earth. Do not be afraid; the Doors of Durin shall open for those who know how to ask.",{scene:'moriaGate'}],
 ['gimli','happy',"My cousin Balin has established a colony here. I hope there is *roast boar* and a very large mug of ale.",{scene:'moriaGate'}]]);
chain('caradhras',[
 N('The Fellowship sets out south from Rivendell, over hill and stone, until the great mountain Caradhras rises before them. They climb as the wind begins to rise.',{scene:'caradhras'}),
 ['boromir','stern',"The snow is deepening. Frodo, take my cloak; the little ones will freeze before nightfall. Pippin, hold on to my belt.",{scene:'caradhras'}],
 ['legolas','worried',"There is a voice upon the wind, a *dark voice*. Do you hear it? It is chanting, and it is not of this world.",{scene:'caradhras'}],
 N('An avalanche of snow thunders from the peak above. Gandalf, braced against the wind, tries to shout down the storm — and the whole mountain answers with a roar of ice.',{scene:'caradhras'}),
 ['aragorn','stern',"Saruman! He is bringing the mountain down upon us. Gandalf, we must turn back; we cannot cross here!",{scene:'caradhras',name:'Aragorn'}]]);
D.caradhras_4.ch=[
 {t:'Gandalf, take us through the Gap of Rohan instead.',go:'cr_a'},
 {t:'We should follow Gandalf. He knows a way.',go:'cr_b',fx:()=>bond('gandalf',1)},
 {t:'Boromir is right: we should go south to Gondor.',go:'cr_c',fx:()=>bond('boromir',1)}];
D.cr_a={who:'gandalf',m:'stern',scene:'caradhras',fx:()=>bond('aragorn',1),text:"The Gap of Rohan runs near Isengard, Frodo. Straight into Saruman's hands. No. There is one road left, and it runs *under* the mountain. Through the Mines of Moria.",next:'cr_end'};
D.cr_b={who:'gandalf',m:'sad',scene:'caradhras',text:"I wish I did. There is a way — and I do not like it. The Mines of Moria. We shall go beneath the mountain, if it is not already ruined.",next:'cr_end'};
D.cr_c={who:'boromir',m:'stern',scene:'caradhras',text:"Gondor lies that way. Through Rohan, then down to my father's city. A well-guarded road. But Gandalf has other thoughts, I see.",next:'cr_d'};
D.cr_d={who:'gandalf',m:'stern',scene:'caradhras',text:"Roads south pass near Isengard, Boromir. There is only one road open to us now: the Mines of Moria.",next:'cr_end'};
D.cr_end={who:'gimli',m:'happy',scene:'caradhras',text:"Moria! Now *that* is a road I have wanted to walk since I was a lad. Hah! Come, you lot, my cousin Balin has been waiting for us."};
async function storyMoriaGate(){flag('mgArrived');chapter(5);await say('caradhras');await say('mgArrive');objective('Open the Doors of Durin. Examine the door by the cliff.',{x:22,y:11.4,up:30});
  await say('mgPippin');return null}
D.mgPippin={who:'pippin',m:'happy',scene:'moriaGate',text:"I say! Skipping stones on a lake — this will be the first moment of fun in a month. Merry, watch me.",ch:[
 {t:'Pippin, do not! Leave the water alone.',go:'mgP_a'},
 {t:'Go on, then. It is only a lake.',go:'mgP_b'}]};
D.mgP_a={who:'pippin',m:'sad',fx:()=>{bond('pippin',-0);bond('gandalf',1)},text:"Oh, very well. A hobbit cannot have *anything* these days.",next:'mgP_end'};
D.mgP_b={who:'narrator',scene:'moriaGate',fx:()=>{flag('pippinThrew');bond('pippin',1);bond('aragorn',-1)},text:"Pippin hurls a stone. It splashes into the black water... and something *beneath* the surface turns over, slowly, and listens.",next:'mgP_end'};
D.mgP_end={who:'aragorn',m:'stern',name:'Aragorn',text:()=>F().pippinThrew?"Do not disturb the water. *Never* disturb the water. Gandalf, hurry.":"Quiet. There is something in the water that I do not like.",scene:'moriaGate'};
function moriaGandalf(){return null}
chain('mgDoor',[
 ['gandalf','neutral',"Ithildin: mirror-silver, which shows only under starlight. Look: *'The Doors of Durin, Lord of Moria. Speak, friend, and enter.'* There are two lines of Elvish writing underneath. The password is hidden in the riddle — a word of friendship in the Elvish tongue.",{scene:'moriaGate'}],
 ['gandalf','stern',"A simple matter, if I could only remember the right word. *Ah — one moment.* It will come to me. Frodo, do you see anything? You have a good eye for details."]]);
D.mgDoor_1.ch=[{t:'Let me look at the door.',go:null}];
async function moriaDoor(){
  if(!F().doorAsked){flag('doorAsked');await say('mgDoor')}
  const r=await puzzle('door',{hard:!!F().pippinThrew});
  if(r.ok){bond('gandalf',r.tries===0?3:1,r.tries===0?'Gandalf: "Well spotted!"':'');flag('doorOpen');await say('mgOpen');sfx.door();objective('The Doors are open. Go in — quickly.',{x:22,y:10,up:20})}
  else{bond('gandalf',-1);flag('doorOpen');await say('mgFail');sfx.door();objective('The Doors are open. Go in — quickly.',{x:22,y:10,up:20})}
  return null}
D.mgOpen={who:'frodo',m:'surprised',scene:'moriaGate',text:"*Mellon.* It means *friend*. The answer was written there all along — you only had to ask in the Elvish way.",next:'mgOpen2'};
D.mgOpen2={who:'gandalf',m:'smile',scene:'moriaGate',text:()=>r_ok()?"Of course! The simplest answer is usually the right one. Well done, Frodo.":"Hm. Well. I might have got there eventually. The doors swing open at last.",next:'mgOpen3'};
function r_ok(){return !F().doorFailed}
D.mgFail={who:'gandalf',m:'sad',scene:'moriaGate',fx:()=>flag('doorFailed'),text:"Oh! I have been a fool. *Mellon.* The word for friend in the Elvish tongue. It was there all along. I could not see the wood for the trees.",next:'mgOpen2'};
D.mgOpen3={who:'gandalf',m:'worried',scene:'moriaGate',text:"The doors are open. Quickly now — into the darkness. I do not like the look of that water."};
async function storyWatcher(){
  flag('watcherDone');
  await say('wt1');
  const base=[[18,23],[22,25],[26,24],[30,23]];
  base.forEach(([x,y],i)=>addNpc({id:'tent'+i,spr:'_none',name:'Watcher',x,y,dir:'down',solid:false,draw:(c,sx,sy,t)=>drawTentacle(c,sx,sy,t,i)}));
  await wait(700);await shake(900,3);
  await say('wt2');
  await shake(500,2);
  chain('wt3',[N('The Doors of Durin groan as the Fellowship pours inside. A tentacle seizes the stone arch; the whole cliff shudders, and rocks crash across the entrance, sealing it forever.',{scene:'moriaGate'}),
    ['gandalf','stern',"We now have no choice but to follow the road through the mines. *Be careful.* There are older and fouler things in the deep places of the world than orcs.",{scene:'moria'}]]);
  await say('wt3');
  M.extra=M.extra.filter(n=>!n.id.startsWith('tent'));
  await transition(async()=>{await go0('moriaHall',28,46)});
  return null}
async function go0(id,tx,ty){M=loadMap(id);M.npcs=null;M.extra=[];G.map=id;G.px=tx*T;G.py=ty*T;G.dir='up';resetTrail();CAM.x=U.clamp(G.px-VW/2,0,Math.max(0,M.W-VW));CAM.y=U.clamp(G.py-VH/2,0,Math.max(0,M.H-VH));Music.set(M.def.music);initWeather();showLoc(M.def.name);save()}
chain('wt1',[
 N('A ripple spreads across the black lake. Then another. Then, with a slow, slithering sigh, a long glistening limb rises from the water.',{scene:'moriaGate'}),
 ['aragorn','surprised',"Into the Mines! *Now!* Gandalf — the Doors — something is coming out of the water!",{scene:'moriaGate',name:'Aragorn'}]]);
D.wt2={who:'narrator',scene:'moriaGate',text:"A tentacle wraps itself around Frodo's ankle and hauls him into the air. The Fellowship scatters. Boromir hacks one limb; another sweeps Merry and Pippin from the ground. Frodo dangles upside down above the dark water.",ch:[
 {t:'Draw Sting and strike at the tentacle!',go:'wtSting',if:()=>F().hasSting,fx:()=>{bond('heart',1);flag('fightBack')}},
 {t:'Cry out for Sam!',go:'wtSam',fx:()=>{bond('sam',1)}},
 {t:'Struggle and scream.',go:'wtScream',fx:()=>{bond('heart',-0);ringUp(3)}}]};
D.wtSting={who:'narrator',scene:'moriaGate',text:"Sting flares blue, a cold bright flame. You slash at the slimy limb; it recoils. Sam and Aragorn seize you as you fall, and Boromir slams his shield into another tentacle.",fx:()=>bond('aragorn',1),next:null};
D.wtSam={who:'sam',m:'angry',scene:'moriaGate',text:"LET HIM GO, you great slimy brute! Mr. Frodo! Hold on! *Strider!* Boromir!",fx:()=>bond('sam',1),next:null};
D.wtScream={who:'narrator',scene:'moriaGate',text:"You scream, thrash, kick — and Boromir cuts the limb with a roar. Aragorn catches you as you fall. You are shaking; the Ring is hot against your chest.",next:null};
D.wt2.ch.forEach(c=>{if(!c.go)return});
/* the three outcomes share the same exit */
['wtSting','wtSam','wtScream'].forEach(k=>D[k].next=undefined);
function drawTentacle(c,sx,sy,t,i){const segs=14,len=9;let x=sx,y=sy;const col=['#2a5a48','#3a7a5a','#5aa07a'];
  for(let s=0;s<segs;s++){const a=-Math.PI/2+Math.sin(t*1.4+i*1.7+s*.45)*.5*(1+s*.05)+(i-1.5)*.15;const px=x+Math.cos(a)*len*.5,py=y+Math.sin(a)*len*.9;const r=Math.max(1.5,6-s*.32);
    c.fillStyle=col[(s*3|0)%3===0?2:s%2];c.beginPath();c.ellipse(Math.round(px),Math.round(py),r,r*.9,0,0,7);c.fill();if(s%3===1){c.fillStyle='#d8f0c8';c.fillRect(Math.round(px-r*.4),Math.round(py+r*.3),1,1)}x=px;y=py}
  c.fillStyle='rgba(20,40,60,.45)';c.beginPath();c.ellipse(Math.round(sx),Math.round(sy+2),8,3,0,0,7);c.fill()}

/* ---------- Moria hall ---------- */
chain('mhArrive',[
 N('Black. A damp, endless silence, the sound of dripping water... and then Gandalf\'s staff ignites with a pure white glow, and the Fellowship gasps. Immense pillars stretch up into the dark; hall after hall of carved stone, all deserted.',{scene:'moria'}),
 ['gimli','sad',"This is no mine. It is a *tomb*. Gloin said there was a halls here... the greatest of the Dwarves. What has happened to them?",{scene:'moria'}],
 ['gandalf','stern',"We follow the Dwarf-road. Stay close and *touch nothing*. Aragorn, look about; Frodo, to me. Remember: this place is older than the memory of Men.",{scene:'moria'}]]);
async function storyMoriaHall(){flag('mhArrived');chapter(5);await say('mhArrive');objective("Explore the hall. Balin's tomb is in the western chamber.",{x:8,y:31.4});return null}
chain('tomb1',[
 N('A low chamber lined with stone: in the centre, a white tomb bears the runes of Dwarvish letters. Gimli stands very still. Behind him, Gandalf lifts a mouldering book from the bones of a fallen dwarf.',{scene:'moria'}),
 ['gimli','sad',"*Here lies Balin, Lord of Moria.* No. No, no, no... He is dead. My cousin is dead.",{scene:'moria'}],
 ['gandalf','worried',"The last pages of this book. It tells of the end — *'We cannot get out. The pool is up to the wall at Westgate. The Watcher took Óin... Drums, drums in the deep. They are coming.'*",{scene:'moria'}]]);
D.tomb1_2.ch=[{t:'Gimli, I am so sorry. He was a brave dwarf.',go:'tomb_a',fx:()=>bond('gimli',2)},{t:'(Say nothing; place a hand on Gimli\'s shoulder.)',go:'tomb_b',fx:()=>{bond('gimli',3);bond('heart',1)}},{t:'Gandalf, we must leave. Now.',go:'tomb_c',fx:()=>bond('gandalf',1)}];
D.tomb_a={who:'gimli',m:'sad',scene:'moria',text:"Thank you, master hobbit. He would have been glad to meet you. He had a good eye for hobbits. They always had the best tobacco.",next:'tomb_end'};
D.tomb_b={who:'gimli',m:'sad',scene:'moria',text:"...Aye. Thank you, Frodo. A dwarf does not weep easily, but he does not forget a hand on the shoulder either.",next:'tomb_end'};
D.tomb_c={who:'gandalf',m:'stern',scene:'moria',text:"Yes. Yes, you are right. This is no place to linger.",next:'tomb_end'};
D.tomb_end={who:'narrator',scene:'moria',text:"Then, with a clatter of bones and iron, something heavy tumbles into the well-shaft outside. A skeleton, a bucket on a chain — Pippin, white-faced, standing behind it."};
D.tomb_p={who:'pippin',m:'surprised',scene:'moria',text:"I'm so sorry! I only leaned on it! It was a perfectly *ordinary* bone!",next:'tomb_g'};
D.tomb_g={who:'gandalf',m:'angry',scene:'moria',text:"Fool of a Took! *Throw yourself in next time, and rid us of your stupidity!* ... Oh, no. Listen.",next:'tomb_drum'};
D.tomb_drum={who:'narrator',scene:'moria',text:"Far below, a single drum: *Doom. Doom.* Then another. Then dozens, a rolling thunder rising out of the dark. Sting glows blue at Frodo's belt.",fx:()=>{flag('orcsComing');flag('tombDone');objective('Orcs! Run for the Great Stair, to the north of the hall!',{x:30,y:18})}};
async function moriaTomb(){await say('tomb1');await say('tomb_p');await say('orcWave');return null}
chain('orcWave',[
 ['boromir','stern',"They have a cave troll. Frodo, behind me! Aragorn — *the door!*",{scene:'moria'}],
 N('Orcs boil out of the cracks and holes of the hall. Black-armoured, screeching, a hundred scimitars flashing. Aragorn and Legolas hold the door; Boromir, Gimli and Gandalf lay about them. Sam swings a frying pan.'),
 ['gandalf','angry',"To the bridge of Khazad-dûm! *Run*, you fools! This foe is beyond any of you!",{scene:'moria'}]]);
D.orcWave_2.fx=()=>{flag('orcsComing');objective('Run for the Great Stair at the north of the hall.',{x:30,y:18});
  [[18,26],[26,24],[34,28],[40,24],[22,32],[30,30]].forEach(([x,y],i)=>addNpc({id:'orc'+i,spr:'orc',name:'Orc',x,y,dir:'down',solid:false}));};
async function moriaWell(){await say('well1');flag('wellDone');return null}
chain('well1',[N('The old well-shaft, gaping black. Far below, a faint echo; a clatter of bones.',{scene:'moria'})]);
async function moriaStairs(){
  await say('stair0');
  const r=await puzzle('stairs');
  if(r.ok){flag('stairsDone');bond('gandalf',1);await say('stairOk');objective('Cross the bridge of Khazad-dûm!',{x:45,y:9.5,up:10});M.extra=M.extra.filter(n=>!n.id.startsWith('orc'))}
  else{await say('stairBad');flag('stairsDone');bond('aragorn',-1);bond('boromir',1);objective('Cross the bridge of Khazad-dûm!',{x:45,y:9.5,up:10});M.extra=M.extra.filter(n=>!n.id.startsWith('orc'))}
  return null}
D.stair0={who:'aragorn',m:'stern',name:'Aragorn',scene:'moria',text:"The Stair is broken in places. Watch where Legolas steps, and *remember*; one wrong tread and it is a long fall. I cannot carry you all."};
D.stairOk={who:'gandalf',m:'smile',scene:'moria',text:"Quick feet, Frodo! Across! The way lies over the narrow bridge ahead."};
D.stairBad={who:'boromir',m:'worried',scene:'moria',text:"Hold fast, little ones! I have you! — By the White Tree, you are all lighter than a sack of apples. Leap!"};
chain('bridgeScene',[
 N('A roar shakes the hall. From a cleft in the dark, a shape of shadow and fire rises: wings of darkness, a mane of flame, a whip of fire. A *Balrog*, an ancient demon of the Elder Days.',{scene:'bridge'}),
 ['boromir','surprised',"What is that horror?!",{scene:'bridge'}],
 ['gandalf','stern',"A Balrog, a demon of the Ancient World. This foe is beyond any of you. *RUN!* Across the bridge, all of you. Fly!",{scene:'bridge'}],
 N('The Fellowship races over the narrow span, flames licking at their heels. Gandalf is the last. At the far end he turns, staff and sword in hand, to face the creature.',{scene:'bridge'}),
 ['gandalf','angry',"I am a servant of the Secret Fire. *You shall not pass!* The dark fire will not avail you. Go back to the Shadow!",{scene:'bridge'}],
 N('He strikes his staff on the stone. The bridge breaks. The Balrog plunges, roaring... but its whip of fire lashes out and curls about Gandalf\'s ankle. He is dragged to the very edge.',{scene:'bridge'}),
 ['gandalf','stern',"Fly, you fools!",{scene:'bridge'}],
 N('He lets go. And is gone.',{scene:'dark'})]);
D.bridgeScene_7.next='bridgeChoice';
D.bridgeChoice={who:'frodo',m:'sad',scene:'bridge',text:"NO! *Gandalf!* NO!",ch:[
 {t:'Run to the edge. Try to reach him!',go:'bc_a',tag:'edge'},
 {t:'Collapse; Boromir pulls you away.',go:'bc_b',tag:'collapse'}]};
D.bc_a={who:'boromir',m:'angry',scene:'moria',fx:()=>{bond('boromir',2);bond('heart',1)},text:"Frodo! *No!* There is nothing you can do! He would not want you to throw your life away. Come — I have you. Merry, Pippin! Out! OUT!",next:'bc_end'};
D.bc_b={who:'boromir',m:'sad',scene:'moria',fx:()=>{bond('boromir',1)},text:"Come on, small one. He gave himself for us; do not waste it. Aragorn! Take Sam; I have the Ring-bearer.",next:'bc_end'};
D.bc_end={who:'aragorn',m:'sad',name:'Aragorn',scene:'moria',text:"Gandalf the Grey is lost. We *go on*. Come, all of you. Into the light. Legolas, get them up. Boromir — *Boromir!* — out of the Mines, and quickly."};
async function storyBridge(){
  flag('bridgeStarted');await say('bridgeScene');
  flag('gandalfFell');G.party=G.party.filter(k=>k!=='gandalf');flag('bridgeDone');chapter(6);ringUp(2);
  await transition(async()=>{});
  await say('moriaOut');objective('Follow Aragorn out of Moria.');
  await go('lorien',3,20,'right');return null}
chain('moriaOut',[
 N('The company stumbles up the last steps of the Great Gates and out into a cold, bright morning. No one speaks. The hobbits are weeping. Even Gimli sits in the grass with his head in his hands.',{scene:'amonhen'}),
 ['aragorn','stern',"Legolas, get them up. Come, Boromir. We must be out of these woods before dusk. *Up*, Frodo. I know your heart is breaking. So is mine. But there are other eyes on us, and the road is not done.",{scene:'amonhen',name:'Aragorn'}]]);

/* ================= VI · LOTHLÓRIEN ================= */
chain('lorGate',[
 N('Beneath tall trees whose leaves are gold, the Fellowship walks into the Golden Wood. The light is soft, as though a dream had put on the clothes of a forest. Suddenly, a hundred arrows point out of the trees.',{scene:'lorien'}),
 ['elfB','stern',"The dwarf breathes so loud we could have shot him in the dark. *Well met, Aragorn son of Arathorn.* But no dwarf may pass the borders of our wood.",{scene:'lorien',name:'Haldir'}],
 ['gimli','angry',"I have seen a good deal of elves and orcs in this life, and one's as ill-bred as the other.",{scene:'lorien'}]]);
D.lorGate_2.ch=[{t:'Gimli, please. Let me speak.',go:'lg_a',fx:()=>bond('gimli',0)},{t:'Haldir, we have come in great need. The Lady will see us.',go:'lg_b',fx:()=>bond('legolas',1)}];
D.lg_a={who:'gimli',m:'sad',scene:'lorien',fx:()=>bond('gimli',1),text:"...Aye. Fine. For you, Frodo, I shall hold my tongue. But I shall *not* like it.",next:'lg_end'};
D.lg_b={who:'elfB',m:'smile',name:'Haldir',scene:'lorien',text:"The Lady of the Wood is expecting you. She has been watching your journey. Come — and tread softly.",next:'lg_end'};
D.lg_end={who:'elfB',m:'stern',name:'Haldir',scene:'lorien',text:"The Lady of the Wood is waiting. Follow the paths of white stone, through Caras Galadhon, to the Mirror grove.",fx:()=>{objective('Walk through Caras Galadhon. Galadriel waits to the south-east, in the Mirror grove.',{npc:'galadriel'})}};
async function storyLorien(){flag('lorArrived');chapter(6);setTime('day');await say('lorGate');return null}
D.haldir={who:'elfB',m:'smile',name:'Haldir',scene:'lorien',text:"The wood is long and old, and what is said about Galadriel is only half true. I would say no more than that."};
D.celeborn={who:'elrond',m:'stern',name:'Celeborn',scene:'lorien',text:"The Lady and I have lived here a long age. We hear of the world's wrongs every night, and still we do not leave. Remember that, Ring-bearer."};
D.elfL1={who:'galadriel',m:'smile',name:'Elf',scene:'lorien',text:"We keep the lamps lit through the night. There is nowhere in Lórien where the dark can hide."};
D.elfL2={who:'galadriel',m:'smile',name:'Elf',scene:'lorien',text:"Mallorn trees do not lose their leaves until spring. Then the old gold falls, and the new gold grows in. Beauty for beauty, and no gap between."};
chain('galMeet',[
 N('At the heart of the wood, among white stone and fountains, a tall figure waits. Her hair is gold and silver; her gaze, bright as starlight. The whole Fellowship falls silent.',{scene:'lorien'}),
 ['galadriel','neutral',"Welcome to Lothlórien. You have come to us out of a great sorrow. Gandalf the Grey, who led you, did not pass the borders of this land. I know. I have heard the news.",{scene:'lorien'}],
 N('Her eyes pass over each member of the Fellowship. Aragorn bows his head; Boromir looks away, trembling; Sam, wide-eyed, whispers a promise to himself. At last the gaze rests on Frodo.',{scene:'lorien'}),
 ['galadriel','stern',"Your coming here is the footstep of doom. *Frodo.* The quest stands upon the edge of a knife; stray but a little and it will fail, to the ruin of all. Yet hope remains while the Company is true.",{scene:'lorien'}]]);
D.galMeet_3.ch=[{t:'I am afraid. Tell me what I must do.',go:'gal_a'},{t:'I will go on. I made a promise.',go:'gal_b'},{t:'Lady, how can you know so much?',go:'gal_c'}];
D.gal_a={who:'galadriel',m:'smile',scene:'lorien',fx:()=>{bond('trust',1);flag('galFear')},text:"Fear is no weakness when it keeps you humble. You will do what you must do: carry. That is the task. It is a small task and a great one. You are not alone; even the smallest person can change the course of the future.",next:'gal_end'};
D.gal_b={who:'galadriel',m:'smile',scene:'lorien',fx:()=>{bond('heart',1);flag('galResolve')},text:"I see that your heart is as true as your word. Hold to it, even when the way grows dark, and darker still.",next:'gal_end'};
D.gal_c={who:'galadriel',m:'smile',scene:'lorien',fx:()=>{flag('galCurious')},text:"I have lived through three Ages of the world. I have seen the great triumph and fall. Some things I see in water; some in the faces of those who stand before me.",next:'gal_end'};
D.gal_end={who:'galadriel',m:'neutral',scene:'lorien',text:"Rest, all of you. At dusk, come to the Mirror, Frodo. It shows things that were, that are, and some that have not yet come to pass.",fx:()=>{flag('galMet');flag('mirrorReady');objective('Look into Galadriel\'s Mirror in the south-east grove. (Optional: find the silver mirror-stones in the north.)',{x:44,y:31.5})}};
async function lorGaladriel(){if(!F().galMet)return'galMeet';if(F().mirrorDone)return'galAfter';return'galWait'}
D.galWait={who:'galadriel',m:'smile',scene:'lorien',text:"The basin awaits you in the grove. Come when you are ready."};
D.galAfter={who:'galadriel',m:'smile',scene:'lorien',text:"Go with the light of Eärendil; may it shine in the dark places when all other lights go out."};
async function lorGimli(){return null}
async function lorMirror(){
  await say('mirror0');
  const r=await say('mirrorChoice');
  await say('vision1');
  if(r==='ring'&&G.stats.ring<45){await say('ringOffer');bond('trust',2);bond('heart',1);ringUp(-5,'The Ring weighs a little less.');flag('offeredRing')}
  else if(r==='ring'){await say('ringHold');ringUp(4)}
  else{await say('mirrorKeep');}
  flag('mirrorDone');await lorFarewell();return null}
chain('mirror0',[
 N('A basin of cool, silver water in a dark grove. Galadriel pours water from a ewer; the surface stills. "Will you look?" she asks softly. "I do not counsel you. The Mirror is dangerous. It shows many things — not all of them true."',{scene:'mirror'})]);
D.mirror0.next=null;
D.mirrorChoice={who:'narrator',scene:'mirror',text:"You lean over the water. The surface clears. First the Shire: the old Party Tree on fire, hobbits chained and led away, Bag End a smoking ruin. Then — an Eye, wreathed in flame, searching, searching... and it finds *you*.",ch:[
 {t:'Offer the Ring to Galadriel.',go:'mirOffer',tag:'ring'},
 {t:'Pull away. Keep the Ring, whatever it costs.',go:'mirKeep',tag:'keep'}]};
D.mirOffer={who:'frodo',m:'stern',scene:'mirror',text:"I would give you the Ring, if you would take it. You are wise; wiser than I. It is too much for me to bear.",next:null};
D.mirKeep={who:'frodo',m:'worried',scene:'mirror',text:"I... I will not give it up. I cannot. It is mine. It is... *my burden.*",fx:()=>{ringUp(3)},next:null};
chain('vision1',[N('Galadriel rises, tall and terrible and beautiful. A white light leaps from her. Her voice deepens; the whole grove darkens.',{scene:'eye'})]);
D.ringOffer={who:'galadriel',m:'stern',scene:'eye',text:"*In place of a dark lord you would have a queen!* Not dark, but beautiful and terrible as the dawn! All shall love me and despair! — I pass the test. I will diminish, and go into the West, and remain Galadriel. Thank you, Frodo. Few could have offered it.",fx:()=>{bond('trust',0)},next:null};
D.ringHold={who:'galadriel',m:'worried',scene:'mirror',text:"You cannot even offer it. That is the Ring's hold on you, little one. Be careful. It is stronger than you think.",next:null};
D.mirrorKeep={who:'galadriel',m:'smile',scene:'mirror',text:"You choose to bear it alone. That is brave — and perhaps unwise. But I will not be the one to change your mind.",next:null};
async function lorLightPuzzle(){
  await say('light0');const ok=await puzzle('mirrors');
  if(ok){flag('lightDone');bond('legolas',1);await say('lightOk')}else await say('lightBad');return null}
D.light0={who:'narrator',scene:'mirror',text:"Silver mirror-stones on slender pillars, set in a ring beneath the trees. A thin beam of starlight enters from the east, but the stones are out of true. If you could turn them, the light might reach the crystal on the far side."};
D.lightOk={who:'narrator',scene:'lorien',text:"A shaft of white fire kindles the crystal. A hidden panel opens: within lies a small phial of clear glass, shining with the light of Eärendil's star. *The Phial of Galadriel.*",fx:()=>{flag('hasPhial');toast('You found the Phial of Galadriel.')}};
D.lightBad={who:'narrator',scene:'lorien',text:"The beam wanders and fails. The stones are very patient: they will wait for another day."};
chain('lorNight',[
 N('In the quiet of the Elven night, the Fellowship rests under pale lanterns. Boromir sits apart, looking at his hands. Frodo sits beside him.',{scene:'lorien'}),
 ['boromir','sad',"She spoke to me, Frodo. In my mind. She said that my courage would be tested. And I think... I think she is right. My father's city is dying, and it is all I can think about. If only... if only that thing were not so *beautiful*.",{scene:'lorien'}]]);
D.lorNight_1.ch=[{t:'It is a burden for all of us, Boromir. You are not alone.',go:'ln_a',fx:()=>{bond('boromir',3);bond('heart',1)}},{t:'You must not speak that way. It is the Ring talking.',go:'ln_b',fx:()=>{bond('boromir',-1);bond('trust',1)}},{t:'(Say nothing.)',go:'ln_c'}];
D.ln_a={who:'boromir',m:'smile',scene:'lorien',text:"...You are a good friend, Frodo. Better than I deserve. I shall keep my promise to you. I shall *try*.",next:'ln_end'};
D.ln_b={who:'boromir',m:'angry',scene:'lorien',text:"You are right... of course. Forgive me. A man can only be so strong. I will not speak of it again.",next:'ln_end'};
D.ln_c={who:'boromir',m:'sad',scene:'lorien',text:"I see. ...Perhaps it is wiser to keep my own counsel.",next:'ln_end'};
D.ln_end={who:'galadriel',m:'smile',scene:'lorien',text:"In the morning I will give you gifts. A cloak for each, and bread that will keep a man on his feet for a day. And one gift more, for the Ring-bearer.",fx:()=>{flag('lorGifts')}};
chain('gifts',[
 ['galadriel','smile',"For you, Frodo Baggins, the Phial of Galadriel: in it is caught the light of Eärendil's star. May it be a light to you in dark places, when all other lights go out.",{scene:'lorien'}],
 ['frodo','smile',"Thank you, Lady. I shall carry it with me, always."],
 ['gimli','happy',"...And I, Lady, would ask nothing of gold or jewels. But one hair of your head, to set among my people's crystal, would be my greatest treasure.",{scene:'lorien'}],
 ['galadriel','smile',"I will give you three. And I will say this, Gimli son of Glóin: your hands shall flow with gold, and yet gold shall have no dominion over you."]]);
async function lorFarewell(){
  await transition(async()=>{});
  await say('lorNight');await say('gifts');
  flag('lorDone');flag('hasPhial');chapter(7);
  objective("Leave Lothlórien by boat down the Anduin. Follow the river east.");
  await go('amonHen',3,18,'right');return null}

/* ================= VII · AMON HEN ================= */
chain('amArrive',[
 N('Days on the great river, rowing down through pale marshes and tall reeds. At last the Fellowship comes ashore beneath a green hill: Amon Hen, the Hill of Sight. Beyond the water, two mighty stone figures rise out of the mist.',{scene:'amonhen'}),
 ['aragorn','stern',"We must make a choice, here. East to Mordor or south to Minas Tirith. Frodo — the decision is yours to make. Take some time. We shall make camp. But do not go far.",{scene:'amonhen',name:'Aragorn'}]]);
D.amArrive_1.ch=[{t:'I need to be alone for a little while.',go:'am_a'},{t:'Boromir, will you walk with me?',go:'am_b'}];
D.am_a={who:'aragorn',m:'smile',scene:'amonhen',text:"Go. Be back before dusk.",next:'am_end',fx:()=>bond('aragorn',1)};
D.am_b={who:'boromir',m:'smile',scene:'amonhen',text:"Not now. Go ahead; I will be along shortly.",next:'am_end'};
D.am_end={who:'narrator',scene:'amonhen',text:"Frodo climbs alone toward the ruins at the top of the hill.",fx:()=>objective('Climb Amon Hen to the Seat of Seeing and think.',{x:24,y:6,up:30})};
async function storyAmon(){
  flag('amArrived');chapter(7);
  const pk=[...G.party];G.party=[];
  G.stats._parting={...G.stats};
  [['aragornA'],['legolasA'],['gimliA']].forEach(()=>{});
  ['sam','merry','pippin'].forEach((k,i)=>addNpc({id:'f_'+k,spr:k,por:k,name:k[0].toUpperCase()+k.slice(1),x:[11,9.6,8.6][i],y:[24.6,22.4,26][i],dir:'right',solid:true,talk:()=>'am_'+k}));
  await say('amArrive');return null}
D.am_sam={who:'sam',m:'worried',scene:'amonhen',text:"Mr. Frodo, you're awful quiet. Whatever you decide, I'll stand by it. Just... you'll not do anything daft without me, will you?"};
D.am_merry={who:'merry',m:'smile',scene:'amonhen',text:"Nice view. Shame about the doom and all."};
D.am_pippin={who:'pippin',m:'smile',scene:'amonhen',text:"There's a bit of cheese left. Do you want it? No? Good."};
D.amonAra={who:'aragorn',m:'smile',scene:'amonhen',name:'Aragorn',text:"The road forks here. Gondor, or Mordor. I will not tell you which. Only that it must be *your* choice."};
D.amonLeg={who:'legolas',m:'smile',scene:'amonhen',text:"This hill gives a man leave to see much, if he can bear it. Do not stay long; I do not like the wind."};
D.amonGim={who:'gimli',m:'stern',scene:'amonhen',text:"Elves, men, dwarves... all of us bleeding for the sake of a hobbit's trinket. Well. At least it is *a very good trinket* to bleed for."};
async function amonSeat(){
  if(F().seatDone)return null;
  await say('seat1');flag('seatDone');flag('amonBoromirHere');place('boromirA',22,12,'up');
  const boro=M.npcs&&M.npcs.find(n=>n.id==='boromirA');if(boro){boro.x=20*T;boro.y=11*T}
  await walkTo('boromirA',23,8.4,35);
  await boromirTalk();return null}
chain('seat1',[
 N('The Seat of Seeing: a stone throne on the summit, from which one may see for a hundred leagues. Frodo sits. The Ring hangs warm on his chest. He closes his eyes.',{scene:'amonhen'}),
 ['frodo','worried',"Mordor is out there. And I am so very small. But I think... I think I already know what I must do. Alone, I could keep the others safe from the Ring. Alone, no one else can be hurt on my account.",{scene:'amonhen'}]]);
async function boromirTalk(){
  await say('bor_a1');
  const soft=G.stats.boromir>=5&&G.stats.ring<45;
  if(soft){await say('bor_soft')}else{await say('bor_hard');await boromirLunge()}
  return null}
chain('bor_a1',[
 ['boromir','sad',"None of us should have followed you. We are no help — Gimli swinging an axe, a few elves with bows... You carry the fate of us all, and you will not say where it leads.",{scene:'amonhen'}],
 ['boromir','neutral',"I saw the sorrow in your face, when I spoke at the Council. You think me weak. But the Ring is a gift to Gondor, a weapon. Why not use it against our enemies? Why do you refuse to see its worth?"]]);
D.bor_a1_1.ch=[
 {t:'I do not think you weak. But it is not ours to use.',go:'ba_a',fx:()=>{bond('boromir',2)}},
 {t:'The Ring would destroy you, Boromir. Just as it destroyed Isildur.',go:'ba_b',fx:()=>{bond('boromir',-1);bond('trust',1)}},
 {t:'Stay away from me, Boromir.',go:'ba_c',fx:()=>{bond('boromir',-2);flag('shunnedBoromir')}}];
D.ba_a={who:'boromir',m:'sad',scene:'amonhen',text:"...No. Not ours to use. And yet I think of my people, Frodo. My brother. My father. How many more must die while this thing sits in your pocket?"};
D.ba_b={who:'boromir',m:'angry',scene:'amonhen',text:"Isildur was a *man* of Gondor, as I am. His weakness was not in the Ring, but in himself. I would not be as weak. *Give it to me!*"};
D.ba_c={who:'boromir',m:'angry',scene:'amonhen',text:"Why? Because you think I am too weak to bear it? You are the weak one, little halfling! You will not make it to Mordor. *You will die!*"};
D.bor_choice={who:'narrator',scene:'amonhen',text:"Boromir's face twists, half sorrow, half something else. The Ring thrums against your chest. What do you do?",ch:[
 {t:'Hand him the Ring... just to look.',go:'bc_hand',tag:'hand'},
 {t:'Back away and refuse.',go:'bc_back',tag:'back'}]};
D.bc_hand={who:'boromir',m:'angry',scene:'amonhen',fx:()=>{ringUp(10);bond('trust',-2);flag('handedBoromir')},text:"It is... so beautiful... *Mine!* — Ah! No! It cannot...!",next:'bc_back'};
D.bc_back={who:'narrator',scene:'amonhen',text:"Boromir lunges. You stumble. The Ring, trembling in your fist, slips onto your finger.",next:null};
D.bor_soft={who:'boromir',m:'sad',scene:'amonhen',fx:()=>{bond('boromir',3);flag('boromirRedeemed')},text:"...I shall not take it. I cannot. Forgive me, Frodo. I felt it call, and for a moment — for one terrible moment — I listened. Go. Go on, with my blessing. I shall keep the others safe, whatever may come. I shall *not* follow.",ch:[{t:'Thank you, Boromir. I will remember your honour.',go:'bs_end',fx:()=>{bond('heart',2)}},{t:'Come with us. Help me carry the burden.',go:'bs_end2',fx:()=>{bond('boromir',2)}}]};
D.bs_end={who:'boromir',m:'smile',scene:'amonhen',text:"Be safe, Ring-bearer.",fx:()=>{flag('frodoAlone');objective('Run to the river and take a boat to the eastern shore.',{x:38,y:31.4})}};
D.bs_end2={who:'boromir',m:'sad',scene:'amonhen',text:"No. If I come with you, I shall not be able to hold back. The Ring must be taken *away from men*. Go, small one. Quickly.",fx:()=>{flag('frodoAlone');objective('Run to the river and take a boat to the eastern shore.',{x:38,y:31.4})}};
D.bor_hard={who:'boromir',m:'stern',scene:'amonhen',text:"If you would only *think*! The Ring has a will of its own. It will betray you, as it betrayed Isildur. Give it to Gondor. *Give it to me.*",next:'bc_lunge_q'};
D.bc_lunge_q={who:'narrator',scene:'amonhen',text:"He reaches for the chain around your neck.",next:null};
async function boromirLunge(){
  await say('bor_choice');
  await flash(200);ringUp(8,'The Ring slides onto your finger.');G.ringOn=true;flag('usedRing');
  await say('seatVision');
  G.ringOn=false;flag('frodoAlone');
  await say('seatAfter');objective('Run to the river and take a boat to the eastern shore.',{x:38,y:31.4});return null}
chain('seatVision',[
 N('The world falls away. Frodo\'s mind is flung to the top of the world: a vast dark land, a tower of black stone, and above it a single Eye, wreathed in flame. It turns. It finds him. A voice, enormous, not unlike thunder, speaks his name.',{scene:'eye'}),
 ['gandalf','stern',"*Take it off, Frodo!* TAKE IT OFF!",{scene:'eye',name:'Gandalf (voice)'}],
 ['frodo','worried',"Gandalf?! ...I took it off. I took it off. *I must go. I must go now.*",{scene:'amonhen'}]]);
D.seatAfter={who:'narrator',scene:'amonhen',text:"Frodo tears the Ring from his finger. Boromir lies on the ground, weeping, whispering that he is sorry. Frodo does not stay to listen. He runs."};
async function amonBoats(){
  if(!F().frodoAlone)return null;
  await say('shore1');
  const samBond=G.stats.sam;const ring=G.stats.ring;
  if(samBond<0){await say('shoreLone');flag('samLeft')}else{await say('shoreSam');flag('samWith');joinParty('sam')}
  await endingFlow();return null}
chain('shore1',[N('Frodo reaches the shore, half-falling down the slope. The boats lie in a row. Behind him, a horn sounds from the hill: *Boromir\'s horn*, then the clatter of steel. Orcs, a great many, coming through the woods.',{scene:'amonhen'}),
 ['frodo','sad',"I cannot let them follow me. They would all die for this. I have to go alone.",{scene:'amonhen'}]]);
chain('shoreSam',[
 N('Frodo pushes a boat from the shore and paddles out. Behind him there is a splash. A frightened hobbit wades into the river, up to his chin, calling after him.',{scene:'amonhen'}),
 ['sam','sad',"Mr. Frodo! Mr. Frodo, wait! I'm coming! I can't swim! *Mr. Frodo!*",{scene:'amonhen'}],
 ['frodo','surprised',"Sam! Sam, go back! Sam —!",{scene:'amonhen'}],
 ['sam','worried',"Don't you leave me behind, Mr. Frodo! I made a promise: not to leave you. *Don't you leave him, Samwise Gamgee,* — and I don't mean to.",{scene:'amonhen'}],
 N('Frodo drops the paddle, leans out and seizes his hand. He hauls Sam aboard, both of them soaked and gasping.',{scene:'amonhen'}),
 ['frodo','smile',"Oh, Sam. I would not have gone without you. I only did not know how to ask.",{scene:'amonhen'}],
 ['sam','happy',"Then let's go, Mr. Frodo. Let's go to Mordor, you and me. Together.",{scene:'amonhen'}]]);
chain('shoreLone',[
 N('Frodo pushes a boat from the shore and paddles out, alone. He does not look back at the hill, or the voices calling from it. A small figure runs along the bank — Sam, shouting something. The current carries Frodo away.',{scene:'amonhen'}),
 ['frodo','sad',"Forgive me, Sam. I could not bring you. It is a road I must walk by myself.",{scene:'amonhen'}]]);
async function endingFlow(){
  await transition(async()=>{});
  endBook(F().samLeft?'alone':'final')}
D.ringLostEnd={who:'narrator',scene:'eye',text:"The Ring is *so* beautiful. Frodo slips it on, and the world falls away. The Eye turns, and sees him, and the Dark Lord knows his servant at last. There is no one left in all the world who can say no."};

/* ================= PARTY BANTER ================= */
const BANTER={
 sam:{default:["I never thought the world was so big, Mr. Frodo. Nor so hard on the feet.","I still miss the Gaffer's garden. And the taters. Don't tell the others."],
  2:["Don't worry, Mr. Frodo. I've got the cooking gear and plenty o' salt. We'll manage.","I keep thinking about Rosie, back home. I mean — er — about the Shire."],
  3:["I don't like them rock walls, Mr. Frodo. The wind's wrong.","Bacon's the thing. Any trouble, bacon."],
  4:["This place is lovely. Shame we've got to leave it, innit?","Do you think there's any chance of a second breakfast?"],
  5:["It's very dark down here, Mr. Frodo. I'm sticking to you like a tick.","Don't you worry. I'll carry you if I have to."],
  6:["I saw an elf! And a beautiful one at that. Don't tell my Gaffer.","This is what elves are like, then. All light and no mud."],
  7:["Whatever you decide, I'll be with you."]},
 merry:{default:["I would die for a pint of ale and a dry pair of socks, Frodo.","We shall find a way, cousin. We always do."],4:["Elvish bread! I never thought I'd say this, but... I'm too full to move."],5:["The walls... they're *breathing*. Don't they look like they're breathing?"],6:["Doesn't this wood smell wonderful?"],7:["I don't think any of us expected to get this far."]},
 pippin:{default:["Is it lunchtime yet? Do you know what the elves would say if I asked for second breakfast?","We should have brought more cheese."],4:["Elves keep singing about stars. Do you know any songs about *sausages*?"],5:["I do not like this place. Not one little bit."],6:["Even the grass here is expensive."],7:["I'll tell you what, Frodo: I'm *not* leaving you behind."]},
 gandalf:{default:["Keep to the path, Frodo. Wizards are rarely wrong about paths, but they do get lost in the dark at times.","A wizard is never late. Nor early. He arrives precisely when he means to."],5:["Hold fast; I need to think. The Dwarf-road is somewhere beneath us."]},
 aragorn:{default:["Stay close. The shadows have eyes.","We shall make Mordor, if we survive the road to it."],4:["I have not been in these halls in many years. They hold memories."],5:["Keep quiet. Even the stones here listen."],6:["It has been a long time since I looked on the Golden Wood."],7:["Whatever you decide, I shall abide by it."]},
 legolas:{default:["The wind has changed. Something comes.","Do you hear that? The stars are singing."],5:["Stone has no song. It has only silence. I do not like it."],6:["This... this is a place of my kin. I feel the whole forest thrumming with their songs."],7:["The river calls my name; I shall be glad to see the sea one day."]},
 gimli:{default:["Never trust an elf's cooking. It's nothing but leaves.","These feet are made for hills, not cobblestones."],5:["Stone! Do you hear it? Echoes! I should spend a week listening."],6:["Her hair... a gift beyond measure."],7:["Hmph. Let them come. My axe is thirsty."]},
 boromir:{default:["The Ring weighs heavy, little one. Heavier than you know.","If Gondor falls, the whole West falls with it. Never forget that."],5:["I would not have chosen this road. Yet here we are."],6:["The Lady's eyes... I could not bear them."],7:["I have not slept well, Frodo."]}};
window.partyTalk=async function(key){const b=BANTER[key]||{};const pool=b[G.chapter]||b.default||["..."];const text=pool[Math.floor(Math.random()*pool.length)];
  D._pt={who:key,m:'smile',scene:M.def.scene,text};return'_pt'};

/* ================= JOURNAL & ENDINGS ================= */
const HEARTS=n=>{n=Math.max(0,Math.min(5,Math.round(n)));return '♥'.repeat(n)+'♡'.repeat(5-n)};
window.journalHTML=function(){const f=G.flags,st=G.stats;const li=(d,t)=>`<li class="${d?'done':''}">${d?'☑':'☐'} ${t}</li>`;
  const chapters=['','The Shire','Bree','Weathertop','Rivendell','Moria','Lothlórien','Amon Hen'];
  return `<h2>📖 FRODO'S JOURNAL — Book I, Chapter ${G.chapter}: ${chapters[G.chapter]||''}</h2>
  <div class="note"><b>Current aim:</b> ${G.objective||'—'}</div>
  <h2 style="font-size:1.15em">THE ROAD</h2><ul>${li(f.partyDone,"Leave Bag End with the Ring")}${li(f.runesDone,"Learn the Ring's secret from Gandalf")}${li(f.breeInnDone,'Meet Strider in Bree')}${li(f.wtDone,'Survive Weathertop')}${li(f.councilDone,'Attend the Council of Elrond')}${li(f.doorOpen,'Open the Doors of Durin')}${li(f.bridgeDone,'Cross the Bridge of Khazad-dûm')}${li(f.mirrorDone,"Look into Galadriel's Mirror")}${li(f.seatDone,'Climb Amon Hen')}</ul>
  <h2 style="font-size:1.15em">PUZZLES</h2><ul>${['runes:The Ring\'s inscription','hide:Hiding from the Rider','letter:Gandalf\'s letter','fire:Defending the fire','athelas:The healing brew','door:The Doors of Durin','stairs:The broken stair','mirrors:Mirror-stones of Lórien'].map(s=>{const[k,t]=s.split(':');return li(G.solved[k],t)}).join('')}</ul>
  <h2 style="font-size:1.15em">BONDS</h2><div class="note">Sam ${HEARTS(st.sam)} · Merry ${HEARTS(st.merry)} · Pippin ${HEARTS(st.pippin)}<br>Gandalf ${HEARTS(st.gandalf)} · Aragorn ${HEARTS(st.aragorn)} · Boromir ${HEARTS(st.boromir)}<br>Legolas ${HEARTS(st.legolas)} · Gimli ${HEARTS(st.gimli)}</div>
  <div class="note"><b>The Ring's hold on you:</b> ${st.ring}/100 · <b>Kindness:</b> ${st.heart} · <b>Trust earned:</b> ${st.trust}</div>
  <div class="note">Items: ${[f.hasRing&&'The One Ring',f.hasSting&&'Sting',f.hasMithril&&'Mithril-shirt',f.hasCloak&&'Elven cloak',f.hasPhial&&'Phial of Galadriel'].filter(Boolean).join(' · ')||'—'}</div>
  <button class="btn" onclick="closeJournal()">Close (J)</button>`};
window.endingHTML=function(kind){const st=G.stats,f=G.flags;const solved=Object.values(G.solved).filter(Boolean).length;
  let title,body;
  if(kind==='ringlost'){title='THE RING PREVAILS';body="The Ring has claimed its bearer. In a flash of light and shadow the Eye of Sauron falls on the hobbit who thought he was strong enough. All the free peoples of Middle-earth will pay for it. This is not how the story was meant to end."}
  else if(kind==='alone'){title='A LONE WANDERER';body="Frodo crosses the Anduin alone, with the Ring warm on his chest and the roar of the orcs growing behind him. Whatever lies in the Emyn Muil and beyond, he must face it by himself. On the far hill, a dwarf's axe flashes; a horn sounds once more; and the Fellowship is broken. Whether Sam can follow remains to be seen..."}
  else{title='THE BREAKING OF THE FELLOWSHIP';body=(f.boromirRedeemed?"Boromir's horn rings out from the hill as the orcs break from the trees. He stands alone to guard the hobbits, a man redeemed by his own honour. Whatever happens next, he will not be remembered as a thief.":"Boromir's horn sounds from the hill, ragged and desperate. The man who once wept in the Mirror-grove has come to a terrible bargain with his own pride, and the day will end in a great cost.")+" Frodo and Sam push out into the swift current of the Anduin, bound for the eastern shore and the long road to Mordor. Behind them the hill falls away into smoke and horn-calls. Before them, the black mountains rise."}
  const ringRank=st.ring<25?'Steadfast':st.ring<55?'Burdened':'Wearing Thin';
  return `<h2>${title}</h2><p style="line-height:1.55;font-size:1.15em">${body}</p>
  <p class="note"><b>Ring-bearer:</b> ${ringRank} (${st.ring}/100) · <b>Puzzles solved:</b> ${solved}/8 · <b>Kindness:</b> ${st.heart} · <b>Trust:</b> ${st.trust}<br>Sam ${HEARTS(st.sam)} · Aragorn ${HEARTS(st.aragorn)} · Boromir ${HEARTS(st.boromir)} · Gandalf ${HEARTS(st.gandalf)}</p>
  <p class="note"><i>End of Book One. The road goes ever on...</i></p><button class="btn" id="again">Walk the road again</button>`};
