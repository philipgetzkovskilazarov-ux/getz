'use strict';
/* boot.js — title screen wiring + debug hooks */
(()=>{
const saved=loadSave();
if(saved)$('bcont').classList.remove('hide');
const begin=(st)=>{try{ac()}catch(e){}try{Music.set('shire')}catch(e){}Promise.resolve().then(()=>startGame(st)).catch(e=>{const d=document.createElement('div');d.style.cssText='position:fixed;left:8px;top:8px;right:8px;z-index:99;background:#400;color:#fff;font:13px monospace;padding:8px;white-space:pre-wrap';d.textContent='Could not start: '+e.message+'\n'+(e.stack||'');document.body.appendChild(d)})};
$('bnew').addEventListener('click',()=>{try{localStorage.removeItem('fotr1')}catch(e){}begin(newGame())});
$('bcont').addEventListener('click',()=>begin(saved));
window.__dbg={get G(){return G},get M(){return M},get mode(){return mode},say,go,puzzle,flag,bond,ringUp,place,endBook,D,MAPS,loadMap,walkTo,storyStart,runScript};
requestAnimationFrame(frame);
})();
