// The house dimensions come from the supplied plans. Yard dimensions are estimated.
export const SITE = {
  width: 4.76,
  rearZ: 0,
  frontLeftZ: 11.84,
  frontRightZ: 13.25,
  yardArea: 56,
  balconyDepth: 1.2,
  levels: [0, 3.6, 7.2, 10.5],
} as const;
export const frontZ = (x: number) =>
  SITE.frontLeftZ + ((SITE.frontRightZ - SITE.frontLeftZ) * x) / SITE.width;
export const gateZ =
  (SITE.frontLeftZ + SITE.frontRightZ) / 2 + SITE.yardArea / SITE.width;
export const houseOutline: number[][] = [
  [0, 0],
  [SITE.width, 0],
  [SITE.width, SITE.frontRightZ],
  [0, SITE.frontLeftZ],
];
export const upperOutline: number[][] = [
  [0, 0],
  [SITE.width, 0],
  [SITE.width, SITE.frontRightZ + SITE.balconyDepth],
  [0, SITE.frontLeftZ + SITE.balconyDepth],
];
export const yardOutline: number[][] = [
  [0, SITE.frontLeftZ],
  [SITE.width, SITE.frontRightZ],
  [SITE.width, gateZ],
  [0, gateZ],
];
export const houseArea =
  (SITE.width * (SITE.frontLeftZ + SITE.frontRightZ)) / 2;
