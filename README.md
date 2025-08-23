# Star — Dissolve & Reform (Three.js) — v2
An interactive star-shaped particle system that **dissolves into dust** and **reforms**, with **bloom**, **pulse**, **theme switching**, and a **particle count slider**.

This build incorporates robustness & a11y improvements: DOM safety checks, ARIA states, visibility pause, cleanup, configurable parameters, theme color caching, and a loading overlay.

## Prerequisites
- Python 3.x (or any static server)
- Modern browser with WebGL enabled

## Run locally
```bash
python -m http.server 5173
# open http://localhost:5173
```

## Config
Tweak values in `src/main.js`:
```js
const CONFIG = { particleCount: 2800, starRadiusOuter: 1.5, starRadiusInner: 0.62,
  scatterRadius: 4.0, dissolveSpeed: 0.06, rotationSpeed: 0.0015, maxPixelRatio: 2 };
```

## Notes on Dependencies
- Three.js modules are pinned to 0.158.0 via unpkg CDN.
- For production hardening, consider bundling with Vite/Webpack and vendoring dependencies.

## Deploy
Static hosting works anywhere (GitHub Pages, Netlify, Vercel, S3, etc.).

### Git quickstart
```bash
git init
git add .
git commit -m "feat(star-demo): v2 — dissolve/reform + bloom + slider + a11y"
git branch -M main
git remote add origin <YOUR_PUBLIC_REPO_URL>
git push -u origin main
```

## Roadmap
- Optional shader-based GPU animation of dissolve
- Mobile quality auto-scaling
- CDN fallback or local vendor bundle
