// Star dissolve/reform demo with accessibility, performance, and configurability.
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://unpkg.com/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.158.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// ---- Configurable parameters ----
const CONFIG = {
  particleCount: 2800,
  starRadiusOuter: 1.5,
  starRadiusInner: 0.62,
  scatterRadius: 4.0,
  dissolveSpeed: 0.06,
  rotationSpeed: 0.0015,
  maxPixelRatio: 2
};

// ---- Helpers ----
const getEl = (sel) => {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Missing DOM element: ${sel}`);
  return el;
};
const canvas = getEl('#c');
const themeSel = getEl('#theme');
const toggleBtn = getEl('#toggle');
const pulseBtn = getEl('#pulse');
const resetBtn = getEl('#reset');
const fpsEl = getEl('#fps');
const loadingEl = getEl('#loading');
const particleSlider = getEl('#particles');
const particleOut = getEl('#particlesOut');

// WebGL support check
const hasWebGL = (() => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
})();
if (!hasWebGL) {
  canvas.insertAdjacentHTML('afterend', '<div style="position:absolute;inset:0;display:grid;place-items:center;color:#fff;background:#000a">WebGL not supported.</div>');
  throw new Error('WebGL not supported');
}

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(CONFIG.maxPixelRatio, window.devicePixelRatio));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Scene & camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b12);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.set(0, 0, 4.5);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

// Postprocessing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.8, 0.0);
composer.addPass(bloom);

// Themes
const THEMES = {
  starlight: { colors: [0xffffff, 0x88c9ff], bloom: 1.2, bg: 0x070b12 },
  cosmic:    { colors: [0x50ffd3, 0xa482ff], bloom: 1.6, bg: 0x080913 },
  inferno:   { colors: [0xffe079, 0xff5a2e], bloom: 1.5, bg: 0x120807 },
  aurora:    { colors: [0x70ff7a, 0x66ccff], bloom: 1.4, bg: 0x05120b }
};
const themeColorCache = {}; // {key: Float32Array}

// Geometry state
let geom, material, points, basePositions = [], colorsAttr, scatter;

// Build star shape
function makeStarShape(R = CONFIG.starRadiusOuter, r = CONFIG.starRadiusInner, spikes = 5) {
  const shape = new THREE.Shape();
  const step = Math.PI / spikes;
  let rot = -Math.PI / 2;
  shape.moveTo(Math.cos(rot) * R, Math.sin(rot) * R);
  for (let i = 0; i < spikes; i++) {
    rot += step; shape.lineTo(Math.cos(rot) * r, Math.sin(rot) * r);
    rot += step; shape.lineTo(Math.cos(rot) * R, Math.sin(rot) * R);
  }
  shape.closePath();
  return shape;
}

// Generate points
function generateStarPoints(count) {
  const shape = makeStarShape();
  const outline = shape.getSpacedPoints(Math.min(1400, Math.max(300, Math.floor(count * 0.55))));
  const pts = [];
  for (let i = 0; i < count - outline.length; i++) {
    const t = Math.random();
    const a = outline[(Math.random() * outline.length) | 0];
    const b = outline[(Math.random() * outline.length) | 0];
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    const k = (Math.random() * 0.32) * (Math.random() < 0.5 ? -1 : 1);
    pts.push(new THREE.Vector3(x * (1 + k), y * (1 + k), (Math.random() - 0.5) * 0.16));
  }
  outline.forEach(p => pts.push(new THREE.Vector3(p.x, p.y, (Math.random() - 0.5) * 0.1)));
  return pts;
}

function reseedScatter(radius, count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < arr.length; i += 3) {
    const r = radius * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i]   = r * Math.sin(phi) * Math.cos(theta);
    arr[i+1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i+2] = r * Math.cos(phi);
  }
  return arr;
}

function colorArrayForTheme(key, count) {
  const cacheKey = key + ':' + count;
  if (!themeColorCache[cacheKey]) {
    const theme = THEMES[key];
    const c1 = theme.colors[0], c2 = theme.colors[1];
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const col = new THREE.Color(c1).lerp(new THREE.Color(c2), t);
      arr[i*3] = col.r; arr[i*3+1] = col.g; arr[i*3+2] = col.b;
    }
    themeColorCache[cacheKey] = arr;
  }
  return themeColorCache[cacheKey];
}

function rebuild(count) {
  // Dispose old
  if (points) { scene.remove(points); points.geometry.dispose(); }
  if (geom) { geom.dispose(); }

  basePositions = generateStarPoints(count);
  geom = new THREE.BufferGeometry().setFromPoints(basePositions);
  geom.center();

  colorsAttr = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  geom.setAttribute('color', colorsAttr);

  if (!material) {
    material = new THREE.PointsMaterial({
      size: 0.02, sizeAttenuation: true,
      vertexColors: true, transparent: true,
      opacity: 1.0, depthWrite: false
    });
  }

  points = new THREE.Points(geom, material);
  scene.add(points);

  // Scatter targets
  scatter = reseedScatter(CONFIG.scatterRadius, count);

  // Apply theme colors
  applyTheme(themeKey, true);
}

let dissolve = 0;       // 0 = star, 1 = scattered
let targetDissolve = 0;
let pulseOn = true;
let themeKey = 'starlight';

function applyTheme(key, force = false) {
  themeKey = key;
  const theme = THEMES[key];
  bloom.strength = theme.bloom;
  scene.background = new THREE.Color(theme.bg);
  const colArr = colorArrayForTheme(key, basePositions.length);
  if (force || !colorsAttr || colorsAttr.array.length !== colArr.length) {
    colorsAttr = new THREE.BufferAttribute(new Float32Array(colArr.length), 3);
    geom.setAttribute('color', colorsAttr);
  }
  colorsAttr.array.set(colArr);
  colorsAttr.needsUpdate = true;
}

function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2; }

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  bloom.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);

// UI events + a11y
themeSel.addEventListener('change', (e) => applyTheme(e.target.value));
toggleBtn.addEventListener('click', () => {
  targetDissolve = targetDissolve > 0 ? 0 : 1;
  toggleBtn.setAttribute('aria-pressed', String(targetDissolve > 0));
  toggleBtn.textContent = targetDissolve > 0 ? 'Reform' : 'Dissolve';
  if (targetDissolve > 0) scatter = reseedScatter(CONFIG.scatterRadius, basePositions.length);
});
pulseBtn.addEventListener('click', () => {
  pulseOn = !pulseOn;
  pulseBtn.setAttribute('aria-pressed', String(pulseOn));
  pulseBtn.textContent = 'Pulse: ' + (pulseOn ? 'On' : 'Off');
});
resetBtn.addEventListener('click', () => {
  targetDissolve = 0;
  dissolve = 0;
  toggleBtn.setAttribute('aria-pressed', 'false');
  toggleBtn.textContent = 'Dissolve';
});

// Keyboard support for buttons
function clickOnEnterSpace(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    e.currentTarget.click();
  }
}
[toggleBtn, pulseBtn, resetBtn].forEach(btn => btn.addEventListener('keydown', clickOnEnterSpace));

// Particle slider
function updateParticleCount(n) {
  CONFIG.particleCount = n;
  particleOut.value = String(n);
  particleSlider.setAttribute('aria-valuenow', String(n));
  rebuild(n);
}
particleSlider.addEventListener('input', (e) => updateParticleCount(parseInt(e.target.value, 10)));

// Visibility pause
let rafId = null;
function animate(now) {
  rafId = requestAnimationFrame(animate);
  controls.update();

  dissolve += (targetDissolve - dissolve) * CONFIG.dissolveSpeed;
  const k = easeInOut(THREE.MathUtils.clamp(dissolve, 0, 1));

  const pos = geom.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const i3 = i * 3;
    const sx = basePositions[i].x, sy = basePositions[i].y, sz = basePositions[i].z;
    const tx = scatter[i3], ty = scatter[i3+1], tz = scatter[i3+2];
    pos.array[i3]   = sx + (tx - sx) * k;
    pos.array[i3+1] = sy + (ty - sy) * k;
    pos.array[i3+2] = sz + (tz - sz) * k;
  }
  pos.needsUpdate = true;

  const t = now * 0.0015;
  const pulse = pulseOn ? (Math.sin(t) * 0.12 + 0.15) : 0.12;
  points.rotation.y += CONFIG.rotationSpeed;
  points.scale.setScalar(1.0 + pulse * (1.0 - 0.5 * k));
  bloom.strength = THREE.MathUtils.lerp(THEMES[themeKey].bloom, THEMES[themeKey].bloom + 0.25, (pulse + 0.15));

  composer.render();

  // FPS
  frames++;
  const dt = now - lastFpsTime;
  if (dt >= 500) {
    const fps = Math.round((frames / dt) * 1000);
    fpsEl.textContent = fps + ' fps';
    frames = 0;
    lastFpsTime = now;
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  } else {
    if (!rafId) requestAnimationFrame(animate);
  }
});

// Cleanup on unload
function cleanup() {
  window.removeEventListener('resize', resize);
  document.removeEventListener('visibilitychange', cleanup);
  if (rafId) cancelAnimationFrame(rafId);
  controls.dispose();
  if (points) points.geometry.dispose();
  if (geom) geom.dispose();
  renderer.dispose();
}
window.addEventListener('beforeunload', cleanup);

// Bootstrap
rebuild(CONFIG.particleCount);
applyTheme(themeKey, true);

const fpsStart = performance.now();
let lastFpsTime = fpsStart;
let frames = 0;
requestAnimationFrame((now) => {
  // remove loading overlay after first frame schedules
  loadingEl.style.display = 'none';
  requestAnimationFrame(animate);
});
