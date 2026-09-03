import "./styles.css";
import { initSmoothScroll } from "./smooth-scroll.js";

const lenis = initSmoothScroll();

lenis?.on("scroll", ({ scroll }) => {
  const progress = Math.min(scroll / window.innerHeight, 1);
  document.documentElement.style.setProperty("--afterglow-shift", `${progress * 85}px`);
  document.documentElement.style.setProperty("--afterglow-scale", 1 - progress * 0.06);
});

const DEFAULTS = {
  partnerOne: "Maya",
  partnerTwo: "Leo",
  date: "2027-09-18",
  location: "Comporta, Portugal",
  tagline: "Two souls, one very good party.",
  intro:
    "We found our forever in each other. Now we’re gathering our favorite people at the edge of the Atlantic for three days of salt air, candlelight, and dancing until dawn.",
  palette: "wine",
};

const PALETTES = {
  wine: {
    ink: "#1d1212",
    paper: "#f3eee5",
    primary: "#61151d",
    accent: "#f16f59",
    soft: "#e9b6b0",
    pop: "#e8ff78",
    shaderA: [0.38, 0.06, 0.10],
    shaderB: [0.94, 0.30, 0.24],
  },
  ocean: {
    ink: "#0a252c",
    paper: "#eef3ef",
    primary: "#123f4a",
    accent: "#56c7bf",
    soft: "#b8d8d4",
    pop: "#ffc857",
    shaderA: [0.03, 0.21, 0.25],
    shaderB: [0.22, 0.72, 0.70],
  },
  olive: {
    ink: "#25261c",
    paper: "#f3f0e4",
    primary: "#374125",
    accent: "#b3a369",
    soft: "#d7cda2",
    pop: "#ff8a68",
    shaderA: [0.13, 0.18, 0.08],
    shaderB: [0.62, 0.52, 0.25],
  },
  midnight: {
    ink: "#10111e",
    paper: "#f1eff8",
    primary: "#191b2e",
    accent: "#8976e8",
    soft: "#c1b8f0",
    pop: "#d9ff6b",
    shaderA: [0.04, 0.04, 0.13],
    shaderB: [0.42, 0.31, 0.87],
  },
};

const storedConfig = JSON.parse(localStorage.getItem("afterglow-config") || "null");
let config = { ...DEFAULTS, ...storedConfig };
let shaderPalette = PALETTES[config.palette];

const formatDate = (dateString) => {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replaceAll("/", " · ");
};

const applyConfig = () => {
  const values = {
    ...config,
    initialOne: config.partnerOne.trim().charAt(0) || "M",
    initialTwo: config.partnerTwo.trim().charAt(0) || "L",
    signature: `${config.partnerOne.trim().charAt(0) || "M"} + ${config.partnerTwo.trim().charAt(0) || "L"}`,
    dateDisplay: formatDate(config.date),
  };

  Object.entries(values).forEach(([key, value]) => {
    document.querySelectorAll(`[data-bind="${key}"]`).forEach((element) => {
      element.textContent = value;
    });
  });

  document.querySelectorAll("[data-edit]").forEach((input) => {
    input.value = config[input.dataset.edit] || "";
  });

  document.querySelectorAll("[data-palette]").forEach((button) => {
    button.classList.toggle("active", button.dataset.palette === config.palette);
  });

  const palette = PALETTES[config.palette];
  shaderPalette = palette;
  const root = document.documentElement;
  root.style.setProperty("--ink", palette.ink);
  root.style.setProperty("--paper", palette.paper);
  root.style.setProperty("--wine", palette.primary);
  root.style.setProperty("--coral", palette.accent);
  root.style.setProperty("--blush", palette.soft);
  root.style.setProperty("--acid", palette.pop);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", palette.primary);
  document.title = `${config.partnerOne} & ${config.partnerTwo} — Wedding Invitation`;
};

applyConfig();

window.addEventListener("load", () => {
  window.setTimeout(() => document.querySelector("#loader").classList.add("hidden"), 600);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scroll);
    if (lenis) lenis.scrollTo(target);
    else target?.scrollIntoView();
  });
});

const updateCountdown = () => {
  const target = new Date(`${config.date}T16:30:00`).getTime();
  const distance = Math.max(0, target - Date.now());
  const units = {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };

  Object.entries(units).forEach(([unit, value]) => {
    const width = unit === "days" ? 3 : 2;
    document.querySelector(`[data-count="${unit}"]`).textContent = String(value).padStart(width, "0");
  });
};

updateCountdown();
window.setInterval(updateCountdown, 1000);

const modal = document.querySelector("#rsvp-modal");
document.querySelectorAll("[data-open-rsvp]").forEach((button) => {
  button.addEventListener("click", () => {
    modal.classList.remove("success");
    modal.showModal();
    document.body.classList.add("modal-open");
  });
});

