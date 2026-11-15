(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Toast */
  let toastEl, toastTimer;
  const toast = (msg) => {
    if (!toastEl) {
      toastEl = Object.assign(document.createElement("div"), { className: "toast" });
      toastEl.setAttribute("role", "status");
      document.body.append(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
  };
  const copy = async (text, msg) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(msg);
    } catch {
      toast("Copy failed. Please select and copy manually.");
    }
  };

  /* Theme */
  $("[data-theme-toggle]")?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    document.dispatchEvent(new CustomEvent("themechange"));
  });

  /* Header + mobile nav */
  const header = $("[data-header]");
  const nav = $("#site-nav");
  const navBtn = $("[data-nav-toggle]");
  const onScroll = () => header?.classList.toggle("is-stuck", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  navBtn?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navBtn.setAttribute("aria-expanded", String(open));
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav?.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      navBtn.setAttribute("aria-expanded", "false");
      navBtn.focus();
    }
  });

  /* Reveal on scroll */
  const reveals = $$(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* Counters */
  const counters = $$("[data-count]");
  if (counters.length && !reduced && "IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const target = Number(e.target.dataset.count);
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 1100);
        e.target.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  }

  /* Relative dates ("3 days ago") */
  const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });
  $$("time[data-relative]").forEach((el) => {
    const days = Math.round((new Date(el.dateTime) - Date.now()) / 864e5);
    if (Number.isNaN(days)) return;
    const abs = Math.abs(days);
    if (abs < 14) el.textContent = rtf.format(days, "day");
    else if (abs < 60) el.textContent = rtf.format(Math.round(days / 7), "week");
    else if (abs < 365) el.textContent = rtf.format(Math.round(days / 30), "month");
  });

  /* Click-to-play YouTube (no third-party requests until asked) */
  $$("[data-video]").forEach((btn) => btn.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.video}?autoplay=1&rel=0`;
    f.title = btn.getAttribute("aria-label") || "Video";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    f.allowFullscreen = true;
    btn.replaceChildren(f);
    btn.style.cursor = "default";
  }, { once: true }));

  /* Copy buttons */
  $$("[data-copy]").forEach((b) => b.addEventListener("click", () => copy(b.dataset.copy, b.dataset.copyMsg || "Copied")));
  $$(".prose pre").forEach((pre) => {
    const b = Object.assign(document.createElement("button"), { className: "copy-code", type: "button", textContent: "Copy" });
    b.addEventListener("click", () => copy(pre.querySelector("code")?.innerText ?? "", "Code copied"));
    pre.append(b);
  });

  /* Writing: search + topic filter */
  const list = $("[data-post-list]");
  if (list) {
    const rows = $$("[data-post]", list);
    const input = $("[data-post-search]");
    const chips = $$("[data-topic]");
    const empty = $("[data-post-empty]");
    const count = $("[data-post-count]");
    let topic = new URLSearchParams(location.search).get("topic") || "";
    const apply = () => {
      const q = (input?.value || "").trim().toLowerCase();
      let shown = 0;
      rows.forEach((r) => {
        const ok = (!topic || r.dataset.topics.split("|").includes(topic)) && (!q || r.dataset.text.includes(q));
        r.hidden = !ok;
        if (ok) shown++;
      });
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.topic === topic)));
      if (empty) empty.hidden = shown > 0;
      if (count) count.textContent = `${shown} ${shown === 1 ? "post" : "posts"}`;
    };
    input?.addEventListener("input", apply);
    chips.forEach((c) => c.addEventListener("click", () => {
      topic = c.dataset.topic === topic ? "" : c.dataset.topic;
      const url = new URL(location.href);
      topic ? url.searchParams.set("topic", topic) : url.searchParams.delete("topic");
      history.replaceState(null, "", url);
      apply();
    }));
    addEventListener("keydown", (e) => {
      if (e.key === "/" && input && document.activeElement !== input && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        input.focus();
      }
    });
    apply();
  }

  /* Article: progress bar, table of contents, share */
  const prose = $("[data-article]");
  if (prose) {
    const bar = $(".progress");
    const update = () => {
      const r = prose.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight * 0.6)));
      if (bar) bar.style.width = `${p * 100}%`;
    };
    addEventListener("scroll", update, { passive: true });
    update();

    const toc = $("[data-toc]");
    const heads = $$("h2[id], h3[id]", prose);
    if (toc && heads.length >= 2) {
      const ol = document.createElement("ol");
      heads.forEach((h) => {
        const a = Object.assign(document.createElement("a"), { href: `#${h.id}`, textContent: h.textContent });
        if (h.tagName === "H3") a.className = "l3";
        const li = document.createElement("li");
        li.append(a);
        ol.append(li);
      });
      toc.append(ol);
      const links = $$("a", ol);
      const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) links.forEach((l) => l.classList.toggle("is-active", l.hash === `#${e.target.id}`));
      }), { rootMargin: "-90px 0px -70% 0px" });
      heads.forEach((h) => spy.observe(h));
    } else if (toc) {
      toc.closest(".toc")?.remove();
    }

    $("[data-share]")?.addEventListener("click", async () => {
      if (navigator.share) {
        try { await navigator.share({ title: document.title, url: location.href }); } catch {}
      } else copy(location.href, "Link copied");
    });
  }

  /* Contact form: composes an email in the visitor's own mail app or Gmail */
  const form = $("[data-contact-form]");
  if (form) {
    const to = form.dataset.to;
    const compose = () => {
      if (!form.reportValidity()) return null;
      const d = Object.fromEntries(new FormData(form));
      const subject = `[${d.topic}] ${d.subject || "Message from your website"}`;
      const body = `${d.message.trim()}\n\n—\n${[d.name, d.organisation].filter(Boolean).join("\n")}`;
      return { subject, body };
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const m = compose();
      if (!m) return;
      const via = e.submitter?.value;
      if (via === "gmail") {
        open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`, "_blank", "noopener");
      } else if (via === "copy") {
        copy(`To: ${to}\nSubject: ${m.subject}\n\n${m.body}`, "Message copied. Paste it into any email client.");
      } else {
        location.href = `mailto:${to}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;
      }
    });
    const preset = new URLSearchParams(location.search).get("topic");
    if (preset) {
      const opt = $$("option", form.elements.topic).find((o) => o.value.toLowerCase().startsWith(preset.toLowerCase()));
      if (opt) form.elements.topic.value = opt.value;
    }
  }

  /* Hero: animated network topology */
  const canvas = $("[data-topology]");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let w, h, nodes, raf, color;
    const readColor = () => { color = getComputedStyle(root).getPropertyValue("--accent").trim() || "#f58a3c"; };
    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(64, Math.max(22, (w * h) / 22000)));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() < 0.15 ? 2.6 : 1.4,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const max = 150;
      for (const p of nodes) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < max) {
            ctx.globalAlpha = (1 - d / max) * 0.28;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 0.55;
      for (const p of nodes) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
      raf = requestAnimationFrame(draw);
    };
    readColor(); size(); draw();
    addEventListener("resize", size);
    document.addEventListener("themechange", readColor);
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) draw();
    });
  }
})();
