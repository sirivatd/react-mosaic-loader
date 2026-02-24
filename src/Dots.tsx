import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useImageSampler } from './useImageSampler';
import { isInsideShape } from './shapes';
import type { MosaicProps } from './types';

const DEFAULT_GRID_SIZE = 16;
const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 320;
const DEFAULT_DOT_RADIUS = 2.6;
const DEFAULT_DURATION = 3400;
const DEFAULT_EASING = 'cubic-bezier(0.33, 0, 0.2, 1)';
const DEFAULT_RENDER_MODE = 'auto';
const DEFAULT_QUALITY = 'auto';
const DEFAULT_ANIMATION_PRESET = 'calm';
const AUTO_CANVAS_THRESHOLD = 520;

const PRESETS = {
  calm: {
    minOpacity: 0.48,
    maxOpacity: 0.96,
    minScale: 0.9,
    maxScale: 1.03,
    phaseMix: 0.22,
    phaseSpreadFactor: 0.12,
    durationSpread: 180,
    staggerFactor: 0.26,
  },
  vivid: {
    minOpacity: 0.3,
    maxOpacity: 1,
    minScale: 0.82,
    maxScale: 1.08,
    phaseMix: 0.34,
    phaseSpreadFactor: 0.2,
    durationSpread: 320,
    staggerFactor: 0.34,
  },
  minimal: {
    minOpacity: 0.62,
    maxOpacity: 0.9,
    minScale: 0.95,
    maxScale: 1.01,
    phaseMix: 0.16,
    phaseSpreadFactor: 0.08,
    durationSpread: 120,
    staggerFactor: 0.2,
  },
} as const;

type DotRuntime = {
  key: string;
  x: number;
  y: number;
  color: string;
  rgb: [number, number, number];
  delayMs: number;
  periodMs: number;
  depth: number;
};

/** Deterministic 0..1 from grid position for organic variation. */
function phaseHash(gx: number, gy: number): number {
  const n = Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hexToRgb(color: string): [number, number, number] {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16),
    ];
  }
  const rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return [26, 26, 26];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}

/** Interpolate between gradient stops; t in 0..1. Stops should use hex colors. */
function sampleGradient(
  stops: Array<{ offset: number; color: string }>,
  t: number
): string {
  const sorted = [...stops].sort((a, b) => a.offset - b.offset);
  if (sorted.length === 0) return '#1a1a1a';
  if (sorted.length === 1 || t <= sorted[0].offset) return sorted[0].color;
  if (t >= sorted[sorted.length - 1].offset) return sorted[sorted.length - 1].color;
  let i = 0;
  while (i + 1 < sorted.length && sorted[i + 1].offset < t) i += 1;
  const a = sorted[i];
  const b = sorted[i + 1];
  const local = (t - a.offset) / (b.offset - a.offset);
  const c1 = hexToRgb(a.color);
  const c2 = hexToRgb(b.color);
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * local);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * local);
  const bl = Math.round(c1[2] + (c2[2] - c1[2]) * local);
  return rgbToHex(r, g, bl);
}

/** Get 0..1 position along gradient direction (angle in degrees). */
function gradientT(x: number, y: number, angleDeg: number): number {
  const rad = (angleDeg * Math.PI) / 180;
  return (x * Math.cos(rad) + y * Math.sin(rad) + 1) / 2;
}

function resolveColor(
  colorProp: MosaicProps['color'],
  normX: number,
  normY: number
): string | null {
  if (colorProp == null) return null;
  if (typeof colorProp === 'string') return colorProp;
  if (colorProp.type === 'linear') {
    const angle = colorProp.angle ?? 0;
    const t = clamp(gradientT(normX, normY, angle), 0, 1);
    return sampleGradient(colorProp.stops, t);
  }
  return null;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mediaQuery.matches);
    update();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  return prefersReducedMotion;
}

function qualityGridSize(baseGridSize: number, quality: MosaicProps['quality']): number {
  const safeGrid = Math.max(1, baseGridSize);

  if (quality === 'high') return safeGrid;
  if (quality === 'low') return Math.max(6, Math.floor(safeGrid * 0.68));
  if (quality === 'balanced') return Math.max(8, Math.floor(safeGrid * 0.86));

  if (typeof navigator === 'undefined') return Math.max(8, Math.floor(safeGrid * 0.9));

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

  if (cores <= 2 || memory <= 2) return Math.max(6, Math.floor(safeGrid * 0.64));
  if (cores <= 4 || memory <= 4) return Math.max(8, Math.floor(safeGrid * 0.82));
  return safeGrid;
}

