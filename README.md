# OMNIVERSE — Alien Archive

A comic-book website built around an original universe: five alien forms, a CSS-3D alien watch,
a hologram transformation sequence, panel-by-panel issues, and a turn-based battle arena against
a chronomancer who cheats.

Pure **HTML + CSS + JS**. No frameworks, no build step, no audio files, no third-party requests.

---

## Deploy to GitHub Pages

1. Unzip. Create a **public** repo (e.g. `omniverse`).
2. Upload the **contents** so `index.html` is at the repo root:
   ```
   index.html
   .nojekyll
   src/app.css   src/app.js
   assets/*.jpg  assets/*.woff2
   ```
3. **Settings → Pages → Deploy from a branch → main / (root) → Save**.
4. Live at `https://<you>.github.io/omniverse/` in ~30s.

CLI version:
```bash
git init && git add . && git commit -m "Omniverse"
git branch -M main
git remote add origin https://github.com/<you>/omniverse.git
git push -u origin main
```

`.nojekyll` is included — keep it, or Pages may skip `assets/`.

---

## What's interactive

| Section | What happens |
|---|---|
| **Hero + watch** | The watch is real CSS 3D (preserve-3d, layered bezel / glass / hourglass, tilts to your pointer). Tap it → charge → transformation. `T` also works. |
| **Transformation** | Six-stage sequence: floor grid boots up → DNA scan sweeps over a black silhouette → the form floods with colour bottom-up → slice-glitch pass → name slam → white-out. Then **the whole site re-inks to that alien's palette**. Esc skips. |
| **Archive** | Five hexagonal specimens on a wheel. Click for the dossier (animated stat bars, powers), filter by role, **Transform** or **Send to battle**. |
| **Issue 001** | Staggered panel reveals, hover punch-in, SFX lettering, and a reader with ← → flipping + Esc. |
| **Battle arena** | Turn-based vs **Kronik** (130 HP). Three moves per form, each with its own sound. Under 34% HP he **stops time**, heals and steals your turn. K.O. ends it. |
| **Sound lab** | Eight rebuilt effects, all synthesised: rasterised chirps, mechanical dial clicks, a filtered-noise warp sweep, impact with sub-bass thump and metal ring, glitch stutter, time-stop dive. |
| **Panel forge** | Caption + specimen + SFX + ink → drawn live on `<canvas>` (halftone dots, starburst, caption box) → **Download PNG**. |
| **Chaos mode ✦** | Tilts every panel and swaps the accent. |

Accessibility: skip link, visible focus rings, keyboard-complete controls, `aria-live` regions,
`prefers-reduced-motion` short-circuits every animation.

---

## Editing

- **Characters** — `src/app.js` → `ALIENS` (name, role, image, accent colours, powers, stats, moves) and `VILLAIN`.
- **Comic panels** — `src/app.js` → `PANELS`.
- **Colours** — `src/app.css` `:root`. `--accent` / `--accent-deep` are swapped per alien by JS (the deep one is the darkened variant used on cream paper).
- **Sound** — `src/app.js` → `Sound` module. Each effect is a few oscillators + filtered noise; add a `case` to `P` and wire it to a button.
- **Art** — drop images into `assets/`, then point the `img` fields at them. Landscape ~1400×768 works best.
- **Subscribe form** — demo only; point `#subForm` at your provider in `src/app.js → misc()`.

---

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

The PNG export uses `canvas.toDataURL()`, which browsers block on `file://`. Everything else runs fine
opened directly, but use a local server (or Pages) to test the download.

---

## Credits

All artwork is original and generated for this project — no stock, no scraped assets, and no
licensed characters. It's a genre homage, not a reproduction of any existing show's designs.
Fonts: **Bangers**, **Archivo Black**, **Space Mono** (all SIL Open Font License, self-hosted).

MIT — take it apart, ship it, make it yours.
