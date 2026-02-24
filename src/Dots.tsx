import { useMemo } from 'react';
import { useImageSampler } from './useImageSampler';
import { isInsideShape } from './shapes';
import type { DotsProps } from './types';

const DEFAULT_GRID_SIZE = 16;
const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 320;
const DEFAULT_DOT_RADIUS = 3;
const DEFAULT_DURATION = 2800;
const DEFAULT_EASING = 'cubic-bezier(0.33, 0, 0.2, 1)';

/** Deterministic 0..1 from grid position for organic variation. */
function phaseHash(gx: number, gy: number): number {
  const n = Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

const DEFAULT_MIN_OPACITY = 0.3;
const DEFAULT_MAX_OPACITY = 1;
const DEFAULT_MIN_SCALE = 0.72;
const DEFAULT_MAX_SCALE = 1;

export function Dots({
  src = null,
  gridSize = DEFAULT_GRID_SIZE,
  dotCount,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  dotRadius = DEFAULT_DOT_RADIUS,
  gap,
  duration = DEFAULT_DURATION,
  easing = DEFAULT_EASING,
  shape = 'square',
  speed = 1,
  minOpacity = DEFAULT_MIN_OPACITY,
  maxOpacity = DEFAULT_MAX_OPACITY,
  minScale = DEFAULT_MIN_SCALE,
  maxScale = DEFAULT_MAX_SCALE,
  className,
  style,
  crossOrigin = 'anonymous',
}: DotsProps) {
  const effectiveGridSize =
    dotCount != null
      ? Math.max(1, Math.round(Math.sqrt(dotCount)))
      : gridSize;

  const { dots, loading } = useImageSampler({
    src,
    gridSize: effectiveGridSize,
    width,
    height,
    crossOrigin,
  });

  const effectiveDuration = duration / Math.max(0.1, Math.min(10, speed));

  const visibleDots = useMemo(() => {
    if (shape === 'square') return dots;
    return dots.filter((d) => {
      const nx = width > 0 ? d.x / width : 0;
      const ny = height > 0 ? d.y / height : 0;
      return isInsideShape(nx, ny, shape);
    });
  }, [dots, shape, width, height]);

  const maxGrid = useMemo(() => {
    let maxX = 0;
    let maxY = 0;
    for (const d of visibleDots) {
      if (d.gridX > maxX) maxX = d.gridX;
      if (d.gridY > maxY) maxY = d.gridY;
    }
    return { maxX, maxY };
  }, [visibleDots]);

  const staggerSpan = effectiveDuration * 0.5;
  const phaseSpread = effectiveDuration * 0.42;
  const durationSpread = 520;

  const cssVars = {
    '--rd-min-opacity': minOpacity,
    '--rd-max-opacity': maxOpacity,
    '--rd-min-scale': minScale,
    '--rd-max-scale': maxScale,
  } as React.CSSProperties;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        backgroundColor: '#0d0d0d',
        ...cssVars,
        ...style,
      }}
      aria-busy={loading}
      aria-label="Image-sampled dot matrix"
    >
      <svg
        width={width}
        height={height}
        style={{ display: 'block', overflow: 'visible' }}
        aria-hidden
      >
        <defs>
          <style>
            {`
              .rd-dot {
                transform-origin: center;
                animation: rd-wave ${effectiveDuration}ms ${easing} infinite;
              }
              @keyframes rd-wave {
                0%, 100% {
                  opacity: var(--rd-min-opacity, 0.3);
                  transform: scale(var(--rd-min-scale, 0.72));
                }
                50% {
                  opacity: var(--rd-max-opacity, 1);
                  transform: scale(var(--rd-max-scale, 1));
                }
              }
            `}
          </style>
        </defs>
        {visibleDots.map((dot) => {
          const h = phaseHash(dot.gridX, dot.gridY);
          const diagonal =
            (dot.gridX + dot.gridY) / (maxGrid.maxX + maxGrid.maxY + 1);
          const cx = maxGrid.maxX / 2;
          const cy = maxGrid.maxY / 2;
          const dist = Math.sqrt(
            Math.pow(dot.gridX - cx, 2) + Math.pow(dot.gridY - cy, 2)
          );
          const maxDist = Math.sqrt(cx * cx + cy * cy) || 1;
          const radial = dist / maxDist;
          const basePhase = (0.65 * diagonal + 0.35 * radial) * staggerSpan;
          const organicOffset = (h - 0.5) * phaseSpread;
          const delay = basePhase + organicOffset;
          const dotDuration = effectiveDuration + (h - 0.5) * durationSpread;
          return (
            <circle
              key={`${dot.gridX}-${dot.gridY}`}
              className="rd-dot"
              cx={dot.x}
              cy={dot.y}
              r={dotRadius}
              fill={dot.color}
              style={{
                animationDuration: `${dotDuration}ms`,
                animationDelay: `${-delay}ms`,
                opacity: loading ? 0.4 : undefined,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default Dots;
