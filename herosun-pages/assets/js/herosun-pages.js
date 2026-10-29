(function () {
  "use strict";

  var data = window.HEROSUN_DATA || { brands: [], products: [] };

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/\s+/g, " ");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function unique(values) {
    return values.filter(function (item, index) {
      return item && values.indexOf(item) === index;
    });
  }

  function addOptions(select, values) {
    if (!select) return;
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupNavigation() {
    var page = document.body.getAttribute("data-page");
    var current = document.querySelector('[data-nav="' + page + '"]');
    if (current) current.setAttribute("aria-current", "page");

    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-main-nav]");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", function (event) {
      if (!menu.classList.contains("open")) return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  function setupReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(function (item) { item.classList.add("in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    items.forEach(function (item) { observer.observe(item); });
  }

  function brandCard(brand) {
    var hasCatalog = brand.catalogAvailable !== false && Boolean(brand.catalog);
    var catalogButton = hasCatalog
      ? '<a class="btn btn-primary catalog-direct" href="https://herosunco.ir/herosun-pages/managed-catalog.php?action=download&amp;id=' + encodeURIComponent(brand.id) + '">دانلود کاتالوگ</a>' +
        '<button class="btn btn-outline" type="button" data-catalog="' + escapeHtml(brand.catalog) + '" data-brand-id="'+escapeHtml(brand.id)+'" data-brand-name="' + escapeHtml(brand.name) + '">مشاهده PDF</button>'
      : '<span class="catalog-error">کاتالوگ هنوز منتشر نشده است</span>';

    return [
      '<article class="brand-card reveal">',
        '<div class="brand-logo-wrap">',
          '<img src="' + escapeHtml(brand.logo) + '" alt="لوگوی ' + escapeHtml(brand.name) + '" loading="lazy">',
        '</div>',
        '<div class="brand-card-body">',
          '<span class="card-kicker">' + escapeHtml(brand.category) + '</span>',
          '<h3>' + escapeHtml(brand.name) + '</h3>',
          '<p>' + escapeHtml(brand.description) + '</p>',
          '<div class="card-actions">',
            catalogButton,
            '<a class="btn btn-outline" href="products.html?brand=' + encodeURIComponent(brand.name) + '">محصولات برند</a>',
          '</div>',
        '</div>',
      '</article>'
    ].join("");
  }

  function setupBrands() {
    var grid = document.getElementById("brandGrid");
    if (!grid) return;

    var search = document.getElementById("brandSearch");
    var category = document.getElementById("brandCategory");
    var catalog = document.getElementById("catalogStatus");
    var count = document.getElementById("brandCount");
    var empty = document.getElementById("brandEmpty");
    var dialog = document.getElementById("catalogDialog");
    var frame = document.getElementById("catalogFrame");
    var title = document.getElementById("catalogTitle");
    var download = document.getElementById("catalogDownload");
    var close = document.getElementById("catalogClose");

    addOptions(category, unique(data.brands.map(function (brand) { return brand.category; })).sort());

    function render() {
      var query = normalize(search ? search.value : "");
      var selectedCategory = category ? category.value : "";
      var selectedCatalog = catalog ? catalog.value : "";
      var filtered = data.brands.filter(function (brand) {
        var haystack = normalize([brand.name, brand.category, brand.description].join(" "));
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var categoryMatch = !selectedCategory || brand.category === selectedCategory;
        var catalogMatch = !selectedCatalog || (selectedCatalog === "yes" ? brand.catalogAvailable !== false && Boolean(brand.catalog) : brand.catalogAvailable === false || !brand.catalog);
        return queryMatch && categoryMatch && catalogMatch;
      });

      grid.innerHTML = filtered.map(brandCard).join("");
      if (count) count.textContent = new Intl.NumberFormat("fa-IR").format(filtered.length);
      if (empty) empty.classList.toggle("show", filtered.length === 0);
      setupReveal();
      document.dispatchEvent(new Event("herosun:render"));
    }

    function openCatalog(path, brandName, brandId) {
      if (!dialog || !frame) return;
      frame.src = path;
      title.textContent = "کاتالوگ " + brandName;
      download.href = "https://herosunco.ir/herosun-pages/managed-catalog.php?action=download&id=" + encodeURIComponent(brandId);
      download.setAttribute("download", "");
      document.body.classList.add("modal-open");
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }

    function closeCatalog() {
      if (!dialog || !frame) return;
      frame.src = "about:blank";
      document.body.classList.remove("modal-open");
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }

    grid.addEventListener("click", function (event) {
      var button = event.target.closest("[data-catalog]");
      if (!button) return;
      openCatalog(button.getAttribute("data-catalog"), button.getAttribute("data-brand-name"), button.getAttribute("data-brand-id"));
    });

    [search, category, catalog].forEach(function (control) {
      if (!control) return;
      control.addEventListener(control.tagName === "INPUT" ? "input" : "change", render);
    });

    if (close) close.addEventListener("click", closeCatalog);
    if (dialog) {
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) closeCatalog();
      });
      dialog.addEventListener("cancel", function (event) {
        event.preventDefault();
        closeCatalog();
      });
    }

    render();
    fetch('managed-catalog-list.json', {cache:'no-store', credentials:'same-origin'})
      .then(function(response){if(!response.ok)throw new Error('catalog_unavailable');return response.json();})
      .then(function(result){if(!result.catalogs)throw new Error('invalid_catalog_response');data.brands.forEach(function(brand){var item=result.catalogs[brand.id];if(item){brand.catalogAvailable=item.available;if(item.url)brand.catalog=item.url;}});render();})
      .catch(function(){var message=document.createElement('p');message.className='hs-status';message.textContent='بررسی آنلاین کاتالوگ‌ها انجام نشد. می‌توانید دریافت مستقیم را امتحان کنید.';grid.before(message);});
  }

  function productCard(product) {
    var visual = product.image
      ? '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.title) + '" loading="lazy">'
      : '<span class="product-placeholder" aria-hidden="true">' + escapeHtml(product.initial || "H") + '</span>';
    var code = product.code
      ? '<span class="product-code">کد کالا: ' + escapeHtml(product.code) + '</span>'
      : '<span class="product-code">برای موجودی تماس بگیرید</span>';

    return [
      '<article class="product-card reveal">',
        '<div class="product-visual">',
          '<span class="product-badge">' + escapeHtml(product.category) + '</span>',
          visual,
        '</div>',
        '<div class="product-body">',
          '<div class="product-meta"><span>' + escapeHtml(product.brand) + '</span><span>' + escapeHtml(product.category) + '</span></div>',
          '<h3>' + escapeHtml(product.title) + '</h3>',
          '<p>' + escapeHtml(product.description) + '</p>',
          '<div class="product-bottom">',
            code,
            '<a class="btn btn-primary" href="tel:03433231010">استعلام</a>',
          '</div>',
        '</div>',
      '</article>'
    ].join("");
  }

  function setupProducts() {
    var grid = document.getElementById("productGrid");
    if (!grid) return;

    var search = document.getElementById("productSearch");
    var category = document.getElementById("productCategory");
    var brand = document.getElementById("productBrand");
    var count = document.getElementById("productCount");
    var empty = document.getElementById("productEmpty");

    addOptions(category, unique(data.products.map(function (product) { return product.category; })).sort());
    addOptions(brand, unique(data.products.map(function (product) { return product.brand; })).sort());

    var queryBrand = new URLSearchParams(window.location.search).get("brand");
    if (queryBrand && brand) {
      var exists = Array.prototype.some.call(brand.options, function (option) { return option.value === queryBrand; });
      if (exists) brand.value = queryBrand;
    }

    function render() {
      var query = normalize(search ? search.value : "");
      var selectedCategory = category ? category.value : "";
      var selectedBrand = brand ? brand.value : "";
      var filtered = data.products.filter(function (product) {
        var haystack = normalize([product.title, product.brand, product.category, product.code, product.description].join(" "));
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var categoryMatch = !selectedCategory || product.category === selectedCategory;
        var brandMatch = !selectedBrand || product.brand === selectedBrand;
        return queryMatch && categoryMatch && brandMatch;
      });

      grid.innerHTML = filtered.map(productCard).join("");
      if (count) count.textContent = new Intl.NumberFormat("fa-IR").format(filtered.length);
      if (empty) empty.classList.toggle("show", filtered.length === 0);
      setupReveal();
      document.dispatchEvent(new Event("herosun:render"));
    }

    [search, category, brand].forEach(function (control) {
      if (!control) return;
      control.addEventListener(control.tagName === "INPUT" ? "input" : "change", render);
    });

    render();
  }

  function setupCareers() {
    var form = document.getElementById("recruitmentForm");
    if (!form) return;

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
    var current = 0;

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
      clearStatus();
      for(var si=0;si<steps.length;si++){var bad=Array.prototype.find.call(steps[si].querySelectorAll('input,select,textarea'),function(field){return !field.disabled&&!field.checkValidity();});if(bad){showStep(si);bad.reportValidity();return;}}

      var endpoint = data.recruitmentEndpoint || form.getAttribute("action");
      if (!endpoint || endpoint === "#") {
        showStatus("نسخه نمایشی فرم کامل است، اما اطلاعات هنوز ارسال نشده است. برای ثبت واقعی باید فرم به بخش استخدام سایت Yii2 متصل شود.", "info");
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "در حال ارسال…";
      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        credentials: "same-origin",
        headers: { "Accept": "application/json" }
      }).then(function (response) {
        if (!response.ok) throw new Error("submit_failed");
        return response.json();
      }).then(function(result) {
        if (result.success !== true) throw new Error("submit_failed");
        showStatus("درخواست شما با موفقیت ارسال شد. همکاران منابع انسانی پس از بررسی با شما تماس خواهند گرفت.", "success");
        form.reset();
        if (resumeName) resumeName.textContent = "هنوز فایلی انتخاب نشده است";
        updateReview();
      }).catch(function () {
        showStatus("ارسال درخواست انجام نشد. لطفاً دوباره تلاش کنید یا با واحد منابع انسانی تماس بگیرید.", "error");
      }).finally(function () {
        submitButton.disabled = false;
        submitButton.textContent = "ثبت درخواست همکاری";
      });
    });

  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupBrands();
    setupProducts();
    setupCareers();
    setupReveal();

  });
})();
