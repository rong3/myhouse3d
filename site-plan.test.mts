import assert from 'node:assert/strict';
// @ts-expect-error Node's TypeScript runner uses explicit extensions.
import * as plan from './app/site-plan.ts';
const { SITE, frontZ, gateZ, houseOutline, upperOutline, yardOutline } = plan;
function area(points: number[][]) {
  return (
    Math.abs(
      points.reduce((s, p, i) => {
        const q = points[(i + 1) % points.length];
        return s + p[0] * q[1] - q[0] * p[1];
      }, 0),
    ) / 2
  );
}
assert.ok(
  Math.abs(area(houseOutline) - 59.7142) < 0.001,
  'House follows the original ~60 m² oblique footprint',
);
assert.ok(
  Math.abs(area(yardOutline) - 56) < 0.001,
  'Yard adds a separate 56 m² instead of occupying the house',
);
assert.ok(
  gateZ - SITE.frontRightZ > 11 && gateZ - SITE.frontLeftZ > 12,
  'The forecourt has a full estimated depth on both sides',
);
assert.ok(
  Math.abs(area(upperOutline) - area(houseOutline) - 4.76 * 1.2) < 0.001,
  'Balcony adds 1.2 m at the front',
);
assert.equal(
  Math.min(...upperOutline.map((p) => p[1])),
  0,
  'No rear balcony projection remains',
);
assert.equal(frontZ(0), 11.84);
assert.equal(frontZ(SITE.width), 13.25);
assert.deepEqual(SITE.levels, [0, 3.6, 7.2, 10.5]);
console.log(
  'Geometry verified: house ' +
    area(houseOutline).toFixed(2) +
    ' m², yard ' +
    area(yardOutline).toFixed(2) +
    ' m², front balcony and original levels.',
);
