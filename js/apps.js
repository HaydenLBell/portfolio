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

  /* ---------- Project cards ---------- */
  function initProjectCards() {
    var cards = document.querySelectorAll(".card[data-project]");
    var dialog = document.getElementById("project-dialog");
    if (!cards.length || !dialog) return;

    var body = dialog.querySelector(".dialog-body");
    var closeBtn = dialog.querySelector(".dialog-close");

    cards.forEach(function (card) {
      card.addEventListener("click", function (e) {
        // 1. Ripple from the click point
        var rect = card.getBoundingClientRect();
        var ripple = document.createElement("span");
        ripple.className = "ripple";
        var x = e.clientX ? e.clientX - rect.left : rect.width / 2;
        var y = e.clientY ? e.clientY - rect.top : rect.height / 2;
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";
        card.appendChild(ripple);
        ripple.addEventListener("animationend", function () { ripple.remove(); });

        // 2. Press animation
        card.classList.remove("is-pressed");
        void card.offsetWidth; // restart animation
        card.classList.add("is-pressed");

        // 3. Open the details after the effect has a moment to play
        var details = card.querySelector(".card-details");
        setTimeout(function () {
          body.innerHTML = details ? details.innerHTML : "";
          if (typeof dialog.showModal === "function") dialog.showModal();
          else dialog.setAttribute("open", "");
        }, 220);
      });

      // Cards are divs with role="button", so give them keyboard support
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });

    closeBtn.addEventListener("click", function () { dialog.close(); });
    // Click on the backdrop closes it
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }
})();
