export async function submitForm(e) {
  e.preventDefault();
  const data = sanitazeData(Object.fromEntries(new FormData(e.target)));

  if (dataValidation(data) == false) return false;

  if ((await sendToFormspree(data)) == false) return false;

  e.target.reset();
}

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqpangpy";

async function sendToFormspree(data) {
  toggleButton();

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
    hideSubmitInfo();
    return errorMessage("Mesajul nu a putut fi trimis. Verificati conexiunea la internet!");
  } finally {
    // A reCAPTCHA token can only be verified once, so request a new one
    grecaptcha.reset();
  }

  if (response.ok) {
    toggleButton();
    setTimeout(() => {
      hideSubmitInfo();
    }, 5000);
    return true;
  }

  hideSubmitInfo();
  const result = await response.json().catch(() => ({}));
  const error = result.errors?.[0];
  if (error?.code?.includes("RECAPTCHA") || result.error?.includes("reCAPTCHA"))
    return errorMessage("Va rugam, verificati ca nu sunteti un robot!", "captcha");

  return errorMessage(
    error?.message || "Mesajul nu a putut fi trimis. Incercati din nou!",
    error?.field
  );
}

function dataValidation(data) {
  const response = grecaptcha.getResponse();
  if (response.length == 0)
    return errorMessage("Va rugam, verificati ca nu sunteti un robot!", "captcha");

  document.getElementById("captcha").style.borderColor = "rgb(156 163 175)";

  if (validateName(data) == false) return false;
  if (validateEmail(data) == false) return false;
  if (validateTlf(data) == false) return false;
  if (validateMessage(data) == false) return false;
  document.getElementById("message_error_container").style.display = "none";
  return true;
}

function validateName(data) {
  // Name
  if (data.name == "")
    return errorMessage("Trebuie sa introduceti un Nume!", "name");

  if (data.name.length <= 3)
    return errorMessage("Numele este prea scurt!", "name");

  document.getElementById("name").style.borderColor = "rgb(156 163 175)";
}

function validateTlf(data) {
  // Phone Number
  if (data.tlf == "")
    return errorMessage("Trebuie sa introduceti un numar de Tlf!", "tlf");

  const regexPhone = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
  if (!regexPhone.test(data.tlf) || data.tlf.length < 9)
    return errorMessage("Introduceti un numar de Tlf. corect! Ex: 789456123", "tlf");

  document.getElementById("tlf").style.borderColor = "rgb(156 163 175)";
}

function validateEmail(data) {
  // Email
  if (data.email == "")
    return errorMessage("Trebuie sa introduceti un email!", "email");

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(data.email))
    return errorMessage("Introduceti o adresa de email corecta!", "email");

  document.getElementById("email").style.borderColor = "rgb(156 163 175)";
}

function validateMessage(data) {
  // Message
  if (data.message == "")
    return errorMessage("Trebuie sa introduceti un mesaj!", "message");

  if (data.message.length <= 5)
    return errorMessage("Mesajul este prea scurt!", "message");

  if (data.message.length >= 260)
    return errorMessage("Mesajul este prea lung!", "message");

  document.getElementById("message").style.borderColor = "rgb(156 163 175)";
}

function errorMessage(message, idElement) {
  const element = idElement && document.getElementById(idElement);
  if (element) element.style.borderColor = "red";
  document.getElementById("message_error_container").style.display = "block";
  document.getElementById("error_message").innerText = message;
  return false;
}

function sanitazeData(data) {
  return {
    name: DOMPurify.sanitize(data.name),
    email: DOMPurify.sanitize(data.email),
    tlf: DOMPurify.sanitize(data.tlf),
    message: DOMPurify.sanitize(data.message),
    "g-recaptcha-response": DOMPurify.sanitize(data["g-recaptcha-response"]),
  };
}

function toggleButton() {
  const loading = document.querySelector("#submit_loading");
  const ok = document.querySelector("#submit_ok");
  if (loading.style.visibility === "hidden") {
    loading.style.visibility = "visible";
    ok.style.visibility = "hidden";
  } else {
    ok.style.visibility = "visible";
    loading.style.visibility = "hidden";
  }
}

function hideSubmitInfo() {
  document.querySelector("#submit_loading").style.visibility = "hidden";
  document.querySelector("#submit_ok").style.visibility = "hidden";
}
