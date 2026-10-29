(function(){'use strict';
 const script=document.currentScript;
 if(!script||window.__hsSuppliers)return;window.__hsSuppliers=true;
 const base=new URL('../../herosun-pages/',script.src);
 async function run(){
  const section=document.querySelector('#brands'),track=section&&section.querySelector('.marquee-track');if(!track)return;
  try{
   const response=await fetch(new URL('suppliers-data.json',base),{cache:'no-store',credentials:'same-origin'});
   if(!response.ok)return;const data=await response.json();if(!Array.isArray(data.suppliers))return;
   const rows=data.suppliers.map(r=>{try{const url=new URL(r.logo,base);return ['https:','http:'].includes(url.protocol)?{...r,url:url.href}:null;}catch(e){return null;}}).filter(Boolean);
   if(!rows.length){section.hidden=true;section.style.display='none';return;}
   const set=document.createElement('div');set.className='m-set';
   // Repeat short lists equally in both halves so the existing -50% animation stays seamless.
   const repeat=Math.max(1,Math.ceil(20/rows.length));
   for(let n=0;n<repeat;n++)rows.forEach(r=>{const img=document.createElement('img');img.src=r.url;img.alt=n===0?r.title||'تأمین‌کننده':'';img.decoding='async';if(n>0)img.setAttribute('aria-hidden','true');set.appendChild(img);});
   const twin=set.cloneNode(true);twin.setAttribute('aria-hidden','true');twin.querySelectorAll('img').forEach(i=>i.alt='');
   track.replaceChildren(set,twin);
  }catch(e){/* Keep the existing marquee on transport or JSON failure. */}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
