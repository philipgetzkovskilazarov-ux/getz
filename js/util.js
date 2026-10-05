'use strict';
/* =========================================================
   util.js — colour ramps, noise, and the pixel canvas (Cv)
   used by every procedural pixel-art painter in the game.
   ========================================================= */
window.U=(()=>{
const U={};
const hexc={};
U.rgb=c=>{if(Array.isArray(c))return c;let r=hexc[c];if(!r){let h=c.slice(1);if(h.length===3)h=h.split('').map(x=>x+x).join('');r=hexc[c]=[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}return r};
U.hex=([r,g,b])=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const rgb2hsl=(r,g,b)=>{r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s,l]};
const hsl2rgb=(h,s,l)=>{h=(((h%360)+360)%360)/360;if(s===0)return[l*255,l*255,l*255];const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p};const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;return[f(p,q,h+1/3)*255,f(p,q,h)*255,f(p,q,h-1/3)*255]};
const adiff=(a,b)=>{let d=((b-a)%360+540)%360-180;return d};
/* hue-shifted ramp: shadows drift to blue-violet, lights to warm yellow (painterly pixel-art look) */
const rampCache={};
U.ramp=(base,n=5,spread=.27)=>{const key=(Array.isArray(base)?base.join():base)+n+spread;if(rampCache[key])return rampCache[key];
  const[r,g,b]=U.rgb(base),[h,s,l]=rgb2hsl(r,g,b),out=[];
  for(let i=0;i<n;i++){const f=n===1?0:i/(n-1)*2-1;let L=l+f*spread*(f<0?1.05:.8),H=h,S=s;
    if(f<0){H=h+adiff(h,262)*(-f)*.2;S=Math.min(1,s*(1+(-f)*.12))}else{H=h+adiff(h,52)*f*.16;S=s*(1-f*.12)}
    out.push(hsl2rgb(H,Math.max(0,Math.min(1,S)),Math.max(.03,Math.min(.97,L))))}
  return rampCache[key]=out};
U.mix=(a,b,t)=>{a=U.rgb(a);b=U.rgb(b);return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]};
U.clamp=(v,a,b)=>v<a?a:v>b?b:v;
U.lerp=(a,b,t)=>a+(b-a)*t;
U.rng=seed=>{let a=seed|0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
U.hash=(x,y,s=0)=>{let h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,1442695041);h=Math.imul(h^h>>>13,1274126177);h^=h>>>16;return(h>>>0)/4294967296};
const sm=t=>t*t*(3-2*t);
U.noise=(x,y,s=0)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=sm(x-xi),yf=sm(y-yi);const a=U.hash(xi,yi,s),b=U.hash(xi+1,yi,s),c=U.hash(xi,yi+1,s),d=U.hash(xi+1,yi+1,s);return a+(b-a)*xf+(c-a)*yf+(a-b-c+d)*xf*yf};
U.fbm=(x,y,s=0,o=3)=>{let v=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){v+=U.noise(x*f,y*f,s+i*17)*a;n+=a;a*=.5;f*=2}return v/n};
U.shuffle=(a,r=Math.random)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
U.pick=(a,r=Math.random)=>a[Math.floor(r()*a.length)];
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>v/16);
U.bayer=(x,y)=>BAY[((y|0)&3)*4+((x|0)&3)];
const inPoly=(pts,x,y)=>{let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c}return c};
U.inPoly=inPoly;

