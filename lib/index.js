"use strict";

const contactForm = document.getElementById("contact-form");
contactForm.addEventListener("submit", submitForm);

var onloadCallback = function onloadCallback() {
  grecaptcha.render("recaptcha", {
    sitekey: "6Lf_YFkgAAAAAGqT_55SvWQyVfKzVHMfwahxJ_v4"
  });
};

function submitForm(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  /* let name = document.getElementById("name").value;
  let tlf = document.getElementById("tlf").value;
  let email = document.getElementById("email").value;
  let message = document.getElementById("message").value;*/

  var response = grecaptcha.getResponse();

  if (response.length == 0) {
    alert("please verify you are humann!");
    e.preventDefault();
    return false;
  } //console.log(JSON.parse(JSON.stringify(data)).name);


  contactForm.reset();
}