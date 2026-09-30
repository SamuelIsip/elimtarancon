import { loadScrollReveal } from "./modules/scrollRevealImpl.js?v=3";
import { verseOfTheDay } from "./modules/verseOfDayImpl.js?v=3";
import { initContactForm } from "./modules/formImpl.js?v=3";

loadScrollReveal();
verseOfTheDay();
initContactForm(document.getElementById("contact-form"));

document.getElementById("current-year").innerHTML = new Date().getFullYear();
