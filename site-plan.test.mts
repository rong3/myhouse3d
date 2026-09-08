import assert from 'node:assert/strict';
// @ts-expect-error Node's TypeScript runner uses explicit extensions.
import * as plan from './app/site-plan.ts';
const { SITE, frontZ, boundaryZ, houseOutline, upperOutline, yardOutline } =
  plan;
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
  Math.abs(area(houseOutline) - 60) < 0.001,
  'Rectangular house occupies 60 m²',
);
assert.ok(
  Math.abs(area(yardOutline) - 56) < 0.001,
  'Yard adds a separate 56 m² instead of occupying the house',
);
assert.ok(
  boundaryZ(0) - SITE.houseDepth > 11 &&
    boundaryZ(SITE.width) - SITE.houseDepth > 12,
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
assert.equal(frontZ(0), frontZ(SITE.width), 'House front is straight');
assert.ok(
  Math.abs(boundaryZ(SITE.width) - boundaryZ(0) - 1.41) < 1e-9,
  'Only the land boundary is skewed',
);
for (let i = 0; i < 4; i++) {
  const a = houseOutline[i],
    b = houseOutline[(i + 1) % 4],
    c = houseOutline[(i + 2) % 4];
  assert.ok(
    Math.abs((b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1])) <
      1e-9,
    'Every house corner is 90 degrees',
  );
}
assert.deepEqual(SITE.levels, [0, 3.6, 7.2, 10.5]);
console.log(
  'Geometry verified: house ' +
    area(houseOutline).toFixed(2) +
    ' m², yard ' +
    area(yardOutline).toFixed(2) +
    ' m², front balcony and original levels.',
);
