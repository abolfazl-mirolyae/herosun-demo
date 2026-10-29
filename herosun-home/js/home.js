/* Homepage-only initialization; shared navigation and destinations are unchanged. */
(function(){'use strict';
function start(){
if(window.__herosunHomeReady)return;window.__herosunHomeReady=true;
const HomeObserver=window.IntersectionObserver||class{constructor(callback){this.callback=callback}observe(target){setTimeout(()=>this.callback([{target,isIntersecting:true}]),0)}unobserve(){}disconnect(){}};
const io=new HomeObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.querySelectorAll('.glow').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px');});});

const statsSection=document.getElementById('stats');
if(statsSection){let counted=false;const fa=n=>new Intl.NumberFormat('fa-IR',{useGrouping:false}).format(n);const runCounters=()=>{if(counted)return;counted=true;statsSection.querySelectorAll('.counter').forEach(el=>{const target=Number(el.dataset.target)||0,start=performance.now(),duration=1350;const tick=now=>{const t=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-t,3);el.textContent=fa(Math.round(target*ease));if(t<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)});};
const statIO=new HomeObserver(es=>es.forEach(e=>{if(e.isIntersecting){statsSection.classList.add('in');runCounters();statIO.disconnect()}}),{threshold:.24});statIO.observe(statsSection);}

const qualityVisual=document.getElementById('qualityVisual');
if(qualityVisual&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){let qTick=false;const qMove=()=>{qTick=false;const r=qualityVisual.getBoundingClientRect(),vh=window.innerHeight||1;if(r.bottom>0&&r.top<vh){const progress=(vh-r.top)/(vh+r.height),shift=Math.max(-24,Math.min(24,(progress-.5)*46));qualityVisual.style.setProperty('--quality-shift',shift.toFixed(1)+'px')}};window.addEventListener('scroll',()=>{if(!qTick){qTick=true;requestAnimationFrame(qMove)}},{passive:true});window.addEventListener('resize',qMove);qMove();}

document.querySelectorAll('.btn,.icon-btn').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--bx',(e.clientX-r.left)+'px');el.style.setProperty('--by',(e.clientY-r.top)+'px');});});
const sTrack=document.getElementById('stripTrack'),sPrev=document.getElementById('stripPrev'),sNext=document.getElementById('stripNext');
if(sTrack&&sTrack.querySelector('svg')){const sSvg=sTrack.querySelector('svg'),sVp=sTrack.parentElement,sWrap=sVp.parentElement,CARDS=10,AR=1997.04/297.96;let sIdx=0;
try{const gp=sTrack.querySelector('path.ic-3');if(gp){const NS='http://www.w3.org/2000/svg',segs=gp.getAttribute('d').split(/(?=M)/).filter(x=>x.trim());
const boxes=segs.map(sd=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',sd);gp.parentNode.appendChild(p);const b=p.getBBox();p.remove();return b;});
const par=boxes.map((_,i)=>i),find=i=>par[i]===i?i:(par[i]=find(par[i]));
const ov=(a,b)=>{const x=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)),y=Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));const s=Math.min(a.width*a.height,b.width*b.height);return s>0&&(x*y)/s>0.35;};
for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)if(ov(boxes[i],boxes[j])){par[find(i)]=find(j);}
const cl={};segs.forEach((sd,i)=>{const r=find(i);(cl[r]=cl[r]||[]).push(i)});
const grp=document.createElementNS(NS,'g');grp.setAttribute('class','ic-3');
const areaOf=ix=>ix.reduce((s,i)=>s+boxes[i].width*boxes[i].height,0),maxA=Math.max(...Object.values(cl).map(areaOf));
Object.values(cl).forEach(ix=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',ix.map(i=>segs[i]).join(' '));p.setAttribute('fill','#470068');p.setAttribute('fill-rule','evenodd');p.setAttribute('class',areaOf(ix)>maxA*0.08?'gearseg':'sparkseg');grp.appendChild(p);});
gp.replaceWith(grp);}}catch(e){}
sTrack.querySelectorAll('.pchov').forEach(r=>{const k=r.getAttribute('data-c');r.addEventListener('mouseenter',()=>sTrack.querySelectorAll('.ic-'+k).forEach(el=>el.classList.add('play')));r.addEventListener('mouseleave',()=>sTrack.querySelectorAll('.ic-'+k).forEach(el=>el.classList.remove('play')));});
// Measure card positions in SVG units; the drawing includes outer margins.
const hitCards=Array.from(sSvg.querySelectorAll('.pchov')).sort((a,b)=>Number(a.getAttribute('x'))-Number(b.getAttribute('x')));
const view=sSvg.getAttribute('viewBox').trim().split(/[ ,]+/).map(Number);
const firstX=hitCards.length?Number(hitCards[0].getAttribute('x')):62.13;
const cardWidth=hitCards.length?Number(hitCards[0].getAttribute('width')):163.58;
const pitch=hitCards.length>1?Number(hitCards[1].getAttribute('x'))-firstX:190.08;
const count=hitCards.length||CARDS;
const origin=firstX-Math.max(0,(pitch-cardWidth)/2);
let visible=1;
const sUpd=()=>{
 const style=getComputedStyle(sWrap);
 const available=Math.max(1,sWrap.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0));
 if(available<=1)return;
 const preferred=(window.innerWidth<=560?170:200)/view[3];
 const scale=Math.min(preferred,available/pitch);
 const step=pitch*scale;
 visible=Math.max(1,Math.min(5,count,Math.floor((available+.01)/step)));
 sSvg.style.width=(view[2]*scale)+'px';sSvg.style.height=(view[3]*scale)+'px';
 sSvg.setAttribute('width',view[2]*scale);sSvg.setAttribute('height',view[3]*scale);
 sVp.style.width=(visible*step)+'px';
 const max=count-visible;sIdx=Math.min(max,Math.max(0,sIdx));
 sTrack.style.transform='translateX('+(-(origin+sIdx*pitch)*scale)+'px)';
 if(sPrev)sPrev.disabled=sIdx===0;if(sNext)sNext.disabled=sIdx===max;
};
const move=delta=>{sIdx+=delta;sUpd();};
if(sNext){sNext.setAttribute('aria-label','دسته‌های بعدی');sNext.addEventListener('click',()=>move(1));}
if(sPrev){sPrev.setAttribute('aria-label','دسته‌های قبلی');sPrev.addEventListener('click',()=>move(-1));}
sVp.tabIndex=0;sVp.setAttribute('role','region');sVp.setAttribute('aria-label','دسته‌بندی قطعات؛ با فلش چپ و راست یا کشیدن انگشت پیمایش کنید');
sVp.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
let touchStart=null;
sVp.addEventListener('touchstart',e=>{touchStart=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
sVp.addEventListener('touchend',e=>{if(!touchStart||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.4)move(dx<0?1:-1);},{passive:true});
sVp.addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
window.addEventListener('load',sUpd);if(document.fonts)document.fonts.ready.then(sUpd);
window.addEventListener('resize',sUpd);if('ResizeObserver' in window)new ResizeObserver(sUpd).observe(sWrap);sUpd();}

const nTrack=document.getElementById('newsTrack'),nPrev=document.getElementById('newsPrev'),nNext=document.getElementById('newsNext');
if(nTrack){let nIdx=0;const total=nTrack.children.length;
const nUpd=()=>{const r=nTrack.children[0].getBoundingClientRect(),st=r.width+22,vis=window.innerWidth<=560?1:(window.innerWidth<=900?2:3),max=Math.max(0,total-vis);
if(nIdx>max)nIdx=max;if(nIdx<0)nIdx=0;nTrack.style.transform='translateX('+(nIdx*st)+'px)';nPrev.disabled=nIdx===0;nNext.disabled=nIdx===max;};
nNext.addEventListener('click',()=>{nIdx++;nUpd()});nPrev.addEventListener('click',()=>{nIdx--;nUpd()});
window.addEventListener('resize',nUpd);nUpd();}

}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
