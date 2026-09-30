import { loadScrollReveal } from "./modules/scrollRevealImpl.js?v=2";
import { verseOfTheDay } from "./modules/verseOfDayImpl.js?v=2";
import { submitForm } from "./modules/formImpl.js?v=2";

loadScrollReveal();
verseOfTheDay();

const contactForm = document.getElementById("contact-form");
contactForm.addEventListener("submit", submitForm);

document.getElementById("current-year").innerHTML = new Date().getFullYear();
