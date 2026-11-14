/* =========================================================
   apps.js — loaded in the <head> of every page (no defer)
   so a saved theme is applied before the page paints.

   Theme: follows the system setting until the visitor uses
   the switch, then remembers their choice.
   ========================================================= */
(function () {
  var KEY = "theme";
  var root = document.documentElement;
  var systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
  if (saved === "light" || saved === "dark") {
    root.setAttribute("data-theme", saved);
  }

  function currentTheme() {
    var chosen = root.getAttribute("data-theme");
    if (chosen) {
      return chosen;
    }
    if (systemDark && systemDark.matches) {
      return "dark";
    }
    return "light";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".theme-toggle");
    if (!toggle) {
      return;
    }

    function sync() {
      var isDark = currentTheme() === "dark";
      toggle.setAttribute("aria-checked", isDark ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* storage blocked */ }
      sync();
    });

    // If the visitor hasn't picked a theme, keep the switch in step with the system
    if (systemDark && systemDark.addEventListener) {
      systemDark.addEventListener("change", sync);
    }

    sync();
  });

  /* ---------- Project page gallery ----------
     One big image, arrows, and a thumbnail per picture.
     Arrow keys work when the gallery has focus. */
  document.addEventListener("DOMContentLoaded", function () {
    var gallery = document.querySelector("[data-gallery]");
    if (!gallery) {
      return;
    }

    var stageImg = gallery.querySelector(".stage-img");
    var count = gallery.querySelector(".stage-count");
    var thumbs = gallery.querySelectorAll(".shot-thumb");
    var current = 0;

    function show(index) {
      if (index < 0) {
        index = thumbs.length - 1;
      }
      if (index >= thumbs.length) {
        index = 0;
      }
      current = index;

      var thumbImg = thumbs[index].querySelector("img");
      stageImg.src = thumbImg.src;
      stageImg.alt = thumbImg.alt;

      for (var i = 0; i < thumbs.length; i++) {
        thumbs[i].setAttribute("aria-current", i === index ? "true" : "false");
      }
      count.textContent = (index + 1) + " / " + thumbs.length;
    }

    for (var i = 0; i < thumbs.length; i++) {
      (function (index) {
        thumbs[index].addEventListener("click", function () { show(index); });
      })(i);
    }

    gallery.querySelector(".stage-arrow.prev").addEventListener("click", function () { show(current - 1); });
    gallery.querySelector(".stage-arrow.next").addEventListener("click", function () { show(current + 1); });

    gallery.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        show(current - 1);
      }
      if (event.key === "ArrowRight") {
        show(current + 1);
      }
    });

    show(0);
  });

  /* ---------- The shrimp ----------
     Swims in a few seconds after the page loads. Click it to make it spin.
     Every tenth click gets a bigger spin. */
  var SHRIMP_SVG =
    '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<g fill="none" stroke="#ad9466" stroke-width="1.4" stroke-linecap="round">' +
        '<path d="M10 27 C 4 20, 6 10, 16 5"/>' +
        '<path d="M10 30 C 2 29, 1 18, 7 11"/>' +
      '</g>' +
      '<g stroke="#7a1f35" stroke-width="1.6" stroke-linecap="round">' +
        '<path d="M20 32 L 16 42"/>' +
        '<path d="M25 29 L 22 40"/>' +
        '<path d="M30 26 L 28 38"/>' +
        '<path d="M35 25 L 34 36"/>' +
      '</g>' +
      '<path d="M41 44 L 33 52 L 39 51 L 41 56 L 46 47 Z" fill="#e8806e" stroke="#7a1f35" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<g fill="#e8806e" stroke="#7a1f35" stroke-width="1.6">' +
        '<circle cx="44" cy="40" r="5"/>' +
        '<circle cx="47.5" cy="33.5" r="6"/>' +
        '<circle cx="46" cy="26" r="7"/>' +
        '<circle cx="40" cy="20" r="8"/>' +
        '<circle cx="31" cy="18.5" r="8.5"/>' +
        '<circle cx="22.5" cy="22" r="9"/>' +
      '</g>' +
      '<path d="M8.5 30 C 9 22, 15 19, 22 21 C 25 25, 25 33, 19 37 C 14 38, 9 35, 8.5 30 Z" fill="#f09382" stroke="#7a1f35" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<circle cx="13.5" cy="27" r="2.4" fill="#1d2327"/>' +
      '<circle cx="12.8" cy="26.2" r="0.8" fill="#ffffff"/>' +
    '</svg>';

  var REACTIONS = ["!", "hi!", "wheee", "again?", "♪", "hehe", "blub", "♥"];

  document.addEventListener("DOMContentLoaded", function () {
    var shrimp = document.createElement("button");
    shrimp.type = "button";
    shrimp.className = "shrimp";
    shrimp.setAttribute("aria-label", "Spin the shrimp");
    shrimp.innerHTML = '<span class="shrimp-body">' + SHRIMP_SVG + "</span>";
    document.body.appendChild(shrimp);

    var clicks = 0;
    var busy = false;

    // swim in after a short wait
    setTimeout(function () {
      shrimp.classList.add("is-here");
    }, 2500);

    function blowBubbles(count) {
      for (var i = 0; i < count; i++) {
        var bubble = document.createElement("span");
        bubble.className = "shrimp-bubble";
        bubble.style.animationDelay = (i * 0.12) + "s";
        bubble.style.setProperty("--drift", (Math.random() * 20 - 14) + "px");
        shrimp.appendChild(bubble);
        removeLater(bubble, 1500 + i * 120);
      }
    }

    function say(text) {
      var old = shrimp.querySelector(".shrimp-say");
      if (old) {
        old.remove();
      }
      var bubble = document.createElement("span");
      bubble.className = "shrimp-say";
      bubble.textContent = text;
      shrimp.appendChild(bubble);
      removeLater(bubble, 1500);
    }

    function removeLater(element, ms) {
      setTimeout(function () {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, ms);
    }

    shrimp.addEventListener("click", function () {
      if (busy) {
        return;
      }
      busy = true;
      clicks = clicks + 1;

      var big = clicks % 10 === 0;
      if (big) {
        shrimp.classList.add("is-big");
        say("you found the shrimp");
        blowBubbles(6);
      } else {
        say(REACTIONS[(clicks - 1) % REACTIONS.length]);
        blowBubbles(3);
      }

      shrimp.classList.add("is-spinning");
      setTimeout(function () {
        shrimp.classList.remove("is-spinning");
        shrimp.classList.remove("is-big");
        busy = false;
      }, big ? 1200 : 750);
    });
  });
})();
