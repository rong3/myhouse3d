export type TourFrame={p:number;eye:[number,number,number];look:[number,number,number];ceiling:number;chapter:number;title:string;description:string;floor:number};
export const tourFrames:TourFrame[]=[
 {p:0,eye:[-14,12,-20],look:[2.1,4.1,3.7],ceiling:20,chapter:0,title:'Một ngôi nhà. Một hành trình.',description:'Từ không gian sum họp đến khoảng sân đầy nắng. Cuộn để bước vào nhà.',floor:0},
 {p:.09,eye:[-10,9,-12],look:[2.3,4.1,5.3],ceiling:12,chapter:0,title:'Nhìn trọn không gian',description:'Các tầng liền mạch, đúng cao độ. Mặt cắt mở giúp nhìn thấy bên trong.',floor:0},
 {p:.15,eye:[2.38,1.72,-3.7],look:[2.8,1.25,1.9],ceiling:3.39,chapter:0,title:'Qua cổng, vào sân nhà',description:'Sân lát đá, cổng nan thoáng và hai dải cây xanh. Sân/cổng là phương án đề xuất vì bản vẽ chưa có kích thước ranh đất.',floor:0},
 {p:.20,eye:[2.2,1.72,.3],look:[3.7,1.15,3.1],ceiling:3.39,chapter:1,title:'Bước vào phòng khách',description:'Sofa êm, gỗ sáng và ánh sáng dịu. Lối đi thoáng nối từ cửa vào đến bếp.',floor:0},
 {p:.30,eye:[2.05,1.72,4.45],look:[1.05,1.04,6.7],ceiling:3.39,chapter:1,title:'Nơi cả nhà quây quần',description:'Bàn ăn sáu chỗ, kết nối phòng khách và bếp trong một không gian mở.',floor:0},
 {p:.40,eye:[2.45,1.72,8.85],look:[.65,1.1,11],ceiling:3.39,chapter:1,title:'Căn bếp gọn gàng',description:'Tủ bếp liền mạch, mặt đá sáng. Khu giặt và vệ sinh nằm gọn bên phải.',floor:0},
 {p:.43,eye:[1.95,1.85,8.0],look:[3.5,1.25,8.8],ceiling:3.39,chapter:1,title:'Trở về lõi giữa nhà',description:'Lối đi liên tục nối bếp, khu ăn và cầu thang.',floor:0},
 {p:.46,eye:[1.9,2.1,7.7],look:[3.7,2.6,6.0],ceiling:5.3,chapter:1,title:'Kết nối các tầng',description:'Lõi cầu thang giữa nhà dẫn lên không gian riêng tư phía trên.',floor:0},
 {p:.56,eye:[1.65,5.25,4.1],look:[3.5,4.65,2.2],ceiling:6.99,chapter:2,title:'Phòng ngủ phía trước',description:'Màu sắc nhẹ, tủ áo gọn và ban công đón sáng. Một khoảng nghỉ yên tĩnh.',floor:1},
 {p:.66,eye:[1.6,5.25,8.75],look:[3.6,4.65,10.5],ceiling:6.99,chapter:2,title:'Phòng ngủ phía sau',description:'Giường và tủ gỗ cùng tông; giữ vách xéo và cửa sổ theo mặt bằng gốc.',floor:1},
 {p:.73,eye:[-3.6,9.5,9],look:[2.5,6,5.8],ceiling:10.28,chapter:2,title:'Lên khoảng trời riêng',description:'Tiếp tục theo cầu thang lên phòng thờ và hai sân thượng.',floor:1},
 {p:.83,eye:[.6,8.86,.4],look:[3.6,8.35,3.8],ceiling:10.28,chapter:3,title:'Sân trước & phòng thờ',description:'Khoảng sân thoáng, cây xanh vừa đủ và phòng thờ ấm áp ở phía trong.',floor:2},
 {p:.91,eye:[.8,8.86,8.9],look:[2.8,7.95,11.1],ceiling:10.28,chapter:3,title:'Thư giãn trên sân thượng',description:'Một góc ngồi ngoài trời gọn nhẹ, mở ra khoảng thoáng phía sau nhà.',floor:2},
 {p:1,eye:[-14,13,-20],look:[2.1,4.1,3.7],ceiling:20,chapter:0,title:'Trở lại toàn cảnh',description:'Bạn có thể xem lại hành trình hoặc chuyển sang Tự do để xoay và khám phá.',floor:2}
];
export function sampleTour(progress:number){
 const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));let i=0;while(i<tourFrames.length-2&&p>tourFrames[i+1].p)i++;
 const a=tourFrames[i],b=tourFrames[i+1],t=Math.min(1,(p-a.p)/(b.p-a.p)),s=t*t*(3-2*t);
 const mix=(x:number,y:number)=>x+(y-x)*s;
 return {eye:a.eye.map((v,n)=>mix(v,b.eye[n])) as [number,number,number],look:a.look.map((v,n)=>mix(v,b.look[n])) as [number,number,number],ceiling:mix(a.ceiling,b.ceiling),frame:t>.5?b:a,p};
}

