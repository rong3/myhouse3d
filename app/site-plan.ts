// Owner correction: rectangular house; only the street-side land boundary is oblique.
// House depth and yard dimensions are estimated from the requested areas.
export const SITE = {
  width: 4.76,
  rearZ: 0,
  houseDepth: 60 / 4.76,
  streetSkew: 1.41,
  yardArea: 56,
  balconyDepth: 1.2,
  levels: [0, 3.6, 7.2, 10.5],
} as const;
export const frontZ = (_x: number) => SITE.houseDepth;
export const gateZ = SITE.houseDepth + SITE.yardArea / SITE.width;
export const boundaryZ = (x: number) =>
  gateZ + SITE.streetSkew * (x / SITE.width - 0.5);
export const houseOutline: number[][] = [
  [0, 0],
  [SITE.width, 0],
  [SITE.width, SITE.houseDepth],
  [0, SITE.houseDepth],
];
export const upperOutline: number[][] = [
  [0, 0],
  [SITE.width, 0],
  [SITE.width, SITE.houseDepth + SITE.balconyDepth],
  [0, SITE.houseDepth + SITE.balconyDepth],
];
export const yardOutline: number[][] = [
  [0, SITE.houseDepth],
  [SITE.width, SITE.houseDepth],
  [SITE.width, boundaryZ(SITE.width)],
  [0, boundaryZ(0)],
];
export const houseArea = SITE.width * SITE.houseDepth;
