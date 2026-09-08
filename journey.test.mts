import assert from 'node:assert/strict';
// @ts-expect-error Node native TypeScript requires the explicit .ts extension.
import { sampleTour,tourFrames } from './app/journey.ts';
assert.equal(sampleTour(-1).p,0);assert.equal(sampleTour(2).p,1);assert.equal(sampleTour(NaN).p,0);
for(let i=0;i<tourFrames.length;i++){
 const f=tourFrames[i],s=sampleTour(f.p);s.eye.forEach((v,j)=>assert.ok(Math.abs(v-f.eye[j])<1e-8));s.look.forEach((v,j)=>assert.ok(Math.abs(v-f.look[j])<1e-8));assert.ok(Math.abs(s.ceiling-f.ceiling)<1e-8);
 if(i)assert.ok(f.p>tourFrames[i-1].p);
}
let maxStep=0;
for(let i=0;i<1000;i++){
 const s=sampleTour(i/1000),n=sampleTour((i+1)/1000);assert.ok([...s.eye,...s.look,s.ceiling].every(Number.isFinite));
 const distance=Math.hypot(...s.eye.map((v,j)=>v-n.eye[j]));maxStep=Math.max(maxStep,distance);assert.ok(distance<.65,'Camera path must remain continuous');
 assert.ok(Math.hypot(...s.eye.map((v,j)=>v-s.look[j]))>.5,'Camera must not coincide with its look target');
}
assert.equal(tourFrames.filter(f=>f.floor===1).length,3);
console.log('Tour path verified: clamped input, exact keyframes, continuous camera and valid targets. Max step:',maxStep.toFixed(3));

