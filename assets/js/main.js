/* Zhouhu Tan — homepage interactions
   页面交互脚本：主题切换、手机菜单、滚动动效、导航高亮、页脚年份。
   一般改内容不需要动这个文件；改坏了刷新页面没动画/按钮失灵就 git checkout 恢复。

   ===== 以后可能要改的几处 =====
   1. 横幅粒子拼的字：搜 var TEXT = ... 改引号里内容
   2. 粒子颜色：搜 COLOR_A / COLOR_B（两组 RGB，分深浅色）
   3. 打字机速度：搜 typeLine( 调用处，50 / 60 是每字毫秒数
   4. 图案点开停留时间：搜 1600（毫秒），改大小即可
   其它段落（主题切换、菜单、滚动进度）一般不用动。 */

(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- theme toggle ---------- */
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isDark = root.classList.toggle("dark");
      try {
        localStorage.setItem("theme", isDark ? "dark" : "light");
      } catch (e) {}
    });
  }

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("navBurger");
  var navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- scroll progress ---------- */
  var progress = document.getElementById("navProgress");
  function updateProgress() {
    if (!progress) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    progress.style.width = pct.toFixed(2) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- active nav link ---------- */
  var sectionIds = ["about", "research", "news", "education"];
  var linkMap = {};
  if (navLinks) {
    Array.prototype.forEach.call(navLinks.querySelectorAll("a[href^='#']"), function (a) {
      linkMap[a.getAttribute("href").slice(1)] = a;
    });
  }

  function setActive(id) {
    for (var k in linkMap) {
      linkMap[k].classList.toggle("active", k === id);
    }
  }

  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    /* ---------- reveal on scroll ---------- */
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = el.getAttribute("data-delay");
          if (delay) el.style.setProperty("--delay", delay + "ms");
          el.classList.add("is-visible");
          obs.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- 手绘图案：点击 / 触摸浮现 ----------
     电脑上悬停由 CSS 处理；手机上点一下模块，给它临时加 .is-tapped，
     让图案淡入放大，1.6 秒后自动收起。 */
  var doodleHosts = ".research-item, .news-item, .meta-list li";
  document.addEventListener("pointerdown", function (e) {
    var host = e.target && e.target.closest ? e.target.closest(doodleHosts) : null;
    if (!host) return;
    host.classList.add("is-tapped");
    clearTimeout(host._doodleTimer);
    host._doodleTimer = setTimeout(function () {
      host.classList.remove("is-tapped");
    }, 1600);
  });

  /* ---------- hero 打字机 ----------
     .type-sizer 里是原文，.type-out 逐字打出来；打完后给下面几层加 .is-in 浮现。
     没有 JS 时 CSS 会直接显示原文，无障碍阅读器读的也是原文。 */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 打字全部结束后置 true，横幅视频等这个开关才播
  var heroTypingDone = false;

  function typeLine(slot, speed, done, holdEnd) {
    var out = slot.querySelector(".type-out");
    var sizer = slot.querySelector(".type-sizer");
    if (!out || !sizer) {
      if (done) done();
      return;
    }
    var text = sizer.textContent.replace(/\s+/g, " ").trim();
    // 去掉末尾下划线，打完后再用闪烁下划线留住
    var holdUnderscore = /_$/.test(text) || !!holdEnd;
    if (/_$/.test(text)) text = text.slice(0, -1);

    var cursor = document.createElement("span");
    cursor.className = "cursor";
    out.textContent = "";
    out.appendChild(cursor);

    var i = 0;
    (function step() {
      if (i < text.length) {
        out.insertBefore(document.createTextNode(text.charAt(i)), cursor);
        i += 1;
        // 速度照 mimo：每字 ±5ms 抖动
        setTimeout(step, speed + (10 * Math.random() - 5));
      } else {
        if (holdUnderscore) {
          cursor.remove();
          var u = document.createElement("span");
          u.className = "hold-underscore";
          u.textContent = "_";
          out.appendChild(u);
        } else {
          out.innerHTML = sizer.innerHTML;
        }
        if (done) done();
      }
    })();
  }

  function runHeroTyping() {
    var slots = document.querySelectorAll(".hero .type-slot");
    var after = document.querySelectorAll(".hero-desc, .hero-links, .hero-banner-wrap");
    function showRest() {
      heroTypingDone = true;
      if (window._tryPlayBanner) window._tryPlayBanner();
      Array.prototype.forEach.call(after, function (el, i) {
        setTimeout(function () {
          el.classList.add("is-in");
        }, i * 150);
      });
    }
    if (!slots.length || reduceMotion) {
      Array.prototype.forEach.call(slots, function (slot) {
        var sizer = slot.querySelector(".type-sizer");
        var out = slot.querySelector(".type-out");
        if (sizer && out) out.innerHTML = sizer.innerHTML;
      });
      showRest();
      return;
    }
    // 眉标先出，再打字
    var eyebrow = document.querySelector(".hero-eyebrow");
    if (eyebrow) {
      setTimeout(function () {
        eyebrow.classList.add("is-in");
      }, 120);
    }
    function begin() {
      // mimo 节奏：起手等 300ms，名字 50ms/字，行间隔 120ms，中文名/副标题 60ms/字
      setTimeout(function () {
        typeLine(slots[0], 50, function () {
          // 名字打完横幅就出来，粒子立刻开始飞入
          var bannerWrapEarly = document.querySelector(".hero-banner-wrap");
          if (bannerWrapEarly) bannerWrapEarly.classList.add("is-in");
          typeNext(1);
        });
      }, 300);
    }
    // 后面几个 type-slot 依次打（谭周湖、副标题…），最后一行打完停在闪烁下划线
    function typeNext(i) {
      if (i >= slots.length) {
        showRest();
        return;
      }
      var isLast = i === slots.length - 1;
      setTimeout(function () {
        typeLine(slots[i], 60, function () {
          if (isLast) showRest();
          else typeNext(i + 1);
        }, isLast);
      }, 120);
    }
    // 字体就位再打，避免字宽跳动
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(begin).catch(begin);
    } else {
      begin();
    }
  }
  runHeroTyping();

  /* ---------- 横幅视频：文字打完 + 滑到横幅才播 ----------
     进页面不自动播；等首屏打字结束、且横幅滚进视野（露出 30%）才从头播。
     之后每次滑到横幅都重播一遍，播完停在最后一帧，不循环。
     想改触发灵敏度：threshold 的 0.3 表示露出 30% 才算「到了」。 */
  var bannerVideo = document.querySelector(".hero-banner-video");
  if (bannerVideo) {
    bannerVideo.loop = false;
    var videoInView = false;

    function replayBanner() {
      try {
        bannerVideo.currentTime = 0;
        var p = bannerVideo.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    }

    // 满足「打字完 + 在视野里」才播；打字收尾时会调到这里
    function tryPlayBanner() {
      if (videoInView && heroTypingDone && !reduceMotion) replayBanner();
    }
    window._tryPlayBanner = tryPlayBanner;

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var arrived = entry.isIntersecting && entry.intersectionRatio >= 0.3;
            if (arrived && !videoInView) {
              videoInView = true;
              tryPlayBanner();
            } else if (!arrived && videoInView) {
              videoInView = false;
              bannerVideo.pause();
            }
          });
        },
        { threshold: [0, 0.3] }
      ).observe(bannerVideo);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        bannerVideo.pause();
      } else {
        tryPlayBanner();
      }
    });
  }

  /* ---------- 横幅粒子拼字（仿 mimo）----------
     把文字画到离屏画布上采样成粒子，粒子从四周飞入拼成字，
     拼好后轻微漂浮，鼠标/手指靠近会被推开。 */
  (function heroBannerParticles() {
    var wrap = document.querySelector(".hero-banner");
    var canvas = document.getElementById("heroParticles");
    if (!wrap || !canvas) return;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // 横幅里拼出的字，想换就改这一行
    var TEXT = "Zhouhu Tan";
    // 粒子主色：深墨 + 橙色渐变（取自主题）
    var COLOR_A = [26, 26, 26];
    var COLOR_B = [234, 88, 12];

    function readThemeColors() {
      var dark = document.documentElement.classList.contains("dark");
      COLOR_A = dark ? [240, 239, 236] : [26, 26, 26];
      COLOR_B = dark ? [251, 146, 60] : [234, 88, 12];
    }

    var particles = [];
    var W = 0, H = 0, dpr = 1;
    // cx/cy 是屏幕坐标，每帧换算成横幅内坐标；snap 表示刚按下、直接落点别滑过去
    var mouse = { active: false, cx: 0, cy: 0, x: 0, y: 0, sx: 0, sy: 0, snap: false };
    // 手指事件比鼠标稀疏，跟手系数加大，不然推开的圈拖在手指后面
    var isCoarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    var follow = isCoarse ? 0.45 : 0.18;
    var startTime = 0;
    var entering = true;
    var rafId = 0;

    function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

    function build() {
      readThemeColors();
      var rect = wrap.getBoundingClientRect();
      W = Math.floor(rect.width);
      H = Math.floor(rect.height);
      if (W <= 0 || H <= 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 量字号：clamp(4rem, 13vw, 10rem)，跟 mimo 一个套路
      var probe = document.createElement("span");
      probe.textContent = "M";
      probe.style.cssText =
        "position:absolute;visibility:hidden;pointer-events:none;" +
        "font-size:clamp(4rem,13vw,10rem);font-weight:400;" +
        "font-family:var(--font-serif)";
      wrap.appendChild(probe);
      var fontSize =
        Number.parseFloat(window.getComputedStyle(probe).fontSize) || 80;
      probe.remove();

      var serifStack = '"Newsreader","Songti SC",Georgia,serif';
      var font = "400 " + fontSize + "px " + serifStack;

      // 离屏画布画字
      var off = document.createElement("canvas");
      var octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.font = font;
      var metrics = octx.measureText(TEXT);
      var maxW = 0.92 * W;
      var tw = Math.max(1, metrics.width);
      if (tw > maxW) {
        fontSize = Math.max(18, (maxW / tw) * fontSize);
        font = "400 " + fontSize + "px " + serifStack;
        octx.font = font;
        metrics = octx.measureText(TEXT);
      }
      var left = Math.ceil(metrics.actualBoundingBoxLeft || 0);
      var right = Math.ceil(metrics.actualBoundingBoxRight || metrics.width);
      var asc = Math.ceil(metrics.actualBoundingBoxAscent || fontSize * 0.78);
      var desc = Math.ceil(metrics.actualBoundingBoxDescent || fontSize * 0.22);
      var pad = Math.max(12, Math.ceil(fontSize * 0.08));
      off.width = Math.max(1, left + right) + pad * 2;
      off.height = Math.max(1, asc + desc) + pad * 2;
      octx.clearRect(0, 0, off.width, off.height);
      octx.font = font;
      octx.textAlign = "left";
      octx.textBaseline = "alphabetic";
      octx.fillStyle = "#fff";
      octx.fillText(TEXT, pad - left, pad + asc);

      // 采样字形像素
      var img = octx.getImageData(0, 0, off.width, off.height).data;
      var pts = [];
      var step = 2;
      for (var y = 0; y < off.height; y += step) {
        for (var x = 0; x < off.width; x += step) {
          var alpha = img[(y * off.width + x) * 4 + 3];
          if (alpha > 40) {
            pts.push({
              x: W / 2 - off.width / 2 + x,
              y: H / 2 - off.height / 2 + y
            });
          }
        }
      }

      // 粒子数量 900~5200，跟 mimo 一致
      var target = Math.max(900, Math.min(5200, Math.floor((W * H) / 90)));
      var every = Math.max(1, Math.ceil(pts.length / target));

      particles = [];
      for (var i = 0; i < pts.length; i += every) {
        var p = pts[i];
        // 伪随机，刷新后布局稳定
        var seed = ((9301 * i + 49297) % 233280) / 233280;
        var depth = 0.45 + (((233 * i + 97) % 1000) / 1000) * 0.9;
        var mix = clamp(p.x / Math.max(1, W) + (seed - 0.5) * 0.35, 0, 1);
        var r = Math.round(COLOR_A[0] + (COLOR_B[0] - COLOR_A[0]) * mix);
        var g = Math.round(COLOR_A[1] + (COLOR_B[1] - COLOR_A[1]) * mix);
        var b = Math.round(COLOR_A[2] + (COLOR_B[2] - COLOR_A[2]) * mix);

        var ang = seed * Math.PI * 2;
        var rad = 180 * (0.35 + 0.75 * depth);
        var sx = p.x + Math.cos(ang) * rad + (seed - 0.5) * 81;
        var sy = p.y + Math.sin(ang) * rad + (depth - 0.9) * 81;

        particles.push({
          x: sx, y: sy,
          sx: sx, sy: sy,
          tx: p.x, ty: p.y,
          size: 1.8,
          color: "rgb(" + r + "," + g + "," + b + ")",
          seed: seed,
          depth: depth,
          delay: 240 * seed
        });
      }

      startTime = performance.now();
      entering = true;
    }

    function frame(now) {
      ctx.clearRect(0, 0, W, H);
      // 屏幕坐标 → 横幅内坐标：放在帧里换算，手指快速划过事件稀疏也不会算旧位置
      var rect = wrap.getBoundingClientRect();
      mouse.x = mouse.cx - rect.left;
      mouse.y = mouse.cy - rect.top;
      if (mouse.snap) {
        mouse.sx = mouse.x;
        mouse.sy = mouse.y;
        mouse.snap = false;
      }
      mouse.sx += (mouse.x - mouse.sx) * follow;
      mouse.sy += (mouse.y - mouse.sy) * follow;

      var allDone = true;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var nx = p.tx;
        var ny = p.ty;
        var appear = 1;

        if (entering) {
          var t = clamp((now - startTime - p.delay) / 1100, 0, 1);
          appear = t;
          var e = 1 - Math.pow(1 - t, 3);
          nx = p.sx + (p.tx - p.sx) * e;
          ny = p.sy + (p.ty - p.sy) * e;
          if (t < 1) allDone = false;
        } else if (!reduceMotion) {
          var tt = now * 0.001;
          nx = p.tx + 0.15 * Math.sin(0.9 * tt + 10 * p.seed) * p.depth;
          ny = p.ty + 0.15 * Math.cos(0.75 * tt + 10 * p.depth) * p.depth;
        }

        if (mouse.active) {
          var dx = p.x - mouse.sx;
          var dy = p.y - mouse.sy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0.1) {
            var push = (1 - dist / 120) * 40;
            nx += (dx / dist) * push;
            ny += (dy / dist) * push;
          }
        }

        p.x += (nx - p.x) * (entering ? 0.72 : 0.55);
        p.y += (ny - p.y) * (entering ? 0.72 : 0.55);

        ctx.globalAlpha = clamp(0.35 + 0.65 * appear, 0, 1);
        ctx.fillStyle = p.color;
        if (p.size <= 2.1) {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (entering && allDone) entering = false;
      rafId = requestAnimationFrame(frame);
    }

    function setPointer(cx, cy) {
      mouse.cx = cx;
      mouse.cy = cy;
      mouse.active = true;
    }
    function onMove(e) {
      // 浏览器会把一次手指滑动的多个采样合并，取出最后那个跟手最准
      if (e.getCoalescedEvents) {
        var evts = e.getCoalescedEvents();
        if (evts && evts.length) {
          var last = evts[evts.length - 1];
          setPointer(last.clientX, last.clientY);
          return;
        }
      }
      setPointer(e.clientX, e.clientY);
    }
    function onDown(e) {
      setPointer(e.clientX, e.clientY);
      mouse.snap = true;
    }
    function onLeave() {
      mouse.active = false;
    }

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerleave", onLeave);
    // 鼠标抬起后仍在悬停，不能关；手指没有悬停，抬手就收
    wrap.addEventListener("pointerup", function (e) {
      if (e.pointerType !== "mouse") onLeave();
    });
    // 手机上一拖动浏览器就去滚动，会发 pointercancel/touchcancel 把 pointer 掐掉；
    // 这时不关效果，touchmove 继续跟，否则粒子圈走到一半突然停住。只有真抬手才收。
    wrap.addEventListener("touchmove", function (e) {
      var t = e.touches && e.touches[0];
      if (t) setPointer(t.clientX, t.clientY);
    }, { passive: true });
    wrap.addEventListener("touchend", onLeave, { passive: true });

    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(rafId);
        build();
        rafId = requestAnimationFrame(frame);
      }, 180);
    });

    // 主题切换后重上色
    var themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        setTimeout(function () {
          cancelAnimationFrame(rafId);
          build();
          rafId = requestAnimationFrame(frame);
        }, 60);
      });
    }

    // 等横幅真正显示出来再飞入，否则打字没结束粒子就拼完了
    function start() {
      if (reduceMotion) {
        build();
        for (var k = 0; k < particles.length; k++) {
          particles[k].x = particles[k].tx;
          particles[k].y = particles[k].ty;
        }
        entering = false;
        rafId = requestAnimationFrame(frame);
      } else {
        build();
        rafId = requestAnimationFrame(frame);
      }
    }

    var bannerWrap = document.querySelector(".hero-banner-wrap");
    if (bannerWrap && !bannerWrap.classList.contains("is-in")) {
      var waited = 0;
      var waitTimer = setInterval(function () {
        waited += 50;
        if (bannerWrap.classList.contains("is-in") || waited > 15000) {
          clearInterval(waitTimer);
          start();
        }
      }, 50);
    } else {
      start();
    }
  })();

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
