import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { t, fill, getLanguage } from "../js/modules/i18n.js";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("Romanian is the default and uses the text written in the code", () => {
  assert.equal(getLanguage(), "ro");
  assert.equal(t("form.error.nameShort", "Numele este prea scurt!"), "Numele este prea scurt!");
});

test("placeholders are filled, unknown ones are left as they are", () => {
  assert.equal(fill("Evenimentul {n} din {total}", { n: 2, total: 13 }), "Evenimentul 2 din 13");
  assert.equal(fill("{n} / {total}", { n: 1 }), "1 / {total}");
});

test("es.json has a Spanish text for every key the page and scripts use", () => {
  const spanish = JSON.parse(read("lng/es.json"));
  const html = read("index.html");
  const scripts = readdirSync(new URL("js/modules/", root))
    .map((file) => read(`js/modules/${file}`))
    .join("\n");

  const used = new Set([...html.matchAll(/data-lng(?:-[a-z-]+)?="([^"]+)"/g)].map((m) => m[1]));
  for (const m of scripts.matchAll(/"((?:form|events)\.[a-zA-Z.]+)"/g)) used.add(m[1]);

  const missing = [...used].filter((key) => !(key in spanish));
  assert.deepEqual(missing, []);
});

test("Spanish texts keep the same placeholders and line breaks as the page", () => {
  const spanish = JSON.parse(read("lng/es.json"));
  assert.match(spanish["events.dot"], /\{n\}.*\{total\}/);
  for (const key of ["about.item1.text", "about.item2.text", "about.item3.text"]) {
    assert.ok(spanish[key].includes("<br />"), key);
  }
});
