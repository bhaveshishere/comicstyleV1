# OMNIDEX — a comic-book interactive website

A single-page, framework-free site built like a comic book: five original alien transformation
forms, a slap-to-transform dial, halftone wipes, speed lines, an issue reader, a Web-Audio SFX lab,
and a live panel builder that renders (and downloads) a real comic panel on `<canvas>`.

No build step. No dependencies. Drop it on GitHub Pages and it runs.

---

## Put it on GitHub Pages (2 minutes)

1. Unzip this folder anywhere.
2. Create a new repo on GitHub — e.g. `omnidex` — **public**.
3. Upload the **contents** of the folder (not the folder itself) so that `index.html` sits at the repo root:
   ```
   index.html
   src/
     app.css
     app.js
   assets/
     Bangers.woff2  ArchivoBlack.woff2  Mono400.woff2  Mono700.woff2
     alien-cinder.jpg  alien-volt.jpg  alien-tide.jpg  alien-quill.jpg
     alien-null.jpg  alien-titan.jpg
     hero-teen.jpg  panel-watch.jpg  panel-city.jpg
     *.png   (oversized masters — safe to delete, ~11 MB)
   ```
4. Repo → **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** · Folder: **/ (root)** → **Save**
5. Wait ~30 seconds. Your site is live at `https://<your-username>.github.io/omnidex/`.

> Prefer the command line?
> ```bash
> git init && git add . && git commit -m "Omnidex"
> git branch -M main
> git remote add origin https://github.com/<you>/omnidex.git
> git push -u origin main
> ```
> Then enable Pages as above.

### A `.nojekyll` file is included
It stops GitHub's Jekyll pipeline from touching `assets/` and `src/`. Leave it in.

---

## What's interactive

| Where | What happens |
|---|---|
| **Hero dial** | Click it (or press **T**) → full transformation sequence: screen darkens, speed lines spin, rings pulse, the alien morphs in with a glitch pass, its name slams down, white flash, and **the whole site re-colours to that alien's palette**. |
| **The Dex (#dex)** | Five specimens on a wheel. Click one → dossier loads with animated stat bars. Filter by *power / speed / stealth*. Press **GO** to transform into that form. |
| **Comic pages (#pages)** | Staggered panel reveal on scroll, hover punch-in, SFX lettering. Click a panel → **reader** opens; ← → arrows flip panels, Esc closes, focus is trapped. |
| **SFX lab (#sfx)** | Six buttons, all sounds synthesised live with the Web Audio API — **zero audio files**. The ♪ button in the HUD mutes everything. |
| **Panel builder (#build)** | Type a caption, pick a specimen / speech effect / ink colour, reroll the angle, then **Download PNG**. Text is drawn onto a 1000 × 700 canvas with halftone dots, a caption box and a starburst SFX. |
| **Chaos mode (✦)** | In the HUD — tilts every panel at once and turns the accent yellow. |
| **Everything** | Custom crosshair + star cursors, printed halftone + paper grain overlays, scroll progress bar, toast messages. |

Keyboard: **T** transform · **Esc** skip/close · **← →** flip reader panels · **Tab** order is complete,
focus rings are visible, and `prefers-reduced-motion` short-circuits every animation.

---

## Editing it

**Copy / characters** — everything is in `src/app.js`:
- `ALIENS` array at the top: name, role, image, accent colours, powers, stats, blurb.
- `PANELS` array: the six comic pages (image, caption, SFX, column span, tilt).

**Colours** — `src/app.css`, the `:root` block. `--accent` is overwritten per-alien by JS.

**Artwork** — drop new images in `assets/`, then point `img`/`img:` fields at them.
Portrait plates look best around **1400 × 768**·landscape or **768 × 1376**·vertical.

**Sounds** — `src/app.js → Sound.play()`; each case is a few oscillators/noise bursts.
Tweak frequencies or add a new `case` and wire it to a button.

**Subscribe form** — currently a demo. Point `#subForm`'s submit handler at your provider
(Buttondown, Mailchimp, Formspree…) in `src/app.js → misc()`.

---

## Local preview

Because the panel-builder export uses `canvas.toDataURL()`, `file://` will block the PNG download
(tainted canvas). Serve it over http instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Everything else works fine opened directly.

---

## Credits & notes

- All artwork is **original and generated for this project** — no stock, no scraped assets,
  no licensed characters. The "watch + aliens" vibe is a genre homage, not a copy of any show's designs.
- Typefaces: **Bangers**, **Archivo Black**, **Space Mono** — all SIL Open Font License, self-hosted in `assets/`.
- Zero trackers, zero third-party requests at runtime.

MIT — do what you like with the code.
