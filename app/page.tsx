/* Native images keep the same static plan URLs on GitHub Pages and Sites. */
/* The keyboard-operated 3D canvas is intentionally focusable. */
/* eslint-disable next/no-img-element, jsx-a11y/no-noninteractive-tabindex */
'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Move3D,
  FileImage,
  X,
  Minus,
  Plus,
  House,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Layers3,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { Viewer } from './viewer';
import { sampleTour } from './journey';
import { registerViewerTool } from './webmcp';
const plans = ['tret', 'lau1', 'lau2', 'mai'];
const names = ['Tầng trệt', 'Lầu 1', 'Lầu 2', 'Mái'];
export default function Home() {
  const mount = useRef<HTMLDivElement>(null),
    api = useRef<Viewer | null>(null);
  const modeRef = useRef('free'),
    progressRef = useRef(0),
    playingRef = useRef(false);
  const [mode, setMode] = useState('free'),
    [progress, setProgress] = useState(0),
    [playing, setPlaying] = useState(false);
  const [cut, setCut] = useState(true),
    [plan, setPlan] = useState(false),
    [planFloor, setPlanFloor] = useState(0);
  const [settings, setSettings] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState('');
  const [immersive, setImmersive] = useState(false),
    [hidden, setHidden] = useState(false),
    [screenNote, setScreenNote] = useState('');
  const frame = sampleTour(progress).frame;
  function seek(p: number) {
    const next = Math.max(0, Math.min(1, p));
    progressRef.current = next;
    setProgress(next);
    api.current?.seek(next);
  }
  function changeMode(m: string) {
    modeRef.current = m;
    setMode(m);
    playingRef.current = false;
    setPlaying(false);
    api.current?.setMode(m);
  }
  function togglePlay() {
    if (playingRef.current) {
      playingRef.current = false;
      setPlaying(false);
      return;
    }
    if (progressRef.current >= 0.998) seek(0);
    if (modeRef.current !== 'tour') changeMode('tour');
    playingRef.current = true;
    setPlaying(true);
  }
  function reset() {
    playingRef.current = false;
    setPlaying(false);
    if (modeRef.current === 'tour') seek(0);
    else api.current?.view('iso');
  }
  useEffect(() => {
    let cancelled = false,
      v: Viewer | undefined;
    const host = mount.current;
    if (!host) return;
    const lost = (e: Event) => {
      e.preventDefault();
      setReady(false);
      setError('Kết nối đồ họa bị gián đoạn. Vui lòng tải lại để tiếp tục.');
    };
    void import('./viewer')
      .then(({ createViewer }) => {
        if (cancelled) return;
        try {
          v = createViewer(host, () => {});
          api.current = v;
          v.setMode('free');
          v.setSection(true);
          host
            .querySelector('canvas')
            ?.addEventListener('webglcontextlost', lost);
          setReady(true);
        } catch (e) {
          console.error(e);
          setError(
            'Không thể mở mô hình 3D trên thiết bị này. Hãy thử tải lại hoặc dùng trình duyệt hỗ trợ WebGL.',
          );
        }
      })
      .catch(() => {
        if (!cancelled)
          setError(
            'Không tải được mô hình. Hãy kiểm tra kết nối mạng rồi tải lại.',
          );
      });
    return () => {
      cancelled = true;
      host
        .querySelector('canvas')
        ?.removeEventListener('webglcontextlost', lost);
      v?.dispose();
      api.current = null;
    };
  }, []);
  useEffect(() => {
    api.current?.setSection(cut);
  }, [cut, ready]);
  useEffect(() => {
    const sync = () => {
      if (!document.fullscreenElement) setImmersive(false);
    };
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  async function toggleFullscreen() {
    try {
      if (immersive) {
        if (document.fullscreenElement) await document.exitFullscreen();
        setImmersive(false);
        return;
      }
      setImmersive(true);
      if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else setScreenNote('Đã mở chế độ tập trung.');
    } catch {
      setScreenNote('Đã mở chế độ tập trung.');
    }
  }
  useEffect(() => {
    if (!screenNote) return;
    const timer = setTimeout(() => setScreenNote(''), 3500);
    return () => clearTimeout(timer);
  }, [screenNote]);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let last = 0,
      id = 0,
      startY = 0,
      startP = 0,
      dragging = false;
    const stop = () => {
      playingRef.current = false;
      setPlaying(false);
    };
    const wheel = (e: WheelEvent) => {
      if (modeRef.current !== 'tour' || plan || settings) return;
      e.preventDefault();
      stop();
      seek(
        progressRef.current +
          Math.max(
            -160,
            Math.min(160, e.deltaY * (e.deltaMode === 1 ? 16 : 1)),
          ) *
            0.00013,
      );
    };
    const down = (e: PointerEvent) => {
      if (modeRef.current === 'tour') {
        startY = e.clientY;
        startP = progressRef.current;
        dragging = true;
        host.setPointerCapture(e.pointerId);
      }
    };
    const move = (e: PointerEvent) => {
      if (!dragging || modeRef.current !== 'tour') return;
      stop();
      seek(startP + (startY - e.clientY) * 0.001);
    };
    const up = () => {
      dragging = false;
    };
    const key = (e: KeyboardEvent) => {
      if (modeRef.current !== 'tour') return;
      if (
        ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(
          e.key,
        )
      ) {
        e.preventDefault();
        stop();
        seek(
          e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? 1
              : progressRef.current +
                (e.key === 'ArrowDown'
                  ? 0.018
                  : e.key === 'ArrowUp'
                    ? -0.018
                    : e.key === 'PageDown'
                      ? 0.1
                      : -0.1),
        );
      }
    };
    const tick = (t: number) => {
      const dt = Math.min(0.08, (t - last) / 1000);
      last = t;
      if (
        playingRef.current &&
        modeRef.current === 'tour' &&
        !document.hidden &&
        !plan &&
        !settings
      ) {
        seek(progressRef.current + dt * 0.012);
        if (progressRef.current >= 1) stop();
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    host.addEventListener('wheel', wheel, { passive: false });
    host.addEventListener('pointerdown', down);
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerup', up);
    host.addEventListener('pointercancel', up);
    host.addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(id);
      host.removeEventListener('wheel', wheel);
      host.removeEventListener('pointerdown', down);
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerup', up);
      host.removeEventListener('pointercancel', up);
      host.removeEventListener('keydown', key);
    };
  }, [plan, settings]);
  useEffect(
    () =>
      registerViewerTool((p, m) => {
        changeMode(m);
        seek(p);
      }),
    [],
  );
  return (
    <main
      className={
        'experience' +
        (immersive ? ' immersive' : '') +
        (hidden ? ' controls-hidden' : '') +
        (mode === 'tour' ? ' tour-mode' : '')
      }
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The canvas container handles arrow keys for the guided camera. */}
      <div
        ref={mount}
        className="world"
        role="application"
        tabIndex={0}
        aria-label="Mô hình nhà 3D. Kéo trái để xoay, kéo chuột phải hoặc dùng hai ngón để di chuyển, cuộn để thu phóng. Dùng WASD hoặc phím mũi tên để đi quanh nhà."
      />
      {!hidden && (
        <>
          <header className="masthead">
            <button
              className="wordmark"
              onClick={() => {
                changeMode('free');
                reset();
              }}
              aria-label="Về toàn cảnh"
            >
              <span className="logo-box">
                <House size={21} />
              </span>
              <span>
                <strong>
                  NHÀ PHỐ <b>4.76</b>
                </strong>
                <small>PHỐI CẢNH KIẾN TRÚC</small>
              </span>
            </button>
            <div className="top-actions">
              <button
                className="text-button"
                onClick={() => setPlan(true)}
                title="Bản vẽ gốc"
              >
                <FileImage size={19} />
                <span>Bản vẽ</span>
              </button>
              <button
                className="icon-button"
                aria-label="Thông tin phương án và hướng dẫn"
                title="Thông tin phương án"
                onClick={() => setSettings(true)}
              >
                <Info size={20} />
              </button>
              <button
                className="icon-button"
                onClick={toggleFullscreen}
                aria-label={immersive ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                aria-pressed={immersive}
                title="Toàn màn hình"
              >
                {immersive ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
              </button>
            </div>
          </header>
          <aside className="view-tools" aria-label="Điều khiển góc nhìn">
            <button
              className="tool-button"
              title="Toàn cảnh"
              aria-label="Toàn cảnh"
              onClick={reset}
            >
              <House size={19} />
            </button>
            <button
              className="tool-button"
              title="Nhìn từ trên"
              aria-label="Nhìn từ trên"
              onClick={() => {
                changeMode('free');
                api.current?.view('top');
              }}
            >
              <Layers3 size={19} />
            </button>
            <span className="tool-divider" />
            <button
              className="tool-button"
              title="Phóng to"
              aria-label="Phóng to"
              disabled={mode === 'tour'}
              onClick={() => api.current?.zoom(0.82)}
            >
              <Plus size={20} />
            </button>
            <button
              className="tool-button"
              title="Thu nhỏ"
              aria-label="Thu nhỏ"
              disabled={mode === 'tour'}
              onClick={() => api.current?.zoom(1.22)}
            >
              <Minus size={20} />
            </button>
          </aside>
          <div className="bottom-panel">
            {mode === 'tour' && (
              <div className="tour-progress">
                <button
                  className="play-button"
                  onClick={togglePlay}
                  aria-label={playing ? 'Tạm dừng' : 'Phát tham quan'}
                >
                  {playing ? <Pause size={17} /> : <Play size={17} />}
                </button>
                <div className="tour-track">
                  <div>
                    <span>{frame.title}</span>
                    <output>{Math.round(progress * 100)}%</output>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={Math.round(progress * 1000)}
                    aria-label="Tiến trình tham quan"
                    onChange={(e) => {
                      playingRef.current = false;
                      setPlaying(false);
                      seek(Number(e.target.value) / 1000);
                    }}
                  />
                </div>
                <button
                  className="tool-button"
                  onClick={reset}
                  aria-label="Tham quan từ đầu"
                >
                  <RotateCcw size={17} />
                </button>
              </div>
            )}
            <div className="control-dock">
              <Tabs
                className="mode-control"
                value={mode}
                onValueChange={(v) => changeMode(String(v))}
              >
                <TabsList aria-label="Chế độ khám phá">
                  <TabsTrigger value="free">
                    <Move3D size={17} />
                    <span>Tự do</span>
                  </TabsTrigger>
                  <TabsTrigger value="tour">
                    <Play size={16} />
                    <span>Tham quan</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <span className="dock-divider" />
              <label htmlFor="section-main" className="section-toggle">
                <Switch
                  id="section-main"
                  checked={cut}
                  onCheckedChange={setCut}
                  aria-label="Mở mặt cắt"
                />
                <span>Mặt cắt</span>
              </label>
            </div>
          </div>
        </>
      )}
      <button
        className="visibility-toggle"
        onClick={() => setHidden(!hidden)}
        aria-label={hidden ? 'Hiện điều khiển' : 'Ẩn điều khiển'}
        aria-pressed={hidden}
        title={hidden ? 'Hiện điều khiển' : 'Ẩn điều khiển'}
      >
        {hidden ? <Eye size={19} /> : <EyeOff size={19} />}
      </button>
      {screenNote && <output className="screen-note">{screenNote}</output>}
      {!ready && (
        <div className="loading-state" aria-live="polite">
          <span className="loading-mark">
            <House size={28} />
          </span>
          <strong>
            {error ? 'Chưa thể hiển thị' : 'Đang dựng không gian'}
          </strong>
          <p>{error || 'Mô hình 3D đang được tải…'}</p>
          {error && <button onClick={() => location.reload()}>Tải lại</button>}
        </div>
      )}
      <Dialog open={settings} onOpenChange={setSettings}>
        <DialogContent className="settings-dialog">
          <DialogTitle>Phương án không gian</DialogTitle>
          <p className="dialog-lead">
            Hai mặt tiền · Sân rộng · Giữ bố trí mặt bằng
          </p>
          <dl className="project-dimensions">
            <div>
              <dt>Ngang nhà</dt>
              <dd>4,76 m</dd>
            </div>
            <div>
              <dt>Chiều dài nhà · ước lượng</dt>
              <dd>≈ 12,61 m</dd>
            </div>
            <div>
              <dt>Cao độ lầu 1 / lầu 2</dt>
              <dd>3,60 / 7,20 m</dd>
            </div>
            <div>
              <dt>Cao độ mái</dt>
              <dd>10,50 m</dd>
            </div>
          </dl>
          <dl className="project-dimensions">
            <div>
              <dt>Sân trước · ước lượng</dt>
              <dd>56 m²</dd>
            </div>
            <div>
              <dt>Chiều sâu sân trung bình</dt>
              <dd>≈ 11,8 m</dd>
            </div>
          </dl>
          <p>
            Nhà chữ nhật 4,76 × 12,61 m, khoảng 60 m². Từ sân vào là phòng
            khách, tiếp đến bàn ăn và cầu thang, cuối nhà là bếp, khu vệ sinh và
            cửa thoát hiểm phía sau. Các tầng trên cùng chiều vào nhà.
          </p>
          <p>
            Chỉ ranh đất phía cổng bị xéo; sân nằm giữa ranh này và mặt nhà
            thẳng. Ban công sâu 1,20 m hướng ra sân. Cửa phía sau thông ra mặt
            tiền thứ hai. Lầu 1 có phòng ngủ 01 phía ban công, phòng ngủ 02 phía
            sau. Phòng thờ và khối mái được đảo cùng chiều với lõi thang.
          </p>
          <p className="proposal-note">
            Chiều dài nhà, sân 56 m² và độ xéo ranh đất là số ước lượng theo yêu
            cầu, chưa phải kích thước đo thực địa. Hình nhà chữ nhật và ban công
            phía sân được cập nhật theo xác nhận của bạn.
          </p>
          <div className="help-row">
            <Move3D size={19} />
            <p>
              Kéo trái để xoay. Kéo chuột phải hoặc dùng hai ngón để di chuyển.
              Cuộn chuột hoặc chụm hai ngón để thu phóng. Bấm vào mô hình rồi
              dùng WASD hoặc phím mũi tên để đi quanh nhà.
            </p>
          </div>
          <label htmlFor="section-settings" className="settings-switch">
            <span>Mở mặt cắt</span>
            <Switch
              id="section-settings"
              checked={cut}
              onCheckedChange={setCut}
            />
          </label>
        </DialogContent>
      </Dialog>
      <Dialog open={plan} onOpenChange={setPlan}>
        <DialogContent className="plan-dialog" showCloseButton={false}>
          <header>
            <div>
              <small>HỒ SƠ THAM CHIẾU</small>
              <DialogTitle>Bản vẽ gốc · {names[planFloor]}</DialogTitle>
            </div>
            <button
              className="icon-button"
              aria-label="Đóng bản vẽ"
              onClick={() => setPlan(false)}
            >
              <X size={21} />
            </button>
          </header>
          <div className="plan-image">
            <img
              src={'./plans/' + plans[planFloor] + '.jpg'}
              alt={'Bản vẽ gốc ' + names[planFloor]}
            />
          </div>
          <footer>
            {names.map((n, i) => (
              <button
                aria-pressed={i === planFloor}
                className={i === planFloor ? 'chosen' : ''}
                onClick={() => setPlanFloor(i)}
                key={n}
              >
                {n}
              </button>
            ))}
          </footer>
        </DialogContent>
      </Dialog>
    </main>
  );
}
