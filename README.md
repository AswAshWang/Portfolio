# Personal Portfolio (Ashe Wang / 王若寒)

Static bilingual portfolio: hub landing (horizontal three panels), games, art, and about sections.

## Local preview

Language files load via `fetch`, so use a local server (not `file://`):

```bash
cd D:\Personal_Maxs_Projects\Personal_web
npx --yes serve .
```

Or open the folder in VS Code / Cursor and use **Live Server** on `index.html`.

## Structure

- `index.html` — full-screen hero + three section tiles (scroll down)
- `assets/images/hero.png` — homepage hero background
- `assets/images/tile-games.png`, `tile-art.jpg`, `tile-about.png` — home section tile backgrounds
- `games/` — Unseen Witness
- `art/` — concept + UE5 environment projects
- `lang/zh.json`, `lang/en.json` — all copy (edit here first)
- `assets/images/` — add project covers and gallery images when ready

## Deploy (Netlify)

1. Push this folder to a Git repository.
2. Netlify: **Add site** → connect repo.
3. Build command: *(empty)*  
   Publish directory: `/` (root)

## Customize

- Replace placeholder text in `lang/*.json`.
- Update `about.email` and mailto in `about.html` if needed.
- Swap `.project-card__media` / `.project-hero` for `<img src="../assets/images/...">` on detail pages.
