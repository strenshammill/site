/* ═══════════════════════════════════════════════════════════════
   STRENSHAM MILL MOORINGS — site script
   No dependencies. Every feature degrades safely if its markup
   is absent, so the same file loads on every page.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ───────────────────────────────────────────────────────────
     1. MOBILE NAVIGATION
     Wired first and independently of everything else.
     ─────────────────────────────────────────────────────────── */
  (function nav() {
    var toggle = document.getElementById("nav-toggle");
    var panel = document.getElementById("nav-mobile");
    if (!toggle || !panel) return;

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      panel.hidden = true;
      toggle.textContent = "Menu";
    }

    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") { closeMenu(); return; }
      toggle.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      toggle.textContent = "Close";
    });

    panel.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        toggle.focus();
      }
    });
  })();

  /* ───────────────────────────────────────────────────────────
     2. FAQ — single-open accordion
     Native <details> siblings stay open independently, so this
     closes the others whenever one is opened.
     ─────────────────────────────────────────────────────────── */
  (function accordion() {
    var groups = document.querySelectorAll("[data-accordion]");
    Array.prototype.forEach.call(groups, function (group) {
      var items = group.querySelectorAll("details");
      Array.prototype.forEach.call(items, function (item) {
        item.addEventListener("toggle", function () {
          if (!item.open) return;
          Array.prototype.forEach.call(items, function (other) {
            if (other !== item) other.open = false;
          });
        });
      });
    });
  })();

  /* ───────────────────────────────────────────────────────────
     3. LIGHTBOX
     Built from the gallery buttons already in the page, so the
     photographs remain plain links-free images without JS.
     ─────────────────────────────────────────────────────────── */
  (function lightbox() {
    var gallery = document.getElementById("gallery-grid");
    if (!gallery) return;

    var triggers = Array.prototype.slice.call(gallery.querySelectorAll("button[data-full]"));
    if (!triggers.length) return;

    var box = document.getElementById("lightbox");
    var img = document.getElementById("lb-img");
    var counter = document.getElementById("lb-count");
    var btnClose = document.getElementById("lb-close");
    var btnPrev = document.getElementById("lb-prev");
    var btnNext = document.getElementById("lb-next");
    if (!box || !img) return;

    var index = 0;
    var opener = null;

    function show(i) {
      index = (i + triggers.length) % triggers.length;
      var t = triggers[index];
      img.src = t.getAttribute("data-full");
      img.alt = t.getAttribute("data-alt") || "";
      if (counter) counter.textContent = (index + 1) + " of " + triggers.length;
    }

    function open(i, from) {
      opener = from || null;
      show(i);
      box.hidden = false;
      document.body.style.overflow = "hidden";
      if (btnClose) btnClose.focus();
    }

    function close() {
      box.hidden = true;
      img.src = "";
      document.body.style.overflow = "";
      if (opener) opener.focus();
    }

    triggers.forEach(function (t, i) {
      t.addEventListener("click", function () { open(i, t); });
    });

    if (btnClose) btnClose.addEventListener("click", close);
    if (btnPrev) btnPrev.addEventListener("click", function () { show(index - 1); });
    if (btnNext) btnNext.addEventListener("click", function () { show(index + 1); });

    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });

    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  })();

  /* ───────────────────────────────────────────────────────────
     4. FOOTER YEAR
     ─────────────────────────────────────────────────────────── */
  (function year() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  })();

  /* ───────────────────────────────────────────────────────────
     5. SCROLL CHROME — reading progress + header condense
     One scroll listener, throttled with requestAnimationFrame.
     ─────────────────────────────────────────────────────────── */
  (function scrollChrome() {
    var bar = document.getElementById("progress");
    var header = document.querySelector(".site-header");
    if (!bar && !header) return;

    var ticking = false;
    function update() {
      var st = window.pageYOffset || document.documentElement.scrollTop;
      if (bar) {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        bar.style.width = (max > 0 ? (st / max) * 100 : 0) + "%";
      }
      if (header) {
        header.classList.toggle("is-condensed", st > 40);
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  /* ───────────────────────────────────────────────────────────
     6. STAT COUNTERS
     Counts each [data-count] up to its target once it scrolls
     into view. Respects reduced-motion (shows final value).
     ─────────────────────────────────────────────────────────── */
  (function counters() {
    var nums = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    if (!nums.length) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      nums.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
      return;
    }

    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var start = null, dur = 1100;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);        // easeOutCubic
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = String(target);
      }
      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { el.textContent = "0"; io.observe(el); });
  })();

  /* ───────────────────────────────────────────────────────────
     7. SCROLL REVEAL  (AOS-compatible)
     Runs last, so the mobile nav above is always wired first and
     independently. Reveals each [data-aos] element once, as it
     scrolls into view. Reads data-aos-delay (ms) if present.
     ─────────────────────────────────────────────────────────── */
  (function reveal() {
    var root = document.documentElement;
    root.classList.add("aos-done");   // cancels the head-guard fallback timer

    var els = Array.prototype.slice.call(document.querySelectorAll("[data-aos]"));
    if (!els.length) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* No motion, or no observer support: show everything at once. */
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("aos-in"); });
      return;
    }

    /* Commit the hidden start state to the screen before anything is
       revealed. Without this the browser can batch the opacity:0 and
       the reveal into one frame, and the transition never runs. */
    void document.body.offsetHeight;

    function show(el, delay) {
      var dur = parseInt(el.getAttribute("data-aos-duration") || "0", 10);
      if (dur) el.style.transitionDuration = dur + "ms";
      if (delay) {
        setTimeout(function () { el.classList.add("aos-in"); }, delay);
      } else {
        el.classList.add("aos-in");
      }
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        show(el, parseInt(el.getAttribute("data-aos-delay") || "0", 10));
        io.unobserve(el);
      });
    }, {
      /* threshold 0 so tall cards reveal as soon as any edge appears;
         the negative bottom margin holds them back until they are
         properly on screen rather than peeking. */
      rootMargin: "0px 0px -10% 0px",
      threshold: 0
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var onscreen = [];

        els.forEach(function (el) {
          var top = el.getBoundingClientRect().top;
          if (top < vh) onscreen.push(el); else io.observe(el);
        });

        /* Anything already on screen at load cascades down the page in
           document order, rather than the whole lot arriving at once.
           This is what makes a tall screen — or a preview pane with no
           scroll — still feel composed instead of lumpy. */
        onscreen.forEach(function (el, i) {
          var own = parseInt(el.getAttribute("data-aos-delay") || "0", 10);
          show(el, Math.min(i * 90, 700) + own);
        });
      });
    });
  })();
})();
