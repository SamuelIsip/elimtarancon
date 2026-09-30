// Romanian / Spanish switch. Romanian is written in index.html and in the
// code as the default text; Spanish lives in lng/es.json.
//
// In index.html, mark a translatable element with:
//   data-lng="key"             to translate its content (HTML allowed)
//   data-lng-title="key"       (also data-lng-aria-label, data-lng-alt,
//   data-lng-value, data-lng-aria-placeholder) to translate that attribute
const LANGUAGES = ["ro", "es"];
const STORAGE_KEY = "elim-language";
const ATTRIBUTES = ["title", "aria-label", "alt", "value", "aria-placeholder"];

let language = "ro";
let spanish = {};
const originals = new Map();
const listeners = new Set();

// Text for the current language: Spanish from es.json, otherwise the
// Romanian fallback. {name} placeholders are filled from params.
export function t(key, fallback, params = {}) {
  const text = language === "es" ? spanish[key] ?? fallback : fallback;
  return fill(text, params);
}

export function fill(text, params) {
  return text.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match);
}

export function getLanguage() {
  return language;
}

export function onLanguageChange(listener) {
  listeners.add(listener);
}

export async function initLanguageSwitch(button) {
  button?.addEventListener("click", () =>
    setLanguage(language === "ro" ? "es" : "ro")
  );
  updateSwitch(button);
  listeners.add(() => updateSwitch(button));

  const saved = readSavedLanguage();
  if (saved && saved !== language) await setLanguage(saved);
}

export async function setLanguage(next) {
  if (!LANGUAGES.includes(next)) return;
  if (next === "es" && !Object.keys(spanish).length) {
    try {
      const response = await fetch("./lng/es.json", { cache: "no-cache" });
      spanish = await response.json();
    } catch {
      return; // Stay in Romanian if the translations can't be loaded
    }
  }

  language = next;
  document.documentElement.lang = next;
  translatePage();
  saveLanguage(next);
  listeners.forEach((listener) => listener(next));
}

function translatePage() {
  document.querySelectorAll("[data-lng]").forEach((element) => {
    const original = remember(element, "html", () => element.innerHTML);
    element.innerHTML = t(element.dataset.lng, original);
  });

  for (const attribute of ATTRIBUTES) {
    document.querySelectorAll(`[data-lng-${attribute}]`).forEach((element) => {
      const original = remember(element, attribute, () =>
        element.getAttribute(attribute)
      );
      element.setAttribute(attribute, t(element.getAttribute(`data-lng-${attribute}`), original));
    });
  }
}

// Keep the Romanian text the first time an element is translated
function remember(element, slot, read) {
  if (!originals.has(element)) originals.set(element, {});
  const saved = originals.get(element);
  if (!(slot in saved)) saved[slot] = read();
  return saved[slot];
}

function updateSwitch(button) {
  button?.setAttribute("aria-checked", String(language === "es"));
}

function readSavedLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveLanguage(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private browsing: the choice just isn't remembered
  }
}
