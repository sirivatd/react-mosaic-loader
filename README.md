# react-mosaic-loader

[![npm](https://img.shields.io/npm/v/react-mosaic-loader.svg)](https://www.npmjs.com/package/react-mosaic-loader) [![npm](https://img.shields.io/npm/dm/react-mosaic-loader.svg)](https://www.npmjs.com/package/react-mosaic-loader)

**React image-sampling loader** — Renders an image or gradient as a **mosaic grid of animated dots** by sampling pixel data. Use as a loading spinner, placeholder, or visual effect. Supports multiple shapes (circle, squircle, diamond, hexagon, play icon), custom colors and gradients, size, and quality presets. Degrades to a monochrome grid on load or CORS failure.

- **[Live demo](https://demo-puce-chi.vercel.app)** · **[GitHub](https://github.com/sirivatd/react-mosaic-loader)** · **[npm](https://www.npmjs.com/package/react-mosaic-loader)**

---

## Install

```bash
npm install react-mosaic-loader
```

## Usage

```tsx
import { Mosaic } from 'react-mosaic-loader';

<Mosaic
  src="https://example.com/image.jpg"
  size={320}
  gridSize={24}
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
| `width` | number | 320 | Component width (px). Ignored if `size` is set. |
| `height` | number | 320 | Component height (px). Ignored if `size` is set. |
| `size` | number | — | Square size (px). Sets both width and height. |
| `dotRadius` | number | 2.6 | Dot radius (px). |
| `duration` | number | 3400 | Animation cycle (ms). |
| `speed` | number | 1 | Speed multiplier (e.g. 2 = twice as fast). |
| `minOpacity` / `maxOpacity` | number | preset-based | Opacity range (0–1). |
| `minScale` / `maxScale` | number | preset-based | Scale range. |
| `shape` | 'square' \| 'circle' \| 'squircle' \| 'play' \| 'diamond' \| 'hexagon' | 'square' | Dot layout shape. |
| `color` | string \| LinearGradient | — | Single color or gradient to override sampled colors. |
| `easing` | string | cubic-bezier(…) | CSS easing. |
| `renderMode` | 'auto' \| 'svg' \| 'canvas' | 'auto' | Adaptive renderer. Auto uses canvas for larger grids. |
| `quality` | 'auto' \| 'high' \| 'balanced' \| 'low' | 'auto' | Device-aware density/perf profile. |
| `animationPreset` | 'calm' \| 'vivid' \| 'minimal' | 'calm' | Tuned motion defaults. |
| `reducedMotion` | boolean | system preference | Force reduced-motion behavior. |
| `crossOrigin` | string | 'anonymous' | Image CORS mode. |
| `className` / `style` | — | — | Container class and inline style. |

### Image sampling

- **`src`** — Image URL. If missing, invalid, or CORS-blocked, the component shows a monochrome dot grid.
- **`crossOrigin`** — Use `"anonymous"` (or `"use-credentials"`) for cross-origin images so the canvas can be read.
- **`gap`** — Optional fixed center-to-center spacing.
- Sampling results are cached by source and config to avoid repeated pixel reads.

### Performance guidance

- Use `quality="auto"` for production defaults across mixed devices.
- Use `animationPreset="calm"` for premium, low-noise motion.
- Use `size` for square loaders (e.g. `size={120}`) instead of setting `width` and `height` separately.
- Force `renderMode="canvas"` for very dense grids or full-screen loaders.

---

## Links

- **Demo:** [demo-puce-chi.vercel.app](https://demo-puce-chi.vercel.app)
- **Repository:** [github.com/sirivatd/react-mosaic-loader](https://github.com/sirivatd/react-mosaic-loader)
- **npm:** [npmjs.com/package/react-mosaic-loader](https://www.npmjs.com/package/react-mosaic-loader)

## License

MIT
