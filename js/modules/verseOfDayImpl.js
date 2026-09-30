const VERSE_URL = "https://www.resursecrestine.ro/web-api-versetul-zilei";

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
