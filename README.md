# Vitaliy Portfolio — Vue 3 + GSAP

Portfolio prototype with a Three.js hero and GSAP ScrollTrigger page-overlap effects.

## Start

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
```

Upload the contents of `dist/` to static hosting such as AWS S3.

## Three.js assets

The scene is loaded from `public/three/scene.html`. Put the existing scene dependencies here:

- `public/three/js/three.min.js`
- `public/three/js/Water_v2.js`
- `public/three/js/Sky.js`
- `public/three/img/waternormals.jpg`
- `public/three/fonts/droid_sans_bold.typeface.json`

## Parallax / overlap

GSAP setup is in `src/App.vue`. Layout and sticky panels are in `src/assets/main.css` under `GSAP scroll-overlap`.
