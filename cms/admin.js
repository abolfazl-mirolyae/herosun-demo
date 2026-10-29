(function(){'use strict';
const boot=window.HS_ADMIN_BOOT,app=document.getElementById('app'),banner=document.getElementById('banner');
const labels={suppliers:'لوگوهای صفحه اول',overview:'نمای کلی',blog:'وبلاگ و مقاله‌ها',events:'رویدادها و همایش‌ها',brands:'برندها و کاتالوگ‌های دو لاین',products:'محصولات ثبت‌شده',settings:'متن بالای صفحات',backup:'پشتیبان‌گیری'};
const lineLabels={spare:'قطعات یدکی',accessories:'اسپرت و تزئینات',both:'هر دو لاین'};
const singular={suppliers:'لوگوی تأمین‌کننده',blog:'مقاله',events:'رویداد',brands:'برند',products:'محصول'};
const fa=n=>new Intl.NumberFormat('fa-IR').format(n),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=null,blog=[],initialized=false,blogError='',blogWritable=true,section='overview',editing=null,dirty=false,busy=false,pendingUploads=0,query='',statusFilter='',lineFilter='',page=1,toastTimer,backupList=null,mediaScan=null;
const clone=v=>JSON.parse(JSON.stringify(v));
function toast(s){const t=document.getElementById('toast');t.textContent=s;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,6000);}
function status(r){return r.archived?'archived':(section==='blog'?Number(r.status)===1:r.published)?'published':'draft';}
function safeURL(s){if(!s)return '';try{const u=new URL(s,boot.frontendUrl+'/herosun-pages/');return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
function errorText(e){return e.message||'عملیات انجام نشد.';}
async function request(p){
 if(boot.demo)return demoRequest(p);
 const form=new FormData();form.append('payload',JSON.stringify(p));form.append(boot.csrfParam,boot.csrfToken);
 const response=await fetch(boot.api,{method:'POST',body:form,credentials:'same-origin',headers:{'Accept':'application/json'}});
 let result;try{result=await response.json();}catch{throw new Error('پاسخ سرور معتبر نیست؛ ورود مدیر و مسیر داشبورد را بررسی کنید.');}
 if(!response.ok||result.success!==true)throw new Error(result.message||'عملیات انجام نشد؛ ممکن است نشست ورود منقضی شده باشد.');return result;
}
function demoRequest(p){
 const key='herosun-admin-preview-v1';let data;
 try{data=JSON.parse(localStorage.getItem(key));}catch{}
 if(!data)data={state:clone(window.HS_ADMIN_SEED),blog:clone(window.HS_ADMIN_BLOG||[]),initialized:true};
 if(p.op==='load')return Promise.resolve({success:true,...data});
 // Server-only tools: show how they look without pretending to change anything.
 if(p.op==='backups')return Promise.resolve({success:true,backups:[]});
 if(['restore-backup','import','media-clean','media-scan'].includes(p.op))return Promise.reject(new Error('این ابزار روی سرور واقعی کار می‌کند و در نسخه نمایشی غیرفعال است.'));
 if(p.op==='settings')data.state.settings=p.settings;
 else if(p.op==='initialize')data.initialized=true;
 else if(p.op==='blog-save'){const r=clone(p.record);if(!r.id)r.id=String(Date.now());r._version=String(Date.now());const i=data.blog.findIndex(a=>a.id===r.id);if(i<0)data.blog.unshift(r);else data.blog[i]=r;try{localStorage.setItem(key,JSON.stringify(data));}catch{}return Promise.resolve({success:true,record:r});}
 else if(p.op==='blog-delete')data.blog=data.blog.filter(r=>r.id!==p.record.id);
 else{const rows=data.state[p.type],i=rows.findIndex(r=>r.id===(p.record?.id||p.id));if(p.op==='save'){if(p.isNew&&i>=0)throw new Error('این شناسه قبلاً ثبت شده است.');if(i<0)rows.push(p.record);else rows[i]=p.record;}else if(i>=0){rows[i].archived=p.op==='archive';rows[i].published=false;}}
 data.state.revision++;data.state.activity.unshift({at:new Date().toISOString(),actor:'پیش‌نمایش',label:p.op});
 try{localStorage.setItem(key,JSON.stringify(data));}catch{}
 return Promise.resolve({success:true,state:data.state,deletedId:p.record?.id});
}
async function load(){
 app.innerHTML='<div class="loading">در حال دریافت اطلاعات…</div>';
 try{const r=await request({op:'load'});state=r.state;state.suppliers=state.suppliers||[];blog=r.blog;initialized=r.initialized;blogError=r.blogError||'';blogWritable=r.blogWritable!==false;renderBanner();render();}
 catch(e){app.innerHTML='<div class="notice error">'+esc(errorText(e))+'<br><button class="button" data-action="reload">تلاش دوباره</button></div>';}
}
function renderBanner(){banner.innerHTML=(boot.demo?'<div class="notice">نسخه نمایشی — تغییرات این صفحه فقط در همین مرورگر ذخیره می‌شوند و روی سایت اثری ندارند.</div>':'')+(!initialized?'<div class="notice"><strong>مدیریت محتوا هنوز فعال نشده است.</strong><br>برندها و محصولات زیر از نسخه ارسالی قبلی هستند. پیش از فعال‌سازی، آن‌ها را با اطلاعات فعلی سایت مقایسه کنید؛ رویدادهای فعلی به‌صورت خودکار وارد نمی‌شوند.<br><button class="button gold" data-action="initialize">فعال‌سازی با همین اطلاعات</button></div>':'')+(!blogWritable?'<div class="notice">وبلاگ در حالت مشاهده است. فعال‌سازی ذخیره و حذف مقاله‌ها به بررسی مدل فعلی Article و تنظیم دسترسی نوشتن نیاز دارد.</div>':'')+(blogError?'<div class="notice error">'+esc(blogError)+'</div>':'');}
function navigate(next){if(busy||pendingUploads){toast('تا پایان ذخیره یا بارگذاری صبر کنید.');return;}if(dirty&&!confirm('تغییرات ذخیره نشده کنار گذاشته شوند؟'))return;if(next!==section)lineFilter='';backupList=null;mediaScan=null;section=next;editing=null;dirty=false;query='';statusFilter='';page=1;document.querySelectorAll('[data-section]').forEach(b=>b.classList.toggle('active',b.dataset.section===section));document.getElementById('sidebar').classList.remove('open');document.getElementById('menuToggle').setAttribute('aria-expanded','false');render();window.scrollTo(0,0);}
function heading(description,extra=''){return '<div class="heading"><div><h1>'+labels[section]+'</h1><p>'+description+'</p></div>'+extra+'</div>';}
function render(){if(!state)return;if(editing)return editor();if(section==='overview')return overview();if(section==='settings')return settings();if(section==='backup')return backup();listing();}
function overview(){
 const counts={suppliers:state.suppliers.length,blog:blog.length,events:state.events.length,brands:state.brands.length,products:state.products.length};
 app.innerHTML=heading('خوش آمدید؛ امروز محتوای کدام بخش را تازه می‌کنیم؟')+'<section class="welcome"><div><h2>هر تغییر، یک ارتباط تازه</h2><p>مقاله بنویسید، لحظه‌های رویدادها را منتشر کنید و برندها و محصولات هیروسان را به‌روز نگه دارید.</p></div><button class="button gold" data-new="blog">＋ نوشتن مقاله</button></section><div class="stats">'+Object.keys(counts).map(k=>'<button class="stat" data-section="'+k+'"><span class="label">'+labels[k]+'<span>↗</span></span><span class="number">'+fa(counts[k])+'</span><span class="foot">مشاهده و مدیریت '+singular[k]+'‌ها</span></button>').join('')+'</div><div class="overview-grid"><section class="panel"><h2>شروع سریع</h2><div class="quick">'+['blog','events','brands','products'].map(k=>'<button data-new="'+k+'">＋ افزودن '+singular[k]+'<span>'+({blog:'عنوان، تصویر و متن مقاله',events:'جزئیات همایش، عکس و فیلم',brands:'معرفی برند و بارگذاری کاتالوگ',products:'تصویر، مشخصات و دسته‌بندی محصول'}[k])+'</span></button>').join('')+'</div></section><section class="panel"><h2>آخرین تغییرات محتوای صفحات</h2><ul class="activity">'+(state.activity.length?state.activity.slice(0,5).map(a=>'<li>'+esc(activityLabel(a.label))+'<small>'+esc(new Date(a.at).toLocaleString('fa-IR'))+'</small></li>').join(''):'<li class="muted">هنوز تغییری ثبت نشده است.</li>')+'</ul></section></div>';
}
function activityLabel(s){const parts=s.split(':');return (labels[parts[0]]||parts[0])+' — '+({save:'ذخیره محتوا',archive:'بایگانی',restore:'بازیابی',settings:'تغییر متن‌ها',seo:'تنظیم سئو',import:'بازگردانی از فایل'}[parts[1]]||parts[1]||'');}
function size(b){return b>=1048576?fa(Math.round(b/104857.6)/10)+' مگابایت':fa(Math.max(1,Math.round(b/1024)))+' کیلوبایت';}
function matchesBrandLine(r,line){const value=r.businessLine||'spare';return !line||value===line||(line!=='both'&&value==='both');}
function brandTools(){
 const rows=state.brands.filter(r=>!r.archived);
 return '<section class="panel"><h2>کاتالوگ را در کدام صفحه نمایش بدهیم؟</h2><p class="muted">برای انتقال کاتالوگ فعلی، برند را ویرایش کنید و «محل نمایش برند و کاتالوگ» را تغییر دهید؛ نیازی به آپلود دوباره PDF نیست.</p><div role="group" aria-label="فیلتر لاین برندها" style="display:flex;flex-wrap:wrap;gap:10px;margin:16px 0">'+Object.entries({'':'همه برندها',...lineLabels}).map(([key,label])=>'<button type="button" class="button '+(lineFilter===key?'primary':'')+'" data-brand-line="'+key+'" aria-pressed="'+String(lineFilter===key)+'">'+label+' · '+fa(rows.filter(r=>matchesBrandLine(r,key)).length)+'</button>').join('')+'</div><p class="muted">برندهای «هر دو لاین» در هر دو صفحه با همان PDF نمایش داده می‌شوند. برندهای قدیمیِ بدون لاین در قطعات یدکی قرار می‌گیرند.</p><div style="display:flex;flex-wrap:wrap;gap:12px"><a class="button small" target="_blank" rel="noopener" href="'+esc(safeURL(boot.frontendUrl+'/herosun-pages/brands.html'))+'">مشاهده صفحه قطعات یدکی ↗</a><a class="button small" target="_blank" rel="noopener" href="'+esc(safeURL(boot.frontendUrl+'/herosun-pages/products.html'))+'">مشاهده صفحه اسپرت و تزئینات ↗</a></div></section>';
}
function listing(){
 const rows=section==='blog'?blog:state[section];let filtered=rows.filter(r=>(section!=='brands'||matchesBrandLine(r,lineFilter))&&(!statusFilter?status(r)!=='archived':status(r)===statusFilter)&&(!query||[r.name,r.title,r.description,r.category,r.brand,r.id].join(' ').toLowerCase().includes(query.toLowerCase())));
 const pages=Math.max(1,Math.ceil(filtered.length/12));page=Math.min(page,pages);const slice=filtered.slice((page-1)*12,page*12);
 app.innerHTML=heading('افزودن، ویرایش و مدیریت انتشار '+singular[section]+'‌ها','<button class="button primary" data-action="new">＋ افزودن '+singular[section]+'</button>')+(section==='brands'?brandTools():'')+'<section class="panel"><div class="toolbar"><input id="search" aria-label="جست‌وجوی محتوا" placeholder="جست‌وجو در عنوان، دسته یا شناسه…" value="'+esc(query)+'"><select id="statusFilter" aria-label="وضعیت انتشار"><option value="">همه موارد فعال</option><option value="published">منتشرشده</option><option value="draft">پیش‌نویس</option>'+(section!=='blog'?'<option value="archived">بایگانی‌شده</option>':'')+'</select></div><div class="table-wrap">'+(slice.length?'<table><thead><tr><th>عنوان</th><th>'+(section==='blog'?'نویسنده':section==='suppliers'?'لوگو':'دسته‌بندی')+'</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>'+slice.map(r=>{
 const s=status(r),title=r.name||r.title,duplicate=section==='blog'&&rows.filter(x=>x.title?.trim()===r.title?.trim()).length>1;
 return '<tr><td><span class="record-title">'+esc(title)+'</span><span class="sub">'+esc(section==='brands'?((lineLabels[r.businessLine||'spare']||'قطعات یدکی')+' · '+(r.catalog?'کاتالوگ تعیین شده':'بدون کاتالوگ')):section==='events'?r.date:section==='products'?r.brand:'شناسه: '+r.id)+'</span>'+(duplicate?'<span class="duplicate">عنوان مشابه در فهرست وجود دارد</span>':'')+'</td><td>'+(section==='suppliers'?'<img alt="" src="'+esc(safeURL(r.logo))+'" style="max-width:120px;height:44px;object-fit:contain">':esc(section==='blog'?r.auther:r.category))+'</td><td><span class="badge '+s+'">'+({published:'منتشرشده',draft:'پیش‌نویس',archived:'بایگانی'}[s])+'</span></td><td><div class="row-actions"><button class="button small" data-edit="'+esc(r.id)+'">ویرایش</button>'+(s==='archived'?'<button class="button small" data-restore="'+esc(r.id)+'">بازیابی</button>':'<button class="button small danger" data-archive="'+esc(r.id)+'">'+(section==='blog'?'حذف':section==='suppliers'?'حذف از نمایش':'بایگانی')+'</button>')+'</div></td></tr>';
 }).join('')+'</tbody></table>':'<div class="empty"><b>موردی پیدا نشد</b>فیلتر را تغییر دهید یا یک '+singular[section]+' جدید بسازید.</div>')+'</div><div class="pager"><span>'+fa(filtered.length)+' مورد · صفحه '+fa(page)+' از '+fa(pages)+'</span><div class="row-actions"><button class="button small" data-page="-1" '+(page===1?'disabled':'')+'>قبلی</button><button class="button small" data-page="1" '+(page===pages?'disabled':'')+'>بعدی</button></div></div></section>';
 document.getElementById('statusFilter').value=statusFilter;
}
function field(key,label,value,type='text',full=false,hint=''){
 return '<div class="field '+(full?'full':'')+'"><label for="f-'+key+'">'+label+'</label>'+(type==='textarea'?'<textarea id="f-'+key+'" name="'+key+'">'+esc(value)+'</textarea>':'<input id="f-'+key+'" name="'+key+'" type="'+type+'" value="'+esc(value)+'" '+(key==='id'?'class="ltr" pattern="[a-z0-9][a-z0-9_-]{0,79}" '+(!editing.isNew?'readonly':''):'')+' '+(['title','name','id'].includes(key)?'required':'')+'>')+(hint?'<small>'+hint+'</small>':'')+'</div>';
}
function uploadField(key,label,value,kind){return '<div class="field full"><label for="f-'+key+'">'+label+'</label><input class="ltr" id="f-'+key+'" name="'+key+'" value="'+esc(value)+'" placeholder="از بارگذاری فایل استفاده کنید یا مسیر فعلی را وارد کنید"><label class="upload-label">بارگذاری '+label+'<input type="file" data-upload="'+key+'" data-kind="'+kind+'" accept="'+(kind==='pdf'?'.pdf':'.jpg,.jpeg,.png,.webp')+'"></label><small>'+(kind==='pdf'?'PDF تا ۵۰ مگابایت؛ محدودیت هاست هم اعمال می‌شود.':'JPG، PNG یا WebP تا ۸ مگابایت؛ عکس‌های بزرگ خودکار به ۱۹۲۰ پیکسل کوچک می‌شوند.')+'</small></div>';}
function seoPanel(seo){seo=seo||{};return '<section class="panel"><h2>سئو و اشتراک‌گذاری</h2><p class="muted">اختیاری؛ اگر خالی بماند، عنوان، خلاصه و تصویر شاخص مقاله استفاده می‌شود.</p><div class="form-grid">'+field('seoTitle','عنوان در نتایج گوگل',seo.metaTitle||'','text',true,'حداکثر ۱۲۰ نویسه؛ بهتر است زیر ۶۰ نویسه باشد.')+field('seoDescription','توضیح در نتایج گوگل',seo.metaDescription||'','textarea',true,'حداکثر ۳۲۰ نویسه؛ گوگل معمولاً ۱۵۰ تا ۱۶۰ نویسه را نشان می‌دهد.')+uploadField('seoImage','تصویر اشتراک‌گذاری',seo.ogImage||'','blog-image')+'<div class="field full"><label><input type="checkbox" name="seoNoindex" value="1" '+(seo.noindex?'checked':'')+'> این مقاله در نتایج گوگل نمایش داده نشود</label></div></div></section>';}
function startEdit(id,type=section){
 if(busy||pendingUploads)return;
 if(type!=='blog'&&!initialized){toast('ابتدا مدیریت محتوا را فعال کنید.');return;}
 if(type==='blog'&&(blogError||!blogWritable)){toast(blogError||'ذخیره وبلاگ هنوز فعال نشده است.');return;}
 if(dirty&&!confirm('تغییرات ذخیره نشده کنار گذاشته شوند؟'))return;
 section=type;const rows=type==='blog'?blog:state[type],found=id?rows.find(r=>String(r.id)===String(id)):null;
 editing={isNew:!found,record:found?clone(found):{id:type==='blog'?'':'',published:false,status:0,order:rows.length,created:Math.floor(Date.now()/1000),photos:[],videos:[],...(type==='brands'?{businessLine:lineFilter||'spare'}:{})}};dirty=false;render();window.scrollTo(0,0);
}
function editor(){
 const r=editing.record;let fields='';
 if(section!=='blog')fields+=field('id','شناسه انگلیسی',r.id,'text',false,'مثال: lenzo-s200؛ شناسه پس از ثبت ثابت می‌ماند.');
 fields+=field(section==='brands'?'name':'title',section==='brands'?'نام برند':'عنوان',r.name||r.title);
 if(section==='blog'){
  fields+=field('auther','نام نویسنده',r.auther)+field('created','تاریخ انتشار',r.created,'text',false,'تایم‌استمپ فعلی یا تاریخ میلادی مانند 2026-09-13 12:00:00؛ تاریخ آینده باعث زمان‌بندی خودکار نمی‌شود.');
  fields+=field('summary','خلاصه مقاله',r.summary,'textarea',true)+uploadField('image','تصویر شاخص',r.image,'blog-image');
  fields+='<div class="field full"><label for="f-text">متن کامل مقاله</label><small>متن HTML؛ دکمه‌ها قالب را دور متن انتخاب‌شده قرار می‌دهند. نتیجه را در پیش‌نمایش ببینید.</small><div class="edit-toolbar"><button type="button" data-format="p">پاراگراف</button><button type="button" data-format="h2">تیتر</button><button type="button" data-format="strong">پررنگ</button><button type="button" data-format="em">مورب</button><button type="button" data-format="ul">فهرست</button></div><textarea id="f-text" name="text" class="code-editor">'+esc(r.text)+'</textarea></div>';
 }else{
  if(section!=='suppliers')fields+=field('category','دسته‌بندی',r.category);
  if(section==='brands')fields+='<div class="field"><label for="f-businessLine">محل نمایش برند و کاتالوگ</label><select id="f-businessLine" name="businessLine">'+Object.keys(lineLabels).map(k=>'<option value="'+k+'" '+((r.businessLine||'spare')===k?'selected':'')+'>'+lineLabels[k]+'</option>').join('')+'</select><small>محل نمایش برند و کاتالوگ؛ انتخاب «هر دو لاین» برند را در هر دو صفحه نمایش می‌دهد.</small></div>';
  if(section==='products'){
   fields+='<div class="field"><label for="f-brandId">برند محصول</label><select name="brandId" id="f-brandId"><option value="">نام برند را دستی وارد می‌کنم</option>'+state.brands.filter(b=>!b.archived).map(b=>'<option value="'+esc(b.id)+'" '+(r.brandId===b.id?'selected':'')+'>'+esc(b.name)+'</option>').join('')+'</select></div>'+field('brand','نام برند (برای ورود دستی)',r.brand)+field('code','کد محصول',r.code)+field('initial','حرف جایگزین تصویر',r.initial);
  }
  if(section==='events')fields+=field('date','تاریخ برگزاری',r.date,'text',false,'مثال: ۲۵ شهریور ۱۴۰۵')+field('city','شهر یا محل برگزاری',r.city);
  if(section!=='suppliers')fields+=field('description','توضیحات',r.description,'textarea',true);
  if(section==='suppliers')fields+=uploadField('logo','لوگوی تأمین‌کننده',r.logo,'image');
  if(section==='brands')fields+=uploadField('logo','لوگوی برند',r.logo,'image')+uploadField('catalog','کاتالوگ PDF',r.catalog,'pdf');
  if(section==='products')fields+=uploadField('image','تصویر محصول',r.image,'image');
  if(section==='events')fields+=uploadField('cover','تصویر کاور رویداد',r.cover,'image');
 }
 app.innerHTML='<div class="heading"><div><h1>'+(editing.isNew?'افزودن ':'ویرایش ')+singular[section]+'</h1><p>تغییرات پس از زدن دکمه ذخیره اعمال می‌شوند.</p></div><button class="button" data-action="back">بازگشت به فهرست</button></div><form id="editorForm"><div class="editor-grid"><div><section class="panel"><h2>اطلاعات '+singular[section]+'</h2><div class="form-grid">'+fields+'</div></section>'+(section==='events'?galleryPanel('photos','آلبوم عکس‌ها',r.photos||[])+galleryPanel('videos','فیلم‌های رویداد',r.videos||[]):'')+(section==='blog'?seoPanel(r.seo):'')+'</div><aside class="panel editor-side"><h2>انتشار</h2><div class="field"><label for="f-published">وضعیت نمایش در سایت</label><select id="f-published" name="published"><option value="0">پیش‌نویس</option><option value="1">منتشرشده</option></select></div>'+(section!=='blog'?field('order','ترتیب نمایش',r.order||0,'number',false,'عدد کمتر، نمایش زودتر.'):'')+'<p class="muted">'+(section==='brands'?'کاتالوگ آپلودشده پس از ذخیره برند در دسترس قرار می‌گیرد.':section==='events'?'ابتدا عکس‌ها و فیلم‌ها را اضافه کنید و سپس وضعیت را منتشرشده قرار دهید.':'پیش‌نویس در فهرست عمومی نمایش داده نمی‌شود.')+'</p><div id="formError" class="form-error" role="alert"></div><button class="button primary" id="saveButton" type="submit">ذخیره تغییرات</button><button class="button" type="button" data-action="preview">پیش‌نمایش</button><button class="button" type="button" data-action="back">انصراف</button></aside></div></form>';
 document.getElementById('f-published').value=(section==='blog'?Number(r.status)===1:r.published)?'1':'0';
}
function mediaRow(group,m){return '<div class="media-row"><input class="ltr" data-media="src" value="'+esc(m.src)+'" aria-label="آدرس فایل" placeholder="آدرس فایل"><input data-media="caption" value="'+esc(m.caption)+'" aria-label="توضیح رسانه" placeholder="توضیح عکس یا فیلم">'+(group==='videos'?'<input class="poster ltr" data-media="poster" value="'+esc(m.poster)+'" aria-label="تصویر پوستر فیلم" placeholder="آدرس پوستر فیلم (اختیاری)">':'')+'<button type="button" class="button small danger" data-remove-media>حذف از آلبوم</button></div>';}
function galleryPanel(group,title,items){return '<section class="panel"><h2>'+title+'</h2><div class="media-controls"><button class="button small" type="button" data-add-media="'+group+'">＋ افزودن با لینک</button><label class="button small">بارگذاری '+(group==='photos'?'عکس‌ها':'فیلم MP4')+'<input type="file" data-gallery-upload="'+group+'" accept="'+(group==='photos'?'.jpg,.jpeg,.png,.webp':'.mp4')+'" multiple style="max-width:190px"></label></div><small class="muted">'+(group==='videos'?'هر فیلم تا ۱۰۰ مگابایت؛ سقف هاست ممکن است کمتر باشد. برای فایل بزرگ می‌توانید لینک HTTPS مستقیم وارد کنید.':'برای هر عکس می‌توانید توضیح جداگانه بنویسید.')+'</small><div id="gallery-'+group+'">'+items.map(m=>mediaRow(group,m)).join('')+'</div></section>';}
function collect(){const form=document.getElementById('editorForm'),fd=new FormData(form),r={...editing.record};for(const [k,v] of fd)r[k]=v;r.published=fd.get('published')==='1';r.order=Number(fd.get('order')||0);if(section==='blog'){r.status=r.published?1:0;delete r.published;r.seo={metaTitle:fd.get('seoTitle')||'',metaDescription:fd.get('seoDescription')||'',ogImage:fd.get('seoImage')||'',noindex:fd.get('seoNoindex')==='1'};['seoTitle','seoDescription','seoImage','seoNoindex'].forEach(k=>delete r[k]);}if(section==='events')for(const g of ['photos','videos'])r[g]=Array.from(document.querySelectorAll('#gallery-'+g+' .media-row')).map(row=>{const m={};row.querySelectorAll('[data-media]').forEach(i=>m[i.dataset.media]=i.value);return m;});return r;}
async function save(e){e.preventDefault();if(busy||pendingUploads){toast('تا پایان بارگذاری فایل‌ها صبر کنید.');return;}const form=document.getElementById('editorForm');if(!form.reportValidity())return;const r=collect();busy=true;document.getElementById('saveButton').disabled=true;document.getElementById('formError').textContent='';
 try{const response=await request({op:section==='blog'?'blog-save':'save',type:section,revision:state.revision,isNew:editing.isNew,record:r,...(section==='blog'?{seo:r.seo}:{})});if(section==='blog'){if(response.state)state=response.state;const i=blog.findIndex(a=>a.id===response.record.id);if(i<0)blog.unshift(response.record);else blog[i]=response.record;}else state=response.state;if(section==='brands'&&!matchesBrandLine(r,lineFilter))lineFilter=r.businessLine||'spare';query=r.name||r.title||'';statusFilter='';page=1;dirty=false;editing=null;toast(boot.demo?'در پیش‌نمایش مرورگر ذخیره شد.':'تغییرات ذخیره شد.');render();}
 catch(e){document.getElementById('formError').textContent=errorText(e);toast('ذخیره انجام نشد؛ متن خطا را بررسی کنید.');}
 finally{busy=false;const b=document.getElementById('saveButton');if(b)b.disabled=false;}
}
async function upload(file,kind){
 if(boot.demo)throw new Error('آپلود واقعی در پیش‌نمایش فعال نیست؛ این قابلیت پس از نصب روی هاست کار می‌کند.');
 const max={image:8,'blog-image':8,pdf:50,video:100}[kind];if(file.size>max*1024*1024)throw new Error('فایل بزرگ‌تر از '+fa(max)+' مگابایت است.');
 const form=new FormData();form.append('file',file);form.append('kind',kind);form.append(boot.csrfParam,boot.csrfToken);
 const res=await fetch(boot.upload,{method:'POST',body:form,credentials:'same-origin',headers:{'Accept':'application/json'}});let data;
 try{data=await res.json();}catch{throw new Error('آپلود ناموفق بود؛ محدودیت حجم هاست یا نشست ورود را بررسی کنید.');}
 if(!res.ok||data.success!==true)throw new Error(data.message||'آپلود انجام نشد.');return data;
}
async function handleUpload(input){if(!input.files.length||busy)return;pendingUploads++;input.disabled=true;toast('در حال بارگذاری…');
 try{for(const file of input.files){const group=input.dataset.galleryUpload,kind=group?(group==='photos'?'image':'video'):input.dataset.kind;const r=await upload(file,kind);if(!document.contains(input))break;if(group)document.getElementById('gallery-'+group).insertAdjacentHTML('beforeend',mediaRow(group,{src:r.value,caption:file.name}));else document.getElementById('f-'+input.dataset.upload).value=r.value;dirty=true;}toast('بارگذاری انجام شد؛ برای اعمال روی سایت، تغییرات را ذخیره کنید.');}
 catch(e){toast(errorText(e));const out=document.getElementById('formError');if(out)out.textContent=errorText(e);}
 finally{pendingUploads--;input.disabled=false;input.value='';}
}
function preview(){const r=collect(),box=document.getElementById('previewContent');box.replaceChildren();const h=document.createElement('h2');h.textContent=r.name||r.title;box.appendChild(h);
 if(section==='blog'){const frame=document.createElement('iframe');frame.setAttribute('sandbox','');frame.title='پیش‌نمایش متن مقاله';frame.srcdoc='<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src https: http:; style-src \'unsafe-inline\'"><style>body{font-family:Tahoma;direction:rtl;line-height:2;padding:16px}img{max-width:100%}</style>'+r.text;box.appendChild(frame);}
 else{const image=safeURL(r.logo||r.image||r.cover);if(image){const img=document.createElement('img');img.src=image;img.className='preview-image';img.alt=r.name||r.title;box.appendChild(img);}const p=document.createElement('p');p.className='preview-body';p.textContent=r.description||'';box.appendChild(p);if(section==='events'){const meta=document.createElement('p');meta.textContent=[r.date,r.city,fa(r.photos.length)+' عکس',fa(r.videos.length)+' فیلم'].join(' · ');box.appendChild(meta);}}
 const dialog=document.getElementById('previewDialog');dialog.showModal();}
function settings(){app.innerHTML=heading('عنوان و توضیح بالای صفحات قطعات یدکی، اسپرت و تزئینات و رویدادها')+'<form id="settingsForm" class="settings-grid">'+['brands','products','events'].map(k=>'<section class="panel"><h2>'+({brands:'قطعات یدکی',products:'اسپرت و تزئینات',events:labels.events}[k])+'</h2><div class="form-grid">'+field(k+'Title','عنوان صفحه',state.settings[k+'Title'],'text',true)+field(k+'Description','توضیح کوتاه',state.settings[k+'Description'],'textarea',true)+'</div></section>').join('')+'<div id="settingsError" class="form-error" role="alert"></div><button class="button primary" type="submit">ذخیره متن‌ها</button></form>';}
async function saveSettings(e){e.preventDefault();if(!initialized){toast('ابتدا مدیریت محتوا را فعال کنید.');return;}if(busy)return;busy=true;const settings=Object.fromEntries(new FormData(e.target));try{const r=await request({op:'settings',settings,revision:state.revision});state=r.state;dirty=false;toast('متن‌های صفحات ذخیره شد.');}catch(e){document.getElementById('settingsError').textContent=errorText(e);}finally{busy=false;}}
function backup(){app.innerHTML=heading('نسخه پشتیبان، بازگردانی و فضای رسانه‌ها')+'<section class="panel"><h2>دریافت نسخه پشتیبان محتوا</h2><p>خروجی JSON شامل لوگوهای صفحه اول، برندها، محصولات، رویدادها، متن‌های صفحات، سئوی مقاله‌ها و خود مقاله‌هاست. فایل‌های عکس، فیلم و PDF داخل این خروجی نیستند؛ از پوشه رسانه‌ها نیز در هاست بکاپ بگیرید.</p><button class="button primary" data-action="export">↧ دانلود اطلاعات</button>'+(boot.demo?'<button class="button danger" data-action="reset-demo">بازنشانی داده‌های نمایشی</button>':'')+'</section>'
 +'<section class="panel"><h2>بازگردانی به نسخه‌های قبلی</h2><p class="muted">با هر ذخیره، نسخه قبلی برندها، محصولات، رویدادها، لوگوها، متن صفحات و سئوی مقاله‌ها روی سرور نگه داشته می‌شود (۲۰ نسخه آخر). خود بازگردانی هم از وضعیت فعلی نسخه پشتیبان می‌سازد. متن مقاله‌ها در پایگاه داده است و با این بخش برنمی‌گردد.</p>'
 +(backupList?(backupList.length?'<div class="table-wrap"><table><thead><tr><th>نسخه</th><th>زمان ذخیره</th><th>محتوا</th><th>آخرین تغییر پیش از آن</th><th>عملیات</th></tr></thead><tbody>'+backupList.map(b=>'<tr><td>'+fa(b.revision)+'</td><td>'+esc(new Date(b.savedAt).toLocaleString('fa-IR'))+'</td><td>'+fa(b.counts.brands)+' برند · '+fa(b.counts.products)+' محصول · '+fa(b.counts.events)+' رویداد · '+fa(b.counts.suppliers)+' لوگو</td><td>'+esc(b.lastChange?activityLabel(b.lastChange.label):'—')+'</td><td><button class="button small" data-action="restore-backup" data-revision="'+b.revision+'">بازگردانی</button></td></tr>').join('')+'</tbody></table></div>':'<p class="muted">هنوز نسخه پشتیبانی روی سرور ساخته نشده است.</p>'):'<button class="button" data-action="list-backups">نمایش نسخه‌های سرور</button>')
 +'<h3>بازگردانی از فایل دانلودشده</h3><p class="muted">فایل JSON دریافت‌شده از دکمه «دانلود اطلاعات» را انتخاب کنید؛ پیش از جایگزینی تأیید گرفته می‌شود.</p><label class="upload-label">انتخاب فایل پشتیبان<input type="file" data-import accept=".json,application/json"></label></section>'
 +'<section class="panel"><h2>فایل‌های بی‌استفاده</h2><p class="muted">عکس‌ها، PDFها و فیلم‌هایی که در هیچ برند، محصول، رویداد، لوگو یا نسخه پشتیبانی استفاده نشده‌اند و بیش از یک روز از بارگذاری‌شان گذشته است.</p>'
 +(mediaScan?'<p>همه رسانه‌ها: '+fa(mediaScan.usage.count)+' فایل · '+size(mediaScan.usage.bytes)+'<br>بی‌استفاده: <strong>'+fa(mediaScan.unusedCount)+' فایل · '+size(mediaScan.unusedBytes)+'</strong></p>'+(mediaScan.unusedCount?'<details><summary>فهرست فایل‌ها</summary><ul class="activity">'+mediaScan.unused.map(f=>'<li><a target="_blank" rel="noopener" href="'+esc(safeURL('content-media.php?file='+f.name))+'">'+esc(f.name)+'</a><small>'+size(f.bytes)+' · '+esc(new Date(f.modified).toLocaleDateString('fa-IR'))+'</small></li>').join('')+'</ul></details><button class="button danger" data-action="clean-media">حذف '+fa(mediaScan.unusedCount)+' فایل بی‌استفاده</button> ':'<p class="muted">فایل بی‌استفاده‌ای پیدا نشد.</p>'):'')
 +'<button class="button" data-action="scan-media">'+(mediaScan?'بررسی دوباره':'بررسی فایل‌ها')+'</button></section>';}
async function importBackup(input){const file=input.files[0];input.value='';if(!file||busy)return;let data;try{data=JSON.parse(await file.text());}catch{toast('فایل انتخاب‌شده JSON معتبر نیست.');return;}
 const s=data&&data.state;if(!s||!Array.isArray(s.brands)){toast('این فایل خروجی «دانلود اطلاعات» نیست.');return;}
 if(!confirm('محتوای فعلی برندها، محصولات، رویدادها، لوگوها و متن صفحات با فایل «'+file.name+'» ('+(data.exportedAt?new Date(data.exportedAt).toLocaleString('fa-IR'):'بدون تاریخ')+') جایگزین شود؟ وضعیت فعلی به‌عنوان نسخه پشتیبان نگه داشته می‌شود.'))return;
 busy=true;try{const r=await request({op:'import',state:s,revision:state.revision});state=r.state;backupList=null;toast('اطلاعات از فایل بازگردانی شد.');backup();}catch(e){toast(errorText(e));}finally{busy=false;}}
async function exportData(){if(boot.demo){downloadBlob(new Blob([JSON.stringify({state,articles:blog},null,2)],{type:'application/json'}),'herosun-preview-backup.json');return;}const form=new FormData();form.append(boot.csrfParam,boot.csrfToken);const r=await fetch(boot.export,{method:'POST',body:form,credentials:'same-origin'});if(!r.ok||!r.headers.get('Content-Disposition'))throw new Error('دریافت بکاپ انجام نشد؛ اتصال وبلاگ و ورود مدیر را بررسی کنید.');downloadBlob(await r.blob(),'herosun-content-backup.json');}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function archive(id,restore=false){if(busy)return;if(section==='blog'&&!blogWritable){toast('حذف وبلاگ هنوز فعال نشده است.');return;}const r=(section==='blog'?blog:state[section]).find(r=>String(r.id)===String(id));if(!r)return;let p;
 if(section==='blog'){const title=prompt('حذف دائمی مقاله قابل بازگشت نیست. ابتدا بکاپ بگیرید. برای تأیید، عنوان زیر را دقیق وارد کنید:\n'+r.title);if(title!==r.title)return;p={op:'blog-delete',record:r,confirmTitle:title};}
 else{if(!confirm(restore?'این مورد به پیش‌نویس برگردد؟':'این مورد از نمایش عمومی خارج و بایگانی شود؟'))return;p={op:restore?'restore':'archive',type:section,id,revision:state.revision};}
 busy=true;try{const result=await request(p);if(section==='blog')blog=blog.filter(x=>x.id!==id);else state=result.state;toast('تغییر اعمال شد.');render();}catch(e){toast(errorText(e));}finally{busy=false;}}
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-brand-line')){if(section!=='brands'||editing||busy||pendingUploads)return;lineFilter=b.dataset.brandLine;query='';page=1;return listing();}
 if(b.dataset.section)return navigate(b.dataset.section);
 if(b.dataset.new)return startEdit(null,b.dataset.new);
 if(b.dataset.edit)return startEdit(b.dataset.edit);
 if(b.dataset.archive)return archive(b.dataset.archive);
 if(b.dataset.restore)return archive(b.dataset.restore,true);
 if(b.dataset.page){page+=Number(b.dataset.page);return listing();}
 if(b.dataset.addMedia){document.getElementById('gallery-'+b.dataset.addMedia).insertAdjacentHTML('beforeend',mediaRow(b.dataset.addMedia,{}));dirty=true;return;}
 if(b.hasAttribute('data-remove-media')){b.closest('.media-row').remove();dirty=true;return;}
 if(b.dataset.format){const t=document.getElementById('f-text'),tag=b.dataset.format,text=t.value.slice(t.selectionStart,t.selectionEnd)||'متن';t.setRangeText(tag==='ul'?'<ul><li>'+text+'</li></ul>':'<'+tag+'>'+text+'</'+tag+'>',t.selectionStart,t.selectionEnd,'end');t.focus();dirty=true;return;}
 const action=b.dataset.action;
 try{if(action==='new')startEdit();if(action==='back')navigate(section);if(action==='preview')preview();if(action==='reload')load();if(action==='export')await exportData();if(action==='reset-demo'&&confirm('داده‌های نمایشی پاک و بازنشانی شوند؟')){localStorage.removeItem('herosun-admin-preview-v1');await load();}
 if(action==='list-backups'){backupList=(await request({op:'backups'})).backups;backup();}
 if(action==='restore-backup'){const rev=Number(b.dataset.revision);if(busy||!confirm('برندها، محصولات، رویدادها، لوگوها و متن صفحات به نسخه '+fa(rev)+' برگردد؟ وضعیت فعلی هم به‌عنوان نسخه پشتیبان نگه داشته می‌شود.'))return;busy=true;try{const r=await request({op:'restore-backup',backupRevision:rev,revision:state.revision});state=r.state;backupList=null;toast('نسخه '+fa(rev)+' بازگردانی شد.');backup();}finally{busy=false;}}
 if(action==='scan-media'){toast('در حال بررسی فایل‌ها…');mediaScan=await request({op:'media-scan'});backup();}
 if(action==='clean-media'){if(busy||!mediaScan)return;if(prompt('حذف این '+fa(mediaScan.unusedCount)+' فایل قابل بازگشت نیست. برای تأیید، کلمه «حذف» را بنویسید:')!=='حذف')return;busy=true;try{const r=await request({op:'media-clean',count:mediaScan.unusedCount});toast(fa(r.deleted)+' فایل حذف شد و '+size(r.bytes)+' فضا آزاد شد.');mediaScan=await request({op:'media-scan'});backup();}finally{busy=false;}}
 if(action==='initialize'){if(!confirm('اطلاعات نسخه ارسالی جایگزین منبع نمایش برندها، محصولات و رویدادها می‌شود. بررسی و بکاپ انجام شده است؟'))return;const r=await request({op:'initialize',revision:0});state=r.state;initialized=true;renderBanner();render();toast('مدیریت محتوا فعال شد.');}}
 catch(e){toast(errorText(e));}
});
// Use the DOM attribute: a form control named 'id' can shadow form.id.
app.addEventListener('submit',e=>{
 const form=e.target;
 if(!(form instanceof HTMLFormElement))return;
 const formId=form.getAttribute('id');
 if(formId==='editorForm'){e.preventDefault();save(e);}
 else if(formId==='settingsForm'){e.preventDefault();saveSettings(e);}
});
app.addEventListener('input',e=>{if(e.target.id==='search'){const pos=e.target.selectionStart;query=e.target.value;page=1;listing();const input=document.getElementById('search');input.focus();input.setSelectionRange(pos,pos);}else if(e.target.closest('form'))dirty=true;});
app.addEventListener('change',e=>{if(e.target.id==='statusFilter'){statusFilter=e.target.value;page=1;listing();}if(e.target.type==='file'){if(e.target.hasAttribute('data-import'))importBackup(e.target);else handleUpload(e.target);}if(e.target.closest('form'))dirty=true;});
document.getElementById('refresh').addEventListener('click',()=>{if(busy||pendingUploads)return;if(dirty&&!confirm('تغییرات ذخیره نشده کنار گذاشته شوند؟'))return;dirty=false;editing=null;load();});
document.getElementById('menuToggle').addEventListener('click',e=>{const open=document.getElementById('sidebar').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.getElementById('sidebar').classList.remove('open');document.getElementById('menuToggle').setAttribute('aria-expanded','false');}});
document.getElementById('closePreview').addEventListener('click',()=>document.getElementById('previewDialog').close());
window.addEventListener('beforeunload',e=>{if(dirty||pendingUploads||busy){e.preventDefault();e.returnValue='';}});
document.querySelectorAll('#sidebar [data-section]').forEach(b=>{const t=Array.from(b.childNodes).find(n=>n.nodeType===3&&n.textContent.trim());if(t&&labels[b.dataset.section])t.textContent=labels[b.dataset.section];});
document.getElementById('visitSite').href=safeURL(boot.frontendUrl);document.getElementById('today').textContent=new Date().toLocaleDateString('fa-IR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});load();
})();
