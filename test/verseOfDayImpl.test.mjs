import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVerse } from "../js/modules/verseOfDayImpl.js";

test("parses the real API response", () => {
  const script =
    "document.writeln('Iar tu, om al lui Dumnezeu, fugi de aceste lucruri şi caută neprihănirea.');" +
    "document.write('<a onclick=\"var w=window.open(this.href);w.focus();return false;\" " +
    "href=\"https://biblia.resursecrestine.ro/1-timotei/6/11#verset-11\">1 Timotei 6:11</a>');";
  assert.deepEqual(parseVerse(script), {
    text: "Iar tu, om al lui Dumnezeu, fugi de aceste lucruri şi caută neprihănirea.",
    reference: "1 Timotei 6:11",
  });
});

test("unescapes quotes and decodes entities", () => {
  const script =
    "document.writeln('El a zis: \\'Pace vouă!\\' &amp; a plecat.');" +
    "document.write('<a href=\"#\">Ioan 20:19</a>');";
  assert.deepEqual(parseVerse(script), {
    text: "El a zis: 'Pace vouă!' & a plecat.",
    reference: "Ioan 20:19",
  });
});

test("never returns markup, so nothing can run on the page", () => {
  const script =
    "document.writeln('<img src=x onerror=alert(1)>Verset');" +
    "document.write('<img src=x onerror=alert(1)><a href=\"#\"><b>Psalmi 23:1</b></a>');";
  assert.deepEqual(parseVerse(script), { text: "Verset", reference: "Psalmi 23:1" });
});

test("returns null for an unknown format", () => {
  assert.equal(parseVerse("<html>Service unavailable</html>"), null);
});
