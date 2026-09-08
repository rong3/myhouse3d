export type TourFrame = {
  p: number;
  eye: [number, number, number];
  look: [number, number, number];
  ceiling: number;
  chapter: number;
  title: string;
  description: string;
  floor: number;
};
export const tourFrames: TourFrame[] = [
  {
    p: 0,
    eye: [-14, 16, 28],
    look: [2.38, 4.6, 6.2],
    ceiling: 20,
    chapter: 0,
    title: 'Toàn cảnh ngôi nhà',
    description: '',
    floor: 0,
  },
  {
    p: 0.09,
    eye: [-8, 9, 21],
    look: [2.38, 3.3, 8.6],
    ceiling: 14,
    chapter: 0,
    title: 'Mặt tiền & sân cổng',
    description: '',
    floor: 0,
  },
  {
    p: 0.15,
    eye: [2.43, 1.72, 13],
    look: [2.72, 1.15, 10.05],
    ceiling: 3.39,
    chapter: 0,
    title: 'Qua cổng, vào nhà',
    description: '',
    floor: 0,
  },
  {
    p: 0.24,
    eye: [1.6, 1.72, 11.2],
    look: [4.02, 1.05, 10.05],
    ceiling: 3.39,
    chapter: 1,
    title: 'Phòng khách',
    description: '',
    floor: 0,
  },
  {
    p: 0.32,
    eye: [1.98, 1.72, 8.8],
    look: [2.1, 1.3, 5],
    ceiling: 3.39,
    chapter: 1,
    title: 'Lối đi giữa nhà',
    description: '',
    floor: 0,
  },
  {
    p: 0.42,
    eye: [3.72, 1.72, 4.35],
    look: [0.85, 1.15, 2.25],
    ceiling: 3.39,
    chapter: 1,
    title: 'Bếp & bàn ăn',
    description: '',
    floor: 0,
  },
  {
    p: 0.46,
    eye: [1.98, 1.72, 4.6],
    look: [2.95, 1.1, 5.65],
    ceiling: 3.39,
    chapter: 1,
    title: 'Cầu thang trung tâm',
    description: '',
    floor: 0,
  },
  {
    p: 0.5,
    eye: [2.94, 3.5, 7.6],
    look: [4.08, 3.4, 7.65],
    ceiling: 5.8,
    chapter: 1,
    title: 'Kết nối các tầng',
    description: '',
    floor: 0,
  },
  {
    p: 0.58,
    eye: [1.75, 5.25, 4.1],
    look: [3.3, 4.3, 2.2],
    ceiling: 6.99,
    chapter: 2,
    title: 'Phòng ngủ hướng ban công',
    description: '',
    floor: 1,
  },
  {
    p: 0.67,
    eye: [1.75, 5.25, 9.05],
    look: [3.3, 4.3, 10.15],
    ceiling: 6.99,
    chapter: 2,
    title: 'Phòng ngủ hướng cổng',
    description: '',
    floor: 1,
  },
  {
    p: 0.74,
    eye: [-3.6, 9.8, 9.5],
    look: [2.5, 6, 5.8],
    ceiling: 10.28,
    chapter: 2,
    title: 'Lên sân thượng',
    description: '',
    floor: 1,
  },
  {
    p: 0.83,
    eye: [0.5, 8.86, 0.5],
    look: [3.65, 8.3, 3.82],
    ceiling: 10.28,
    chapter: 3,
    title: 'Phòng thờ & sân sau',
    description: '',
    floor: 2,
  },
  {
    p: 0.92,
    eye: [0.8, 8.86, 8.8],
    look: [2.75, 7.9, 10.65],
    ceiling: 10.28,
    chapter: 3,
    title: 'Sân thượng phía cổng',
    description: '',
    floor: 2,
  },
  {
    p: 1,
    eye: [-14, 16, 28],
    look: [2.38, 4.6, 6.2],
    ceiling: 20,
    chapter: 0,
    title: 'Toàn cảnh ngôi nhà',
    description: '',
    floor: 2,
  },
];
export function sampleTour(progress: number) {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  let i = 0;
  while (i < tourFrames.length - 2 && p > tourFrames[i + 1].p) i++;
  const a = tourFrames[i],
    b = tourFrames[i + 1],
    t = Math.min(1, (p - a.p) / (b.p - a.p)),
    s = t * t * (3 - 2 * t);
  const mix = (x: number, y: number) => x + (y - x) * s;
  return {
    eye: a.eye.map((v, n) => mix(v, b.eye[n])) as [number, number, number],
    look: a.look.map((v, n) => mix(v, b.look[n])) as [number, number, number],
    ceiling: mix(a.ceiling, b.ceiling),
    frame: t > 0.5 ? b : a,
    p,
  };
}
