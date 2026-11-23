/* SOLACE — Intelligent Audio. Vanilla JS, no build step, works on file:// */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var body = document.body;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;
  var vh = function () { return window.innerHeight; };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- text roll: duplicate label ---------- */
  $$("[data-roll]").forEach(function (el) {
    var t = el.textContent.trim();
    el.innerHTML = '<span class="roll"><span data-t="' + t.replace(/"/g, "&quot;") + '">' + t + "</span></span>";
  });

  /* ---------- toast ---------- */
  var toastEl = document.createElement("div"); toastEl.className = "toast label"; body.appendChild(toastEl);
  var toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("on"); }, 2200); }

  /* ---------- preloader (home only, once per session) ---------- */
  var pre = $(".preloader");
  function heroIn() { $$(".hero .reveal-up").forEach(function (el, i) { setTimeout(function () { el.classList.add("is-in"); }, 120 * i); }); }
  if (pre) {
    var seen = false; try { seen = sessionStorage.getItem("solace-intro") === "1"; } catch (e) {}
    if (seen || reduced) { pre.remove(); body.classList.remove("is-loading"); heroIn(); }
    else {
      try { sessionStorage.setItem("solace-intro", "1"); } catch (e) {}
      setTimeout(function () { pre.classList.add("step-2"); }, 2700);
      setTimeout(function () { pre.classList.add("step-3"); }, 2900);
      setTimeout(function () { pre.classList.add("is-done"); body.classList.remove("is-loading"); heroIn(); }, 4300);
      setTimeout(function () { pre.remove(); }, 5000);
    }
  } else { heroIn(); }

  /* ---------- smooth wheel scroll (desktop) ---------- */
  var target = window.scrollY, current = window.scrollY, smoothing = false;
  if (!isTouch && !reduced) {
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey || body.classList.contains("is-locked") || body.classList.contains("is-loading")) { if (body.classList.contains("is-loading")) e.preventDefault(); return; }
      if (e.target.closest && e.target.closest(".panel, .cart-list, .nav__mobile")) return;
      e.preventDefault();
      if (!smoothing) { target = current = window.scrollY; }
      var max = document.documentElement.scrollHeight - vh();
      target = clamp(target + e.deltaY * (e.deltaMode === 1 ? 32 : 1), 0, max);
      if (!smoothing) { smoothing = true; requestAnimationFrame(loop); }
    }, { passive: false });
    window.addEventListener("keydown", function () { smoothing = false; });
    function loop() {
      current += (target - current) * 0.1;
      if (Math.abs(target - current) < 0.5) { current = target; smoothing = false; }
      window.scrollTo(0, current);
      if (smoothing) requestAnimationFrame(loop);
    }
  }
  function scrollToY(y) { if (smoothing) { target = y; } else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" }); }

  /* ---------- header scroll state ---------- */
  var darkSecs = $$("[data-dark]");
  function onScrollHeader() {
    var y = window.scrollY;
    body.classList.toggle("scrolled", y > 60);
    var onDark = false;
    for (var i = 0; i < darkSecs.length; i++) { var r = darkSecs[i].getBoundingClientRect(); if (r.top < 40 && r.bottom > 40) { onDark = true; break; } }
    body.classList.toggle("on-dark", onDark);
  }

  /* ---------- menu, panels, cookie ---------- */
  var menuBtn = $(".hdr__menu");
  function closeAll() { body.classList.remove("menu-open", "panel-open", "is-locked"); $$(".panel.is-open").forEach(function (p) { p.classList.remove("is-open"); }); }
  if (menuBtn) menuBtn.addEventListener("click", function () {
    var open = !body.classList.contains("menu-open");
    closeAll(); if (open) { body.classList.add("menu-open", "is-locked"); smoothing = false; }
  });
  $$(".nav-overlay").forEach(function (o) { o.addEventListener("click", closeAll); });
  function openPanel(id) { closeAll(); var p = $("#" + id); if (!p) return; p.classList.add("is-open"); body.classList.add("panel-open", "is-locked"); smoothing = false; }
  $$("[data-open]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); openPanel(b.getAttribute("data-open")); }); });
  $$(".panel [data-close]").forEach(function (b) { b.addEventListener("click", closeAll); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeAll(); closeFilm(); closeLight(); } });

  var cookie = $(".cookie");
  if (cookie) {
    if (store.get("solace-cookie", null)) cookie.remove();
    else $$(".cookie [data-c]").forEach(function (b) { b.addEventListener("click", function () { store.set("solace-cookie", b.getAttribute("data-c")); cookie.classList.add("is-hidden"); setTimeout(function () { cookie.remove(); }, 700); }); });
  }

  /* ---------- account form (validates, never submits anywhere) ---------- */
  var acc = $("#acc-form");
  if (acc) acc.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = acc.querySelector(".field"), m = acc.querySelector(".err-msg");
    var ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value);
    f.classList.toggle("is-error", !ok);
    m.textContent = ok ? "Demo only — accounts open at launch." : "Please enter a valid email address.";
  });

  /* ---------- cart ---------- */
  var cart = store.get("solace-cart", []);
  function money(n) { return "$" + n; }
  function renderCart() {
    var count = cart.reduce(function (a, i) { return a + i.q; }, 0);
    $$("[data-cart-count]").forEach(function (el) { el.textContent = "(" + count + ")"; });
    $$(".roll-cart").forEach(function (el) { el.innerHTML = '<span class="roll"><span data-t="Cart (' + count + ')">Cart (' + count + ")</span></span>"; });
    var empty = $("#cart .cart-empty"), list = $("#cart .cart-list"), foot = $("#cart .cart-foot");
    if (!empty) return;
    empty.hidden = count > 0; list.hidden = foot.hidden = count === 0;
    list.innerHTML = cart.map(function (it, idx) {
      return '<div class="cart-item"><img src="' + it.img + '" alt=""><div><p class="t-small">' + it.name + '</p><p class="t-xs" style="color:var(--muted)">' + it.opt + '</p><span class="qty t-xs"><button data-q="-1" data-i="' + idx + '">−</button>' + it.q + '<button data-q="1" data-i="' + idx + '">+</button></span><br><button class="rm t-xs" data-rm="' + idx + '">Remove</button></div><p class="label">' + money(it.price * it.q) + "</p></div>";
    }).join("");
    var total = cart.reduce(function (a, i) { return a + i.q * i.price; }, 0);
    $("#cart .cart-total").textContent = money(total);
  }
  function addToCart(item) {
    var f = cart.filter(function (c) { return c.name === item.name && c.opt === item.opt; })[0];
    if (f) f.q++; else { item.q = 1; cart.push(item); }
    store.set("solace-cart", cart); renderCart(); openPanel("cart");
  }
  document.addEventListener("click", function (e) {
    var q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]");
    if (q) { var it = cart[+q.dataset.i]; it.q = Math.max(1, it.q + +q.dataset.q); }
    else if (rm) { cart.splice(+rm.dataset.rm, 1); }
    else return;
    store.set("solace-cart", cart); renderCart();
  });
  var checkout = $("#cart .checkout");
  if (checkout) checkout.addEventListener("click", function () { toast("Checkout opens with pre-orders"); });
  renderCart();

  /* ---------- newsletter (no request; validation only) ---------- */
  $$(".ftr__form").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var i = f.querySelector("input"), m = f.parentNode.querySelector(".ftr__msg");
      var ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value);
      m.textContent = ok ? "Thank you — you are on the list." : "Please enter a valid email address.";
      if (ok) i.value = "";
    });
  });

  /* ---------- reveal on view ---------- */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { threshold: .2 });
  $$(".chapter, [data-inview]").forEach(function (el) { io.observe(el); });
  $$(".chapter__big").forEach(function (el) {
    var t = el.textContent; el.innerHTML = t.split("").map(function (c, i) { return c === " " ? " " : '<span class="ch" style="--i:' + i + '">' + c + "</span>"; }).join("");
  });

  /* ---------- word-by-word scroll reveal ---------- */
  function splitWords(root) {
    var walk = function (node) {
      $$(":scope > *", node);
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w));
            else { var s = document.createElement("span"); s.className = "w"; s.textContent = w; frag.appendChild(s); }
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains("manifesto__pop") && n.tagName !== "svg") {
          if (n.classList.contains("ico")) n.classList.add("w"); else walk(n);
        }
      });
    };
    walk(root);
    return $$(".w", root);
  }
  var revealSets = $$("[data-words]").map(function (el) { return { el: el, sec: el.closest("[data-words-sec]") || el, words: splitWords(el) }; });
  function onReveal() {
    revealSets.forEach(function (s) {
      var r = s.sec.getBoundingClientRect();
      var total = Math.max(1, r.height - vh() * .6);
      var p = clamp((-r.top + vh() * .35) / total, 0, 1);
      if (s.sec === s.el) p = clamp((vh() * .85 - r.top) / (vh() * .6), 0, 1);
      var n = Math.round(p * s.words.length);
      s.words.forEach(function (w, i) { w.classList.toggle("on", i < n); });
    });
  }

  /* ---------- film thumb + modal ---------- */
  var film = $(".film-modal"), thumb = $(".film-thumb"), filmT, filmI = 0;
  var manif = $(".manifesto");
  function openFilm() {
    if (!film) return; film.classList.add("is-open"); body.classList.add("is-locked"); smoothing = false;
    var imgs = $$(".film-modal__media img", film), caps = film.getAttribute("data-caps").split("|"), cap = $(".film-modal__cap", film), bar = $(".track i", film);
    filmI = 0; var step = function () {
      imgs.forEach(function (im, i) { im.classList.toggle("on", i === filmI); });
      cap.textContent = caps[filmI % caps.length];
      bar.style.transition = "none"; bar.style.width = (filmI / imgs.length * 100) + "%";
      requestAnimationFrame(function () { bar.style.transition = "width 4.5s linear"; bar.style.width = ((filmI + 1) / imgs.length * 100) + "%"; });
      filmI = (filmI + 1) % imgs.length;
    };
    step(); clearInterval(filmT); filmT = setInterval(step, 4500);
  }
  function closeFilm() { if (!film || !film.classList.contains("is-open")) return; film.classList.remove("is-open"); body.classList.remove("is-locked"); clearInterval(filmT); }
  $$("[data-film]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); openFilm(); }); });
  if (film) { $(".film-modal__close", film).addEventListener("click", closeFilm); var pp = $("[data-pause]", film); if (pp) pp.addEventListener("click", function () { if (filmT) { clearInterval(filmT); filmT = null; pp.innerHTML = '<svg viewBox="0 0 8 10" width="8"><path d="M0 0l8 5-8 5z" fill="currentColor"/></svg>'; } else { openFilm(); pp.innerHTML = '<svg viewBox="0 0 8 10" width="8"><path d="M0 0h3v10H0zM5 0h3v10H5z" fill="currentColor"/></svg>'; } }); }
  function onFilmThumb() {
    if (!thumb || !manif || window.innerWidth < 768) return;
    var r = manif.getBoundingClientRect();
    thumb.classList.toggle("is-on", r.top < vh() * .2 && r.bottom > vh() * .9);
  }

  /* ---------- day with ---------- */
  var day = $(".day");
  if (day) {
    var slides = $$(".day__slide", day), bgs = $$(".day__bg img", day), thumbs = $$(".day__thumbs button", day), hours = $$(".day__ring .h", day), dot = $(".day__dot", day);
    var di = 0, dT, dayVisible = false;
    var setDay = function (i) {
      di = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("on", k === di); });
      bgs.forEach(function (s, k) { s.classList.toggle("on", k === di); });
      thumbs.forEach(function (s, k) { s.classList.toggle("on", k === di); });
      var h = +slides[di].getAttribute("data-h");
      hours.forEach(function (s, k) { s.classList.toggle("on", k === Math.floor(h) % 12); });
      dot.style.setProperty("--a", (h % 12) * 30 + "deg");
    };
    var auto = function () { clearInterval(dT); dT = setInterval(function () { if (dayVisible) setDay(di + 1); }, 6000); };
    $(".day__arrow--prev", day).addEventListener("click", function () { setDay(di - 1); auto(); });
    $(".day__arrow--next", day).addEventListener("click", function () { setDay(di + 1); auto(); });
    thumbs.forEach(function (t, k) { t.addEventListener("click", function () { setDay(k); auto(); }); });
    new IntersectionObserver(function (es) { dayVisible = es[0].isIntersecting; }, { threshold: .4 }).observe(day);
    setDay(0); auto();
  }

  /* ---------- configurator ---------- */
  var cfg = $(".config");
  if (cfg) {
    var cImgs = $$(".config__stage img", cfg), colorLbl = $("[data-color-lbl]", cfg), tint = $(".config__stage .tint", cfg);
    $$(".sw i[data-ci]", cfg).forEach(function (s) {
      s.addEventListener("click", function (e) {
        e.stopPropagation();
        var k = +s.dataset.ci;
        $$(".sw i[data-ci]", cfg).forEach(function (x) { x.classList.toggle("on", x === s); });
        cImgs.forEach(function (im, j) { im.classList.toggle("on", j === k); });
        colorLbl.textContent = s.dataset.name;
      });
    });
    $$(".opt[data-group]", cfg).forEach(function (o) {
      o.addEventListener("click", function () {
        $$('.opt[data-group="' + o.dataset.group + '"]', cfg).forEach(function (x) { x.classList.toggle("is-sel", x === o); });
        var sw = o.querySelector(".sw i:not([data-ci])");
        if (sw) { $$(".sw i", o).forEach(function (x, j) { x.classList.toggle("on", j === 0); }); }
      });
    });
    $$(".opt .sw i:not([data-ci])", cfg).forEach(function (s) {
      s.addEventListener("click", function (e) { e.stopPropagation(); var o = s.closest(".opt"); $$(".sw i", o).forEach(function (x) { x.classList.toggle("on", x === s); }); o.click(); $$(".sw i", o).forEach(function (x) { x.classList.toggle("on", x === s); }); });
    });
    $(".config__add", cfg).addEventListener("click", function (e) {
      e.preventDefault();
      var sel = $(".opt.is-sel[data-group=cushion]", cfg);
      addToCart({ name: "Bergen Headphones", opt: colorLbl.textContent + " · " + (sel ? sel.querySelector("p").textContent : "Leather"), price: 349, img: cImgs.filter(function (i) { return i.classList.contains("on"); })[0].getAttribute("src") });
    });
  }

  /* ---------- shelf tabs ---------- */
  $$("[data-shelf]").forEach(function (sh) {
    var tabs = $$(".tabs button", sh), grids = $$(".grid3", sh);
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () {
        if (t.classList.contains("is-active")) return;
        tabs.forEach(function (x) { x.classList.toggle("is-active", x === t); });
        var cur = grids.filter(function (g) { return !g.hidden; })[0];
        cur.classList.add("is-fading");
        setTimeout(function () { cur.hidden = true; cur.classList.remove("is-fading"); grids[k].hidden = false; grids[k].classList.add("is-fading"); requestAnimationFrame(function () { requestAnimationFrame(function () { grids[k].classList.remove("is-fading"); }); }); }, 400);
      });
    });
  });

  /* ---------- listening graph (2D canvas, grows on scroll, leans to the cursor) ---------- */
  $$("canvas[data-graph]").forEach(function (cv) {
    var ctx = cv.getContext("2d"), W, H, dpr = Math.min(2, window.devicePixelRatio || 1), branches = [], grow = 0, mx = 0, my = 0, tx = 0, ty = 0, seed = 7;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    function build() {
      branches = []; seed = 7;
      var cx = W / 2, cy = H * .55;
      var add = function (x, y, ang, len, depth, t0) {
        var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
        branches.push({ x: x, y: y, x2: x2, y2: y2, d: depth, t0: t0, t1: t0 + .12, w: Math.max(.4, 1.4 - depth * .25) });
        if (depth < 5) { var n = depth < 2 ? 3 : 2; for (var i = 0; i < n; i++) add(x2, y2, ang + (rnd() - .5) * 1.4, len * (.62 + rnd() * .2), depth + 1, t0 + .12); }
      };
      for (var k = 0; k < 7; k++) add(cx, cy, k / 7 * Math.PI * 2 + rnd() * .5, Math.min(W, H) * (.12 + rnd() * .06), 0, 0);
    }
    function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); build(); }
    size(); window.addEventListener("resize", size);
    cv.parentNode.addEventListener("mousemove", function (e) { var r = cv.getBoundingClientRect(); tx = (e.clientX - r.left - W / 2) / W; ty = (e.clientY - r.top - H / 2) / H; });
    var t = 0;
    function draw() {
      var r = cv.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh()) {
        grow = reduced ? 1 : clamp((vh() - r.top) / (vh() * 1.1), 0, 1);
        mx += (tx - mx) * .05; my += (ty - my) * .05; t += .01;
        ctx.clearRect(0, 0, W, H);
        branches.forEach(function (b, i) {
          var p = clamp((grow * .85 - b.t0) / (b.t1 - b.t0), 0, 1); if (p <= 0) return;
          var sway = Math.sin(t + i * .3) * 2 * b.d, px = mx * 30 * b.d, py = my * 30 * b.d;
          var x2 = b.x + (b.x2 - b.x) * p, y2 = b.y + (b.y2 - b.y) * p;
          ctx.strokeStyle = "rgba(15,15,15," + (0.55 - b.d * .07) + ")"; ctx.lineWidth = b.w;
          ctx.beginPath(); ctx.moveTo(b.x + px * .8, b.y + py * .8); ctx.lineTo(x2 + px + sway, y2 + py + sway * .5); ctx.stroke();
          if (p === 1 && b.d >= 4) { ctx.fillStyle = "rgba(15,15,15,.6)"; ctx.beginPath(); ctx.arc(x2 + px + sway, y2 + py + sway * .5, 1.2, 0, 7); ctx.fill(); }
        });
      }
      requestAnimationFrame(draw);
    }
    draw();
  });

  /* ---------- love (sticky features) ---------- */
  var love = $(".love");
  var loveIdx = -1;
  function setLove(i) {
    if (!love || i === loveIdx) return; loveIdx = i;
    $$(".love__list li", love).forEach(function (l, k) { l.classList.toggle("on", k === i); });
    $$(".love__media img", love).forEach(function (l, k) { l.classList.toggle("on", k === i); });
    $$(".love__thumbs button", love).forEach(function (l, k) { l.classList.toggle("on", k === i); });
    var g = $(".love__media .glass", love); if (g) g.classList.toggle("on", i === 0);
  }
  if (love) {
    setLove(0);
    var jump = function (k) { var r = love.getBoundingClientRect(); var span = love.offsetHeight - vh(); scrollToY(window.scrollY + r.top + span * (k + .5) / 4); };
    $$(".love__list li", love).forEach(function (l, k) { l.addEventListener("click", function () { if (window.innerWidth >= 768) jump(k); }); });
    $$(".love__thumbs button", love).forEach(function (l, k) { l.addEventListener("click", function () { jump(k); }); });
  }
  function onLove() {
    if (!love || window.innerWidth < 768) return;
    var r = love.getBoundingClientRect(), span = love.offsetHeight - vh();
    var p = clamp(-r.top / span, 0, .999);
    love.querySelector(".love__left").style.setProperty("--lp", p.toFixed(3));
    setLove(Math.floor(p * 4));
  }

  /* ---------- horizontal carousel ---------- */
  var hcar = $(".hcar");
  function onHcar() {
    if (!hcar || window.innerWidth < 768) return;
    var tr = $(".hcar__track", hcar), r = hcar.getBoundingClientRect(), span = hcar.offsetHeight - vh();
    /* short hold on the first and last card, so neither is cut off as the section pins and unpins */
    var p = clamp((-r.top / span - .05) / .85, 0, 1);
    /* --m is a calc() string and cannot be parsed, so the resolved margin is read from padding-right */
    var m = parseFloat(getComputedStyle(tr).paddingRight) || 0;
    var max = tr.lastElementChild.getBoundingClientRect().right - tr.getBoundingClientRect().left + m - document.documentElement.clientWidth;
    tr.style.setProperty("--hx", (-p * Math.max(0, max)).toFixed(1) + "px");
  }
  if (hcar) {
    var htr = $(".hcar__track", hcar);
    $$(".hcar__nav button", hcar).forEach(function (b) { b.addEventListener("click", function () { htr.scrollBy({ left: (b.dataset.dir === "1" ? 1 : -1) * htr.clientWidth * .8, behavior: "smooth" }); }); });
    htr.addEventListener("scroll", function () { var dots = $$(".hcar__nav .dots i", hcar); var k = Math.round(htr.scrollLeft / (htr.scrollWidth - htr.clientWidth) * (dots.length - 1)); dots.forEach(function (d, j) { d.classList.toggle("on", j === k); }); });
  }

  /* ---------- parallax + portrait clip + hero scale ---------- */
  var pars = $$("[data-par]"), portraits = $$(".portrait"), heroBg = $$(".hero__bg, .fhero img, .tech-hero img");
  function onPar() {
    pars.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh()) return;
      var p = (r.top + r.height / 2 - vh() / 2) / (vh() + r.height);
      el.style.setProperty("--py", (-6 + p * 10).toFixed(2) + "%");
    });
    portraits.forEach(function (el) {
      var r = el.getBoundingClientRect(); var p = clamp(1 - r.top / vh(), 0, 1);
      var w = window.innerWidth;
      el.style.setProperty("--cx", ((1 - p) * w * .12).toFixed(1) + "px");
      el.style.setProperty("--ci", ((1 - p) * 60).toFixed(1) + "px");
    });
    heroBg.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(); if (r.bottom < 0) return;
      var p = clamp(-r.top / r.height, 0, 1);
      el.parentNode.style.setProperty("--hs", (1 + p * .08).toFixed(3));
    });
  }

  /* ---------- simple 3-up carousels (product page) ---------- */
  $$(".car3").forEach(function (c) {
    var items = $$(".car3__item", c), dots = $$(".car3__ctrl .dots i", c), i = 0, per = window.innerWidth < 768 ? 1 : 3;
    var go = function (k) {
      i = clamp(k, 0, items.length - per);
      items.forEach(function (it) { it.style.transform = "translateX(calc(" + (-i * 100) + "% - " + (i * 20) + "px))"; });
      dots.forEach(function (d, j) { d.classList.toggle("on", j === i); });
    };
    $$(".arrows button", c).forEach(function (b) { b.addEventListener("click", function () { go(i + (+b.dataset.dir)); }); });
    go(0);
  });

  /* ---------- faq ---------- */
  $$(".faq__q").forEach(function (q) { q.addEventListener("click", function () { var it = q.parentNode; var on = !it.classList.contains("on"); $$(".faq__item", it.parentNode).forEach(function (x) { x.classList.remove("on"); }); it.classList.toggle("on", on); q.setAttribute("aria-expanded", on); }); });

  /* ---------- product page ---------- */
  var pdp = $(".pdp");
  var lightbox = $(".lightbox");
  function closeLight() { if (lightbox) { lightbox.classList.remove("is-open"); body.classList.remove("is-locked"); } }
  if (pdp) {
    var sl = $$(".pdp__gal .slide", pdp), dts = $$(".pdp__dots button", pdp), gi = 0;
    var showG = function (k) { gi = (k + sl.length) % sl.length; sl.forEach(function (s, j) { s.classList.toggle("on", j === gi); }); dts.forEach(function (s, j) { s.classList.toggle("on", j === gi); }); };
    dts.forEach(function (d, k) { d.addEventListener("click", function () { showG(k); }); });
    $$(".pdp__gal-arrows button", pdp).forEach(function (b) { b.addEventListener("click", function () { showG(gi + (+b.dataset.dir)); }); });
    var sx = 0; $(".pdp__gal", pdp).addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    $(".pdp__gal", pdp).addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) showG(gi + (dx < 0 ? 1 : -1)); });
    showG(0);
    $(".pdp__full", pdp).addEventListener("click", function () { $("img", lightbox).src = $("img", sl[gi]).getAttribute("src"); lightbox.classList.add("is-open"); body.classList.add("is-locked"); });
    $(".panel__close", lightbox).addEventListener("click", closeLight);
    var cLbl = $("[data-pcolor]", pdp);
    $$(".pdp__colors button", pdp).forEach(function (b) { b.addEventListener("click", function () { $$(".pdp__colors button", pdp).forEach(function (x) { x.classList.toggle("on", x === b); }); cLbl.textContent = b.dataset.name; }); });
    $$(".pdp__sizes button", pdp).forEach(function (b) { b.addEventListener("click", function () { $$(".pdp__sizes button", pdp).forEach(function (x) { x.classList.toggle("on", x === b); }); }); });
    $$(".pdp__acc button", pdp).forEach(function (b) { b.addEventListener("click", function () { $$(".pdp__acc button", pdp).forEach(function (x) { x.classList.toggle("on", x === b); }); }); });
    $(".pdp__buy .add", pdp).addEventListener("click", function () {
      var size = $(".pdp__sizes .on", pdp), tun = $(".pdp__acc .on .label", pdp);
      addToCart({ name: pdp.dataset.name, opt: cLbl.textContent + " · " + (size ? size.textContent.trim() : "") + " · " + (tun ? tun.textContent.trim() : ""), price: +pdp.dataset.price, img: pdp.dataset.img });
    });
    $(".pdp__buy .pre", pdp).addEventListener("click", function () { toast("Pre-order checkout is not live in this demo"); });
  }

  /* ---------- support search (client side) ---------- */
  var sIn = $(".search input");
  if (sIn) {
    var res = $(".search__res"), items = $$(".faq__q").map(function (q) { return q.textContent.trim(); });
    sIn.addEventListener("input", function () {
      var v = sIn.value.trim().toLowerCase();
      if (!v) { res.hidden = true; return; }
      var hits = items.filter(function (t) { return t.toLowerCase().indexOf(v) > -1; });
      res.innerHTML = hits.length ? hits.slice(0, 6).map(function (h) { return '<a href="#faq">' + h + "</a>"; }).join("") : "<p>No results for “" + sIn.value.replace(/</g, "&lt;") + "”. Try “battery” or “pairing”.</p>";
      res.hidden = false;
    });
    res.addEventListener("click", function (e) { var a = e.target.closest("a"); if (!a) return; res.hidden = true; var q = $$(".faq__q").filter(function (x) { return x.textContent.trim() === a.textContent; })[0]; if (q) { q.click(); } });
  }

  /* ---------- contact form (validation only, nothing is sent) ---------- */
  var cf = $("#contact-form");
  if (cf) cf.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    $$(".field[required]", cf).forEach(function (f) { var good = f.type === "email" ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value) : f.value.trim().length > 1; f.classList.toggle("is-error", !good); ok = ok && good; });
    $(".ok", cf).textContent = ok ? "Thanks — this demo does not send messages. Write to hello@solace.audio." : "Please fill in the highlighted fields.";
  });

  /* ---------- scroll loop ---------- */
  var ticking = false;
  function frame() { ticking = false; onScrollHeader(); onReveal(); onFilmThumb(); onLove(); onHcar(); onPar(); }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener("resize", frame);
  frame();
})();
