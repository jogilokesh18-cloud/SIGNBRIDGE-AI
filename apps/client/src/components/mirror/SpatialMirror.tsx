import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Sparkles, RefreshCw, Layers, ShieldCheck, Zap } from 'lucide-react';
import { useAuraStore } from '../../store/auraStore.js';
import { auraVisionService } from '../../services/vision.service.js';
import { api } from '../../services/api.js';

export const SpatialMirror: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showMesh, setShowMesh] = useState<boolean>(true);
  const [isVtonRendering, setIsVtonRendering] = useState<boolean>(false);

  const {
    isCameraActive,
    setCameraActive,
    bodyScan,
    setBodyScan,
    activeGarment,
    vtonMode,
    setVtonMode,
    setCheckoutModalOpen
  } = useAuraStore();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Autoplay exception handled:', e);
        }
        setCameraActive(true);
        setHasPermission(true);
        startRenderLoop();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startRenderLoop = () => {
    let frameCounter = 0;

    const render = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2 && video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          frameCounter++;
          // Periodic colorimetry update every 90 frames (~1.5s)
          if (frameCounter % 90 === 0) {
            const colorMetrics = auraVisionService.sampleColorimetry(video);
            if (bodyScan) {
              setBodyScan({
                ...bodyScan,
                skin_undertone: colorMetrics.skin_undertone,
                lighting_kelvin: colorMetrics.lighting_kelvin,
                color_palette_recommendation: colorMetrics.color_palette
              });
            }
          }

          // Draw Generative Virtual Try-On Overlay
          if (activeGarment && vtonMode !== 'minimal') {
            const cx = canvas.width / 2;
            const topY = canvas.height * 0.32;
            const gWidth = canvas.width * 0.52;
            const gHeight = canvas.height * 0.65;

            ctx.save();
            // Subtle garment luminous aura
            ctx.shadowColor = activeGarment.color_hex;
            ctx.shadowBlur = 24;

            // Semi-transparent contoured drape shape
            const gradient = ctx.createLinearGradient(0, topY, 0, topY + gHeight);
            gradient.addColorStop(0, `${activeGarment.color_hex}dd`);
            gradient.addColorStop(0.7, `${activeGarment.color_hex}bb`);
            gradient.addColorStop(1, `${activeGarment.color_hex}44`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(cx, topY + gHeight * 0.45, gWidth * 0.42, gHeight * 0.46, 0, 0, Math.PI * 2);
            ctx.fill();

            // Accent Lapel / Seam Structure
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - gWidth * 0.18, topY + gHeight * 0.05);
            ctx.lineTo(cx, topY + gHeight * 0.45);
            ctx.lineTo(cx + gWidth * 0.18, topY + gHeight * 0.05);
            ctx.stroke();

            ctx.restore();
          }

          // Draw Holographic Body Mesh Nodes
          if (showMesh) {
            auraVisionService.drawHolographicMesh(
              ctx,
              canvas.width,
              canvas.height,
              activeGarment ? activeGarment.color_hex : '#d4af37'
            );
          }
        }
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);
  };

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-amber-500/20 shadow-2xl shadow-amber-500/10 flex items-center justify-center">
      {/* Live Video Feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="w-full h-full object-cover -scale-x-100"
      />

      {/* AR Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none object-cover -scale-x-100"
      />

      {/* Top Left: Spatial Telemetry Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-semibold shadow-lg">
          <span className={`w-2.5 h-2.5 rounded-full ${isCameraActive ? 'bg-amber-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="tracking-wide">{isCameraActive ? 'SPATIAL MIRROR: 60 FPS' : 'STANDBY'}</span>
        </div>

        {bodyScan && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-amber-400/20 text-[11px] text-amber-200 shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Size Match: <strong className="text-white font-bold">{bodyScan.estimated_size}</strong> ({Math.round(bodyScan.confidence * 100)}% Fit Confidence)</span>
          </div>
        )}
      </div>

      {/* Top Right: Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowMesh(!showMesh)}
          className={`p-2.5 rounded-xl backdrop-blur-md border transition-all ${
            showMesh ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg' : 'bg-black/60 text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Toggle 3D Pose Mesh"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            const modes: Array<'live_overlay' | 'silhouette' | 'minimal'> = ['live_overlay', 'silhouette', 'minimal'];
            const nextIdx = (modes.indexOf(vtonMode) + 1) % modes.length;
            setVtonMode(modes[nextIdx]);
          }}
          className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white hover:border-amber-400/40 transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="capitalize">{vtonMode.replace('_', ' ')}</span>
        </button>
      </div>

      {/* Bottom Bar: Active Draped Couture Pill & Instant Order */}
      {activeGarment && (
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-amber-500/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl border border-white/20 flex-shrink-0 bg-cover bg-center shadow-md"
              style={{ backgroundImage: `url(${activeGarment.image_url})` }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-tight">{activeGarment.name}</h4>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  {activeGarment.aesthetic_vibe.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400">{activeGarment.designer} • <span className="text-amber-400 font-bold">${activeGarment.price.toLocaleString()}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCheckoutModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Instant Concierge Order</span>
            </button>
          </div>
        </div>
      )}

      {/* Permission Fallback */}
      {hasPermission === false && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 text-white p-6 text-center">
          <CameraOff className="w-12 h-12 text-rose-400 mb-3" />
          <h3 className="text-lg font-bold mb-1">Spatial Camera Inaccessible</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Camera permission is required to analyze 3D body proportions and render real-time generative virtual try-on.
          </p>
          <button
            onClick={startCamera}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
          >
            <RefreshCw className="w-4 h-4" />
            Enable Camera
          </button>
        </div>
      )}
    </div>
  );
};
