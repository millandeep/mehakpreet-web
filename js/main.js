document.addEventListener("DOMContentLoaded", function () {
  initNavToggle();
  initScrollReveal();
  initBannerRotation();
  setFooterYear();
});

function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  if (!toggle || !navList) return;

  toggle.addEventListener("click", function () {
    const isOpen = navList.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navList.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navList.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
}

function initBannerRotation() {
  const banner = document.querySelector(".banner");
  if (!banner) return;

  const slides = banner.querySelectorAll(".banner-slide");
  const dotsWrap = banner.querySelector(".banner-dots");
  const prevBtn = banner.querySelector(".banner-arrow.prev");
  const nextBtn = banner.querySelector(".banner-arrow.next");
  let current = 0;
  let timer;
  const INTERVAL = 5500;

  function show(index) {
    slides.forEach((s, i) => s.classList.toggle("active", i === index));
    if (dotsWrap) {
      dotsWrap.querySelectorAll("button").forEach((d, i) => {
        d.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }
    current = index;
  }

  function next() {
    show((current + 1) % slides.length);
  }

  function prev() {
    show((current - 1 + slides.length) % slides.length);
  }

  function restartTimer() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }

  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Show slide " + (i + 1));
      dot.setAttribute("aria-current", i === 0 ? "true" : "false");
      dot.addEventListener("click", function () {
        show(i);
        restartTimer();
      });
      dotsWrap.appendChild(dot);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      next();
      restartTimer();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      prev();
      restartTimer();
    });
  }

  show(0);
  restartTimer();

  banner.addEventListener("mouseenter", () => clearInterval(timer));
  banner.addEventListener("mouseleave", restartTimer);
}

function setFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
