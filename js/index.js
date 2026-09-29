import { loadScrollReveal } from "./modules/scrollRevealImpl.js";
import { verseOfTheDay } from "./modules/verseOfDayImpl.js";
import { submitForm } from "./modules/formImpl.js";

loadScrollReveal();
verseOfTheDay();

const contactForm = document.getElementById("contact-form");
contactForm.addEventListener("submit", submitForm);

document.getElementById("current-year").innerHTML = new Date().getFullYear();
