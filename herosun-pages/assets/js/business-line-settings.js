(function(){
 if(window.HEROSUN_CONTENT_ERROR){var msg=document.createElement('p');msg.className='hs-status';msg.setAttribute('role','status');msg.textContent='دریافت فهرست برندها موقتاً ممکن نیست؛ لطفاً دوباره تلاش کنید.';document.querySelector('main').prepend(msg);}
 var s=window.HEROSUN_PAGE_SETTINGS;if(!s)return;
 var key=document.body.dataset.hsPage,hero=document.querySelector('.page-hero');if(!hero)return;
 var oldTitles={brands:['برندها و کاتالوگ محصولات','برندها و کاتالوگ‌ها','برندهای همکار هیروسان'],products:['قطعه موردنیازتان را سریع‌تر پیدا کنید','محصولات هیروسان','محصولات']};
 var title=s[key+'Title'],description=s[key+'Description'];
 if(title && !(oldTitles[key]||[]).includes(title)){hero.querySelector('h1').textContent=title;document.title=title+' | هیروسان';}
 var oldDescriptions=['همراه با برندهای معتبر، برای تأمین مطمئن قطعات خودرو.','قطعات یدکی و لوازم جانبی برای همراهان هیروسان.','برند موردنظر خود را پیدا کنید و کاتالوگ رسمی محصولات آن را مستقیماً مشاهده یا دریافت کنید.','محصولات را براساس نام، برند یا گروه قطعه جست‌وجو کنید و برای دریافت موجودی و شرایط فروش با کارشناسان ما تماس بگیرید.'];
 if(description&&!oldDescriptions.includes(description))hero.querySelector('.line-description').textContent=description;
})();
