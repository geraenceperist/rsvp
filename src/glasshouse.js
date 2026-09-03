import "./glasshouse.css";
import { initSmoothScroll } from "./smooth-scroll.js";

const lenis = initSmoothScroll();
const intro = document.querySelector("#glass-intro");

window.addEventListener("load", () => {
  window.setTimeout(() => intro.classList.add("complete"), 700);
});

lenis?.on("scroll", ({ scroll }) => {
  const progress = Math.min(scroll / window.innerHeight, 1);
  document.documentElement.style.setProperty("--glass-shift", `${progress * 75}px`);
  document.documentElement.style.setProperty("--glass-scale", 1 - progress * 0.055);
});

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scroll);
    if (lenis) lenis.scrollTo(target);
    else target?.scrollIntoView();
  });
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

document.querySelectorAll(".reveal-glass").forEach((element) => observer.observe(element));

const modal = document.querySelector("#glass-modal");
document.querySelectorAll("[data-rsvp]").forEach((button) => {
  button.addEventListener("click", () => modal.showModal());
});
document.querySelector(".glass-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});
modal.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  modal.classList.add("success");
});

const canvas = document.querySelector("#garden-canvas");
const context = canvas.getContext("2d");
const pointer = { x: 0.5, y: 0.45 };

const resize = () => {
  const ratio = Math.min(window.devicePixelRatio, 1.5);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
};

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer.x += (event.clientX / window.innerWidth - pointer.x) * 0.15;
  pointer.y += (event.clientY / window.innerHeight - pointer.y) * 0.15;
});
resize();

const blobs = [
  { x: 0.18, y: 0.25, r: 0.35, color: "rgba(245,255,177,.72)", speed: 0.00018 },
  { x: 0.75, y: 0.3, r: 0.42, color: "rgba(192,184,240,.68)", speed: -0.00013 },
  { x: 0.55, y: 0.78, r: 0.38, color: "rgba(105,164,133,.4)", speed: 0.0001 },
];

const draw = (time) => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#dfe4d7";
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = "screen";
  blobs.forEach((blob, index) => {
    const x = (blob.x + Math.sin(time * blob.speed + index) * 0.11 + (pointer.x - 0.5) * 0.04) * width;
    const y = (blob.y + Math.cos(time * blob.speed * 1.4 + index) * 0.1 + (pointer.y - 0.5) * 0.04) * height;
    const radius = blob.r * Math.max(width, height);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, blob.color);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  });
  context.globalCompositeOperation = "source-over";
  requestAnimationFrame(draw);
};

requestAnimationFrame(draw);
