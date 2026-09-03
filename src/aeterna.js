import "./aeterna.css";
import { initSmoothScroll } from "./smooth-scroll.js";

const lenis = initSmoothScroll();
const intro = document.querySelector("#aeterna-intro");
const cursor = document.querySelector("#aeterna-cursor");
const modal = document.querySelector("#aeterna-modal");

window.addEventListener("load", () => {
  window.setTimeout(() => intro.classList.add("complete"), 800);
});

lenis?.on("scroll", ({ scroll }) => {
  const progress = Math.min(scroll / window.innerHeight, 1);
  document.documentElement.style.setProperty("--aeterna-image-scale", 1 + progress * 0.12);
  document.documentElement.style.setProperty("--aeterna-title-shift", `${progress * 110}px`);
  document.documentElement.style.setProperty("--aeterna-hero-fade", 1 - progress * 0.72);
});

let pointerX = -80;
let pointerY = -80;
let currentX = -80;
let currentY = -80;

window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
});

const moveCursor = () => {
  currentX += (pointerX - currentX) * 0.14;
  currentY += (pointerY - currentY) * 0.14;
  cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
  requestAnimationFrame(moveCursor);
};
moveCursor();

document.querySelectorAll("a, button").forEach((element) => {
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
  { threshold: 0.15 },
);

document.querySelectorAll(".reveal-aeterna").forEach((element) => observer.observe(element));

document.querySelectorAll(".magnetic").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    const bounds = element.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    element.style.transform = `translate(${x * 0.1}px, ${y * 0.16}px)`;
  });
  element.addEventListener("pointerleave", () => {
    element.style.transform = "";
  });
});

document.querySelectorAll("[data-aeterna-rsvp]").forEach((button) => {
  button.addEventListener("click", () => modal.showModal());
});

document.querySelector(".aeterna-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});
modal.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  modal.classList.add("success");
});
