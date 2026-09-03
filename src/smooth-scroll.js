import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./transitions.css";

export const initSmoothScroll = () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  return new Lenis({
    autoRaf: true,
    anchors: {
      offset: 0,
      duration: 1.25,
    },
    duration: 1.25,
    lerp: 0.085,
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.1,
  });
};
