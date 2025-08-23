# Star — Dissolve/Reform (GPU)

https://helixprojectai-code.github.io/star-dissolve-demo/?v=ga1

[![TTD Proofs — build & publish](https://github.com/helixprojectai-code/star-dissolve-demo/actions/workflows/ttd-proofs.yml/badge.svg)](../../actions)

A tiny visual: a star dissolves into glowing particles, scatters with dust-like motion, then reforms. Themes, pulse, and bloom (GPU/Vite build).

---

## Live Demo
- **Demo:** https://helixprojectai-code.github.io/star-dissolve-demo/?v=ga1
- **Code:** https://github.com/helixprojectai-code/star-dissolve-demo

## Features
- Star-shaped particle system (dissolve → scatter → reform loop)
- Theme switcher + pulse toggle
- Post-processing glow/bloom (GPU/Vite build)
- Canvas2D fallback path kept simple for reliability
- GitHub Pages deploy via Actions
- **TTD proofs** published and **keyless-signed (Sigstore)** on every run

## Run Locally (pick one)

### A) Quick static preview
```bash
# any OS with Python 3
python -m http.server 5173
# open http://localhost:5173
