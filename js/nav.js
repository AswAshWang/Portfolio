(function () {
  function markCurrentNav() {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    document.querySelectorAll(".site-nav a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const normalized = href.replace(/^\.\//, "").replace(/index\.html$/, "");
      let current = false;

      if (href.includes("about.html") && path.includes("about.html")) current = true;
      else if (href.includes("/games") && path.includes("/games")) current = true;
      else if (href.includes("/art") && path.includes("/art")) current = true;
      else if (
        (href === "index.html" || href === "./" || href === "../index.html" || href === "../../index.html") &&
        (path.endsWith("/personal_web") ||
          path.endsWith("/personal_web/") ||
          path.endsWith("index.html") && !path.includes("/games") && !path.includes("/art") && !path.includes("about"))
      ) {
        current = path.includes("index.html") && !path.includes("/games") && !path.includes("/art") && !path.includes("about");
      }

      link.toggleAttribute("aria-current", current ? "page" : false);
    });
  }

  function initArtFilter() {
    const bar = document.querySelector(".filter-bar");
    if (!bar) return;

    const cards = document.querySelectorAll(".project-card[data-category]");
    bar.querySelectorAll("button[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        bar.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const filter = btn.getAttribute("data-filter");
        cards.forEach((card) => {
          const cat = card.getAttribute("data-category");
          const show = filter === "all" || cat === filter;
          card.toggleAttribute("data-hidden", show ? false : true);
        });
      });
    });
  }

  function initHomeHeader() {
    const header = document.getElementById("site-header");
    const hero = document.querySelector(".home-hero");
    if (!header || !hero || !document.body.classList.contains("home-page")) return;

    function update() {
      const threshold = (hero.offsetHeight || 0) * 0.55;
      header.classList.toggle("is-scrolled", window.scrollY > threshold);
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  document.addEventListener("DOMContentLoaded", () => {
    markCurrentNav();
    initArtFilter();
    initHomeHeader();
  });
})();