export function Mosaic({
  src = null,
  gridSize = DEFAULT_GRID_SIZE,
  dotCount,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  size,
  dotRadius = DEFAULT_DOT_RADIUS,
  gap,
  duration = DEFAULT_DURATION,
  easing = DEFAULT_EASING,
  shape = 'square',
  speed = 1,
  minOpacity,
  maxOpacity,
  minScale,
  maxScale,
  renderMode = DEFAULT_RENDER_MODE,
  quality = DEFAULT_QUALITY,
  animationPreset = DEFAULT_ANIMATION_PRESET,
  reducedMotion,
  className,
  style,
  crossOrigin = 'anonymous',
  color: colorProp,
}: MosaicProps) {
  const effectiveWidth = size != null ? size : width;
  const effectiveHeight = size != null ? size : height;
  const prefersReducedMotion = usePrefersReducedMotion();
  const effectiveReducedMotion = reducedMotion ?? prefersReducedMotion;

  const requestedGridSize =
    dotCount != null ? Math.max(1, Math.round(Math.sqrt(dotCount))) : Math.max(1, gridSize);
  const effectiveGridSize = qualityGridSize(requestedGridSize, quality);

  const preset = PRESETS[animationPreset];
  const resolvedMinOpacity = minOpacity ?? preset.minOpacity;
  const resolvedMaxOpacity = maxOpacity ?? preset.maxOpacity;
  const resolvedMinScale = minScale ?? preset.minScale;
  const resolvedMaxScale = maxScale ?? preset.maxScale;

  const { dots, loading } = useImageSampler({
    src,
    gridSize: effectiveGridSize,
    width: effectiveWidth,
    height: effectiveHeight,
    gap,
    crossOrigin,
  });

  const effectiveDuration = duration / Math.max(0.1, Math.min(10, speed));

  const visibleDots = useMemo(() => {
    if (shape === 'square') return dots;
    return dots.filter((d) => {
      const nx = effectiveWidth > 0 ? d.x / effectiveWidth : 0;
      const ny = effectiveHeight > 0 ? d.y / effectiveHeight : 0;
      return isInsideShape(nx, ny, shape);
    });
  }, [dots, shape, effectiveWidth, effectiveHeight]);

  const maxGrid = useMemo(() => {
    let maxX = 0;
    let maxY = 0;
    for (const d of visibleDots) {
      if (d.gridX > maxX) maxX = d.gridX;
      if (d.gridY > maxY) maxY = d.gridY;
    }
    return { maxX, maxY };
  }, [visibleDots]);

  const runtimeDots = useMemo<DotRuntime[]>(() => {
    const cx = maxGrid.maxX / 2;
    const cy = maxGrid.maxY / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy) || 1;
    const staggerSpan = effectiveDuration * preset.staggerFactor;
    const phaseSpread = effectiveDuration * preset.phaseSpreadFactor;

    return visibleDots.map((dot) => {
      const h = phaseHash(dot.gridX, dot.gridY);
      const diagonal = (dot.gridX + dot.gridY) / (maxGrid.maxX + maxGrid.maxY + 1);
      const dist = Math.sqrt(Math.pow(dot.gridX - cx, 2) + Math.pow(dot.gridY - cy, 2));
      const radial = dist / maxDist;

      const basePhase = ((1 - preset.phaseMix) * diagonal + preset.phaseMix * radial) * staggerSpan;
      const organicOffset = (h - 0.5) * phaseSpread;
      const delayMs = basePhase + organicOffset;
      const periodMs = Math.max(700, effectiveDuration + (h - 0.5) * preset.durationSpread);
      const depth = 1 - radial * 0.22;

      const normX = effectiveWidth > 0 ? dot.x / effectiveWidth : 0;
      const normY = effectiveHeight > 0 ? dot.y / effectiveHeight : 0;
      const resolvedColor = resolveColor(colorProp, normX, normY) ?? dot.color;
      const resolvedRgb = hexToRgb(resolvedColor);

      return {
        key: `${dot.gridX}-${dot.gridY}`,
        x: dot.x,
        y: dot.y,
        color: resolvedColor,
        rgb: resolvedRgb,
        delayMs,
        periodMs,
        depth,
      };
    });
  }, [visibleDots, maxGrid.maxX, maxGrid.maxY, effectiveDuration, preset, colorProp, effectiveWidth, effectiveHeight]);

  const resolvedRenderMode = useMemo(() => {
    if (renderMode !== 'auto') return renderMode;
    return runtimeDots.length > AUTO_CANVAS_THRESHOLD ? 'canvas' : 'svg';
  }, [renderMode, runtimeDots.length]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (resolvedRenderMode !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = Math.max(1, Math.round(effectiveWidth * dpr));
    canvas.height = Math.max(1, Math.round(effectiveHeight * dpr));
    canvas.style.width = `${effectiveWidth}px`;
    canvas.style.height = `${effectiveHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frame = 0;
    let rafId = 0;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, effectiveWidth, effectiveHeight);

      for (const dot of runtimeDots) {
        const phase = effectiveReducedMotion
          ? 0.5
          : 0.5 + 0.5 * Math.sin(((time + dot.delayMs) / dot.periodMs) * Math.PI * 2);
        const opacity = (resolvedMinOpacity + (resolvedMaxOpacity - resolvedMinOpacity) * phase) * dot.depth;
        const scale = resolvedMinScale + (resolvedMaxScale - resolvedMinScale) * phase;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotRadius * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dot.rgb[0]}, ${dot.rgb[1]}, ${dot.rgb[2]}, ${clamp(
          opacity * (loading ? 0.55 : 1),
          0,
          1
        )})`;
        ctx.fill();
      }

      if (!effectiveReducedMotion) {
        frame += 1;
        if (quality === 'low' && frame % 2 === 1) {
          rafId = requestAnimationFrame(draw);
          return;
        }
        rafId = requestAnimationFrame(draw);
      }
    };

    draw(performance.now());

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    resolvedRenderMode,
    runtimeDots,
    effectiveWidth,
    effectiveHeight,
    dotRadius,
    resolvedMinOpacity,
    resolvedMaxOpacity,
    resolvedMinScale,
    resolvedMaxScale,
    loading,
    effectiveReducedMotion,
    quality,
  ]);

  const cssVars = {
    '--rd-min-opacity': resolvedMinOpacity,
    '--rd-max-opacity': resolvedMaxOpacity,
    '--rd-min-scale': resolvedMinScale,
    '--rd-max-scale': resolvedMaxScale,
  } as CSSProperties;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: effectiveWidth,
        height: effectiveHeight,
        overflow: 'hidden',
        backgroundColor: '#0d0d0d',
        ...cssVars,
        ...style,
      }}
      aria-busy={loading}
      aria-label="Image-sampled dot matrix"
    >
      {resolvedRenderMode === 'canvas' ? (
        <canvas ref={canvasRef} style={{ display: 'block' }} aria-hidden />
      ) : (
        <svg width={effectiveWidth} height={effectiveHeight} style={{ display: 'block', overflow: 'visible' }} aria-hidden>
          <defs>
            <style>
              {`
                .rd-dot {
                  transform-origin: center;
                  animation: rd-wave ${effectiveDuration}ms ${easing} infinite;
                }
                @keyframes rd-wave {
                  0%, 100% {
                    opacity: var(--rd-min-opacity, 0.48);
                    transform: scale(var(--rd-min-scale, 0.9));
                  }
                  50% {
                    opacity: var(--rd-max-opacity, 0.96);
                    transform: scale(var(--rd-max-scale, 1.03));
                  }
                }
              `}
            </style>
          </defs>
          {runtimeDots.map((dot) => (
            <circle
              key={dot.key}
              className="rd-dot"
              cx={dot.x}
              cy={dot.y}
              r={dotRadius}
              fill={dot.color}
              style={{
                animationDuration: `${dot.periodMs}ms`,
                animationDelay: `${-dot.delayMs}ms`,
                opacity: loading ? 0.4 : undefined,
                animationPlayState: effectiveReducedMotion ? 'paused' : 'running',
              }}
            />
          ))}
        </svg>
      )}
    </div>
  );
}

export default Mosaic;
