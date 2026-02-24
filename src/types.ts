export interface DotSample {
  x: number;
  y: number;
  color: string;
  gridX: number;
  gridY: number;
}

import type { CSSProperties } from 'react';

export type RenderMode = 'auto' | 'svg' | 'canvas';
export type QualityMode = 'auto' | 'high' | 'balanced' | 'low';
export type AnimationPreset = 'calm' | 'vivid' | 'minimal';

/** Single color (hex, rgb, hsl) or linear gradient. */
export type ColorProp =
  | string
  | {
      type: 'linear';
      angle?: number;
      stops: Array<{ offset: number; color: string }>;
    };

export interface MosaicProps {
  /** Image URL to sample. On load/CORS failure, falls back to monochrome grid. */
  src?: string | null;
  /** Grid density: number of dots per row/column (e.g. 16 -> 16x16). Ignored if dotCount is set. */
  gridSize?: number;
  /** Approximate total number of dots. Grid size is derived as sqrt(dotCount) per side. */
  dotCount?: number;
  /** Width of the component in pixels. Ignored if size is set. */
  width?: number;
  /** Height of the component in pixels. Ignored if size is set. */
  height?: number;
  /** Square size in pixels. Sets both width and height when provided. */
  size?: number;
  /** Dot radius in pixels. */
  dotRadius?: number;
  /** Gap between dot centers in pixels. Auto-derived from width/height and gridSize if not set. */
  gap?: number;
  /** Animation duration per dot cycle (ms). */
  duration?: number;
  /** Easing for the wave animation (SVG mode). */
  easing?: string;
  /** Optional CSS class for the container. */
  className?: string;
  /** Optional inline styles for the container. */
  style?: CSSProperties;
  /** CrossOrigin for image (e.g. 'anonymous' for CORS). */
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  /** Shape of the dot layout: square (default), circle, squircle, play, diamond, or hexagon. */
  shape?: 'square' | 'circle' | 'squircle' | 'play' | 'diamond' | 'hexagon';
  /** Animation speed multiplier. 1 = normal, 2 = twice as fast. */
  speed?: number;
  /** Minimum opacity (0-1) at wave trough. */
  minOpacity?: number;
  /** Maximum opacity (0-1) at wave peak. */
  maxOpacity?: number;
  /** Minimum scale (0-2) at wave trough. */
  minScale?: number;
  /** Maximum scale (0-2) at wave peak. */
  maxScale?: number;
  /** Renderer selection. auto uses canvas for larger dot counts. */
  renderMode?: RenderMode;
  /** Quality profile tuned for device capability and smoothness. */
  quality?: QualityMode;
  /** Tuned animation profile for product-ready defaults. */
  animationPreset?: AnimationPreset;
  /** Force reduced motion behavior. If undefined, uses prefers-reduced-motion. */
  reducedMotion?: boolean;
  /** Optional single color or gradient to override sampled dot colors. */
  color?: ColorProp;
}

/** @deprecated Use MosaicProps. */
export type DotsProps = MosaicProps;
