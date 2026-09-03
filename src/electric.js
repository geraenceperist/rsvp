import "./electric.css";
import { initSmoothScroll } from "./smooth-scroll.js";

const lenis = initSmoothScroll();
const intro = document.querySelector("#electric-intro");

window.addEventListener("load", () => {
  window.setTimeout(() => intro.classList.add("complete"), 650);
});

lenis?.on("scroll", ({ scroll, velocity }) => {
  const progress = Math.min(scroll / window.innerHeight, 1);
  document.documentElement.style.setProperty("--electric-shift", `${progress * 95}px`);
  document.documentElement.style.setProperty("--electric-scale", 1 - progress * 0.08);
  document.documentElement.style.setProperty("--ticker-skew", `${Math.max(-8, Math.min(8, velocity * 0.08))}deg`);
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

document.querySelectorAll(".kinetic-reveal").forEach((element) => observer.observe(element));

document.querySelectorAll(".question-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".question-list details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

const modal = document.querySelector("#electric-modal");
document.querySelectorAll("[data-electric-rsvp]").forEach((button) => {
  button.addEventListener("click", () => modal.showModal());
});
document.querySelector(".electric-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});
modal.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  modal.classList.add("success");
});

const canvas = document.querySelector("#electric-canvas");
const gl = canvas.getContext("webgl", { antialias: false });

if (gl) {
  const vertex = `attribute vec2 p; void main(){gl_Position=vec4(p,0.,1.);}`;
  const fragment = `
    precision mediump float;
    uniform vec2 r;
    uniform float t;
    uniform vec2 m;
    float blob(vec2 p, vec2 c, float s){return s/length(p-c);}
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;
      vec2 mouse=(m-.5)*vec2(r.x/r.y,1.);
      float a=blob(uv,vec2(sin(t*.37)*.42,cos(t*.29)*.34),.16);
      float b=blob(uv,vec2(cos(t*.23)*.48,sin(t*.31)*.4),.19);
      float c=blob(uv,mouse*.48,.12);
      float bands=step(.48,fract((a+b+c)*2.4));
      vec3 pink=vec3(1.,.08,.66);
      vec3 purple=vec3(.28,.04,.74);
      vec3 acid=vec3(.72,1.,0.);
      vec3 color=mix(pink,purple,smoothstep(.2,1.5,a+b));
      color=mix(color,acid,bands*.22);
      gl_FragColor=vec4(color,1.);
    }
  `;

  const shader = (type, source) => {
    const item = gl.createShader(type);
    gl.shaderSource(item, source);
    gl.compileShader(item);
    return item;
  };

  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, "r");
  const time = gl.getUniformLocation(program, "t");
  const mouse = gl.getUniformLocation(program, "m");
  const pointer = { x: .5, y: .5 };

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
    gl.uniform1f(time, (now - start) / 1000);
    gl.uniform2f(mouse, pointer.x, pointer.y);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}
