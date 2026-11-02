(function () {
  const STORAGE_KEY = "portfolio-locale";
  const DEFAULT_LOCALE = "zh";

  function getBasePath() {
    const script = document.querySelector('script[src*="i18n.js"]');
    const explicit = script?.getAttribute("data-base");
    if (explicit) return explicit.replace(/\/?$/, "/");

    const depth = (window.location.pathname.match(/\//g) || []).length;
    const isFile = window.location.protocol === "file:";
    if (isFile) {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const htmlIndex = parts.findIndex((p) => p.endsWith(".html"));
      const dirParts = htmlIndex >= 0 ? parts.slice(0, htmlIndex) : parts;
      const siteRoot = dirParts.length > 0 ? dirParts[dirParts.length - 1] : "";
      const inSub =
        window.location.pathname.includes("/games/") ||
        window.location.pathname.includes("/art/") ||
        window.location.pathname.includes("\\games\\") ||
        window.location.pathname.includes("\\art\\");
      return inSub ? "../" : "./";
    }
    return "./";
  }

  function getNested(obj, keyPath) {
    return keyPath.split(".").reduce((acc, part) => acc?.[part], obj);
  }

  function applyTranslations(dict) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = getNested(dict, key);
      if (value == null) return;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = value;
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr");
      spec.split(",").forEach((pair) => {
        const trimmed = pair.trim();
        const colon = trimmed.indexOf(":");
        if (colon === -1) return;
        const attr = trimmed.slice(0, colon).trim();
        const key = trimmed.slice(colon + 1).trim();
        const value = getNested(dict, key);
        if (value != null) el.setAttribute(attr, value);
      });
    });
  }

  function setActiveButtons(locale) {
    document.querySelectorAll("[data-set-locale]").forEach((btn) => {
      const active = btn.getAttribute("data-set-locale") === locale;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function deepMerge(target, source) {
    if (!source || typeof source !== "object") return target;
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        if (!target[key] || typeof target[key] !== "object") target[key] = {};
        deepMerge(target[key], val);
      } else {
        target[key] = val;
      }
    }
    return target;
  }

  async function loadLocale(locale) {
    const base = getBasePath();
    const url = `${base}lang/${locale}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return res.json();
  }

  async function loadCaseStudyOverlay(locale) {
    if (!document.body.classList.contains("case-study-unseen-witness")) return null;
    const base = getBasePath();
    try {
      const res = await fetch(`${base}lang/unseen-witness.${locale}.json`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async function setLocale(locale) {
    const supported = ["zh", "en"];
    if (!supported.includes(locale)) locale = DEFAULT_LOCALE;

    try {
      const dict = await loadLocale(locale);
      const overlay = await loadCaseStudyOverlay(locale);
      if (overlay) deepMerge(dict, overlay);
      window.__i18nDict = dict;
      applyTranslations(dict);
      document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
      localStorage.setItem(STORAGE_KEY, locale);
      setActiveButtons(locale);
      document.dispatchEvent(new CustomEvent("localechange", { detail: { locale, dict } }));
    } catch (err) {
      console.error(err);
    }
  }

  function initLocaleButtons() {
    document.querySelectorAll("[data-set-locale]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setLocale(btn.getAttribute("data-set-locale"));
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLocaleButtons();
    const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LOCALE;
    setLocale(saved);
  });

  window.portfolioI18n = { setLocale, getBasePath };
})();
