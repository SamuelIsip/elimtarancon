const VERSE_URL = "https://www.resursecrestine.ro/web-api-versetul-zilei";
// Spanish verse (NVI) from dailyverses.net, the same source as the
// Muntele Sionului Ávila site. Their script writes into #dailyVersesWrapper,
// which is a <template>, so its HTML stays inert and only the text is shown.
const SPANISH_VERSE_URL = "https://dailyverses.net/get/verse.js?language=nvi";
let spanishVerseRequested = false;

// Shows the Romanian or the Spanish verse block. Each language has its own
// daily verse; the Romanian one is never translated.
export function showVerseFor(language) {
  document.querySelectorAll("[data-verse]").forEach((block) => {
    block.hidden = block.dataset.verse !== language;
  });
  if (language === "es") spanishVerseOfTheDay();
}

function spanishVerseOfTheDay() {
  if (spanishVerseRequested) return;
  spanishVerseRequested = true;

  const script = document.createElement("script");
  script.src = SPANISH_VERSE_URL;
  script.async = true;
  script.onload = () => {
    const content = document.getElementById("dailyVersesWrapper")?.content;
    const text = content?.querySelector(".bibleText")?.textContent.trim();
    const link = content?.querySelector(".bibleVerse a");
    // Keep the verse that is already in the page if the format changes
    if (!text || !link) return;

    document.getElementById("verseOfDayES").innerText = text;
    const reference = document.getElementById("verseOfDayReferenceES");
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("https://dailyverses.net/")) {
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.target = "_blank";
      anchor.rel = "noopener";
      anchor.className = "hover:underline";
      anchor.textContent = link.textContent.trim();
      reference.replaceChildren(anchor);
    } else {
      reference.textContent = link.textContent.trim();
    }
  };
  document.head.append(script);
}

export async function verseOfTheDay() {
  let verse;
  try {
    const response = await fetch(VERSE_URL, { cache: "no-cache" });
    if (!response.ok) return;
    verse = parseVerse(await response.text());
  } catch {
    // Keep the verse that is already in the page
    return;
  }
  if (!verse) return;

  document.getElementById("verseOfDay").innerText = verse.text;
  document.getElementById("verseOfDayReference").innerText = verse.reference;
}

// The API returns a script:
//   document.writeln('<verse>');document.write('<a ...>1 Timotei 6:11</a>');
// Returns { text, reference } as plain text, or null if the format is unknown.
export function parseVerse(script) {
  const match = script.match(
    /document\.writeln\('((?:\\.|[^'\\])*)'\);\s*document\.write\('((?:\\.|[^'\\])*)'\);/
  );
  if (!match) return null;

  const reference = unescapeJs(match[2]);
  const link = reference.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i);
  return {
    text: toText(unescapeJs(match[1])),
    reference: toText(link ? link[1] : reference),
  };
}

function unescapeJs(value) {
  return value.replace(/\\(.)/g, "$1");
}

function toText(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}
