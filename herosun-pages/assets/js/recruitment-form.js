(function(){"use strict";
  function setupCareers() {
    var form = document.getElementById("recruitmentApplication");
    if (!form || form.dataset.recruitmentReady) return;
    form.dataset.recruitmentReady="1";

    var steps = Array.prototype.slice.call(form.querySelectorAll(".form-step"));
    var progress = Array.prototype.slice.call(document.querySelectorAll(".progress-step"));
    var nextButtons = form.querySelectorAll("[data-form-next]");
    var prevButtons = form.querySelectorAll("[data-form-prev]");
    var status = document.getElementById("formStatus");
    var department = document.getElementById("department");
    var otherWrap = document.getElementById("otherDepartmentWrap");
    var otherInput = document.getElementById("otherDepartment");
    var resume = document.getElementById("resume");
    var resumeName = document.getElementById("resumeName");
    var submitButton = form.querySelector('[type="submit"]');
    var current = 0, sending = false, completed = false, tokenPromise = null;

    function showStatus(message, type) {
      if (!status) return;
      status.textContent = message;
      status.className = "form-status show " + (type || "info");
      status.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function clearStatus() {
      if (!status) return;
      status.textContent = "";
      status.className = "form-status";
    }

    function showStep(index) {
      current = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach(function (step, stepIndex) {
        step.classList.toggle("active", stepIndex === current);
        step.hidden = stepIndex !== current;
      });
      progress.forEach(function (item, itemIndex) {
        item.classList.toggle("active", itemIndex === current);
        item.classList.toggle("done", itemIndex < current);
        if (itemIndex === current) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
      clearStatus();
      if (current === steps.length - 1) updateReview();
      var heading = steps[current].querySelector("h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function validateStep() {
      var fields = steps[current].querySelectorAll("input, select, textarea");
      for (var i = 0; i < fields.length; i += 1) {
        if (fields[i].disabled || fields[i].type === "hidden") continue;
        if (!fields[i].checkValidity()) {
          fields[i].reportValidity();
          fields[i].focus();
          return false;
        }
      }
      return true;
    }

    function fieldText(id) {
      var field = document.getElementById(id);
      if (!field) return "—";
      if (field.type === "radio") {
        var checked = form.querySelector('[name="' + field.name + '"]:checked');
        return checked ? checked.value : "—";
      }
      if (field.tagName === "SELECT") {
        return field.selectedIndex >= 0 ? field.options[field.selectedIndex].text : "—";
      }
      return field.value.trim() || "—";
    }

    function updateReview() {
      var reviewMap = {
        reviewName: fieldText("fullName"),
        reviewMobile: fieldText("mobile"),
        reviewCity: fieldText("city"),
        reviewDepartment: department && department.value === "سایر" ? fieldText("otherDepartment") : fieldText("department"),
        reviewEmployment: fieldText("employmentFull"),
        reviewExperience: fieldText("experienceYears") + " سال",
        reviewEducation: fieldText("education"),
        reviewResume: resume && resume.files.length ? resume.files[0].name : "انتخاب نشده"
      };
      Object.keys(reviewMap).forEach(function (id) {
        var element = document.getElementById(id);
        if (element) element.textContent = reviewMap[id];
      });
    }

    function updateDepartment() {
      if (!department || !otherWrap || !otherInput) return;
      var isOther = department.value === "سایر";
      otherWrap.hidden = !isOther;
      otherInput.required = isOther;
      if (!isOther) otherInput.value = "";
    }

    function validateResume() {
      if (!resume) return;
      resume.setCustomValidity("");
      if (!resume.files.length) { if(resumeName)resumeName.textContent="هنوز فایلی انتخاب نشده است";return; }
      var file = resume.files[0];
      var allowed = /\.(pdf|doc|docx)$/i.test(file.name);
      var withinLimit = file.size <= 5 * 1024 * 1024;
      if (!allowed) resume.setCustomValidity("فرمت رزومه باید PDF، DOC یا DOCX باشد.");
      else if (!withinLimit) resume.setCustomValidity("حجم رزومه نباید بیشتر از ۵ مگابایت باشد.");
      else resume.setCustomValidity("");
      if (resumeName) resumeName.textContent = file.name;
      if (!resume.checkValidity()) resume.reportValidity();
    }

    nextButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (!validateStep()) return;
        showStep(current + 1);
      });
    });

    prevButtons.forEach(function (button) {
      button.addEventListener("click", function () { showStep(current - 1); });
    });

    if (department) {
      department.addEventListener("change", updateDepartment);
      updateDepartment();
    }
    if (resume) resume.addEventListener("change", validateResume);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if(sending || completed)return;
      clearStatus();
      for(var si=0;si<steps.length;si++){var bad=Array.prototype.find.call(steps[si].querySelectorAll('input,select,textarea'),function(field){return !field.disabled&&!field.checkValidity();});if(bad){showStep(si);bad.reportValidity();return;}}

      var endpoint = form.getAttribute("action");
      if (!endpoint || endpoint === "#") {
        showStatus("نسخه نمایشی فرم کامل است، اما اطلاعات هنوز ارسال نشده است. برای ثبت واقعی باید فرم به بخش استخدام سایت Yii2 متصل شود.", "info");
        return;
      }

      sending=true;
      submitButton.disabled = true;
      submitButton.textContent = "در حال ارسال…";
      if(!tokenPromise)tokenPromise=fetch(endpoint,{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}}).then(function(res){if(!res.ok)throw Error('آماده‌سازی فرم انجام نشد؛ دوباره تلاش کنید.');return res.json();}).then(function(t){if(!t.success||!t.csrfParam||!t.csrfToken||!t.submissionKey)throw Error('نشست فرم معتبر نیست.');return t;}).catch(function(e){tokenPromise=null;throw e;});
      tokenPromise.then(function(t){var payload=new FormData(form);payload.append(t.csrfParam,t.csrfToken);payload.append('submission_key',t.submissionKey);return fetch(endpoint,{method:'POST',body:payload,credentials:'same-origin',headers:{Accept:'application/json'}});}).then(function(res){return res.json().then(function(r){if(!res.ok||r.success!==true)throw Error(r.message||'ثبت انجام نشد؛ دوباره تلاش کنید.');return r;});}).then(function(result){
        completed=true;
        showStatus('درخواست شما ثبت شد. شماره پیگیری: '+result.tracking+' — این شماره را نگه دارید.','success');
        form.reset();if(resumeName)resumeName.textContent='رزومه دریافت شد';
        form.querySelectorAll('input,select,textarea,button').forEach(function(el){el.disabled=true;});
      }).catch(function(e){showStatus(e.message||'ارسال انجام نشد؛ اتصال اینترنت را بررسی کنید.','error');}).finally(function(){sending=false;submitButton.disabled=completed;submitButton.textContent=completed?'درخواست ثبت شد':'ثبت درخواست همکاری';});
    });

  }


if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setupCareers);else setupCareers();})();