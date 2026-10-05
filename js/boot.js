'use strict';
/* boot.js — title screen wiring + debug hooks */
(()=>{
const saved=loadSave();
if(saved)$('bcont').classList.remove('hide');
$('bnew').onclick=()=>{ac();try{localStorage.removeItem('fotr1')}catch(e){}Music.set('shire');startGame(newGame())};
$('bcont').onclick=()=>{ac();startGame(saved)};
window.__dbg={get G(){return G},get M(){return M},get mode(){return mode},say,go,puzzle,flag,bond,ringUp,place,endBook,D,MAPS,loadMap,walkTo,storyStart,runScript};
requestAnimationFrame(frame);
})();
