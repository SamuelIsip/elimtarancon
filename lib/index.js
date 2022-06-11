"use strict";

const contactForm = document.getElementById("contact-form");
contactForm.addEventListener("submit", submitForm);

function submitForm(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  dataValidation(data);
  console.log(JSON.stringify(data));

  if (!fetchUserData(data)) {
    return false;
  }

  contactForm.reset();
}

async function fetchUserData(data) {
  const response = await fetch("https://elimtaranconemail.herokuapp.com/sendEmail", {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) return false;
}

function dataValidation() {
  var response = grecaptcha.getResponse();

  if (response.length == 0) {
    alert("please verify you are humann!");
    e.preventDefault();
    return false;
  }
}