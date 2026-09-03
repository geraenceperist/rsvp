import "./gallery.css";
import { initSmoothScroll } from "./smooth-scroll.js";

const lenis = initSmoothScroll();
const intro = document.querySelector("#gallery-intro");
const progressBar = document.querySelector("#scroll-progress");

window.addEventListener("load", () => {
  window.setTimeout(() => intro.classList.add("complete"), 900);
});

if (lenis) {
  lenis.on("scroll", ({ progress }) => {
    document.documentElement.style.setProperty("--page-progress", progress);
    const heroProgress = Math.min(progress * 5, 1);
    document.documentElement.style.setProperty("--hero-offset", `${heroProgress * 70}px`);
    document.documentElement.style.setProperty("--ghost-offset", `${heroProgress * -80}px`);
    document.documentElement.style.setProperty("--hero-scale", 1 - heroProgress * 0.06);
    progressBar.style.transform = `scaleX(${progress})`;
  });
} else {
  progressBar.hidden = true;
}

const cursor = document.querySelector("#cursor");
let mouseX = -100;
let mouseY = -100;
let currentX = -100;
let currentY = -100;

window.addEventListener("pointermove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

const renderCursor = () => {
  currentX += (mouseX - currentX) * 0.16;
  currentY += (mouseY - currentY) * 0.16;
  cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
  requestAnimationFrame(renderCursor);
};

renderCursor();

document.querySelectorAll(".template-preview").forEach((preview) => {
  preview.addEventListener("pointerenter", () => cursor.classList.add("visible"));
  preview.addEventListener("pointermove", (event) => {
    const bounds = preview.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    preview.style.transform = `perspective(1400px) rotateX(${y * -3}deg) rotateY(${x * 4}deg) scale(0.99)`;
  });
  preview.addEventListener("pointerleave", () => {
    cursor.classList.remove("visible");
    preview.style.transform = "";
  });
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
  { threshold: 0.12 },
);

document.querySelectorAll(".template-row, .customize-callout").forEach((item) => observer.observe(item));

const canvas = document.querySelector("#gallery-canvas");
const gl = canvas.getContext("webgl", { antialias: false, alpha: true });

if (gl) {
  const vertex = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const fragment = `
    precision mediump float;
    uniform vec2 r;
    uniform vec2 m;
    uniform float t;
    float glow(vec2 p, vec2 c, float size){return size/length(p-c);}
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;
      vec2 pointer=(m-.5)*vec2(r.x/r.y,1.);
      float a=glow(uv,vec2(sin(t*.12)*.58,cos(t*.1)*.38),.17);
      float b=glow(uv,vec2(cos(t*.09)*.7,sin(t*.14)*.45),.14);
      float c=glow(uv,pointer*.42,.08);
      float wave=.5+.5*sin((uv.x+uv.y)*5.+t*.28+(a+b)*2.);
      vec3 wine=vec3(.12,.025,.05);
      vec3 coral=vec3(1.,.22,.12);
      vec3 violet=vec3(.34,.06,.25);
      vec3 color=mix(wine,violet,smoothstep(.08,1.5,a+b));
      color=mix(color,coral,smoothstep(.7,2.6,a+c)*(.35+.3*wave));
      gl_FragColor=vec4(color,.96);
    }
  `;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const resolution = gl.getUniformLocation(program, "r");
  const time = gl.getUniformLocation(program, "t");
  const mouse = gl.getUniformLocation(program, "m");
  const pointer = { x: 0.5, y: 0.5 };

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX / window.innerWidth;
    pointer.y = 1 - event.clientY / window.innerHeight;
  });

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  window.addEventListener("resize", resize);
  resize();

  const start = performance.now();
  const draw = (now) => {
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform2f(mouse, pointer.x, pointer.y);
    gl.uniform1f(time, (now - start) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}
