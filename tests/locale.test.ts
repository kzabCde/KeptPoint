import test from "node:test";
import assert from "node:assert/strict";
import { localeFromAcceptLanguage } from "../lib/i18n.ts";

test("browser Thai preference resolves to Thai", () => {
  assert.equal(localeFromAcceptLanguage("th-TH,th;q=0.9,en;q=0.8"), "th");
});

test("browser English preference resolves to English", () => {
  assert.equal(localeFromAcceptLanguage("en-US,en;q=0.9,th;q=0.7"), "en");
});

test("quality weights win over header order", () => {
  assert.equal(localeFromAcceptLanguage("th;q=0.4,en-GB;q=0.9"), "en");
});

test("unsupported and missing languages fall back to Thai", () => {
  assert.equal(localeFromAcceptLanguage("ja-JP,fr;q=0.8"), "th");
  assert.equal(localeFromAcceptLanguage(null), "th");
});
