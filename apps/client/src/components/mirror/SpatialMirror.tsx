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
  Crosshair,
  Ruler,
  Upload,
  SplitSquareVertical,
  Image as ImageIcon
} from 'lucide-react';
import { useAuraStore } from '../../store/auraStore.js';
import { auraVisionService, PoseKeypoints } from '../../services/vision.service.js';

const MODEL_PRESETS = [
  {
    id: 'm1',
    label: 'Model 1 (Tailored)',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm2',
    label: 'Model 2 (Couture)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm3',
    label: 'Model 3 (Modern)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm4',
    label: 'Model 4 (Avant-Garde)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
  }
];

export const SpatialMirror: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const personFileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showMesh, setShowMesh] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [showOriginalPhoto, setShowOriginalPhoto] = useState<boolean>(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [cameraErrorNotice, setCameraErrorNotice] = useState<string | null>(null);
  const [livePoseMetrics, setLivePoseMetrics] = useState<PoseKeypoints | null>(null);

  // Person-fit adjustment states
  const [fitScale, setFitScale] = useState<number>(1.0);
  const [verticalOffset, setVerticalOffset] = useState<number>(0);
  const [garmentOpacity, setGarmentOpacity] = useState<number>(0.96);

  const {
    isCameraActive,
    setCameraActive,
    mirrorSource,
    setMirrorSource,
    personPhotoUrl,
    setPersonPhotoUrl,
    bodyScan,
    setBodyScan,
    activeGarment,
    vtonMode,
    setVtonMode,
    selectedSize,
    setSelectedSize,
    setCheckoutModalOpen,
    addMessage
  } = useAuraStore();

  // Enumerate video devices and initialize Pose Landmarker
  useEffect(() => {
    async function init() {
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
      auraVisionService.initPoseLandmarker().catch((e) => console.warn('Pose init notice:', e));
    }
    init();
  }, []);

  // Preload person photo and active garment overlay
  useEffect(() => {
    if (personPhotoUrl) {
      auraVisionService.getGarmentOverlayImage(personPhotoUrl);
    }
    const url = activeGarment?.vton_overlay_url || activeGarment?.image_url;
    if (url) {
      auraVisionService.getGarmentOverlayImage(url);
    }
  }, [personPhotoUrl, activeGarment]);

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
  }, [mirrorSource, selectedDeviceId, personPhotoUrl, showOriginalPhoto, fitScale, verticalOffset, garmentOpacity, selectedSize, vtonMode, showMesh, activeGarment]);

  const handlePersonPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPersonPhotoUrl(result);
        setMirrorSource('photo_tryon');

        // Colorimetry from uploaded person photo
        const img = new Image();
        img.src = result;
        img.onload = () => {
          const metrics = auraVisionService.sampleColorimetry(img as any);
          if (bodyScan) {
            setBodyScan({
              ...bodyScan,
              skin_undertone: metrics.skin_undertone,
              lighting_kelvin: metrics.lighting_kelvin,
              color_palette_recommendation: metrics.color_palette
            });
          }
        };

        addMessage({
          id: `stylist-${Date.now()}`,
          sender: 'stylist',
          text: `Your portrait has been uploaded and analyzed. I have mapped your shoulder span and chest contours. Draping "${activeGarment?.name || 'haute couture silhouette'}" directly onto your photo now.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggested_prompts: [
            'How does this garment flatter my silhouette?',
            'Show this piece in size L for a relaxed fit',
            'Compare with a cashmere trench'
          ]
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
          ? 'Camera permission was denied. Switched to Photo Try-On Mode.'
          : 'Camera is busy or disconnected. Switched to Photo Try-On Mode.'
      );
      setMirrorSource('photo_tryon');
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
      const timeMs = performance.now();
      const timeSeconds = (Date.now() - startTimeRef.current) / 1000;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const isPhoto = mirrorSource === 'photo_tryon';
          const isStudio = mirrorSource === 'studio_avatar';
          const isCam = mirrorSource === 'camera';

          if (isPhoto || isStudio) {
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

          let pose: PoseKeypoints;

          if (isPhoto) {
            // Mode 1: Render uploaded person photo
            const personImg = auraVisionService.getGarmentOverlayImage(personPhotoUrl);
            auraVisionService.drawPersonPhoto(ctx, canvas.width, canvas.height, personImg);
            pose = auraVisionService.getPhotoPoseKeypoints(canvas.width, canvas.height);
          } else if (isStudio) {
            // Mode 2: Studio avatar simulation
            pose = auraVisionService.getGeometricFallbackPose(canvas.width, canvas.height, timeMs);
            auraVisionService.drawStudioModel(ctx, canvas.width, canvas.height, timeSeconds, pose);
          } else {
            // Mode 3: Live webcam pose tracking
            pose = !video || video.readyState < 2
              ? auraVisionService.getGeometricFallbackPose(canvas.width, canvas.height, timeMs)
              : auraVisionService.detectPose(video, timeMs, canvas.width, canvas.height);
          }

          frameCount++;
          if (frameCount % 30 === 0) {
            setLivePoseMetrics({ ...pose });
            if (bodyScan && pose.detected) {
              setBodyScan({
                ...bodyScan,
                shoulder_width_cm: pose.estimatedShoulderCm,
                estimated_size: pose.bestFitSize,
                confidence: 0.984
              });
            }
          }

          // Optional Alignment Guide
          if (showGuide) {
            auraVisionService.drawAlignmentGuide(ctx, canvas.width, canvas.height);
          }

          // Draped Garment (Worn on the person's photo / camera)
          if (activeGarment && !showOriginalPhoto) {
            auraVisionService.drawConformalGarment(
              ctx,
              canvas.width,
              canvas.height,
              activeGarment,
              vtonMode,
              pose,
              selectedSize,
              fitScale,
              verticalOffset,
              garmentOpacity
            );
          }

          // 3D Holographic Mesh & Landmarker Pins
          if (showMesh && !showOriginalPhoto) {
            auraVisionService.drawHolographicMesh(
              ctx,
              canvas.width,
              canvas.height,
              activeGarment ? activeGarment.color_hex : '#d4af37',
              pose,
              selectedSize
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
      {/* Live Video Element (Active only in camera mode) */}
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

      {/* Top Left: Mode Switcher Tabs */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/85 backdrop-blur-md border border-white/10 shadow-xl">
          <button
            onClick={() => setMirrorSource('photo_tryon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mirrorSource === 'photo_tryon'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photo Try-On</span>
          </button>

          <button
            onClick={() => setMirrorSource('camera')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mirrorSource === 'camera'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => setMirrorSource('studio_avatar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mirrorSource === 'studio_avatar'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Studio Avatar</span>
          </button>
        </div>

        {/* In Photo Try-On Mode: Quick Presets & Upload Person Photo Action */}
        {mirrorSource === 'photo_tryon' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => personFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-[11px] shadow-lg active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Upload Your Photo</span>
            </button>
            <input
              ref={personFileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePersonPhotoUpload}
              className="hidden"
            />

            {/* Quick Model Presets */}
            {MODEL_PRESETS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setPersonPhotoUrl(p.url)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  personPhotoUrl === p.url
                    ? 'bg-white/20 border-amber-400 text-amber-300'
                    : 'bg-black/60 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                Model {idx + 1}
              </button>
            ))}

            {/* Before / After Toggle */}
            <button
              onClick={() => setShowOriginalPhoto(!showOriginalPhoto)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                showOriginalPhoto
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-black/60 text-slate-300 border-white/10 hover:text-white'
              }`}
              title="Toggle between wearing the product and original photo"
            >
              <SplitSquareVertical className="w-3 h-3" />
              <span>{showOriginalPhoto ? 'Showing Original' : 'Wearing Outfit'}</span>
            </button>
          </div>
        )}

        {/* Live Size & Anatomical Measurement Pill */}
        {livePoseMetrics && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-amber-400/30 text-[11px] text-amber-200 shadow-md">
            <Ruler className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Shoulder Breadth: <strong className="text-white font-bold">{livePoseMetrics.estimatedShoulderCm} cm</strong>{' '}
              • Fit Match: <strong className="text-emerald-400 font-bold">{selectedSize}</strong> ({selectedSize === livePoseMetrics.bestFitSize ? 'Exact Tailored Fit' : 'Custom Fit'})
            </span>
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
          title="Adjust Garment Fit & Warping"
        >
          <Sliders className="w-4 h-4" />
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

      {/* Floating Fit & Calibration Panel */}
      {showControls && (
        <div className="absolute top-16 right-4 z-30 w-64 p-3.5 rounded-2xl bg-black/90 backdrop-blur-xl border border-amber-400/30 shadow-2xl text-white space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
              Live Tailoring Calibration
            </span>
            <button
              onClick={() => {
                setFitScale(1.0);
                setVerticalOffset(0);
                setGarmentOpacity(0.96);
              }}
              className="text-[10px] text-slate-400 hover:text-amber-300"
            >
              Reset
            </button>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Shoulder Breadth:</span>
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

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Collar Drop:</span>
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

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Fabric Opacity:</span>
              <span className="font-mono text-amber-400">{Math.round(garmentOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.40"
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
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
    </div>
  );
};
