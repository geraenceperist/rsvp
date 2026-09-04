import "./cike.css";
import { initSmoothScroll } from "./smooth-scroll.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lenis = initSmoothScroll();
const intro = document.querySelector("#cike-intro");
const progress = document.querySelector("#cike-progress");
const orb = document.querySelector("#cike-orb");

window.addEventListener("load", () => {
  window.setTimeout(() => intro.classList.add("complete"), 600);
});

const updateScroll = (scroll) => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scroll / max : 0})`;
  document.documentElement.style.setProperty("--cike-scroll", `${scroll}px`);
  document.documentElement.style.setProperty("--cike-light", `${Math.min(scroll * 0.025, 120)}px`);
};

if (lenis) lenis.on("scroll", ({ scroll }) => updateScroll(scroll));
else {
  window.addEventListener("scroll", () => updateScroll(window.scrollY), { passive: true });
  updateScroll(window.scrollY);
}

const cursor = document.querySelector("#cike-cursor");
let pointerX = -40;
let pointerY = -40;
let cursorX = -40;
let cursorY = -40;

window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;

  if (!reducedMotion) {
    const x = (event.clientX / window.innerWidth - 0.5) * 14;
    const y = (event.clientY / window.innerHeight - 0.5) * 14;
    orb.style.transform = `translate(${x}px, ${y}px)`;
  }
});

const moveCursor = () => {
  cursorX += (pointerX - cursorX) * 0.16;
  cursorY += (pointerY - cursorY) * 0.16;
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
  requestAnimationFrame(moveCursor);
};

if (!reducedMotion) moveCursor();

document.querySelectorAll("a, button, .program-list article").forEach((element) => {
  element.addEventListener("pointerenter", () => cursor.classList.add("active"));
  element.addEventListener("pointerleave", () => cursor.classList.remove("active"));
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal-cike").forEach((element) => observer.observe(element));

const card = document.querySelector("#date-card");

if (!reducedMotion) {
  card.addEventListener("pointermove", (event) => {
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--card-rx", `${y * -10}deg`);
    card.style.setProperty("--card-ry", `${x * 12}deg`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--card-rx", "0deg");
    card.style.setProperty("--card-ry", "0deg");
  });
}

const modal = document.querySelector("#cike-modal");
const form = modal.querySelector("form");

document.querySelectorAll("[data-cike-rsvp]").forEach((button) => {
  button.addEventListener("click", () => {
    modal.classList.remove("submitted");
    modal.showModal();
  });
});

modal.querySelector(".cike-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  modal.classList.add("submitted");
});
