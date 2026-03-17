import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

let scene, camera, renderer;
let orb, energyField, turbulenceField;
let analyser, data;

let audioOn = false;
let state = "IDLE";

const stateEl = document.getElementById("state");

/* ================= INIT ================= */

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 10);
  camera.position.z = 2.6;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setClearColor(0x000000, 1);
  document.body.appendChild(renderer.domElement);

  createOrb();

  window.addEventListener("resize", onResize);
  document.getElementById("start").onclick = startAudio;
}

/* ================= SHADERS ================= */

const vertexShader = `
uniform float uTime;
uniform float uAudio;
varying vec3 vPos;

float noise(vec3 p) {
  return sin(p.x) * sin(p.y) * sin(p.z);
}

void main() {
  vPos = position;

  float audioBoost = pow(uAudio, 1.4);
  float displacement =
    noise(position * 3.0 + uTime) * (0.08 + audioBoost * 0.25);

  vec3 newPos = position + normal * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform float uAudio;
varying vec3 vPos;

void main() {
  float r = length(vPos.xy);

  float core = smoothstep(0.65, 0.0, r);
  float audioBoost = pow(uAudio, 1.3) * 2.2;

  float swirl =
    sin(vPos.x * 3.0 + uTime) +
    sin(vPos.y * 4.0 - uTime * 1.3);

  float energy = core + swirl * 0.12;
  energy *= 1.0 + audioBoost;

  vec3 cyan   = vec3(0.25, 0.95, 1.0);
  vec3 violet = vec3(0.6, 0.25, 1.0);

  vec3 color = mix(cyan, violet, smoothstep(0.2, 1.0, swirl + audioBoost));

  float halo = smoothstep(0.5, 0.9, r);
  vec3 glow = color * halo * (0.6 + audioBoost);

  gl_FragColor = vec4(color * energy + glow, energy);
}
`;

/* -------- Outer Energy Fields -------- */

const fieldFragmentShader = `
precision highp float;

uniform float uTime;
uniform float uAudio;
varying vec3 vPos;

void main() {
  float r = length(vPos.xy);

  float chaos =
    sin(r * 10.0 - uTime * 1.5) +
    sin(vPos.y * 8.0 + uTime * 1.1);

  float intensity = smoothstep(1.3, 0.6, r);
  intensity *= 0.4 + uAudio * 1.1;

  vec3 color = vec3(0.35, 0.85, 1.0);
  gl_FragColor = vec4(color * chaos * intensity, intensity);
}
`;

/* ================= ORB ================= */

function createOrb() {
  // Core
  const coreMat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uAudio: { value: 0 },
    },
  });

  orb = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), coreMat);
  scene.add(orb);

  // Energy containment field
  energyField = new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 96, 96),
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: fieldFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 10 },
        uAudio: { value: 0 },
      },
    })
  );
  scene.add(energyField);

  // Turbulence shell (chaotic, unsynced)
  turbulenceField = new THREE.Mesh(
    new THREE.SphereGeometry(1.25, 80, 80),
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: fieldFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 50 },
        uAudio: { value: 0 },
      },
    })
  );
  scene.add(turbulenceField);
}

/* ================= AUDIO ================= */

async function startAudio() {
  if (audioOn) return;
  audioOn = true;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioContext();
  const src = ctx.createMediaStreamSource(stream);

  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  data = new Uint8Array(analyser.frequencyBinCount);
  src.connect(analyser);
}

/* ================= STATE ================= */

function updateState(a) {
  if (!audioOn) state = "IDLE";
  else if (a > 0.2) state = "SPEAKING";
  else if (a > 0.04) state = "LISTENING";
  else state = "IDLE";

  stateEl.textContent = state;
}

/* ================= LOOP ================= */

function animate() {
  requestAnimationFrame(animate);

  let audio = 0;
  if (analyser) {
    analyser.getByteFrequencyData(data);
    audio = data.reduce((a, b) => a + b, 0) / data.length / 255;
  }

  updateState(audio);

  // Core
  orb.material.uniforms.uTime.value +=
    state === "IDLE" ? 0.006 : state === "LISTENING" ? 0.012 : 0.025;

  orb.material.uniforms.uAudio.value = audio;

  // Energy fields (phase-shifted)
  energyField.material.uniforms.uTime.value += 0.015;
  energyField.material.uniforms.uAudio.value = audio;

  turbulenceField.material.uniforms.uTime.value += 0.02;
  turbulenceField.material.uniforms.uAudio.value = audio * 0.8;

  energyField.rotation.y += 0.002;
  turbulenceField.rotation.x += 0.0025;

  renderer.render(scene, camera);
}

/* ================= RESIZE ================= */

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
init();
animate();
