(function () {
  "use strict";

  var source = window.HEROSUN_DATA || {brands:[]};
  var activeLine = document.body.getAttribute('data-business-line') || 'spare';
  var data = {brands:(Array.isArray(source.brands)?source.brands:[]).filter(function(b){
    var line=b.businessLine||'spare';
    return !b.archived && b.published!==false && (line===activeLine||line==='both');
  })};

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

    var queryBrand=new URLSearchParams(location.search).get('brand');if(queryBrand&&search)search.value=queryBrand;
    render();
    fetch('managed-catalog-list.json', {cache:'no-store', credentials:'same-origin'})
      .then(function(response){if(!response.ok)throw new Error('catalog_unavailable');return response.json();})
      .then(function(result){if(!result.catalogs)throw new Error('invalid_catalog_response');data.brands.forEach(function(brand){var item=result.catalogs[brand.id];if(item){brand.catalogAvailable=item.available;if(item.url)brand.catalog=item.url;}});render();})
      .catch(function(){var message=document.createElement('p');message.className='hs-status';message.textContent='بررسی آنلاین کاتالوگ‌ها انجام نشد. می‌توانید دریافت مستقیم را امتحان کنید.';grid.before(message);});
  }

  setupNavigation();
  setupBrands();
  setupReveal();
})();
