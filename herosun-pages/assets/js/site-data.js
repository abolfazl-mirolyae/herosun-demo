/*
  مدیریت محتوای صفحات هیروسان

  برای افزودن کاتالوگ، فایل PDF را در پوشه catalogs قرار دهید و مسیر آن را
  در ویژگی catalog برند بنویسید. مثال:
  catalog: "catalogs/gisp.pdf"

  برای افزودن تصویر محصول، تصویر را در assets/images/products قرار دهید و
  مسیر آن را در ویژگی image محصول وارد کنید.
*/

window.HEROSUN_DATA = {
  recruitmentEndpoint: "",

  brands: [
    {
      id: "gisp",
      name: "GISP Group",
      logo: "assets/images/brands/gisp.png",
      category: "قطعات یدکی خودرو",
      description: "تأمین قطعات منتخب خودرو برای شبکه فروش و همکاران هیروسان.",
      catalog: "catalogs/gisp.pdf"
    },
    {
      id: "lenzo",
      name: "LENZO",
      logo: "assets/images/brands/lenzo.png",
      category: "روشنایی و تزیینات",
      description: "محصولات روشنایی، هدلایت و تجهیزات کاربردی خودرو.",
      catalog: "catalogs/lenzo.pdf"
    },
    {
      id: "mashhad-wheel",
      name: "Mashhad Wheel",
      logo: "assets/images/brands/mashhad-wheel.png",
      category: "رینگ و چرخ",
      description: "محصولات تخصصی حوزه رینگ و تجهیزات مرتبط با چرخ خودرو.",
      catalog: "catalogs/mashhad-wheel.pdf"
    },
    {
      id: "tng",
      name: "تکنیک گستر",
      logo: "assets/images/brands/tng.png",
      category: "قطعات یدکی خودرو",
      description: "تولید و عرضه قطعات خودرویی برای بازار قطعات یدکی.",
      catalog: "catalogs/tng.pdf"
    },
    {
      id: "raizhen-part",
      name: "رایژن پارت",
      logo: "assets/images/brands/raizhen-part.png",
      category: "قطعات یدکی خودرو",
      description: "مجموعه‌ای از قطعات مصرفی و کاربردی خودرو.",
      catalog: "catalogs/raizhen-part.pdf"
    },
    {
      id: "kpi",
      name: "KPI New",
      logo: "assets/images/brands/kpi.png",
      category: "قطعات یدکی خودرو",
      description: "محصولات منتخب برای تکمیل سبد قطعات فروشگاه‌های همکار.",
      catalog: "catalogs/kpi.pdf"
    },
    {
      id: "adler",
      name: "ADLER",
      logo: "assets/images/brands/adler.png",
      category: "قطعات یدکی خودرو",
      description: "برندی همکار در سبد تأمین و توزیع هیروسان.",
      catalog: "catalogs/adler.pdf"
    },
    {
      id: "v-part",
      name: "V-Part",
      logo: "assets/images/brands/v-part.png",
      category: "قطعات یدکی خودرو",
      description: "قطعات کاربردی خودرو با تمرکز بر تأمین پایدار بازار.",
      catalog: "catalogs/v-part.pdf"
    },
    {
      id: "karmatec",
      name: "Karmatec",
      logo: "assets/images/brands/karmatec.png",
      category: "قطعات یدکی خودرو",
      description: "یکی از برندهای حاضر در شبکه همکاری هیروسان.",
      catalog: "catalogs/karmatec.pdf"
    },
    {
      id: "parsian",
      name: "گروه قطعه پارسیان",
      logo: "assets/images/brands/parsian.png",
      category: "قطعات یدکی خودرو",
      description: "تأمین قطعات موردنیاز بازار و فروشگاه‌های قطعات خودرو.",
      catalog: "catalogs/parsian.pdf"
    },
    {
      id: "pishro-sadra",
      name: "پیشرو صدرا",
      logo: "assets/images/brands/pishro-sadra.png",
      category: "قطعات یدکی خودرو",
      description: "برند همکار در زنجیره تأمین و توزیع منطقه‌ای هیروسان.",
      catalog: "catalogs/pishro-sadra.pdf"
    },
    {
      id: "modern-tandis",
      name: "مدرن تندیس",
      logo: "assets/images/brands/modern-tandis.png",
      category: "قطعات یدکی خودرو",
      description: "محصولات منتخب برای سبد فروش فروشگاه‌های همکار.",
      catalog: "catalogs/modern-tandis.pdf"
    },
    {
      id: "ngco",
      name: "NG.CO",
      logo: "assets/images/brands/ngco.png",
      category: "قطعات یدکی خودرو",
      description: "یکی از برندهای تجاری همکار با مجموعه هیروسان.",
      catalog: "catalogs/ngco.pdf"
    },
    {
      id: "pars-nikan",
      name: "پارس نیکان",
      logo: "assets/images/brands/pars-nikan.png",
      category: "قطعات یدکی خودرو",
      description: "عرضه محصولات خودرویی متناسب با نیاز شبکه فروش.",
      catalog: "catalogs/pars-nikan.pdf"
    },
    {
      id: "mahrsaz",
      name: "مهرساز",
      logo: "assets/images/brands/mahrsaz.png",
      category: "قطعات بدنه",
      description: "تأمین قطعات بدنه برای فروشگاه‌ها و همکاران بازار قطعات خودرو.",
      catalog: "catalogs/mahrsaz.pdf"
    },
    {
      id: "fpd",
      name: "FPD",
      logo: "assets/images/brands/fpd.png",
      category: "قطعات یدکی خودرو",
      description: "محصولات منتخب برای تکمیل سبد قطعات خودرویی هیروسان.",
      catalog: "catalogs/fpd.pdf"
    }
  ],

  products: [
    {
      id: "lenzo-s200",
      title: "هدلایت S200 لنزو",
      brand: "LENZO",
      category: "روشنایی و تزیینات",
      code: "",
      image: "",
      description: "هدلایت خودرو با طراحی حرفه‌ای برای ارتقای روشنایی و دید راننده.",
      initial: "L"
    },
    {
      id: "lenzo-f16",
      title: "جا موبایلی آهنربایی F16",
      brand: "LENZO",
      category: "لوازم جانبی",
      code: "",
      image: "",
      description: "نگهدارنده آهنربایی موبایل با طراحی جمع‌وجور و استفاده آسان.",
      initial: "F"
    },
    {
      id: "mahrsaz-bumper",
      title: "سپر خودرو مهرساز",
      brand: "مهرساز",
      category: "قطعات بدنه",
      code: "",
      image: "",
      description: "قطعه بدنه مناسب بازار یدکی و شبکه فروش قطعات خودرو.",
      initial: "م"
    },
    {
      id: "noorpart-spark",
      title: "شمع خودرو نور پارت",
      brand: "نور پارت",
      category: "قطعات موتوری",
      code: "",
      image: "",
      description: "قطعه مصرفی موتور برای احتراق پایدار و عملکرد مناسب خودرو.",
      initial: "ن"
    },
    {
      id: "risco-bearing",
      title: "بلبرینگ چرخ خودرو",
      brand: "RISCO",
      category: "بلبرینگ",
      code: "",
      image: "",
      description: "بلبرینگ مناسب برای مجموعه چرخ و کاربردهای خودرویی.",
      initial: "R"
    },
    {
      id: "mpnco-piston",
      title: "پیستون موتور خودرو",
      brand: "MPNCO",
      category: "قطعات موتوری",
      code: "",
      image: "",
      description: "قطعه تخصصی موتور برای تکمیل سبد محصولات موتوری فروشگاه‌ها.",
      initial: "M"
    },
    {
      id: "gisp-clutch",
      title: "کیت کلاچ پژو ۴۰۵، پارس و سمند",
      brand: "GISP Group",
      category: "نیرو محرکه و گیربکس",
      code: "",
      image: "",
      description: "مجموعه کلاچ مناسب خودروهای منتخب گروه ایران‌خودرو.",
      initial: "G"
    },
    {
      id: "gisp-shift",
      title: "مجموعه کامل تعویض دنده",
      brand: "GISP Group",
      category: "نیرو محرکه و گیربکس",
      code: "",
      image: "",
      description: "مجموعه تعویض دنده برای تأمین نیاز بازار قطعات یدکی.",
      initial: "G"
    },
    {
      id: "wheel-206",
      title: "رینگ چرخ پژو ۲۰۶",
      brand: "Mashhad Wheel",
      category: "رینگ و چرخ",
      code: "",
      image: "",
      description: "رینگ چرخ متناسب با پژو ۲۰۶ برای شبکه فروش قطعات خودرو.",
      initial: "W"
    }
  ]
};
