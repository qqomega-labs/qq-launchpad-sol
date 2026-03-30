/**
 * @dev Utility functions for the QQ Hex Sphere: geometry, scoring, ranking, coloring.
 */

import {
  DIMS,
  RAW,
  TOTAL,
  type RawAsset,
  type RankedAsset,
  type SortKey,
} from "./sphere-data";

// PUBLIC

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface HexColor {
  h: number;
  s: number;
  l: number;
  t: number;
}

/**
 * @dev Fibonacci sphere with surface repulsion for even distribution.
 * Returns N points on the unit sphere, north pole = front.
 */
export function fibSphere(n: number): Point3D[] {
  const pts: Point3D[] = [];
  const phi = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < n; i++) {
    const theta = Math.acos(1 - (2 * i) / (n - 1));
    const azimuth = (2 * Math.PI * i) / phi;
    pts.push({
      x: Math.sin(theta) * Math.cos(azimuth),
      y: Math.sin(theta) * Math.sin(azimuth),
      z: Math.cos(theta),
    });
  }

  // Surface repulsion to fix north-pole crowding
  const minArc = Math.sqrt((4 * Math.PI) / n) * 0.95;
  for (let pass = 0; pass < 8; pass++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x;
        const dy = pts[j].y - pts[i].y;
        const dz = pts[j].z - pts[i].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < minArc && dist > 0.001) {
          const push = ((minArc - dist) / dist) * 0.3;
          const wi = i === 0 ? 0 : 0.4;
          const wj = i === 0 ? 1 : 0.6;
          pts[i].x -= dx * push * wi;
          pts[i].y -= dy * push * wi;
          pts[i].z -= dz * push * wi;
          pts[j].x += dx * push * wj;
          pts[j].y += dy * push * wj;
          pts[j].z += dz * push * wj;
          // Re-project onto unit sphere
          for (const p of [pts[i], pts[j]]) {
            const len = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
            p.x /= len;
            p.y /= len;
            p.z /= len;
          }
        }
      }
    }
  }
  return pts;
}

/** @dev Rotate a 3D point by pitch (rx) and yaw (ry). */
export function rotate3D(p: Point3D, rx: number, ry: number): Point3D {
  const x1 = p.x * Math.cos(ry) + p.z * Math.sin(ry);
  const z1 = -p.x * Math.sin(ry) + p.z * Math.cos(ry);
  const y2 = p.y * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 = p.y * Math.sin(rx) + z1 * Math.cos(rx);
  return { x: x1, y: y2, z: z2 };
}

/** @dev Generate SVG path string for a pointy-top hexagon of given radius. */
export function hexPath(r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

/** @dev Weighted composite score across all dimensions. */
export function composite(c: RawAsset): number {
  return DIMS.reduce((s, d) => s + (c[d.key] || 0) * d.weight, 0);
}

/** @dev QQ Score: normalized 0-99 scale, calibrated so top rank ~ 93. */
export function qqScore(comp: number): number {
  return Math.min(99, Math.round(comp * 1.07));
}

/** @dev Rank all assets by a given sort key. Returns RankedAsset[]. */
export function rankAll(sk: SortKey): RankedAsset[] {
  const sc = RAW.map((c) => ({ ...c, comp: composite(c) }));
  sc.sort((a, b) =>
    sk === "comp" ? b.comp - a.comp : (b[sk] || 0) - (a[sk] || 0),
  );
  return sc.map((c, i) => ({ ...c, rank: i + 1, qq: qqScore(composite(c)) }));
}

/** @dev HSL color based on rank position: top = vibrant pink, bottom = desaturated. */
export function getHexColor(rank: number): HexColor {
  const t = (rank - 1) / (TOTAL - 1);
  const h = 335 - t * 10;
  const s = 95 - t * 30;
  const l = 44 + t * 22;
  return { h, s, l, t };
}
