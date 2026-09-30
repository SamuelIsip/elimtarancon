import { loadScrollReveal } from "./modules/scrollRevealImpl.js?v=5";
import { verseOfTheDay, showVerseFor } from "./modules/verseOfDayImpl.js?v=5";
import { initContactForm } from "./modules/formImpl.js?v=5";
import { initEventsCarousel } from "./modules/eventsCarouselImpl.js?v=5";
// Every module must import i18n.js with this same ?v= so they share one copy
import { initLanguageSwitch, onLanguageChange } from "./modules/i18n.js?v=5";

loadScrollReveal();
verseOfTheDay();
initContactForm(document.getElementById("contact-form"));
initEventsCarousel(document.querySelector("[data-events-carousel]"));

document.getElementById("current-year").innerHTML = new Date().getFullYear();

onLanguageChange(showVerseFor);
initLanguageSwitch(document.querySelector("[data-language-switch]"));
