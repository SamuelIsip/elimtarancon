import { test } from "node:test";
import assert from "node:assert/strict";
import { validateContact, readFormspreeError } from "../js/modules/formImpl.js";

const valid = {
  name: "Ion Popescu",
  tlf: "612345678",
  email: "ion@example.com",
  message: "Buna ziua, as dori informatii.",
  "g-recaptcha-response": "token",
};

test("valid data passes", () => {
  assert.equal(validateContact(valid), null);
});

test("captcha is checked first", () => {
  const result = validateContact({ ...valid, name: "", "g-recaptcha-response": "" });
  assert.equal(result.field, "captcha");
});

test("fields are checked in order: name, email, tlf, message", () => {
  const all = { ...valid, name: "", email: "", tlf: "", message: "" };
  assert.equal(validateContact(all).field, "name");
  assert.equal(validateContact({ ...all, name: valid.name }).field, "email");
  assert.equal(validateContact({ ...all, name: valid.name, email: valid.email }).field, "tlf");
});

test("name must be longer than 3 characters", () => {
  assert.equal(validateContact({ ...valid, name: "Ion" }).message, "Numele este prea scurt!");
  assert.equal(validateContact({ ...valid, name: "Ioan" }), null);
});

test("email must look like an address", () => {
  assert.equal(validateContact({ ...valid, email: "ion@example" }).field, "email");
});

test("phone accepts common formats and needs 9 characters", () => {
  assert.equal(validateContact({ ...valid, tlf: "+34 612 345 678" }), null);
  assert.equal(validateContact({ ...valid, tlf: "(34)612345678" }), null);
  assert.equal(validateContact({ ...valid, tlf: "61234567" }).field, "tlf");
  assert.equal(validateContact({ ...valid, tlf: "abc123456" }).field, "tlf");
});

test("message length must be 6 to 259 characters", () => {
  assert.equal(validateContact({ ...valid, message: "12345" }).message, "Mesajul este prea scurt!");
  assert.equal(validateContact({ ...valid, message: "123456" }), null);
  assert.equal(validateContact({ ...valid, message: "x".repeat(259) }), null);
  assert.equal(validateContact({ ...valid, message: "x".repeat(260) }).message, "Mesajul este prea lung!");
});

test("Formspree reCAPTCHA failure (real response shape) maps to the captcha message", () => {
  const body = { error: "reCAPTCHA failed. error_codes=[invalid-input-response] trace_id=x" };
  assert.deepEqual(readFormspreeError(body), {
    field: "captcha",
    message: "Va rugam, verificati ca nu sunteti un robot!",
  });
  assert.equal(readFormspreeError({ errors: [{ code: "RECAPTCHA_FAILED" }] }).field, "captcha");
});

test("Formspree field errors keep their field and message", () => {
  const body = { errors: [{ field: "email", code: "TYPE_EMAIL", message: "should be an email" }] };
  assert.deepEqual(readFormspreeError(body), { field: "email", message: "should be an email" });
});

test("unknown Formspree errors fall back to a generic message", () => {
  assert.equal(readFormspreeError({}).message, "Mesajul nu a putut fi trimis. Incercati din nou!");
  assert.equal(readFormspreeError({}).field, undefined);
});
