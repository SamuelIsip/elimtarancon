import { t, onLanguageChange } from "./i18n.js?v=5";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqpangpy";
const CAPTCHA_FIELD = "g-recaptcha-response";

// Messages are looked up when shown, so they follow the language switch
const captchaError = () => ({
  field: "captcha",
  message: t("form.error.captcha", "Va rugam, verificati ca nu sunteti un robot!"),
});
const networkError = () => ({
  message: t("form.error.network", "Mesajul nu a putut fi trimis. Verificati conexiunea la internet!"),
});
const sendError = () => ({
  message: t("form.error.send", "Mesajul nu a putut fi trimis. Incercati din nou!"),
});

export function initContactForm(form) {
  const view = createView();
  // An error shown in the other language would be confusing, so clear it
  onLanguageChange(() => view.clearErrors());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    view.clearErrors();
    const invalid = validateContact(data);
    if (invalid) return view.showError(invalid);

    view.setStatus("sending");
    const error = await sendToFormspree(data);
    // A reCAPTCHA token can only be verified once, so request a new one
    grecaptcha.reset();

    if (error) {
      view.setStatus("idle");
      return view.showError(error);
    }

    form.reset();
    view.setStatus("sent");
  });
}

// Returns the first problem as { field, message }, or null when the data is valid.
export function validateContact(data) {
  if (!data[CAPTCHA_FIELD]) return captchaError();

  return (
    validateName(data.name) ||
    validateEmail(data.email) ||
    validateTlf(data.tlf) ||
    validateMessage(data.message) ||
    null
  );
}

// Turns a Formspree error response body into { field, message }.
export function readFormspreeError(body) {
  const error = body.errors?.[0];
  if (error?.code?.includes("RECAPTCHA") || body.error?.includes("reCAPTCHA"))
    return captchaError();

  if (error?.message) return { field: error.field, message: error.message };
  return sendError();
}

async function sendToFormspree(data) {
  let response;
  try {
    response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch {
    return networkError();
  }

  if (response.ok) return null;
  return readFormspreeError(await response.json().catch(() => ({})));
}

const problem = (field, key, romanian) => ({ field, message: t(key, romanian) });

function validateName(name) {
  if (!name) return problem("name", "form.error.nameRequired", "Trebuie sa introduceti un Nume!");
  if (name.length <= 3) return problem("name", "form.error.nameShort", "Numele este prea scurt!");
}

function validateEmail(email) {
  if (!email) return problem("email", "form.error.emailRequired", "Trebuie sa introduceti un email!");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return problem("email", "form.error.emailInvalid", "Introduceti o adresa de email corecta!");
}

function validateTlf(tlf) {
  if (!tlf) return problem("tlf", "form.error.tlfRequired", "Trebuie sa introduceti un numar de Tlf!");
  if (!/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/.test(tlf) || tlf.length < 9)
    return problem("tlf", "form.error.tlfInvalid", "Introduceti un numar de Tlf. corect! Ex: 789456123");
}

function validateMessage(message) {
  if (!message) return problem("message", "form.error.messageRequired", "Trebuie sa introduceti un mesaj!");
  if (message.length <= 5) return problem("message", "form.error.messageShort", "Mesajul este prea scurt!");
  if (message.length >= 260) return problem("message", "form.error.messageLong", "Mesajul este prea lung!");
}

// The only code that touches the page.
function createView() {
  const errorBox = document.getElementById("message_error_container");
  const errorText = document.getElementById("error_message");
  const loading = document.getElementById("submit_loading");
  const sent = document.getElementById("submit_ok");
  const fields = ["captcha", "name", "tlf", "email", "message"].map((id) =>
    document.getElementById(id)
  );
  let idleTimer;

  function setStatus(status) {
    clearTimeout(idleTimer);
    loading.style.visibility = status === "sending" ? "visible" : "hidden";
    sent.style.visibility = status === "sent" ? "visible" : "hidden";
    if (status === "sent") idleTimer = setTimeout(() => setStatus("idle"), 5000);
  }

  return {
    setStatus,
    clearErrors() {
      // Clearing the inline color restores the Tailwind border and focus styles
      fields.forEach((field) => (field.style.borderColor = ""));
      errorBox.style.display = "none";
    },
    showError({ field, message }) {
      const element = field && document.getElementById(field);
      if (element) element.style.borderColor = "red";
      errorBox.style.display = "block";
      errorText.innerText = message;
    },
  };
}
