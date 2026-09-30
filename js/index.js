import { loadScrollReveal } from "./modules/scrollRevealImpl.js?v=4";
import { verseOfTheDay } from "./modules/verseOfDayImpl.js?v=4";
import { initContactForm } from "./modules/formImpl.js?v=4";
import { initEventsCarousel } from "./modules/eventsCarouselImpl.js?v=4";

loadScrollReveal();
verseOfTheDay();
initContactForm(document.getElementById("contact-form"));
initEventsCarousel(document.querySelector("[data-events-carousel]"));

document.getElementById("current-year").innerHTML = new Date().getFullYear();
