# react-mosaic-loader

[![npm](https://img.shields.io/npm/v/react-mosaic-loader.svg)](https://www.npmjs.com/package/react-mosaic-loader) [![npm](https://img.shields.io/npm/dm/react-mosaic-loader.svg)](https://www.npmjs.com/package/react-mosaic-loader)

**React image-sampling loader** — Renders an image as a grid of dots by sampling pixel data on an off-screen canvas, with an organic staggered wave animation. Use as a loader, placeholder, or visual effect. Supports shapes (circle, squircle, play icon), speed, opacity/scale, and dot count. Degrades to a monochrome grid on load or CORS failure.

- **[Live demo](https://demo-puce-chi.vercel.app)** · **[GitHub](https://github.com/sirivatd/react-mosaic-loader)** · **[npm](https://www.npmjs.com/package/react-mosaic-loader)**

---

## Install

```bash
npm install react-mosaic-loader
```

## Usage

```tsx
import { Dots } from 'react-mosaic-loader';

<Dots
  src="https://example.com/image.jpg"
  dotCount={400}
  width={320}
  height={320}
  shape="circle"
  animationPreset="calm"
  quality="auto"
  renderMode="auto"
  crossOrigin="anonymous"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string \| null | null | Image URL to sample. Fallback grid if missing or CORS. |
| `gridSize` | number | 16 | Dots per row/column. Ignored if `dotCount` is set. |
| `dotCount` | number | — | Approximate total dots (grid size = √dotCount per side). |
| `width` | number | 320 | Component width (px). |
| `height` | number | 320 | Component height (px). |
| `dotRadius` | number | 3 | Dot radius (px). |
| `duration` | number | 2800 | Animation cycle (ms). |
| `speed` | number | 1 | Speed multiplier (e.g. 2 = twice as fast). |
| `minOpacity` / `maxOpacity` | number | preset-based (`0.48 / 0.96` in `calm`) | Opacity range. |
| `minScale` / `maxScale` | number | preset-based (`0.9 / 1.03` in `calm`) | Scale range. |
| `shape` | 'square' \| 'circle' \| 'squircle' \| 'play' | 'square' | Dot layout shape. |
| `easing` | string | cubic-bezier(…) | CSS easing. |
| `renderMode` | 'auto' \| 'svg' \| 'canvas' | 'auto' | Adaptive renderer. Auto uses canvas for larger grids. |
| `quality` | 'auto' \| 'high' \| 'balanced' \| 'low' | 'auto' | Device-aware density/perf profile. |
| `animationPreset` | 'calm' \| 'vivid' \| 'minimal' | 'calm' | Tuned motion defaults for product UI. |
| `reducedMotion` | boolean | system preference | Force reduced-motion behavior. |
| `crossOrigin` | string | 'anonymous' | Image CORS mode. |
| `className` / `style` | — | — | Container class and inline style. |

### Image sampling

- **`src`** — Image URL. If missing, invalid, or CORS-blocked, the component shows a monochrome dot grid.
- **`crossOrigin`** — Use `"anonymous"` (or `"use-credentials"`) for cross-origin images so the canvas can be read.
- **`gap`** — Optional fixed center-to-center spacing for stricter layout rhythm.
- Sampling results are cached by source and config to avoid repeated pixel reads.

### Performance guidance

- Use `quality="auto"` for production defaults across mixed devices.
- Use `animationPreset="calm"` for premium, low-noise motion language.
- Keep `dotCount` around `225`-`625` for best mobile smoothness.
- Force `renderMode="canvas"` for very dense grids or continuous loader screens.

### Keywords

React loader, image loader, dot matrix, pixel sampling, canvas loader, React placeholder, geometric loader, dot grid animation.

---

## Links

- **Demo:** [demo-puce-chi.vercel.app](https://demo-puce-chi.vercel.app)
- **Repository:** [github.com/sirivatd/react-mosaic-loader](https://github.com/sirivatd/react-mosaic-loader)
- **npm:** [npmjs.com/package/react-mosaic-loader](https://www.npmjs.com/package/react-mosaic-loader)

## License

MIT
