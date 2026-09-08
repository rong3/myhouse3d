import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Nhà phố · Khám phá không gian 3D',description:'Xoay, phóng to và khám phá từng tầng nhà theo bản vẽ: tầng trệt, lầu 1, sân thượng và mái.'};
export default function RootLayout({children}: {children:React.ReactNode}) {return <html lang="vi"><body>{children}</body></html>;}
