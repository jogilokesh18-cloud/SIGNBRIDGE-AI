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
  Eye
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
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [cameraErrorNotice, setCameraErrorNotice] = useState<string | null>(null);

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

  // Handle stream initialization or switch
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

    // Stop existing tracks first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    const tiers: MediaStreamConstraints[] = [
      // Tier 1: Ideal 720p with facingMode or deviceId
      {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      },
      // Tier 2: Flexible resolution
      {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      },
      // Tier 3: Standard 480p
      {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      },
      // Tier 4: Minimal constraint fallback
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
      // Auto-fallback to Studio Avatar Simulation Mode
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

          // Ensure canvas sizing
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

          // In Studio Avatar Mode, render synthetic studio backdrop & model
          if (isStudio) {
            auraVisionService.drawStudioModel(ctx, canvas.width, canvas.height, timeSeconds);
          }

          frameCount++;
          // Periodic colorimetry update every ~90 frames (1.5s)
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

          // Render Couture Garment Drape
          if (activeGarment) {
            auraVisionService.drawCoutureGarmentDrape(
              ctx,
              canvas.width,
              canvas.height,
              activeGarment,
              vtonMode,
              timeSeconds
            );
          }

          // Render Holographic Mesh & Telemetry
          if (showMesh) {
            auraVisionService.drawHolographicMesh(
              ctx,
              canvas.width,
              canvas.height,
              activeGarment ? activeGarment.color_hex : '#d4af37',
              timeSeconds
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
      {/* Live Video Element (active in camera mode) */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover -scale-x-100 ${mirrorSource === 'camera' && isCameraActive ? 'block' : 'hidden'}`}
      />

      {/* AR Rendering Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${mirrorSource === 'camera' ? '-scale-x-100' : ''}`}
      />

      {/* Top Left: Spatial Telemetry Badge & Mode Switcher */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs font-semibold shadow-lg">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                mirrorSource === 'camera' && isCameraActive
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="tracking-wide">
              {mirrorSource === 'camera' && isCameraActive
                ? 'LIVE WEBCAM: 60 FPS'
                : 'STUDIO AVATAR SIMULATION'}
            </span>
          </div>

          {/* Quick Source Toggle Button */}
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
                <span>Switch to Studio Avatar</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Switch to Live Camera</span>
              </>
            )}
          </button>
        </div>

        {/* Biometric Fit Confidence Pill */}
        {bodyScan && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-amber-400/30 text-[11px] text-amber-200 shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Size Match:{' '}
              <strong className="text-white font-bold">{bodyScan.estimated_size}</strong>{' '}
              ({Math.round(bodyScan.confidence * 100)}% Fit Confidence) • {bodyScan.skin_undertone.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Notice badge if fallback happened */}
        {cameraErrorNotice && mirrorSource === 'studio_avatar' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300">
            <span>ℹ️ {cameraErrorNotice}</span>
          </div>
        )}
      </div>

      {/* Top Right: Mesh & Try-on Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Camera Selector (if multiple devices available) */}
        {availableDevices.length > 1 && mirrorSource === 'camera' && (
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-xs text-slate-200 outline-none focus:border-amber-400"
          >
            {availableDevices.map((dev, idx) => (
              <option key={dev.deviceId || idx} value={dev.deviceId} className="bg-slate-900 text-white">
                {dev.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
        )}

        {/* 3D Mesh Toggle */}
        <button
          onClick={() => setShowMesh(!showMesh)}
          className={`p-2.5 rounded-xl backdrop-blur-md border transition-all ${
            showMesh
              ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg'
              : 'bg-black/60 text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Toggle 3D Skeleton Wireframe"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Try-On Display Mode Cycle */}
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
          className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white hover:border-amber-400/40 transition-colors flex items-center gap-1.5"
          title="Cycle virtual try-on render mode"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="capitalize">{vtonMode.replace('_', ' ')}</span>
        </button>
      </div>

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
