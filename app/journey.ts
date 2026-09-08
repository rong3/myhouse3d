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
    eye: [-16.62, 21.4, 41.1547],
    look: [2.38, 3.4, 12.1547],
    ceiling: 20,
    chapter: 0,
    title: 'Toàn cảnh nhà & sân',
    description: '',
    floor: 0,
  },
  {
    p: 0.08,
    eye: [-8, 13, 30],
    look: [2.38, 2.8, 15.8],
    ceiling: 20,
    chapter: 0,
    title: 'Sân trước khoảng 56 m²',
    description: '',
    floor: 0,
  },
  {
    p: 0.14,
    eye: [2.38, 1.72, 25],
    look: [2.68, 1.3, 20.5],
    ceiling: 20,
    chapter: 0,
    title: 'Qua cổng chính',
    description: '',
    floor: 0,
  },
  {
    p: 0.24,
    eye: [2.7, 1.72, 14.6],
    look: [2.68, 1.25, 11.6],
    ceiling: 6.99,
    chapter: 0,
    title: 'Qua sân vào mặt nhà thẳng',
    description: '',
    floor: 0,
  },
  {
    p: 0.29,
    eye: [2.5, 1.72, 11.5],
    look: [0.8, 1.1, 10.2],
    ceiling: 3.39,
    chapter: 1,
    title: 'Phòng khách ngay sau cổng',
    description: '',
    floor: 0,
  },
  {
    p: 0.39,
    eye: [1.98, 1.72, 7.8],
    look: [0.95, 1.1, 6.5],
    ceiling: 3.39,
    chapter: 1,
    title: 'Bàn ăn gọn bên cầu thang',
    description: '',
    floor: 0,
  },
  {
    p: 0.46,
    eye: [1.7, 1.72, 4.45],
    look: [3.8, 1.05, 2.5],
    ceiling: 3.39,
    chapter: 1,
    title: 'Bếp và khu vệ sinh ở cuối nhà',
    description: '',
    floor: 0,
  },
  {
    p: 0.52,
    eye: [1.5, 1.72, 1.35],
    look: [1.445, 1.1, -0.8],
    ceiling: 3.39,
    chapter: 1,
    title: 'Cửa thoát hiểm mặt tiền sau',
    description: '',
    floor: 0,
  },
  {
    p: 0.58,
    eye: [1.98, 3.4, 5],
    look: [3.5, 3.4, 6.3],
    ceiling: 6.99,
    chapter: 1,
    title: 'Lõi thang giữ nguyên vị trí',
    description: '',
    floor: 0,
  },
  {
    p: 0.64,
    eye: [1.65, 5.25, 4.1],
    look: [3.45, 4.7, 2.25],
    ceiling: 6.99,
    chapter: 2,
    title: 'Phòng ngủ 01 phía ban công',
    description: '',
    floor: 1,
  },
  {
    p: 0.72,
    eye: [1.7, 5.25, 9.1],
    look: [3.4, 4.8, 10.47],
    ceiling: 6.99,
    chapter: 2,
    title: 'Phòng ngủ 02 phía sau',
    description: '',
    floor: 1,
  },
  {
    p: 0.78,
    eye: [2.68, 5.25, 13.65],
    look: [2.38, 1.5, 20],
    ceiling: 6.99,
    chapter: 2,
    title: 'Ban công hướng sân trước',
    description: '',
    floor: 1,
  },
  {
    p: 0.85,
    eye: [0.6, 8.86, 1.2],
    look: [4, 8.2, 3.85],
    ceiling: 10.28,
    chapter: 3,
    title: 'Phòng thờ & sân thượng',
    description: '',
    floor: 2,
  },
  {
    p: 0.9,
    eye: [0.8, 8.86, 10],
    look: [2.7, 7.9, 12.7],
    ceiling: 10.28,
    chapter: 3,
    title: 'Sân thượng nhìn về cổng',
    description: '',
    floor: 2,
  },
  {
    p: 1,
    eye: [-16.62, 21.4, 41.1547],
    look: [2.38, 3.4, 12.1547],
    ceiling: 20,
    chapter: 0,
    title: 'Toàn cảnh hai mặt tiền',
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
