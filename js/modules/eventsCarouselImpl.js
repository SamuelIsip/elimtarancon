import { t, onLanguageChange } from "./i18n.js?v=5";

// Evenimente carousel. The posters are listed in index.html, newest first.
// Swiping and trackpads use the browser's native scroll snapping; this adds
// the arrows, dots, counter, keyboard support and clicking on a side poster.
export function initEventsCarousel(root) {
  if (!root) return;

  const track = root.querySelector("[data-events-track]");
  const slides = [...track.children];
  const prev = root.querySelector("[data-events-prev]");
  const next = root.querySelector("[data-events-next]");
  const counter = root.querySelector("[data-events-counter]");
  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "events-dot";
    dot.addEventListener("click", () => goTo(i));
    root.querySelector("[data-events-dots]").append(dot);
    return dot;
  });
  const labelDots = () =>
    dots.forEach((dot, i) =>
      dot.setAttribute(
        "aria-label",
        t("events.dot", "Evenimentul {n} din {total}", { n: i + 1, total: slides.length })
      )
    );
  labelDots();
  onLanguageChange(labelDots);
  let current = -1;

  function goTo(index) {
    const slide = slides[Math.max(0, Math.min(index, slides.length - 1))];
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
    });
  }

  function setActive(index) {
    if (index === current) return;
    current = index;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.setAttribute("aria-current", i === index));
    counter.textContent = `${index + 1} / ${slides.length}`;
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  }

  // The active poster is the one closest to the centre of the track
  function updateActive() {
    const centre = track.scrollLeft + track.clientWidth / 2;
    const distances = slides.map((slide) =>
      Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - centre)
    );
    setActive(distances.indexOf(Math.min(...distances)));
  }

  let frame;
  track.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActive);
    },
    { passive: true }
  );

  prev.addEventListener("click", () => goTo(current - 1));
  next.addEventListener("click", () => goTo(current + 1));
  slides.forEach((slide, i) =>
    slide.addEventListener("click", () => {
      if (i !== current) goTo(i);
    })
  );
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(current - 1);
    else if (e.key === "ArrowRight") goTo(current + 1);
    else return;
    e.preventDefault();
  });

  setActive(0);
}
