import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Sparkles,
  RefreshCw,
  Layers,
  ShieldCheck,
  Zap,
  User,
  Sliders,
  CheckCircle2,
  Video,
  Eye,
  MoveVertical,
  Maximize2,
  Minimize2,
  Crosshair
} from 'lucide-react';
import { useAuraStore } from '../../store/auraStore.js';
import { auraVisionService } from '../../services/vision.service.js';

export const SpatialMirror: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showMesh, setShowMesh] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [cameraErrorNotice, setCameraErrorNotice] = useState<string | null>(null);

  // Person-fit adjustment states
  const [fitScale, setFitScale] = useState<number>(1.0);
  const [verticalOffset, setVerticalOffset] = useState<number>(0);
  const [garmentOpacity, setGarmentOpacity] = useState<number>(0.95);

  const {
    isCameraActive,
    setCameraActive,
    mirrorSource,
    setMirrorSource,
    bodyScan,
    setBodyScan,
    activeGarment,
    vtonMode,
    setVtonMode,
    selectedSize,
    setSelectedSize,
    setCheckoutModalOpen
  } = useAuraStore();

  // Enumerate video devices on mount
  useEffect(() => {
    async function getDevices() {
      if (navigator.mediaDevices?.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setAvailableDevices(videoInputs);
          if (videoInputs.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(videoInputs[0].deviceId);
          }
        } catch (e) {
          console.warn('Could not enumerate video devices:', e);
        }
      }
    }
    getDevices();
  }, []);

  // Preload active garment overlay
  useEffect(() => {
    if (activeGarment?.vton_overlay_url) {
      auraVisionService.getGarmentOverlayImage(activeGarment.vton_overlay_url);
    }
  }, [activeGarment]);

  // Adjust scale automatically when size changes
  useEffect(() => {
    const scaleMap: Record<string, number> = {
      XS: 0.88,
      S: 0.94,
      M: 1.0,
      L: 1.08,
      XL: 1.16
    };
    if (scaleMap[selectedSize]) {
      setFitScale(scaleMap[selectedSize]);
    }
  }, [selectedSize]);

  // Handle stream initialization or source switch
  useEffect(() => {
    if (mirrorSource === 'camera') {
      startCamera(selectedDeviceId);
    } else {
      stopCamera();
      startRenderLoop();
    }

    return () => {
      stopCamera();
    };
  }, [mirrorSource, selectedDeviceId]);

  /**
   * Multi-tiered resilient camera acquisition
   */
  const startCamera = async (deviceId?: string) => {
    setIsInitializing(true);
    setCameraErrorNotice(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    const tiers: MediaStreamConstraints[] = [
      {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      },
      {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      },
      {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      },
      {
        video: true,
        audio: false
      }
    ];

    let acquiredStream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of tiers) {
      try {
        acquiredStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (acquiredStream) break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (acquiredStream) {
      streamRef.current = acquiredStream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = acquiredStream;
        video.onloadedmetadata = () => {
          video.play().catch((e) => console.warn('Play error handled:', e));
          setCameraActive(true);
          setHasPermission(true);
          setIsInitializing(false);
          startRenderLoop();
        };
      }
    } else {
      console.warn('Camera acquisition failed across all tiers:', lastError);
      setHasPermission(false);
      setCameraActive(false);
      setIsInitializing(false);
      setCameraErrorNotice(
        lastError?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Switched to Studio Avatar Mode.'
          : 'Camera is busy or disconnected. Switched to Studio Avatar Mode.'
      );
      setMirrorSource('studio_avatar');
      startRenderLoop();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startRenderLoop = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }

    let frameCount = 0;

    const render = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const timeSeconds = (Date.now() - startTimeRef.current) / 1000;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const isStudio = mirrorSource === 'studio_avatar';

          if (isStudio) {
            if (canvas.width !== 1280 || canvas.height !== 720) {
              canvas.width = 1280;
              canvas.height = 720;
            }
          } else if (video && video.videoWidth > 0) {
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }
          } else if (canvas.width === 0 || canvas.height === 0) {
            canvas.width = 1280;
            canvas.height = 720;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // In Studio Avatar Mode, draw realistic studio model & background
          if (isStudio) {
            auraVisionService.drawStudioModel(ctx, canvas.width, canvas.height, timeSeconds);
          }

          // Periodic colorimetry update (~1.5s)
          frameCount++;
          if (frameCount % 90 === 0) {
            const metrics = auraVisionService.sampleColorimetry(
              isStudio || !video ? canvas : video
            );
            if (bodyScan) {
              setBodyScan({
                ...bodyScan,
                skin_undertone: metrics.skin_undertone,
                lighting_kelvin: metrics.lighting_kelvin,
                color_palette_recommendation: metrics.color_palette
              });
            }
          }

          // Optional Alignment Guide Silhouette
          if (showGuide) {
            auraVisionService.drawAlignmentGuide(ctx, canvas.width, canvas.height);
          }

          // Render Haute Couture Garment Worn on Person
          if (activeGarment) {
            auraVisionService.drawCoutureGarmentDrape(
              ctx,
              canvas.width,
              canvas.height,
              activeGarment,
              vtonMode,
              timeSeconds,
              fitScale,
              verticalOffset,
              garmentOpacity
            );
          }

          // Render 3D Holographic Mesh & Landmarks
          if (showMesh) {
            auraVisionService.drawHolographicMesh(
              ctx,
              canvas.width,
              canvas.height,
              activeGarment ? activeGarment.color_hex : '#d4af37',
              timeSeconds,
              verticalOffset,
              fitScale
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
        className={`w-full h-full object-cover -scale-x-100 ${
          mirrorSource === 'camera' && isCameraActive ? 'block' : 'hidden'
        }`}
      />

      {/* AR Garment Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
          mirrorSource === 'camera' ? '-scale-x-100' : ''
        }`}
      />

      {/* Top Left: Telemetry & Mode Selector */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold shadow-lg">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                mirrorSource === 'camera' && isCameraActive
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="tracking-wide">
              {mirrorSource === 'camera' && isCameraActive
                ? 'WEBCAM VTON: 60 FPS'
                : 'STUDIO AVATAR SIMULATION'}
            </span>
          </div>

          <button
            onClick={() => {
              if (mirrorSource === 'camera') {
                setMirrorSource('studio_avatar');
              } else {
                setMirrorSource('camera');
              }
            }}
            className="px-3 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[11px] font-bold backdrop-blur-md transition-all shadow-md flex items-center gap-1.5"
            title="Toggle between real Webcam and Studio Avatar mode"
          >
            {mirrorSource === 'camera' ? (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Studio Avatar Mode</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Live Webcam Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Live Size & Undertone Pill */}
        {bodyScan && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-amber-400/30 text-[11px] text-amber-200 shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Size: <strong className="text-white font-bold">{selectedSize}</strong> ({Math.round(bodyScan.confidence * 100)}% Fit) • {bodyScan.skin_undertone.replace('_', ' ')}
            </span>
          </div>
        )}

        {cameraErrorNotice && mirrorSource === 'studio_avatar' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300">
            <span>ℹ️ {cameraErrorNotice}</span>
          </div>
        )}
      </div>

      {/* Top Right: Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Toggle Custom Fit Adjustments */}
        <button
          onClick={() => setShowControls(!showControls)}
          className={`p-2.5 rounded-xl backdrop-blur-md border transition-all ${
            showControls
              ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg'
              : 'bg-black/70 text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Adjust Garment Fit & Placement"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Toggle Alignment Guide */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className={`p-2.5 rounded-xl backdrop-blur-md border transition-all ${
            showGuide
              ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg'
              : 'bg-black/70 text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Toggle Shoulder Alignment Guide"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Toggle 3D Skeleton Mesh */}
        <button
          onClick={() => setShowMesh(!showMesh)}
          className={`p-2.5 rounded-xl backdrop-blur-md border transition-all ${
            showMesh
              ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg'
              : 'bg-black/70 text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Toggle 3D Skeleton Wireframe"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* VTON Mode Selector */}
        <button
          onClick={() => {
            const modes: Array<'live_overlay' | 'silhouette' | 'minimal'> = [
              'live_overlay',
              'silhouette',
              'minimal'
            ];
            const nextIdx = (modes.indexOf(vtonMode) + 1) % modes.length;
            setVtonMode(modes[nextIdx]);
          }}
          className="px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-white hover:border-amber-400/40 transition-colors flex items-center gap-1.5"
          title="Cycle virtual try-on render mode"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="capitalize">{vtonMode.replace('_', ' ')}</span>
        </button>
      </div>

      {/* Floating Fit & Calibration Panel (Expandable) */}
      {showControls && (
        <div className="absolute top-16 right-4 z-30 w-64 p-3.5 rounded-2xl bg-black/90 backdrop-blur-xl border border-amber-400/30 shadow-2xl text-white space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
              Garment Fit & Warping
            </span>
            <button
              onClick={() => {
                setFitScale(1.0);
                setVerticalOffset(0);
                setGarmentOpacity(0.95);
              }}
              className="text-[10px] text-slate-400 hover:text-amber-300"
            >
              Reset
            </button>
          </div>

          {/* Garment Scale */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Shoulder Span:</span>
              <span className="font-mono text-amber-400">{Math.round(fitScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.80"
              max="1.30"
              step="0.02"
              value={fitScale}
              onChange={(e) => setFitScale(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Vertical Alignment */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Collar Height:</span>
              <span className="font-mono text-amber-400">{verticalOffset}px</span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              step="2"
              value={verticalOffset}
              onChange={(e) => setVerticalOffset(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Opacity */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Drape Opacity:</span>
              <span className="font-mono text-amber-400">{Math.round(garmentOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="1.0"
              step="0.05"
              value={garmentOpacity}
              onChange={(e) => setGarmentOpacity(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Bottom Bar: Active Draped Couture Pill & Instant Order */}
      {activeGarment && (
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-black/85 backdrop-blur-xl border border-amber-500/30 shadow-2xl">
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
              <p className="text-xs text-slate-400">
                {activeGarment.designer} •{' '}
                <span className="text-amber-400 font-bold">${activeGarment.price.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Size Selectors & Order Button */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedSize === size
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

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

      {/* Camera Re-enable overlay if user manually requested camera and it failed */}
      {hasPermission === false && mirrorSource === 'camera' && !isInitializing && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 text-white p-6 text-center backdrop-blur-sm">
          <CameraOff className="w-12 h-12 text-amber-400 mb-3" />
          <h3 className="text-lg font-bold mb-1">Webcam Inaccessible</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Your camera may be in use by another application or blocked in browser settings. You can switch to our high-fidelity Studio Avatar mode or retry.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => startCamera(selectedDeviceId)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Camera
            </button>
            <button
              onClick={() => setMirrorSource('studio_avatar')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors border border-white/20"
            >
              <User className="w-4 h-4 text-amber-400" />
              Use Studio Avatar Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