document.querySelector("#rsvp-close").addEventListener("click", () => modal.close());
modal.addEventListener("close", () => document.body.classList.remove("modal-open"));
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

document.querySelector("#rsvp-form").addEventListener("submit", (event) => {
  event.preventDefault();
  modal.classList.add("success");
});

const editor = document.querySelector("#editor");
const editorScrim = document.querySelector("#editor-scrim");
const setEditor = (open) => {
  editor.classList.toggle("open", open);
  editorScrim.classList.toggle("open", open);
  document.body.classList.toggle("editor-open", open);
};

document.querySelector("#edit-open").addEventListener("click", () => setEditor(true));
document.querySelector("#edit-close").addEventListener("click", () => setEditor(false));
editorScrim.addEventListener("click", () => setEditor(false));

document.querySelectorAll("[data-edit]").forEach((input) => {
  input.addEventListener("input", () => {
    config[input.dataset.edit] = input.value;
    applyConfig();
    updateCountdown();
  });
});

document.querySelectorAll("[data-palette]").forEach((button) => {
  button.addEventListener("click", () => {
    config.palette = button.dataset.palette;
    applyConfig();
  });
});

const showToast = (text) => {
  const toast = document.createElement("div");
  toast.className = "save-toast";
  toast.textContent = text;
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 450);
  }, 1700);
};

document.querySelector("#save-page").addEventListener("click", () => {
  localStorage.setItem("afterglow-config", JSON.stringify(config));
  setEditor(false);
  showToast("Changes saved to this preview");
});

document.querySelector("#reset-page").addEventListener("click", () => {
  config = { ...DEFAULTS };
  localStorage.removeItem("afterglow-config");
  applyConfig();
  updateCountdown();
  showToast("Template reset");
});

document.querySelectorAll(".accordion details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".accordion details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

const soundButton = document.querySelector("#sound-toggle");
let audioContext;
let oscillator;
let gain;

const stopSound = () => {
  gain?.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.45);
  window.setTimeout(() => {
    oscillator?.stop();
    audioContext?.close();
    audioContext = undefined;
  }, 500);
  soundButton.classList.add("muted");
};

soundButton.addEventListener("click", () => {
  if (audioContext) {
    stopSound();
    return;
  }

  audioContext = new AudioContext();
  oscillator = audioContext.createOscillator();
  gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 174;
  gain.gain.value = 0.0001;
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.025, audioContext.currentTime + 1.5);
  soundButton.classList.remove("muted");
});

const canvas = document.querySelector("#shader-canvas");
const gl = canvas.getContext("webgl", {
  antialias: false,
  alpha: false,
  powerPreference: "high-performance",
});

if (gl) {
  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform vec2 pointer;
    uniform vec3 colorA;
    uniform vec3 colorB;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p = p * 2.03 + 17.1;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
      vec2 p = (uv - 0.5) * aspect;
      vec2 mouse = (pointer - 0.5) * aspect;
      float t = time * 0.065;

      float flow = fbm(p * 2.0 + vec2(t, -t * 0.7));
      float detail = fbm(p * 4.3 - vec2(t * 1.4, t));
      float field = smoothstep(0.12, 1.1, flow * 0.8 + detail * 0.35);
      float glow = 0.12 / max(0.05, length(p - mouse * 0.28));
      float wave = sin((p.x + flow * 0.55 + t) * 8.0) * 0.06;

      vec3 color = mix(colorA, colorB, clamp(field + wave + glow * 0.15, 0.0, 1.0));
      color += vec3(0.08, 0.025, 0.01) * glow;
      float vignette = smoothstep(1.0, 0.18, length((uv - 0.5) * vec2(0.9, 1.1)));
      color *= 0.72 + vignette * 0.4;
      color += (hash(gl_FragCoord.xy + time) - 0.5) * 0.025;
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };

  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    resolution: gl.getUniformLocation(program, "resolution"),
    time: gl.getUniformLocation(program, "time"),
    pointer: gl.getUniformLocation(program, "pointer"),
    colorA: gl.getUniformLocation(program, "colorA"),
    colorB: gl.getUniformLocation(program, "colorB"),
  };

  const pointer = { x: 0.68, y: 0.45 };
  window.addEventListener("pointermove", (event) => {
    pointer.x += (event.clientX / window.innerWidth - pointer.x) * 0.2;
    pointer.y += (1 - event.clientY / window.innerHeight - pointer.y) * 0.2;
  });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  window.addEventListener("resize", resize);
  resize();

  const start = performance.now();
  const render = (now) => {
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, (now - start) / 1000);
    gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
    gl.uniform3fv(uniforms.colorA, shaderPalette.shaderA);
    gl.uniform3fv(uniforms.colorB, shaderPalette.shaderB);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}
