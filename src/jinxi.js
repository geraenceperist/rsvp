import "./jinxi.css";
import { initSmoothScroll } from "./smooth-scroll.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lenis = initSmoothScroll();
const intro = document.querySelector("#jinxi-intro");
const thread = document.querySelector("#red-thread-path");

window.addEventListener("load", () => {
  window.setTimeout(() => intro.classList.add("complete"), 750);
});

if (thread) {
  const length = thread.getTotalLength();
  thread.style.strokeDasharray = `${length}`;
  thread.style.strokeDashoffset = `${length}`;

  const updateThread = (scroll) => {
    const progress = Math.min(scroll / (window.innerHeight * 1.15), 1);
    thread.style.strokeDashoffset = `${length * (1 - progress)}`;
    document.documentElement.style.setProperty("--jinxi-shift", `${progress * 90}px`);
    document.documentElement.style.setProperty("--jinxi-fade", 1 - progress * 0.7);
  };

  if (lenis) lenis.on("scroll", ({ scroll }) => updateThread(scroll));
  else updateThread(window.scrollY);
}

const cursor = document.querySelector("#jinxi-cursor");
let pointerX = -80;
let pointerY = -80;
let cursorX = -80;
let cursorY = -80;

window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
});

const moveCursor = () => {
  cursorX += (pointerX - cursorX) * 0.18;
  cursorY += (pointerY - cursorY) * 0.18;
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
  requestAnimationFrame(moveCursor);
};

if (!reducedMotion) moveCursor();

document.querySelectorAll("a, button, .day-list article").forEach((element) => {
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
  { threshold: 0.14 },
);

document.querySelectorAll(".reveal-jinxi").forEach((element) => observer.observe(element));

const timeDisplay = document.querySelector("#time-display");
const timeLabel = document.querySelector("#time-label");

document.querySelectorAll(".day-list article").forEach((item) => {
  item.addEventListener("pointerenter", () => {
    document.querySelector(".day-list article.active")?.classList.remove("active");
    item.classList.add("active");
    timeDisplay.textContent = item.dataset.time;
    timeLabel.textContent = item.dataset.label;
  });
});

const modal = document.querySelector("#jinxi-modal");
const form = modal.querySelector("form");

document.querySelectorAll("[data-jinxi-rsvp]").forEach((button) => {
  button.addEventListener("click", () => modal.showModal());
});

modal.querySelector(".jinxi-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  modal.classList.add("submitted");
});

const canvas = document.querySelector("#jinxi-ink");
const context = canvas.getContext("2d");
const inkBlots = [
  { x: 0.18, y: 0.3, radius: 0.28, speed: 0.0001, phase: 0.2 },
  { x: 0.74, y: 0.52, radius: 0.34, speed: 0.00007, phase: 2.4 },
  { x: 0.48, y: 0.84, radius: 0.22, speed: 0.00012, phase: 4.1 },
];
const inkPointer = { x: 0.5, y: 0.5 };

window.addEventListener("pointermove", (event) => {
  inkPointer.x = event.clientX / window.innerWidth;
  inkPointer.y = event.clientY / window.innerHeight;
});

const resizeCanvas = () => {
  const ratio = Math.min(window.devicePixelRatio, 1.5);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  if (reducedMotion) drawInk();
};

const drawInk = (now = 0) => {
  context.clearRect(0, 0, canvas.width, canvas.height);

  inkBlots.forEach((blot, index) => {
    const drift = reducedMotion ? 0 : Math.sin(now * blot.speed + blot.phase) * 0.065;
    const x = (blot.x + drift + (inkPointer.x - 0.5) * 0.018 * index) * canvas.width;
    const y = (blot.y - drift * 0.6 + (inkPointer.y - 0.5) * 0.012 * index) * canvas.height;
    const radius = blot.radius * Math.min(canvas.width, canvas.height);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(24, 25, 20, ${0.13 - index * 0.018})`);
    gradient.addColorStop(0.45, "rgba(37, 41, 31, 0.055)");
    gradient.addColorStop(1, "rgba(37, 41, 31, 0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(x, y, radius, radius * (0.62 + index * 0.08), drift * 2.5, 0, Math.PI * 2);
    context.fill();
  });

  if (!reducedMotion) requestAnimationFrame(drawInk);
};

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawInk();