/* ---------- Cv: a typed-array pixel canvas ---------- */
class Cv{
  constructor(w,h){this.w=w;this.h=h;this.d=new Uint8ClampedArray(w*h*4)}
  px(x,y,c,a=1){x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=this.w||y>=this.h||a<=0||c===undefined||c===null)return;c=U.rgb(c);const i=(y*this.w+x)*4,d=this.d;
    if(a>=1){d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;return}
    const da=d[i+3]/255,oa=a+da*(1-a);d[i]=(c[0]*a+d[i]*da*(1-a))/oa;d[i+1]=(c[1]*a+d[i+1]*da*(1-a))/oa;d[i+2]=(c[2]*a+d[i+2]*da*(1-a))/oa;d[i+3]=oa*255}
  at(x,y){x|=0;y|=0;if(x<0||y<0||x>=this.w||y>=this.h)return null;const i=(y*this.w+x)*4;return[this.d[i],this.d[i+1],this.d[i+2],this.d[i+3]]}
  solid(x,y){x|=0;y|=0;return x>=0&&y>=0&&x<this.w&&y<this.h&&this.d[(y*this.w+x)*4+3]>8}
  rect(x,y,w,h,c,a=1){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.px(x+i,y+j,typeof c==='function'?c(x+i,y+j):c,a)}
  hline(x,y,w,c,a=1){for(let i=0;i<w;i++)this.px(x+i,y,c,a)}
  vline(x,y,h,c,a=1){for(let j=0;j<h;j++)this.px(x,y+j,c,a)}
  line(x0,y0,x1,y1,c,a=1){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(;;){this.px(x0,y0,c,a);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
  ell(cx,cy,rx,ry,c,a=1){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1)this.px(x,y,typeof c==='function'?c(x,y,dx,dy):c,a)}}
  /* shaded ellipsoid with ordered dithering — the workhorse for heads, canopies, hills, rocks */
  shade(cx,cy,rx,ry,ramp,o={}){const L=o.light||[-.5,-.65,.57],n=ramp.length,bias=o.bias||0,nz=o.noise||0,seed=o.seed||1,dith=o.dither===undefined?.8:o.dither,mask=o.mask,a=o.alpha||1;
    for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){
      const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry,d2=dx*dx+dy*dy;if(d2>1)continue;if(mask&&!mask(x,y,dx,dy))continue;
      const z=Math.sqrt(1-d2);let l=(dx*L[0]+dy*L[1]+z*L[2])*.5+.5+bias;if(nz)l+=(U.hash(x,y,seed)-.5)*nz;
      const v=l*(n-1)+(BAY[(y&3)*4+(x&3)]-.5)*dith;this.px(x,y,ramp[U.clamp(Math.round(v),0,n-1)],a)}}
  region(x0,y0,x1,y1,test,col){for(let y=Math.floor(y0);y<=Math.ceil(y1);y++)for(let x=Math.floor(x0);x<=Math.ceil(x1);x++){if(test(x,y)){const c=typeof col==='function'?col(x,y):col;if(c)this.px(x,y,c)}}}
  poly(pts,col){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;pts.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++)for(let x=Math.floor(x0);x<=Math.ceil(x1);x++)if(inPoly(pts,x+.5,y+.5)){const c=typeof col==='function'?col(x,y):col;if(c)this.px(x,y,c)}}
  stamp(s,x,y,a=1){for(let j=0;j<s.h;j++)for(let i=0;i<s.w;i++){const k=(j*s.w+i)*4,al=s.d[k+3];if(al>0)this.px(x+i,y+j,[s.d[k],s.d[k+1],s.d[k+2]],a*al/255)}}
  /* selective outline: darkened version of the neighbouring colour ("selout") */
  outline(k=.28,col){const w=this.w,h=this.h,d=this.d,add=[];
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]>8)continue;let best=null;
      for(const[ox,oy]of[[0,1],[1,0],[-1,0],[0,-1]]){const u=x+ox,v=y+oy;if(u<0||v<0||u>=w||v>=h)continue;const j=(v*w+u)*4;if(d[j+3]>200){best=[d[j],d[j+1],d[j+2]];if(oy===-1)break}}
      if(best)add.push(x,y,col?U.rgb(col):[best[0]*k,best[1]*k*1.0,best[2]*Math.min(1,k*1.5)])}
    for(let i=0;i<add.length;i+=3)this.px(add[i],add[i+1],add[i+2])}
  flip(){const o=new Cv(this.w,this.h);for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){const a=(y*this.w+x)*4,b=(y*this.w+(this.w-1-x))*4;o.d[b]=this.d[a];o.d[b+1]=this.d[a+1];o.d[b+2]=this.d[a+2];o.d[b+3]=this.d[a+3]}return o}
  copy(){const o=new Cv(this.w,this.h);o.d.set(this.d);return o}
  canvas(){const c=document.createElement('canvas');c.width=this.w;c.height=this.h;c.getContext('2d').putImageData(new ImageData(this.d,this.w,this.h),0,0);return c}
}
U.Cv=Cv;
U.canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
/* radial light sprite for the lighting pass */
U.lightSprite=(r,col)=>{const c=U.canvas(r*2,r*2),x=c.getContext('2d'),[R,G,B]=U.rgb(col),g=x.createRadialGradient(r,r,0,r,r,r);g.addColorStop(0,`rgba(${R},${G},${B},1)`);g.addColorStop(.35,`rgba(${R},${G},${B},.55)`);g.addColorStop(1,`rgba(${R},${G},${B},0)`);x.fillStyle=g;x.fillRect(0,0,r*2,r*2);return c};
return U})();
