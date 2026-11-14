/* =========================================================
   Portfolio — shared script (apps.js)
   Loaded in the <head> of every page WITHOUT defer so the
   saved theme is applied before the page paints (no flash).
   Everything else waits for DOMContentLoaded.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Theme: apply saved choice immediately ---------- */
  var STORAGE_KEY = "portfolio-theme";
  var root = document.documentElement;

  function readStoredTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function storeTheme(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage blocked */ }
  }
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function currentTheme() {
    return root.getAttribute("data-theme") || (systemPrefersDark() ? "dark" : "light");
  }

  var saved = readStoredTheme();
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  document.addEventListener("DOMContentLoaded", function () {
    initThemeToggle();
    initMobileMenu();
    initCarousel();
    initProjectCards();
    initGallery();
    initFooterYear();
  });

  /* ---------- Theme toggle switch ---------- */
  function initThemeToggle() {
    var toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    function sync() {
      toggle.setAttribute("aria-checked", currentTheme() === "dark" ? "true" : "false");
    }
    sync();

    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      storeTheme(next);
      sync();
    });

    // If the visitor hasn't chosen, follow OS changes live
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        if (!readStoredTheme()) sync();
      });
    }
  }

  /* ---------- Mobile nav ---------- */
  function initMobileMenu() {
    var btn = document.querySelector(".menu-btn");
    var links = document.getElementById("nav-links");
    if (!btn || !links) return;

    btn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Carousel ---------- */
  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) return;

    var track = carousel.querySelector(".carousel-track");
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".slide"));
    var prev = carousel.querySelector(".carousel-arrow.prev");
    var next = carousel.querySelector(".carousel-arrow.next");
    var dotsWrap = document.querySelector("[data-carousel-dots]");
    var interval = parseInt(carousel.getAttribute("data-interval"), 10) || 0; // ms, 0 = off
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index = 0;
    var timer = null;

    if (slides.length === 0) return;

    // Build one dot per slide so adding a slide is just adding HTML
    var dots = slides.map(function (slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      slides.forEach(function (s, n) {
        s.setAttribute("aria-hidden", n === index ? "false" : "true");
        s.querySelectorAll("a, button").forEach(function (el) {
          el.tabIndex = n === index ? 0 : -1;
        });
      });
      dots.forEach(function (d, n) {
        d.setAttribute("aria-current", n === index ? "true" : "false");
      });
    }

    function start() {
      if (!interval || reduceMotion || slides.length < 2) return;
      stop();
      timer = setInterval(function () { goTo(index + 1); }, interval);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    if (prev) prev.addEventListener("click", function () { goTo(index - 1); restart(); });
    if (next) next.addEventListener("click", function () { goTo(index + 1); restart(); });

    // Keyboard arrows when the carousel has focus
    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { goTo(index - 1); restart(); }
      if (e.key === "ArrowRight") { goTo(index + 1); restart(); }
    });

    // Swipe on touch screens
    var startX = null;
    carousel.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { goTo(index + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    });

    // Pause auto-advance while the visitor is interacting
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);

    goTo(0);
    start();
  }

  /* ---------- Project cards ----------
     Cards are links to their own page. On a normal click we play the
     ripple + press effect first, then follow the link. Ctrl/Cmd/middle
     click still opens in a new tab as usual. */
  function initProjectCards() {
    var cards = document.querySelectorAll(".card[data-project]");
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener("click", function (e) {
        var href = card.getAttribute("href");
        if (!href || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();

        // 1. Ripple from the click point (centre if opened with the keyboard)
        var rect = card.getBoundingClientRect();
        var ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = (e.clientX ? e.clientX - rect.left : rect.width / 2) + "px";
        ripple.style.top = (e.clientY ? e.clientY - rect.top : rect.height / 2) + "px";
        card.appendChild(ripple);
        ripple.addEventListener("animationend", function () { ripple.remove(); });

        // 2. Press animation
        card.classList.remove("is-pressed");
        void card.offsetWidth; // restart animation
        card.classList.add("is-pressed");

        // 3. Go to the project page once the effect has played
        setTimeout(function () { window.location.href = href; }, 260);
      });
    });

    // Clear the pressed state if the visitor comes back with the Back button
    window.addEventListener("pageshow", function () {
      cards.forEach(function (c) { c.classList.remove("is-pressed"); });
    });
  }

  /* ---------- Project page gallery (Steam-style) ---------- */
  function initGallery() {
    var gallery = document.querySelector("[data-gallery]");
    if (!gallery) return;

    var stage = gallery.querySelector(".stage");
    var img = gallery.querySelector(".stage-img");
    var video = gallery.querySelector(".stage-video");
    var counter = gallery.querySelector(".stage-count");
    var strip = gallery.querySelector(".thumb-strip");
    var thumbs = Array.prototype.slice.call(gallery.querySelectorAll(".shot-thumb"));
    var lightbox = document.querySelector(".lightbox");
    var index = 0;

    if (!thumbs.length) return;

    function show(i) {
      index = (i + thumbs.length) % thumbs.length;
      var t = thumbs[index];

      if (t.dataset.video) {
        img.hidden = true;
        video.hidden = false;
        if (video.getAttribute("src") !== t.dataset.video) video.src = t.dataset.video;
      } else {
        if (!video.hidden) { video.pause(); video.hidden = true; }
        img.hidden = false;
        img.src = t.dataset.src;
        var thumbImg = t.querySelector("img");
        img.alt = thumbImg ? thumbImg.alt : "";
        img.classList.remove("fade-in");
        void img.offsetWidth;
        img.classList.add("fade-in");
      }

      thumbs.forEach(function (th, n) {
        th.setAttribute("aria-current", n === index ? "true" : "false");
      });
      if (counter) counter.textContent = (index + 1) + " / " + thumbs.length;

      // Keep the active thumbnail in view without scrolling the page
      strip.scrollTo({
        left: t.offsetLeft - strip.clientWidth / 2 + t.clientWidth / 2,
        behavior: "smooth"
      });
    }

    thumbs.forEach(function (t, n) {
      t.addEventListener("click", function () { show(n); });
    });

    gallery.querySelector(".stage .prev").addEventListener("click", function () { show(index - 1); });
    gallery.querySelector(".stage .next").addEventListener("click", function () { show(index + 1); });

    // Small arrows under the image step through the screenshots too
    gallery.querySelectorAll(".strip-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        show(index + (btn.classList.contains("prev") ? -1 : 1));
      });
    });

    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });

    var startX = null;
    stage.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });

    // Click the big image to view it full size
    if (lightbox && typeof lightbox.showModal === "function") {
      var lbImg = lightbox.querySelector("img");
      img.addEventListener("click", function () {
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lightbox.showModal();
      });
      lightbox.addEventListener("click", function () { lightbox.close(); });
    }

    show(0);
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }
})();
