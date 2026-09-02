import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { QrApi } from '../../api/client';
import { useToast } from '../../components/toast';
import { useData } from '../../state/data';
import { SubScreen } from '../SubScreen';
import { StatusBadge, ModalCenter, Empty } from '../../components/ui';
import { IconScan, IconCheck } from '../../components/Icons';

export default function ScanQr() {
  const [mode, setMode] = useState<'camera' | 'manual' | 'result' | 'found'>('camera');
  const [manualId, setManualId] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanning = useRef(true);
  const toast = useToast();
  const navigate = useNavigate();
  const { invalidate } = useData();

  // demo QRs for the fallback
  const [demoIdentifiers, setDemoIdentifiers] = useState<string[]>([]);

  // Try to find demo QR identifiers to offer as fallback
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cyclone_cache_/api/items');
      if (raw) {
        const d = JSON.parse(raw);
        (d.items || []).forEach((it: any) => {
          if (it.qrIdentifier) setDemoIdentifiers((s) => (s.includes(it.qrIdentifier) ? s : [...s, it.qrIdentifier]));
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    if (mode === 'camera') {
      startCamera(true);
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stopCamera();
    };
  }, [mode]);

  async function startCamera(loopVideo: boolean) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        if (loopVideo) tick();
      }
    } catch (e) {
      toast.toast('Camera unavailable — use manual entry or a demo QR', 'error');
      setMode('manual');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function tick() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !scanning.current) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        if (code && code.data) {
          verify(code.data, true);
          return;
        }
      }
    }
    requestAnimationFrame(tick);
  }

  async function verify(identifier: string, isScan: boolean) {
    if (busy) return;
    scanning.current = false;
    setBusy(true);
    try {
      const res = await QrApi.verify(identifier.trim());
      setResult(res);
      if (!res.owned && res.item?.status === 'lost') {
        setMode('found');
      } else {
        setMode('result');
      }
      if (isScan) stopCamera();
    } catch (e: any) {
      toast.toast(e.message || 'Invalid QR identifier', 'error');
      navigate('/features/lost-found', { replace: true });
    } finally {
      setBusy(false);
      scanning.current = true;
    }
  }

  async function reportFound() {
    if (!result || !result.item) return;
    setBusy(true);
    try {
      await QrApi.reportFound(result.item.id);
      invalidate(['notifications']);
      toast.toast('Reported to the owner. Thank you!', 'success');
      navigate('/features/lost-found', { replace: true });
    } catch (e: any) {
      toast.toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setMode('camera');
    setManualId('');
    startCamera(true);
  }

  return (
    <SubScreen title="Scan QR">
      {mode === 'camera' && (
        <div>
          <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid var(--c-border)', background: '#0B2545', position: 'relative' }}>
            <video ref={videoRef} muted playsInline style={{ width: '100%', display: 'block', minHeight: 260 }} />
            <div style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 180, height: 180, border: '2px solid rgba(255,255,255,0.85)', borderRadius: 16 }} />
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 12.5, fontWeight: 600, background: 'rgba(11,37,69,0.7)', padding: '6px 10px' }}>
              Point your camera at a CYCLONE QR code
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div className="grid-2 mt16">
            <button className="btn btn-outline" onClick={() => setMode('manual')}>Enter code instead</button>
            <button className="btn btn-secondary" onClick={() => { if (demoIdentifiers.length) { setResult(null); setMode('result'); verify(demoIdentifiers[0], false); } else { toast.toast('Demo QRs will appear after you register an item', 'default'); } }}>
              Use a demo QR
            </button>
          </div>
        </div>
      )}

      {mode === 'manual' && (
        <div className="card card-pad">
          <div className="field">
            <label>QR identifier</label>
            <input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="Paste the CYCLONE identifier (e.g. CYC_…)" />
          </div>
          <button className="btn btn-primary" disabled={!manualId.trim() || busy} onClick={() => verify(manualId, false)}>Verify</button>
          {demoIdentifiers.length > 0 && (
            <div className="mt16">
              <div className="small muted" style={{ fontWeight: 600 }}>Demo QR identifiers found on this device:</div>
              {demoIdentifiers.map((id) => (
                <button key={id} className="btn btn-outline mt8" style={{ justifyContent: 'flex-start', fontFamily: 'monospace', fontSize: 13 }} onClick={() => verify(id, false)}>
                  {id.slice(0, 20)}…
                </button>
              ))}
            </div>
          )}
          <button className="btn btn-ghost mt12" onClick={() => setMode('camera')}>Use camera</button>
        </div>
      )}

      {mode === 'result' && result && (
        <div>
          {result.owned ? (
            <div className="card card-pad" style={{ textAlign: 'center', borderTop: '3px solid var(--c-success)' }}>
              <div style={{ width: 62, height: 62, borderRadius: 20, background: 'var(--c-success-soft)', color: 'var(--c-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <IconCheck size={30} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 800 }}>Verified</h3>
              <p className="muted mt8">This item is registered to your CYCLONE account.</p>
              <div className="card mt16" style={{ background: 'var(--c-bg)', textAlign: 'left', padding: 14 }}>
                <div className="between" style={{ padding: '4px 0' }}><span className="muted-2 small">Item</span><span className="bold">{result.item.name}</span></div>
                <div className="between" style={{ padding: '4px 0' }}><span className="muted-2 small">Category</span><span className="bold">{result.item.category}</span></div>
                <div className="between" style={{ padding: '4px 0' }}><span className="muted-2 small">Status</span><StatusBadge status={result.item.status} /></div>
                <div className="between" style={{ padding: '4px 0' }}><span className="muted-2 small">Registered</span><span className="small">{new Date(result.item.createdAt).toLocaleDateString()}</span></div>
              </div>
              <button className="btn btn-primary mt16" onClick={() => navigate('/features/lost-found/my-items')}>View my items</button>
              <button className="btn btn-ghost mt8" onClick={reset}>Scan another</button>
            </div>
          ) : (
            <div className="card card-pad" style={{ textAlign: 'center' }}>
              <div className="feature-icon" style={{ margin: '0 auto 12px' }}><IconScan /></div>
              <h3 style={{ fontSize: 19, fontWeight: 800 }}>Registered with CYCLONE</h3>
              <p className="muted mt8">{result.message}</p>
              {result.report && (
                <div className="card mt16" style={{ background: 'var(--c-bg)', textAlign: 'left', padding: 14 }}>
                  <div className="between" style={{ padding: '4px 0' }}><span className="muted-2 small">Reported lost at</span><span className="bold">{result.report.location || 'Airport'}</span></div>
                  <div className="between" style={{ padding: '4px 0' }}><span className="muted-2 small">Status</span><span className="badge badge-warning">Lost</span></div>
                </div>
              )}
              {result.action === 'found' && (
                <button className="btn btn-primary mt16" disabled={busy} onClick={reportFound}>
                  <IconScan size={17} /> Report item found
                </button>
              )}
              <button className="btn btn-ghost mt8" onClick={reset}>Scan another</button>
            </div>
          )}
        </div>
      )}

      {mode === 'found' && result && (
        <div>
          <div className="card card-pad" style={{ textAlign: 'center', borderTop: '3px solid var(--c-warning)' }}>
            <h3 style={{ fontSize: 19, fontWeight: 800 }}>Help return this item</h3>
            <p className="muted mt8">
              This item has been registered with CYCLONE and marked as lost. You can help return it without seeing the owner’s personal information.
            </p>
            <div className="card mt16" style={{ background: 'var(--c-bg)', textAlign: 'left', padding: 14 }}>
              <p className="small muted">Where you can drop off found items at this airport:</p>
              <p className="bold small mt8">Lost & Found Office · Terminal {result.report?.airport || '2'} · near Arrivals Hall</p>
            </div>
            <button className="btn btn-primary mt16" disabled={busy} onClick={reportFound}>Report item found</button>
            <button className="btn btn-ghost mt8" onClick={reset}>Scan another</button>
          </div>
        </div>
      )}
    </SubScreen>
  );
}