export type ShapeKind = 'square' | 'circle' | 'squircle' | 'play';

/** Normalized coords nx, ny in [0, 1]. Returns true if point is inside the shape. */
export function isInsideShape(nx: number, ny: number, shape: ShapeKind): boolean {
  switch (shape) {
    case 'square':
      return true;
    case 'circle': {
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      return dx * dx + dy * dy <= 0.25;
    }
    case 'squircle': {
      const x = Math.abs(nx - 0.5) * 2;
      const y = Math.abs(ny - 0.5) * 2;
      return Math.pow(x, 4) + Math.pow(y, 4) <= 1;
    }
    case 'play': {
      return pointInTriangle(nx, ny, 0.22, 0.28, 0.22, 0.72, 0.82, 0.5);
    }
    default:
      return true;
  }
}

function pointInTriangle(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): boolean {
  const sign = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) =>
    (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
  const d1 = sign(px, py, ax, ay, bx, by);
  const d2 = sign(px, py, bx, by, cx, cy);
  const d3 = sign(px, py, cx, cy, ax, ay);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}
