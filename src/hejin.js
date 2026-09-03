import "./hejin.css";
import { initSmoothScroll } from "./smooth-scroll.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lenis = initSmoothScroll();
const intro = document.querySelector("#hejin-intro");
const brushPath = document.querySelector("#hejin-brush-path");

window.addEventListener("load", () => {
  window.setTimeout(() => intro.classList.add("complete"), 650);
});

if (brushPath) {
  const length = brushPath.getTotalLength();
  brushPath.style.strokeDasharray = `${length}`;
  brushPath.style.strokeDashoffset = `${length}`;

  const updateBrush = (scroll) => {
    const progress = Math.min(scroll / (window.innerHeight * 0.82), 1);
    brushPath.style.strokeDashoffset = `${length * (1 - progress)}`;
    document.documentElement.style.setProperty("--hejin-shadow-y", `${scroll * 0.035}px`);
    document.documentElement.style.setProperty("--hejin-shadow-x", `${scroll * -0.018}px`);
  };

  if (lenis) lenis.on("scroll", ({ scroll }) => updateBrush(scroll));
  else {
    window.addEventListener("scroll", () => updateBrush(window.scrollY), { passive: true });
    updateBrush(window.scrollY);
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.14 },
);

document.querySelectorAll(".reveal-hejin").forEach((element) => observer.observe(element));

const treeShadow = document.querySelector(".tree-shadow");

if (!reducedMotion) {
  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 18;
    const y = (event.clientY / window.innerHeight - 0.5) * 12;
    treeShadow.style.setProperty("--pointer-x", `${x}px`);
    treeShadow.style.setProperty("--pointer-y", `${y}px`);
  });
}

const modal = document.querySelector("#hejin-modal");
const form = modal.querySelector("form");

document.querySelectorAll("[data-hejin-rsvp]").forEach((button) => {
  button.addEventListener("click", () => {
    modal.classList.remove("submitted");
    modal.showModal();
  });
});

modal.querySelector(".hejin-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  modal.classList.add("submitted");
});
