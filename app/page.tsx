'use client';
import { useEffect, useRef, useState } from 'react';
import { Box, ArrowDown, ArrowUpRight, Play, Pause, RotateCcw, Move3D, FileImage, X, SlidersHorizontal, Minus, Plus, House, Maximize2 } from 'lucide-react';
import { Tabs,TabsList,TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog,DialogContent,DialogTitle } from '@/components/ui/dialog';
import { createViewer,type Viewer } from './viewer';
import { sampleTour } from './journey';
import { registerViewerTool } from './webmcp';
const plans=['tret','lau1','lau2','mai'],names=['Tầng trệt','Lầu 1','Lầu 2','Mái BTCT'];
export default function Home(){
 const mount=useRef<HTMLDivElement>(null),api=useRef<Viewer|null>(null),modeRef=useRef('tour'),progressRef=useRef(0),playingRef=useRef(false);
 const [mode,setMode]=useState('tour'),[progress,setProgress]=useState(0),[playing,setPlaying]=useState(false),[cut,setCut]=useState(true),[plan,setPlan]=useState(false),[planFloor,setPlanFloor]=useState(0),[settings,setSettings]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState('');
 const frame=sampleTour(progress).frame;
 function seek(p:number){const next=Math.max(0,Math.min(1,p));progressRef.current=next;setProgress(next);api.current?.seek(next);}
 function changeMode(m:string){modeRef.current=m;setMode(m);playingRef.current=false;setPlaying(false);api.current?.setMode(m);}
 function play(){if(progressRef.current>=.998)seek(0);changeMode('tour');playingRef.current=!playing;setPlaying(!playing);}
 useEffect(()=>{if(!mount.current)return;let v:Viewer|undefined;try{v=createViewer(mount.current,()=>{});api.current=v;setReady(true)}catch(e){console.error(e);setError('Trình duyệt chưa mở được 3D. Hãy bật tăng tốc đồ họa rồi tải lại trang.')}return()=>v?.dispose()},[]);
 useEffect(()=>{api.current?.setSection(cut)},[cut,ready]);
 useEffect(()=>{const host=mount.current;if(!host)return;let last=0,id=0,startY=0,startP=0,dragging=false;
 const wheel=(e:WheelEvent)=>{if(modeRef.current!=='tour'||plan||settings)return;e.preventDefault();playingRef.current=false;setPlaying(false);seek(progressRef.current+Math.max(-160,Math.min(160,e.deltaY*(e.deltaMode===1?16:1)))*.00013)};
 const down=(e:PointerEvent)=>{if(modeRef.current==='tour'){startY=e.clientY;startP=progressRef.current;dragging=true;host.setPointerCapture(e.pointerId)}};
 const move=(e:PointerEvent)=>{if(!dragging||modeRef.current!=='tour')return;playingRef.current=false;setPlaying(false);seek(startP+(startY-e.clientY)*.001)};
 const up=()=>{dragging=false};
 const key=(e:KeyboardEvent)=>{if(modeRef.current!=='tour')return;if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(e.key)){e.preventDefault();playingRef.current=false;setPlaying(false);seek(e.key==='Home'?0:e.key==='End'?1:progressRef.current+(e.key==='ArrowDown'?.018:e.key==='ArrowUp'?-.018:e.key==='PageDown'?.1:-.1))}};
 const tick=(t:number)=>{const dt=Math.min(.08,(t-last)/1000);last=t;if(playingRef.current&&modeRef.current==='tour'&&!document.hidden&&!plan&&!settings){seek(progressRef.current+dt*.009);if(progressRef.current>=1){playingRef.current=false;setPlaying(false)}}id=requestAnimationFrame(tick)};id=requestAnimationFrame(tick);
 host.addEventListener('wheel',wheel,{passive:false});host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);host.addEventListener('keydown',key);
 return()=>{cancelAnimationFrame(id);host.removeEventListener('wheel',wheel);host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);host.removeEventListener('keydown',key)};
 },[plan,settings]);
 useEffect(()=>registerViewerTool((p,m)=>{changeMode(m);seek(p)}),[]);
 return <main className="experience">
 <div ref={mount} className="world" tabIndex={0} aria-label="Mô hình nhà 3D. Cuộn hoặc dùng phím mũi tên để tham quan. Chế độ Tự do cho phép kéo xoay và thu phóng."/>
 <header className="masthead"><a className="wordmark" href="#" onClick={e=>{e.preventDefault();changeMode('tour');seek(0)}}><span className="logo-box"><House size={21}/></span><strong>NHÀ PHỐ<span> / KHÔNG GIAN SỐ</span></strong></a><div className="top-actions"><button className="text-button" onClick={()=>{setPlanFloor(frame.floor);setPlan(true)}}><FileImage size={16}/><span>Bản vẽ gốc</span></button><button className="icon-button" aria-label="Tùy chọn hiển thị" onClick={()=>setSettings(true)}><SlidersHorizontal size={19}/></button></div></header>
 <div className="mode-control"><Tabs value={mode} onValueChange={v=>changeMode(String(v))}><TabsList><TabsTrigger value="tour"><Play size={13}/>Tham quan</TabsTrigger><TabsTrigger value="free"><Move3D size={16}/>Tự do</TabsTrigger></TabsList></Tabs></div>
 <section className={'story '+(progress>.13&&progress<.96&&mode==='tour'?'inside':'')} aria-live="polite"><div className="eyebrow"><span/> {mode==='tour'?'HÀNH TRÌNH KHÔNG GIAN':'KHÁM PHÁ TỰ DO'} <span className="chapter-count">0{frame.chapter+1} / 04</span></div><h1>{mode==='tour'?frame.title:'Ngôi nhà trong một góc nhìn.'}</h1><p>{mode==='tour'?frame.description:'Kéo để xoay, cuộn để phóng to. Bật mặt cắt để nhìn xuyên vào các không gian bên trong.'}</p>{progress<.12&&mode==='tour'&&<button className="start-tour" onClick={play}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Tạm dừng':'Tự động tham quan'}<ArrowUpRight size={17}/></button>}</section>
 <div className="house-caption"><span>01 — NHÀ PHỐ</span><b>4,76 <small>m</small></b><p>Ngang nhà · 2 phòng ngủ<br/>Trệt + 2 lầu + mái</p></div>
 <div className="section-control"><label><Switch checked={cut} onCheckedChange={setCut} aria-label="Mở mặt cắt ngôi nhà"/><span>Mở mặt cắt</span></label><small>{cut?'Nhìn rõ bên trong':'Xem mặt ngoài'}</small></div>
 {mode==='free'&&<div className="orbit-tools"><button aria-label="Toàn cảnh ngôi nhà" onClick={()=>api.current?.view('iso')}><House size={19}/></button><button aria-label="Nhìn từ trên" onClick={()=>api.current?.view('top')}><Maximize2 size={19}/></button><button aria-label="Phóng to" onClick={()=>api.current?.zoom(.8)}><Plus size={19}/></button><button aria-label="Thu nhỏ" onClick={()=>api.current?.zoom(1.25)}><Minus size={19}/></button></div>}
 <footer className="tour-dock"><div className="dock-top"><button className="play-button" aria-label={playing?'Tạm dừng tham quan':'Phát hành trình'} onClick={play}>{playing?<Pause size={17}/>:<Play size={17}/>}</button><div className="journey-line"><div className="journey-meta"><span>{mode==='tour'?'CUỘN ĐỂ KHÁM PHÁ':'QUAY LẠI THAM QUAN BẤT CỨ LÚC NÀO'}</span><b>{Math.round(progress*100)}%</b></div><Slider value={[progress*100]} min={0} max={100} step={.1} aria-label="Tiến trình tham quan" onValueChange={v=>{changeMode('tour');seek((Array.isArray(v)?v[0]:v)/100)}}/></div><button className="reset-button" aria-label="Trở về đầu hành trình" onClick={()=>{changeMode('tour');seek(0)}}><RotateCcw size={18}/></button></div><div className="journey-stages">{['Toàn cảnh','Không gian chung','Không gian riêng','Sân thượng'].map((n,i)=><span className={frame.chapter===i?'current':''} key={n}><i/>{n}</span>)}</div></footer>
 <div className="scroll-hint"><ArrowDown size={14}/><span>{mode==='tour'?'Cuộn hoặc vuốt lên để đi tiếp':'Kéo xoay · Cuộn thu phóng'}</span></div><div className="design-note">Phối cảnh đề xuất theo bản vẽ · Nội thất & mặt đứng minh họa</div>
 {!ready&&<div className="loading-state">{error||'Đang mở ngôi nhà…'}{error&&<button onClick={()=>location.reload()}>Thử lại</button>}</div>}
 <Dialog open={settings} onOpenChange={setSettings}><DialogContent className="settings-dialog"><DialogTitle>Góc nhìn của bạn</DialogTitle><p>Ngôi nhà giữ nguyên các tầng ở đúng cao độ. Mặt cắt chỉ mở các vách gần góc nhìn.</p><label><span>Mở mặt cắt</span><Switch checked={cut} onCheckedChange={setCut}/></label><p className="settings-note">Cuộn / vuốt lên để đi vào nhà. Cuộn ngược để trở lại. Trong chế độ Tự do, kéo để xoay và dùng hai ngón tay để thu phóng.</p></DialogContent></Dialog>
 <Dialog open={plan} onOpenChange={setPlan}><DialogContent className="plan-dialog" showCloseButton={false}><header><div><small>ĐỐI CHIẾU BỐ TRÍ</small><DialogTitle>{names[planFloor]} · Bản vẽ gốc</DialogTitle></div><button aria-label="Đóng bản vẽ" onClick={()=>setPlan(false)}><X/></button></header><div className="plan-image"><img src={'/plans/'+plans[planFloor]+'.jpg'} alt={'Bản vẽ '+names[planFloor]}/></div><footer>{names.map((n,i)=><button className={i===planFloor?'chosen':''} onClick={()=>setPlanFloor(i)} key={n}>{n}</button>)}</footer></DialogContent></Dialog>
 </main>;
}
