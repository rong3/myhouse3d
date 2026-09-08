'use client';
import { useEffect, useRef, useState } from 'react';
import { Box, Layers3, RotateCcw, ZoomIn, ZoomOut, MoveUpRight, Scan, FileImage, X, ArrowUpRight, Mouse, Armchair, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { registerViewerTool } from './webmcp';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createViewer, rooms, type Viewer } from './viewer';
const floors = [
 {name:'Tầng trệt',level:'±0.000',area:'60 m²',caption:'Sinh hoạt & sum họp',plan:'tret'},
 {name:'Lầu 1',level:'+3.600',area:'66 m²',caption:'Không gian nghỉ ngơi',plan:'lau1'},
 {name:'Lầu 2',level:'+7.200',area:'20 m²',caption:'Phòng thờ & sân thượng',plan:'lau2'},
 {name:'Mái BTCT',level:'+10.500',area:'20 m²',caption:'Mái che khối cầu thang',plan:'mai'}
];
export default function Home(){
 const mount=useRef<HTMLDivElement>(null), api=useRef<Viewer|null>(null);
 const [floor,setFloor]=useState(0),[mode,setMode]=useState('single'),[cut,setCut]=useState(true),[furniture,setFurniture]=useState(true),[labels,setLabels]=useState(true),[spin,setSpin]=useState(false),[plan,setPlan]=useState(false),[room,setRoom]=useState<string|null>(null),[error,setError]=useState(''),[ready,setReady]=useState(false);
 useEffect(()=>{if(!mount.current)return;let v:Viewer;try{v=createViewer(mount.current,(id)=>setRoom(id));api.current=v;setReady(true);}catch(e){setError('Không thể mở không gian 3D. Hãy bật tăng tốc đồ họa trong trình duyệt rồi tải lại trang.');console.error(e);}return()=>v?.dispose();},[]);
 useEffect(()=>{api.current?.update({floor,mode,cut,furniture,labels,spin});},[floor,mode,cut,furniture,labels,spin,ready]);
 useEffect(()=>{if(!plan)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setPlan(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[plan]);
 useEffect(()=>registerViewerTool((f,m)=>{setFloor(f);setMode(m);setRoom(null)}),[]);
 function selectFloor(n:number){setFloor(n);setRoom(null);}
 const selected=rooms.find(r=>r.id===room);
 return <main className="studio">
 <header className="topbar"><div className="brand"><span className="brand-icon"><Box size={23}/></span><div><b>NHÀ PHỐ <span>/ 3D</span></b><small>KHÔNG GIAN CỦA BẠN</small></div></div><div className="project-meta"><span className="live-dot"/> Mô hình theo bản vẽ <i/> Ngang 4,76 m</div><button className="outline-button" onClick={()=>setPlan(true)}><FileImage size={17}/><span>Bản vẽ gốc</span><ArrowUpRight size={16}/></button></header>
 <aside className="sidebar"><div className="section-kicker">KHÁM PHÁ NGÔI NHÀ</div><h1>Từng tầng.<br/>Từng không gian.</h1><p className="intro">Chọn tầng để khám phá bố trí và nội thất.</p>
 <nav className="floor-list" aria-label="Chọn tầng">{floors.map((f,i)=><button key={f.name} className={'floor-card '+(floor===i?'active':'')} onClick={()=>selectFloor(i)} aria-pressed={floor===i}><span className="floor-number">0{i}</span><span className="floor-copy"><strong>{f.name}</strong><small>{f.caption}</small></span><ChevronRight size={16}/></button>)}</nav>
 <div className="floor-stats"><div><small>Diện tích bản vẽ</small><b>{floors[floor].area}</b></div><div><small>Cao độ sàn</small><b>{floors[floor].level} <em>m</em></b></div></div>
 <div className="section-kicker room-heading">CÁC KHÔNG GIAN <span>{rooms.filter(r=>r.floor===floor).length}</span></div>
 <div className="room-list">{rooms.filter(r=>r.floor===floor).map(r=><button className={r.id===room?'selected':''} key={r.id} onClick={()=>{setRoom(r.id);api.current?.focusRoom(r.id);}}><span style={{background:r.color}}/>{r.name}<MoveUpRight size={14}/></button>)}</div>
 <div className="sidebar-note"><span>GHI CHÚ THIẾT KẾ</span><p>Bố trí theo 4 bản vẽ bạn cung cấp. Nội thất, vật liệu và chiều cao cửa là phương án minh họa; không thay thế hồ sơ thi công.</p></div>
 </aside>
 <section className="canvas-area" aria-label="Không gian nhà 3D"><div className="viewport" ref={mount} tabIndex={0} aria-label="Kéo để xoay, cuộn để thu phóng mô hình. Dùng các nút góc nhìn để điều khiển bằng bàn phím."/>
 <div className="view-top"><div><span className="section-kicker">{mode==='single'?'PHỐI CẢNH TỪNG TẦNG':mode==='explode'?'PHỐI CẢNH TÁCH TẦNG':'PHỐI CẢNH TOÀN NHÀ'}</span><h2>{mode==='single'?floors[floor].name:'Ngôi nhà của bạn'}</h2></div><Tabs value={mode} onValueChange={v=>{setMode(String(v));setRoom(null);}}><TabsList className="view-tabs"><TabsTrigger value="single"><Box size={15}/>Từng tầng</TabsTrigger><TabsTrigger value="explode"><Layers3 size={15}/>Tách tầng</TabsTrigger><TabsTrigger value="all">Toàn nhà</TabsTrigger></TabsList></Tabs></div>
 {!ready&&!error&&<div className="loading">Đang dựng không gian 3D…</div>}{error&&<div className="loading error">{error}<button onClick={()=>location.reload()}>Tải lại</button></div>}
 <div className="compass"><span>BẢN VẼ</span><b>↑</b><small>PHÍA SAU</small></div>
 <div className="view-tools"><button title="Góc phối cảnh" aria-label="Góc phối cảnh" onClick={()=>api.current?.view('iso')}><Box size={20}/></button><button title="Nhìn từ trên" aria-label="Nhìn từ trên" onClick={()=>api.current?.view('top')}><Scan size={20}/></button><button title="Mặt trước" aria-label="Mặt trước" onClick={()=>api.current?.view('front')}><Armchair size={20}/></button><div/><button title="Phóng to" aria-label="Phóng to" onClick={()=>api.current?.zoom(.8)}><ZoomIn size={20}/></button><button title="Thu nhỏ" aria-label="Thu nhỏ" onClick={()=>api.current?.zoom(1.25)}><ZoomOut size={20}/></button><button title="Đặt lại góc nhìn" aria-label="Đặt lại góc nhìn" onClick={()=>{setRoom(null);api.current?.view('iso');}}><RotateCcw size={19}/></button></div>
 {selected&&<div className="room-detail"><div><span style={{background:selected.color}}/>{selected.name}<button aria-label="Đóng thông tin phòng" onClick={()=>{setRoom(null);api.current?.clearSelection();}}><X size={16}/></button></div><p>{selected.description}</p></div>}
 <div className="bottom-panel"><div className="display-options"><label><Switch checked={cut} onCheckedChange={setCut} aria-label="Cắt thấp tường"/>Cắt thấp tường</label><label><Switch checked={furniture} onCheckedChange={setFurniture} aria-label="Hiện nội thất"/>Nội thất</label><label><Switch checked={labels} onCheckedChange={setLabels} aria-label="Hiện tên phòng"/>Tên phòng</label><label><Switch checked={spin} onCheckedChange={setSpin} aria-label="Tự xoay"/>Tự xoay</label></div><div className="gesture-help"><Mouse size={15}/><span>Kéo để xoay</span><i/><span>Cuộn để phóng to</span><i/><span>Chuột phải để di chuyển</span></div></div>
 <div className="scale-note">4,76 m <span>────────</span><small>Ngang nhà theo bản vẽ</small></div>
 </section>
 <Dialog open={plan} onOpenChange={setPlan}><DialogContent className="plan-dialog" showCloseButton={false}><header><div><small>ĐỐI CHIẾU BỐ TRÍ</small><DialogTitle>{floors[floor].name} · Bản vẽ gốc</DialogTitle></div><button autoFocus aria-label="Đóng bản vẽ" onClick={()=>setPlan(false)}><X/></button></header><div className="plan-image"><img src={'/plans/'+floors[floor].plan+'.jpg'} alt={'Bản vẽ '+floors[floor].name}/></div><footer>{floors.map((f,i)=><button className={floor===i?'chosen':''} onClick={()=>selectFloor(i)} key={f.name}>{f.name}</button>)}</footer></DialogContent></Dialog>
 </main>;
}

