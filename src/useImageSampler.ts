import { useState, useCallback, useRef, useEffect } from 'react';
import type { DotSample } from './types';

const FALLBACK_COLOR = '#1a1a1a';

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export interface UseImageSamplerResult {
  dots: DotSample[];
  loading: boolean;
  error: boolean;
  width: number;
  height: number;
}

export interface UseImageSamplerOptions {
  src: string | null | undefined;
  gridSize: number;
  width: number;
  height: number;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
}

export function useImageSampler({
  src,
  gridSize,
  width,
  height,
  crossOrigin = 'anonymous',
}: UseImageSamplerOptions): UseImageSamplerResult {
  const [dots, setDots] = useState<DotSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const getOrCreateCanvas = useCallback(() => {
    if (canvasRef.current) return canvasRef.current;
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    return canvas;
  }, []);

  const samplePixels = useCallback(
    (imageWidth: number, imageHeight: number, imageData: ImageData | null): DotSample[] => {
      const result: DotSample[] = [];
      const data = imageData?.data;
      const stepX = Math.max(1, Math.floor(imageWidth / gridSize));
      const stepY = Math.max(1, Math.floor(imageHeight / gridSize));
      const cols = Math.ceil(imageWidth / stepX);
      const rows = Math.ceil(imageHeight / stepY);
      const gapX = width / Math.max(1, cols - 1);
      const gapY = height / Math.max(1, rows - 1);

      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const px = Math.min(gx * stepX, imageWidth - 1);
          const py = Math.min(gy * stepY, imageHeight - 1);
          const idx = (py * imageWidth + px) * 4;
          let color = FALLBACK_COLOR;
          if (data && idx + 2 < data.length) {
            color = rgbToHex(data[idx], data[idx + 1], data[idx + 2]);
          }
          result.push({
            gridX: gx,
            gridY: gy,
            x: gx * gapX,
            y: gy * gapY,
            color,
          });
        }
      }
      return result;
    },
    [gridSize, width, height]
  );

  const buildFallbackGrid = useCallback(() => {
    const result: DotSample[] = [];
    const gapX = width / Math.max(1, gridSize - 1);
    const gapY = height / Math.max(1, gridSize - 1);
    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        result.push({
          gridX: gx,
          gridY: gy,
          x: gx * gapX,
          y: gy * gapY,
          color: FALLBACK_COLOR,
        });
      }
    }
    return result;
  }, [gridSize, width, height]);

  useEffect(() => {
    if (!width || !height || gridSize < 1) {
      setDots(buildFallbackGrid());
      setLoading(false);
      setError(false);
      return;
    }

    if (!src || src.trim() === '') {
      setDots(buildFallbackGrid());
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    const img = new Image();
    imgRef.current = img;

    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }

    const onLoad = () => {
      const canvas = getOrCreateCanvas();
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setDots(buildFallbackGrid());
        setLoading(false);
        setError(true);
        return;
      }
      ctx.drawImage(img, 0, 0);
      let imageData: ImageData | null = null;
      try {
        imageData = ctx.getImageData(0, 0, w, h);
      } catch {
        // CORS tainted
      }
      const sampled = samplePixels(w, h, imageData);
      setDots(sampled);
      setLoading(false);
      setError(!imageData);
    };

    const onError = () => {
      setDots(buildFallbackGrid());
      setLoading(false);
      setError(true);
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    img.src = src;

    return () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
      img.src = '';
      imgRef.current = null;
    };
  }, [src, gridSize, width, height, crossOrigin, getOrCreateCanvas, samplePixels, buildFallbackGrid]);

  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
        canvasRef.current = null;
      }
    };
  }, []);

  return { dots, loading, error, width, height };
}
