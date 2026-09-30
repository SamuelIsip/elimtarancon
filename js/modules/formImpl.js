const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqpangpy";
const CAPTCHA_FIELD = "g-recaptcha-response";

const CAPTCHA_ERROR = {
  field: "captcha",
  message: "Va rugam, verificati ca nu sunteti un robot!",
};
const NETWORK_ERROR = {
  message: "Mesajul nu a putut fi trimis. Verificati conexiunea la internet!",
};
const SEND_ERROR = {
  message: "Mesajul nu a putut fi trimis. Incercati din nou!",
};

export function initContactForm(form) {
  const view = createView();

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
  if (!data[CAPTCHA_FIELD]) return CAPTCHA_ERROR;

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
    return CAPTCHA_ERROR;

  if (error?.message) return { field: error.field, message: error.message };
  return SEND_ERROR;
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
    return NETWORK_ERROR;
  }

  if (response.ok) return null;
  return readFormspreeError(await response.json().catch(() => ({})));
}

function validateName(name) {
  if (!name) return { field: "name", message: "Trebuie sa introduceti un Nume!" };
  if (name.length <= 3) return { field: "name", message: "Numele este prea scurt!" };
}

function validateEmail(email) {
  if (!email) return { field: "email", message: "Trebuie sa introduceti un email!" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { field: "email", message: "Introduceti o adresa de email corecta!" };
}

function validateTlf(tlf) {
  if (!tlf) return { field: "tlf", message: "Trebuie sa introduceti un numar de Tlf!" };
  if (!/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/.test(tlf) || tlf.length < 9)
    return { field: "tlf", message: "Introduceti un numar de Tlf. corect! Ex: 789456123" };
}

function validateMessage(message) {
  if (!message) return { field: "message", message: "Trebuie sa introduceti un mesaj!" };
  if (message.length <= 5) return { field: "message", message: "Mesajul este prea scurt!" };
  if (message.length >= 260) return { field: "message", message: "Mesajul este prea lung!" };
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
