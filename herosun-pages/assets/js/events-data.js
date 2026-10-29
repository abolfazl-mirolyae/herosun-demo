/* برای انتشار، اطلاعات واقعی را جایگزین و published را true کنید.
مسیر عکس‌ها و ویدیوها نسبت به events.html است. فایل‌ها در media/events/ آپلود شوند.
می‌توانید شیء نمونه را برای هر همایش کپی کنید. id هر رویداد باید یکتا باشد. */
window.HEROSUN_EVENTS = [
  {
    id: "hamayesh-01",
    published: false,
    title: "عنوان همایش",
    category: "همایش",
    date: "تاریخ برگزاری",
    city: "شهر محل برگزاری",
    description: "توضیح کوتاه درباره برنامه، موضوعات و شرکت‌کنندگان همایش.",
    cover: "media/events/hamayesh-01/cover.jpg",
    photos: [
      { src: "media/events/hamayesh-01/01.jpg", caption: "توضیح عکس اول" },
      { src: "media/events/hamayesh-01/02.jpg", caption: "توضیح عکس دوم" }
    ],
    videos: [
      { src: "media/events/hamayesh-01/video.mp4", caption: "گزارش ویدیویی همایش", poster: "media/events/hamayesh-01/cover.jpg" }
    ]
  }
];
