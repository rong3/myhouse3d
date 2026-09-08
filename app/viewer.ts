import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { sampleTour } from './journey';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export const rooms = [
 {id:'living',floor:0,name:'Phòng khách',x:2.38,z:2.35,w:4.4,d:4.4,color:'#d6a15e',description:'Không gian phía trước dài 4,84 m. Sofa, hai ghế đơn và bàn trà; lối vào rộng 2,80 m theo bản vẽ.'},
 {id:'dining',floor:0,name:'Phòng ăn',x:1.22,z:6.45,w:2.05,d:2.7,color:'#bb795b',description:'Bàn ăn sáu chỗ nằm bên trái cầu thang, liên thông phòng khách và bếp.'},
 {id:'kitchen',floor:0,name:'Bếp',x:1.5,z:10.3,w:2.7,d:3.4,color:'#638d87',description:'Tủ bếp bên trái; chậu rửa theo vách sau xéo. Giữ cửa ra phía sau và lối tiếp cận WC.'},
 {id:'wc0',floor:0,name:'WC & giặt',x:3.91,z:10.8,w:1.35,d:3.1,color:'#829aae',description:'Dải chức năng rộng 1,60 m bên phải bếp: khu giặt phía trước và WC phía sau.'},
 {id:'stair0',floor:0,name:'Cầu thang',x:3.55,z:6.4,w:2,d:3,color:'#959099',description:'Cầu thang tại lõi giữa nhà, từ trục 2 đến trục 3, nối lên cao độ +3,600 m.'},
 {id:'bed1',floor:1,name:'Phòng ngủ 01',x:2.38,z:2.4,w:4.4,d:4.4,color:'#c59276',description:'Phòng ngủ phía trước dài 4,84 m, có tủ áo và cửa ra ban công sâu 1,20 m.'},
 {id:'balcony',floor:1,name:'Ban công',x:2.38,z:-.6,w:4.4,d:.9,color:'#6e9681',description:'Ban công rộng theo bề ngang nhà, sâu 1,20 m.'},
 {id:'bed2',floor:1,name:'Phòng ngủ 02',x:2.38,z:10.45,w:4.3,d:3.7,color:'#b79b67',description:'Phòng ngủ phía sau có tủ áo và cửa sổ tại vách xéo. Biên sau giữ đúng hình dạng bản vẽ.'},
 {id:'wc1',floor:1,name:'WC chung',x:.78,z:7.05,w:1.2,d:2.15,color:'#829aae',description:'WC khoảng 1,50 × 2,50 m nằm bên trái sảnh thang, phục vụ hai phòng ngủ.'},
 {id:'stair1',floor:1,name:'Sảnh & cầu thang',x:3.05,z:6.45,w:2.8,d:3,color:'#959099',description:'Lõi giao thông nằm giữa hai phòng ngủ. Chiếu nghỉ mở và ô thang được giữ thông tầng.'},
 {id:'altar',floor:2,name:'Phòng thờ',x:3,z:3.84,w:3.1,d:1.65,color:'#b78a4c',description:'Phòng thờ 3,50 × 2,00 m trước lõi thang; cửa hai cánh mở ra sân thượng trước.'},
 {id:'terraceFront',floor:2,name:'Sân thượng trước',x:2.3,z:.85,w:4.2,d:3.6,color:'#6e9681',description:'Sân thượng phía trước và lối bên hông rộng 1,26 m. Cây và bàn ghế là bố trí gợi ý.'},
 {id:'terraceRear',floor:2,name:'Sân thượng sau',x:2.3,z:10.35,w:4.2,d:3.6,color:'#6e9681',description:'Sân thượng sau tiếp giáp vách xéo, nối với sảnh thang và hành lang bên hông.'},
 {id:'stair2',floor:2,name:'Sảnh cầu thang',x:3.05,z:6.4,w:2.8,d:3,color:'#959099',description:'Cao độ +7,200 m. Khối cầu thang và phòng thờ được che bởi mái bê tông cốt thép.'},
 {id:'roof',floor:3,name:'Sàn mái BTCT',x:3,z:5.55,w:3.1,d:5.1,color:'#8c9ca4',description:'Mái trên phòng thờ và cầu thang, rộng 3,50 m, dài 5,50 m, cao độ +10,500 m. Diện tích ghi trên bản vẽ: 20 m².'}
];
export type Viewer={seek:(p:number)=>void;setMode:(m:string)=>void;setSection:(on:boolean)=>void;view:(v:string)=>void;zoom:(v:number)=>void;dispose:()=>void};
export function createViewer(host:HTMLElement,_onSelect:(id:string)=>void):Viewer {
 const scene=new T.Scene();scene.background=new T.Color('#f0efeb');
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;host.appendChild(renderer.domElement);
 const upperCut=new T.Plane(new T.Vector3(0,-1,0),20);renderer.clippingPlanes=[upperCut];renderer.localClippingEnabled=true;
 const pmrem=new T.PMREMGenerator(renderer),environmentScene=new RoomEnvironment(),environment=pmrem.fromScene(environmentScene,.04);scene.environment=environment.texture;scene.environmentIntensity=.5;environmentScene.dispose();pmrem.dispose();
 const sideCuts=[0,3.6,7.2,10.5].map(y=>new T.Plane(new T.Vector3(0,-1,0),y+.3));

 const camera=new T.PerspectiveCamera(44,1,.035,160);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=1.3;controls.maxDistance=65;controls.maxPolarAngle=Math.PI*.495;controls.enabled=false;controls.target.set(2.38,0,5.8);
 const ambient=new T.HemisphereLight(0xffffff,0xa5b0b7,1.4);scene.add(ambient);
 const sun=new T.DirectionalLight(0xfff4e3,2.7);sun.position.set(-8,22,-8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-18,right:18,top:24,bottom:-20,near:.5,far:70});sun.shadow.bias=-.0004;sun.shadow.normalBias=.025;scene.add(sun);
 const fill=new T.DirectionalLight(0xdbedff,1.1);fill.position.set(12,10,16);scene.add(fill);
 const mats=new Map<string,T.MeshStandardMaterial>();
 function mat(c:string,rough=.65,metal=0){const key=c+rough+metal;let m=mats.get(key);if(!m){m=new T.MeshStandardMaterial({color:c,roughness:rough,metalness:metal});mats.set(key,m)}return m;}
 const cream=mat('#f3f0e9'),wood=mat('#c5a172'),darkwood=mat('#8e6c46'),stone=mat('#ddd8cd'),black=mat('#323d40'),white=mat('#faf9f4'),fabric=mat('#d8c9b6'),green=mat('#426e50');
 // Fine directional grain keeps the furniture coherent without imported assets.
 const grainCanvas=document.createElement('canvas');grainCanvas.width=256;grainCanvas.height=256;const grain=grainCanvas.getContext('2d')!;grain.fillStyle='#e9d2ae';grain.fillRect(0,0,256,256);for(let j=0;j<128;j++){grain.strokeStyle=`rgba(99,67,33,${.035+(j%7)*.012})`;grain.lineWidth=.3+(j%4)*.25;grain.beginPath();for(let x=0;x<=256;x+=8){const y=j*2+Math.sin(x*.027+j)*1.5;x?grain.lineTo(x,y):grain.moveTo(x,y)}grain.stroke()}const woodTexture=new T.CanvasTexture(grainCanvas);woodTexture.colorSpace=T.SRGBColorSpace;wood.map=woodTexture;darkwood.map=woodTexture;
 const glass=new T.MeshStandardMaterial({color:'#a5c8ca',transparent:true,opacity:.24,roughness:.12,metalness:.15,depthWrite:false});
 function box(p:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:T.Material,round=0){const geo=round?new RoundedBoxGeometry(w,h,d,2,round):new T.BoxGeometry(w,h,d);const mesh=new T.Mesh(geo,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh;}
 function cyl(p:T.Object3D,x:number,y:number,z:number,r:number,h:number,m:T.Material,r2=r){const mesh=new T.Mesh(new T.CylinderGeometry(r,r2,h,20),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh;}
 function ball(p:T.Object3D,x:number,y:number,z:number,r:number,m:T.Material,sx=1,sy=1,sz=1){const mesh=new T.Mesh(new T.SphereGeometry(r,16,12),m);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;p.add(mesh);return mesh;}
 function line(p:T.Object3D,a:number[],b:number[],r=.018,m:T.Material=black){const av=new T.Vector3(...a),bv=new T.Vector3(...b),dir=bv.clone().sub(av);const o=new T.Mesh(new T.CylinderGeometry(r,r,dir.length(),8),m);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());p.add(o);return o;}
 function poly(p:T.Object3D,points:number[][],y:number,depth:number,m:T.Material,hole=false){const s=new T.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();if(hole){const path=new T.Path();path.moveTo(2.43,-5);path.lineTo(2.43,-8.1);path.lineTo(4.56,-8.1);path.lineTo(4.56,-5);path.closePath();s.holes.push(path)}const geo=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false});geo.rotateX(-Math.PI/2);const o=new T.Mesh(geo,m);o.position.y=y-depth;o.receiveShadow=true;o.castShadow=true;p.add(o);return o;}
 const base=box(scene,2.38,-.36,3.8,6.5,.2,19.5,mat('#e0ddd5'),.12);
 const ground=new T.Mesh(new T.PlaneGeometry(200,200),mat('#f0efeb'));ground.rotation.x=-Math.PI/2;ground.position.y=-.5;ground.receiveShadow=true;scene.add(ground);
 const groups:T.Group[]=[],wallGroups:T.Group[]=[],furnGroups:T.Group[]=[],labelGroups:T.Group[]=[];
 const outline=[[0,0],[4.76,0],[4.76,13.25],[0,11.84]];
 const outlineUpper=[[0,-1.2],[4.76,-1.2],[4.76,13.25],[0,11.84]];
 function wall(p:T.Group,x1:number,z1:number,x2:number,z2:number,height=3.41,thick=.16,m:T.Material=cream){const length=Math.hypot(x2-x1,z2-z1);const o=box(p,(x1+x2)/2,height/2,(z1+z2)/2,length,height,thick,m);o.rotation.y=-Math.atan2(z2-z1,x2-x1);if((x1===0&&x2===0)||(z1===0&&z2===0))o.userData.section=true;return o;}
 function door(p:T.Group,x:number,z:number,width:number,rot=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;p.add(g);if(z===0||x===0)g.userData.section=true;box(g,-width/2,1.15,0,.055,2.3,.15,wood);box(g,width/2,1.15,0,.055,2.3,.15,wood);box(g,0,2.28,0,width,.06,.15,wood);const leaf=new T.Group();leaf.position.x=-width/2;leaf.rotation.y=-.85;g.add(leaf);box(leaf,width/2,1.1,0,width-.05,2.2,.045,wood);box(leaf,width-.14,1.04,.05,.1,.035,.03,black);}
 function windowPanel(p:T.Group,x:number,z:number,w:number,rot=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;p.add(g);if(z===0||x===0)g.userData.section=true;box(g,0,1.65,0,w,1.65,.035,glass);for(const dx of [-w/2,0,w/2])box(g,dx,1.65,0,.035,1.75,.08,black);for(const y of [.8,2.5])box(g,0,y,0,w,.04,.08,black);}
 function railing(p:T.Object3D,x1:number,z1:number,x2:number,z2:number){line(p,[x1,1.02,z1],[x2,1.02,z2],.022);const len=Math.hypot(x2-x1,z2-z1);const panel=box(p,(x1+x2)/2,.53,(z1+z2)/2,len,.85,.02,glass);panel.rotation.y=-Math.atan2(z2-z1,x2-x1);const n=Math.ceil(len/.75);for(let i=0;i<=n;i++){const t=i/n;line(p,[x1+(x2-x1)*t,.08,z1+(z2-z1)*t],[x1+(x2-x1)*t,1.02,z1+(z2-z1)*t],.012)}}
 function plant(p:T.Object3D,x:number,z:number,size=.6){cyl(p,x,.22*size,z,.22*size,.44*size,mat('#d0bda4'),.16*size);for(let i=0;i<7;i++){const a=i*2.4;const dx=Math.sin(a)*.17*size,dz=Math.cos(a)*.17*size;line(p,[x,.3*size,z],[x+dx,.95*size,dz+z],.012,green);const leaf=ball(p,x+dx,.82*size,z+dz,.25*size,green,.55,1.5,.5);leaf.rotation.z=Math.sin(a)*.55;}}
 function rug(p:T.Object3D,x:number,z:number,w:number,d:number,c='#c0b5a5'){box(p,x,.025,z,w,.025,d,mat(c),.01);for(let i=0;i<6;i++)box(p,x,.04,z-d/2+.06+i*.06,w-.1,.005,.012,mat('#e2d9ca'));}
 function chair(p:T.Object3D,x:number,z:number,rot=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;p.add(g);for(const dx of [-.2,.2])for(const dz of [-.2,.2])box(g,dx,.24,dz,.045,.48,.045,wood);box(g,0,.49,0,.53,.12,.53,fabric,.05);box(g,0,.78,.23,.54,.52,.075,wood,.03);}
 function table(p:T.Object3D,x:number,z:number,w:number,d:number,h=.76){box(p,x,h,z,w,.08,d,wood,.035);for(const dx of [-w/2+.12,w/2-.12])for(const dz of [-d/2+.12,d/2-.12])box(p,x+dx,h/2,z+dz,.07,h,.07,wood);}
 function coffee(p:T.Object3D,x:number,z:number){table(p,x,z,.8,1.25,.4);box(p,x-.13,.465,z+.12,.25,.04,.32,mat('#ecede5'));cyl(p,x+.15,.51,z-.25,.085,.13,white);}
 function sofa(p:T.Object3D,x:number,z:number){box(p,x,.25,z,.95,.25,2.75,darkwood,.06);box(p,x+.38,.65,z,.18,.85,2.75,fabric,.08);for(let i=-1;i<=1;i++){box(p,x-.02,.47,z+i*.83,.76,.26,.78,fabric,.09);box(p,x+.22,.81,z+i*.83,.2,.55,.73,fabric,.07)}for(const dz of [-1.31,1.31])box(p,x,.58,z+dz,.92,.55,.17,fabric,.06);for(const dz of [-.85,.85]){const cushion=box(p,x-.12,.78,z+dz,.17,.38,.39,mat('#8a9a8a'),.06);cushion.rotation.z=.28;}}
 function bed(p:T.Object3D,z:number,color:string){rug(p,2.9,z,2.9,2.7,'#cfc5b6');box(p,3.24,.24,z,2.18,.34,1.85,wood,.06);box(p,3.18,.5,z,2.08,.3,1.76,white,.1);box(p,4.35,.76,z,.15,1.45,2.05,wood,.04);box(p,2.8,.67,z,1.4,.055,1.8,mat(color),.025);for(const dz of [-.46,.46])box(p,3.85,.72,z+dz,.46,.18,.66,white,.08);for(const dz of [-1.3,1.3]){box(p,4.2,.31,z+dz,.65,.6,.52,wood,.02);cyl(p,4.2,.65,z+dz,.12,.04,black);line(p,[4.2,.65,z+dz],[4.2,.96,z+dz],.018);cyl(p,4.2,1,z+dz,.14,.19,white,.11);}for(let i=0;i<9;i++)box(p,4.255,.86,z-.85+i*.2,.012,1.1,.012,darkwood);}
 function wardrobe(p:T.Object3D,x:number,z:number,w:number,d:number){box(p,x,1.21,z,w,2.4,d,wood,.015);const front=z-d/2-.015;for(let i=0;i<4;i++){box(p,x-w/2+(i+.5)*w/4,1.22,front,w/4-.012,2.36,.02,mat('#c4a078'));box(p,x-w/2+(i+.5)*w/4+.06,1.1,front-.025,.02,.28,.025,black)}}
 function toilet(p:T.Object3D,x:number,z:number,rot=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;p.add(g);box(g,0,.61,.2,.45,.55,.19,white,.06);ball(g,0,.33,-.07,.3,white,.72,1,1.2);const ring=new T.Mesh(new T.TorusGeometry(.19,.055,10,30),white);ring.rotation.x=Math.PI/2;ring.scale.y=1.3;ring.position.set(0,.48,-.11);g.add(ring);ball(g,0,.458,-.11,.17,mat('#52646a'),.85,.08,1.3);}
 function sink(p:T.Object3D,x:number,z:number){box(p,x,.45,z,.65,.8,.48,wood,.02);box(p,x,.88,z,.7,.08,.52,white,.045);ball(p,x,.918,z,.23,mat('#afbec0'),1,.06,.7);line(p,[x,.91,z+.15],[x,1.15,z+.15],.025);line(p,[x,1.15,z+.15],[x,1.15,z],.025);}
 function stairs(p:T.Group,up=true){const g=new T.Group();p.add(g);const riser=3.6/22;for(let i=0;i<11;i++){const y=(i+1)*riser;box(g,2.94,y/2,5.1+i*.257,.9,y,.257,stone);box(g,2.94,y+.012,5.1+i*.257,.92,.026,.259,wood)}box(g,3.51,1.74,7.93,2.04,.12,.55,stone);for(let i=0;i<11;i++){const y=1.8+(i+1)*riser;box(g,4.06,y-.08,7.65-i*.257,.9,.16,.257,stone);box(g,4.06,y+.013,7.65-i*.257,.92,.026,.259,wood)}line(g,[3.4,.85,5.1],[3.4,2.65,7.93],.025);line(g,[3.6,2.65,7.93],[3.6,4.35,5.1],.025);for(let i=0;i<11;i++){line(g,[3.4,(i+1)*riser,5.1+i*.257],[3.4,(i+1)*riser+.85,5.1+i*.257],.012);line(g,[3.6,1.8+(i+1)*riser,7.65-i*.257],[3.6,2.65+(i+1)*riser,7.65-i*.257],.012)}if(!up){g.visible=false;}return g;}
 for(let i=0;i<4;i++){const g=new T.Group(),walls=new T.Group(),furn=new T.Group(),labels=new T.Group();groups.push(g);wallGroups.push(walls);furnGroups.push(furn);labelGroups.push(labels);g.add(walls,furn,labels);scene.add(g);if(i<3)poly(g,i===0?outline:outlineUpper,0,.19,i===2?mat('#c8c9bc'):stone,i>0);else poly(g,[[1.26,2.84],[4.76,2.84],[4.76,8.34],[1.26,8.34]],0,.2,mat('#bcc7c8'));
  if(i<2){wall(walls,0,0,0,11.84);wall(walls,4.76,0,4.76,13.25);wall(walls,0,11.84,1.1,12.166);wall(walls,3.5,12.877,4.76,13.25);windowPanel(walls,2.15,12.477,2.2,-Math.atan2(1.41,4.76));wall(walls,0,0,.98,0);wall(walls,3.78,0,4.76,0);if(i===0){const entry=new T.Group();entry.userData.section=true;walls.add(entry);box(entry,2.38,1.35,0,2.8,2.7,.035,glass);for(let k=0;k<=4;k++)box(entry,.98+k*.7,1.35,0,.035,2.7,.07,black);for(const y of [.03,2.7])box(entry,2.38,y,0,2.8,.04,.07,black);for(const x of [2.25,2.5])box(entry,x,1.18,-.045,.025,.38,.03,black);box(g,2.38,-.12,-.32,2.8,.18,.64,stone);box(g,2.38,-.23,-.57,3.15,.09,.26,stone)}else{door(walls,1.11,0,.9);wall(walls,1.56,0,2.56,0);windowPanel(walls,3.16,0,1.2);railing(g,.05,-1.15,4.71,-1.15);railing(g,.05,-1.15,.05,0);railing(g,4.71,-1.15,4.71,0)}}
  if(i===0){rug(furn,2.6,2.5,2.9,3.3);sofa(furn,4.1,2.5);coffee(furn,2.85,2.5);for(const z of [1.65,3.25]){const ch=new T.Group();ch.position.set(1.65,0,z);ch.rotation.y=-Math.PI/2;furn.add(ch);box(ch,0,.45,0,.7,.28,.7,fabric,.08);box(ch,0,.75,.31,.73,.68,.14,fabric,.05);for(const x of [-.32,.32])box(ch,x,.62,0,.09,.3,.65,wood,.025);for(const x of [-.26,.26])for(const zz of [-.26,.26])box(ch,x,.17,zz,.05,.35,.05,wood)}box(furn,.27,.34,2.5,.35,.55,2.5,wood,.02);box(furn,.13,1.28,2.5,.05,.85,1.65,black,.01);plant(furn,4.15,.6,1.25);plant(furn,.5,4.2,.85);
   table(furn,1.05,6.5,.95,1.95);for(const z of [5.85,6.5,7.15]){chair(furn,.27,z,-Math.PI/2);chair(furn,1.83,z,Math.PI/2);cyl(furn,1.05,.813,z,.14,.015,white)}cyl(furn,1.05,.93,6.5,.1,.23,mat('#7c8d7a'));stairs(g);
   wall(walls,3.16,8.34,4.76,8.34);wall(walls,3.16,8.34,3.16,9.9);wall(walls,3.16,10.8,3.16,12.777);door(walls,3.16,10.35,.9,Math.PI/2);wall(walls,3.16,9.95,4.76,9.95);
   box(furn,.46,.45,10.1,.67,.87,2.65,wood,.02);box(furn,.46,.92,10.1,.73,.065,2.7,white);for(let k=0;k<4;k++){box(furn,.808,.44,9.1+k*.64,.02,.78,.61,mat('#c8a47e'));box(furn,.835,.72,9.1+k*.64,.02,.025,.21,black)}box(furn,.46,.965,10.25,.58,.025,.7,black,.01);for(const z of [10.06,10.44])for(const x of [.31,.6])cyl(furn,x,.989,z,.105,.014,mat('#657075'));
   box(furn,.46,.925,9.12,.7,1.81,.8,mat('#788485'),.03);box(furn,.83,1.0,9.12,.04,.045,.51,black);
   const counter=new T.Group();counter.position.set(1.54,0,12.0);counter.rotation.y=-Math.atan2(1.41,4.76);furn.add(counter);box(counter,0,.45,0,1.85,.9,.6,wood);box(counter,0,.93,0,1.9,.06,.67,white);for(const x of [-.26,.26])box(counter,x,.968,0,.45,.02,.42,mat('#899e9e'),.05);line(counter,[0,.97,.22],[0,1.23,.22],.025);line(counter,[0,1.23,.22],[0,1.23,0],.025);
   box(furn,4.23,.46,9.45,.7,.88,.65,white,.025);const wash=new T.Mesh(new T.TorusGeometry(.23,.04,10,30),black);wash.position.set(4.23,.46,9.11);furn.add(wash);sink(furn,3.6,8.72);toilet(furn,4.15,12.15);sink(furn,4.19,10.48);box(furn,4.68,1.52,10.48,.035,.8,.58,mat('#a5c0bf',.08,.6));
  }
  if(i===1){for(const z of [4.84,8.34]){wall(walls,0,z,1.4,z);wall(walls,2.3,z,4.76,z);door(walls,1.85,z,.9)}wall(walls,0,5.84,.35,5.84);wall(walls,1.15,5.84,1.5,5.84);door(walls,.75,5.84,.8);wall(walls,1.5,5.84,1.5,8.34);bed(furn,2.25,'#8eaaa1');bed(furn,10.47,'#be936d');wardrobe(furn,3.4,4.37,2.25,.62);wardrobe(furn,3.4,8.85,2.25,.62);for(const z of [2.2,10.5]){box(furn,.32,.4,z,.38,.65,2.15,wood,.02);box(furn,.14,1.38,z,.045,.78,1.36,black,.01)}toilet(furn,.78,7.88);sink(furn,.57,6.32);box(furn,.77,.014,7.1,1.25,.02,2.25,mat('#beced0'));stairs(g);plant(furn,4.16,-.62,1.0);plant(furn,.44,-.58,.75);
  }
  if(i===2){wall(walls,1.26,2.84,2.66,2.84,3.11);wall(walls,3.86,2.84,4.76,2.84,3.11);door(walls,3.26,2.84,1.2);wall(walls,1.26,2.84,1.26,8.34);wall(walls,4.76,2.84,4.76,8.34);wall(walls,1.26,8.34,1.5,8.34);wall(walls,2.4,8.34,4.76,8.34);door(walls,1.95,8.34,.9);wall(walls,1.26,4.84,2.45,4.84);railing(g,.03,-1.17,4.73,-1.17);railing(g,.03,-1.17,.03,11.82);railing(g,.03,11.82,4.73,13.21);railing(g,4.73,13.21,4.73,8.34);railing(g,4.73,-1.17,4.73,2.84);stairs(g,false);
   box(furn,4.18,.53,3.85,.75,1.04,1.46,darkwood,.025);box(furn,4.18,1.09,3.85,.85,.1,1.6,darkwood);box(furn,4.56,1.55,3.85,.035,2.35,1.8,wood);for(let j=0;j<13;j++)box(furn,4.529,1.55,3.02+j*.138,.026,2.25,.036,darkwood);cyl(furn,4.15,1.25,3.85,.12,.2,mat('#b29052',.3,.6));for(const z of [3.3,4.4]){cyl(furn,4.15,1.3,z,.07,.34,mat('#b29052',.3,.6));ball(furn,4.15,1.51,z,.08,mat('#e9d2a0'))}rug(furn,3.05,3.85,1.25,1.3,'#bda385');plant(furn,.43,.1,1.6);plant(furn,4.24,.15,1.3);plant(furn,.4,10.9,1.5);plant(furn,4.2,12.5,1.6);table(furn,3.05,1.02,1.05,.75);chair(furn,2.16,1.02,-Math.PI/2);chair(furn,3.94,1.02,Math.PI/2);box(furn,1.4,.38,10.7,1.8,.2,.7,wood,.04);for(const x of [.7,2.1])box(furn,x,.17,10.7,.1,.34,.55,black);plant(furn,3.75,10.75,1.1);
   for(let x=.4;x<4.7;x+=.6){line(g,[x,.008,-1.1],[x,.008,2.72],.005,mat('#a5aaa2'));line(g,[x,.008,8.45],[x,.008,11.8+x*1.41/4.76],.005,mat('#a5aaa2'))}for(let z=-.6;z<12.7;z+=.6){const w=z>11.84?(13.25-z)*4.76/1.41:4.6;const start=z>11.84?4.76-w:.1;if(z<2.75||z>8.4)line(g,[start,.009,z],[4.65,.009,z],.005,mat('#a5aaa2'))}
  }
  if(i===3){for(const [a,b] of [[[1.26,2.84],[4.76,2.84]],[[4.76,2.84],[4.76,8.34]],[[4.76,8.34],[1.26,8.34]],[[1.26,8.34],[1.26,2.84]]] as number[][][])wall(walls,a[0],a[1],b[0],b[1],.25,.12,mat('#aebcbd'));for(let x=1.6;x<4.7;x+=.4)line(g,[x,.011,2.98],[x,.011,8.2],.006,mat('#8fa1a2'));for(let z=3.2;z<8.2;z+=.4)line(g,[1.4,.012,z],[4.6,.012,z],.006,mat('#8fa1a2'));}

 }

 // Assembled model: floors never move apart or reset to ground level.
 const levels=[0,3.6,7.2,10.5];
 groups.forEach((g,i)=>{g.position.y=levels[i];labelGroups[i].visible=false;
  if(i<2){
   // Continuous lintels and floor edges give the house a legible frame.
   box(g,2.38,3.33,-.025,4.92,.16,.23,cream);
   box(g,4.73,1.7,.04,.20,3.4,.24,cream);
   box(g,.025,1.7,.04,.20,3.4,.24,cream);
   box(g,2.38,-.085,i===0?0:-.65,4.91,.22,i===0?.24:1.45,cream);
   const infill=new T.Group();infill.userData.section=true;wallGroups[i].add(infill);
   box(infill,2.38,3.04,0,2.8,.62,.16,cream);
   if(i===1){box(infill,3.16,.38,0,1.2,.76,.16,cream);box(infill,1.11,2.8,0,.9,1,.16,cream)}
   for(let k=0;k<9;k++)box(infill,.2+k*.073,1.48,-.092,.04,2.86,.06,wood);
   box(g,2.38,3.23,-.095,4.2,.024,.025,mat('#f9d6a0'));
   // Furniture and soft illumination remain below each slab.
   for(const z of [2.4,6.45,10.5]){const lamp=new T.PointLight(0xffe7c3,3.5,6,2);lamp.position.set(2.5,2.7,z);g.add(lamp)}
  }
  const copies=new Map<T.Material,T.Material>();
  function cutObject(o:T.Object3D,inherited=false){const section=inherited||o.userData.section===true;const mesh=o as T.Mesh;
   if(section&&mesh.material){const clone=(m:T.Material)=>{let c=copies.get(m);if(!c){c=m.clone();c.clippingPlanes=[sideCuts[i]];c.clipShadows=true;copies.set(m,c)}return c};mesh.material=Array.isArray(mesh.material)?mesh.material.map(clone):clone(mesh.material)}
   o.children.forEach(ch=>cutObject(ch,section));
  }cutObject(g);
 });
 // Forecourt proposal: the reference sheets do not provide a site boundary.
 const yard=new T.Group();scene.add(yard);
 const paving=mat('#d6d3c8'),fence=mat('#545e52'),soil=mat('#5f6450'),lawn=mat('#81916b');
 box(yard,2.38,-.18,-2.65,4.76,.16,4.1,paving);
 for(let z=-4.5;z<-.8;z+=.55)line(yard,[.75,-.094,z],[4.01,-.094,z],.007,mat('#b6b9ad'));
 for(let x=.75;x<=4.01;x+=.81)line(yard,[x,-.093,-4.5],[x,-.093,-.8],.005,mat('#b6b9ad'));
 for(const x of [.34,4.42]){
  box(yard,x,.04,-2.6,.57,.25,2.9,cream,.025);box(yard,x,.18,-2.6,.46,.04,2.78,soil);box(yard,x,.205,-2.6,.43,.018,2.75,lawn);
  for(let i=0;i<7;i++)ball(yard,x,.34,-3.72+i*.36,.18,green,1,.65,1.2);
  box(yard,x,.36,-1.08,.57,.58,.62,cream,.025);plant(yard,x,-1.08,1.3);
 }
 for(const x of [.03,4.73]){
  box(yard,x,.45,-2.55,.14,1.15,3.9,cream);box(yard,x,1.035,-2.55,.19,.06,3.93,paving);
  for(const z of [-4.57,-.75]){box(yard,x,.91,z,.24,2.12,.24,cream);box(yard,x,1.99,z,.31,.075,.31,paving)}
 }
 // Gate opening aligns with the 2.80m entrance, with a restrained vertical rhythm.
 for(const x of [.88,3.88]){box(yard,x,.94,-4.57,.24,2.18,.3,cream);box(yard,x,2.04,-4.57,.3,.075,.36,paving);box(yard,x,1.55,-4.738,.09,.21,.035,black);box(yard,x,1.53,-4.76,.05,.14,.018,mat('#f7d9a1'))}
 for(const x of [.43,4.33]){box(yard,x,.66,-4.57,.64,1.62,.12,cream);box(yard,x,1.49,-4.57,.7,.055,.16,paving)}
 box(yard,4.3,1.07,-4.65,.38,.24,.055,fence,.025);box(yard,4.3,1.09,-4.689,.24,.017,.01,black);
 const gateLeaves:T.Group[]=[];
 for(let side=0;side<2;side++){const g=new T.Group();g.position.set(side===0?1:3.76,0,-4.57);yard.add(g);gateLeaves.push(g);const sign=side===0?1:-1;
  for(const y of [.1,1.82])box(g,sign*.685,y,0,1.37,.06,.065,fence);
  for(let j=0;j<=13;j++)box(g,sign*(.025+j*.101),.96,0,.04,1.72,.05,fence);
  box(g,sign*1.24,.96,-.065,.026,.33,.04,wood);
 }
 // A shallow drain at the gate and a generous step at the entrance.
 box(yard,2.38,-.083,-4.33,2.76,.02,.1,black);for(let i=0;i<32;i++)box(yard,1.03+i*.087,-.069,-4.33,.016,.01,.095,paving);
 box(yard,2.38,-.11,-.72,3.1,.12,.38,paving,.02);
 // Quiet balcony planters and aligned facade reveals.
 for(const i of [1,2]){const g=groups[i];box(g,3.65,.16,-.88,1.05,.32,.4,cream,.025);box(g,3.65,.335,-.88,.94,.025,.31,soil);for(let j=0;j<6;j++)ball(g,3.23+j*.165,.43,-.88,.14,green,1,.8,1);}
 for(const g of groups.slice(0,2)){for(const z of [1.6,4.7,8.25,11.4])box(g,4.846,1.74,z,.012,3.18,.035,mat('#d7d3c8'));}
 let mode='tour',progress=0,section=true;
 let tween:{pos:T.Vector3;target:T.Vector3}|null=null;
 const desiredEye=new T.Vector3(),desiredLook=new T.Vector3();
 function refreshTour(){const w=host.clientWidth,h=host.clientHeight;const intro=1-T.MathUtils.smoothstep(progress,.09,.20),outro=T.MathUtils.smoothstep(progress,.91,1);if(w&&h){const offset=w>760?-.105*w*Math.max(intro,outro):0;camera.setViewOffset(w,h,offset,0,w,h)}const s=sampleTour(progress);desiredEye.set(...s.eye);desiredLook.set(...s.look);upperCut.constant=s.ceiling;
  // Widen only the overview framing on small screens; keep room views human scale.
  if(progress<.14||progress>.96){const f=camera.aspect<.85?1.35:1;desiredEye.sub(desiredLook).multiplyScalar(f).add(desiredLook)}
  tween={pos:desiredEye.clone(),target:desiredLook.clone()};
 }
 function setSection(on:boolean){section=on;sideCuts.forEach((p,i)=>p.constant=on?levels[i]+.24:40)}
 function setMode(m:string){mode=m==='free'?'free':'tour';controls.enabled=mode==='free';controls.autoRotate=false;if(mode==='tour')refreshTour();else{camera.clearViewOffset();upperCut.constant=20;view('iso')}}
 function seek(p:number){progress=T.MathUtils.clamp(Number.isFinite(p)?p:0,0,1);if(mode==='tour')refreshTour()}
 function view(v:string){const center=new T.Vector3(2.1,4.1,3.8),k=camera.aspect<.85?1.4:1;const pos=v==='top'?new T.Vector3(2.38,31*k,5.19):new T.Vector3(2.1-15*k,4.4+10*k,3.8-25*k);tween={pos,target:center};}
 function down(){if(mode==='free')tween=null}
 renderer.domElement.addEventListener('pointerdown',down);
 const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);if(mode==='tour')refreshTour()});resize.observe(host);
 camera.position.set(-13,12,-17);controls.target.set(2.1,4.4,5.2);camera.lookAt(controls.target);setSection(true);seek(0);let frame=0,disposed=false,lastTime=0;
 function animate(time=0){if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(.05,(time-lastTime)/1000);lastTime=time;
  if(tween){const ease=1-Math.exp(-dt*7);camera.position.lerp(tween.pos,ease);controls.target.lerp(tween.target,ease);if(camera.position.distanceTo(tween.pos)<.004&&controls.target.distanceTo(tween.target)<.004)tween=null}
  const gateAngle=mode==='tour'?T.MathUtils.smoothstep(progress,.10,.17)*1.4:.35;gateLeaves[0].rotation.y=T.MathUtils.damp(gateLeaves[0].rotation.y,-gateAngle,7,dt);gateLeaves[1].rotation.y=T.MathUtils.damp(gateLeaves[1].rotation.y,gateAngle,7,dt);
  if(mode==='free')controls.update();else camera.lookAt(controls.target);renderer.render(scene,camera);
 }animate();
 return {seek,setMode,setSection,view,zoom(f){tween=null;camera.position.sub(controls.target).multiplyScalar(f).add(controls.target);controls.update()},dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',down);const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();scene.traverse(o=>{const m=o as T.Mesh;if(m.geometry)geometries.add(m.geometry);if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>materials.add(x))});materials.forEach(m=>{const map=(m as T.MeshStandardMaterial).map;if(map)textures.add(map);m.dispose()});textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());environment.dispose();renderer.dispose();renderer.domElement.remove()}};
}
