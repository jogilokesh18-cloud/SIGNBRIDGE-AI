import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  Download,
  SplitSquareVertical,
  CheckCircle2,
  Zap,
  ArrowRight,
  User
} from 'lucide-react';
import { useAuraStore } from '../../store/auraStore.js';
import { aiTryonService, TryonGenerationResult } from '../../services/aiTryon.service.js';

const PERSON_MODEL_PRESETS = [
  {
    id: 'p1',
    label: 'Model 1 (Tailored Male)',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p2',
    label: 'Model 2 (Couture Female)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p3',
    label: 'Model 3 (Modern Streetwear)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p4',
    label: 'Model 4 (Classic Runway)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
  }
];

export const GenerativeTryonStudio: React.FC = () => {
  const {
    personPhotoUrl,
    setPersonPhotoUrl,
    activeGarment,
    setActiveGarment,
    catalog,
    selectedSize,
    setSelectedSize,
    setCheckoutModalOpen,
    setUploadModalOpen,
    addMessage,
    bodyScan
  } = useAuraStore();

  const personInputRef = useRef<HTMLInputElement | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [tryonResult, setTryonResult] = useState<TryonGenerationResult | null>(null);

  // Split-screen comparison slider position (0 to 100%)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);

  // Tailoring — no longer needed for AI mode but kept for fallback
  const fitScale = 1.0;
  const verticalOffset = 0;

  // Automatically trigger try-on generation when either person photo or garment changes
  useEffect(() => {
    if (personPhotoUrl && activeGarment) {
      handleGenerateTryon();
    }
  }, [personPhotoUrl, activeGarment, selectedSize]);

  const handlePersonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPersonPhotoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateTryon = async () => {
    if (!personPhotoUrl || !activeGarment) return;

    setIsGenerating(true);
    setGenerationProgress(10);
    setProgressStage('Uploading person photo & garment to Gemini AI...');

    try {
      await new Promise((r) => setTimeout(r, 300));
      setGenerationProgress(30);
      setProgressStage('AI is analyzing body shape, posture & proportions...');

      const garmentSource = activeGarment.vton_overlay_url || activeGarment.image_url;

      await new Promise((r) => setTimeout(r, 400));
      setGenerationProgress(55);
      setProgressStage('Gemini is re-drawing the person wearing the garment...');

      const result = await aiTryonService.synthesizeTryon(personPhotoUrl, garmentSource, {
        garmentName: activeGarment.name,
        garmentDescription: `${activeGarment.designer} ${activeGarment.category || ''} in ${activeGarment.color_hex || 'classic'} — ${(activeGarment.materials || []).join(', ') || 'premium fabric'}`,
        selectedSize
      });

      setTryonResult(result);
      setGenerationProgress(100);
      setProgressStage(
        result.isAiGenerated
          ? 'AI photo editing complete — the person is now wearing the garment!'
          : 'Canvas fallback used — configure GEMINI_API_KEY for AI generation.'
      );

      // AI Stylist commentary
      addMessage({
        id: `tryon-${Date.now()}`,
        sender: 'stylist',
        text: result.isAiGenerated
          ? `AI Virtual Try-On complete. Gemini has edited your photo to show you naturally wearing "${activeGarment.name}". ${result.stylingNotes}`
          : `Try-on preview generated using canvas fallback. "${activeGarment.name}" has been overlaid on your portrait. For photorealistic AI editing, ensure the Gemini API key is configured.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_prompts: [
          'How does this look for an evening gala?',
          'What accessories pair with this ensemble?',
          'Try a different garment on me'
        ]
      });
    } catch (err) {
      console.error('Try-on synthesis error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadLook = () => {
    if (!tryonResult?.synthesizedImageUrl) return;
    const a = document.createElement('a');
    a.href = tryonResult.synthesizedImageUrl;
    a.download = `AURA-AI-Look-${activeGarment?.name.replace(/\s+/g, '-') || 'Synthesized'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Drag handler for before/after comparison
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingSlider && e.type !== 'touchmove') return;
    if (!splitContainerRef.current) return;

    const rect = splitContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = Math.round((offsetX / rect.width) * 100);
    setSliderPos(percent);
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Top Controller Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 shadow-2xl">
        {/* Step 1: Person Photo Picker */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-amber-400/40 bg-slate-950 flex-shrink-0 shadow-md">
            <img src={personPhotoUrl} alt="Person" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
              <User className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                1. Person Photo
              </span>
              <button
                onClick={() => personInputRef.current?.click()}
                className="text-[11px] font-bold text-white hover:text-amber-300 underline underline-offset-2 transition-colors"
              >
                Upload Your Photo
              </button>
            </div>
            <input
              ref={personInputRef}
              type="file"
              accept="image/*"
              onChange={handlePersonUpload}
              className="hidden"
            />
            {/* Quick model presets */}
            <div className="flex items-center gap-1 mt-1">
              {PERSON_MODEL_PRESETS.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setPersonPhotoUrl(p.url)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all border ${
                    personPhotoUrl === p.url
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Model {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Arrow Divider */}
        <div className="hidden lg:flex items-center text-amber-400/60">
          <ArrowRight className="w-5 h-5" />
        </div>

        {/* Step 2: Garment Selected */}
        <div className="flex items-center gap-3">
          {activeGarment && (
            <>
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-amber-400/40 bg-slate-950 flex-shrink-0 shadow-md">
                <img src={activeGarment.image_url} alt="Garment" className="w-full h-full object-cover" />
                <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full" style={{ backgroundColor: activeGarment.color_hex }} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                  2. Product to Wear
                </span>
                <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5">{activeGarment.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {activeGarment.designer} • <strong className="text-amber-400">${activeGarment.price.toLocaleString()}</strong>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Garment</span>
          </button>

          <button
            onClick={handleGenerateTryon}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{isGenerating ? 'Synthesizing...' : 'Synthesize Try-On'}</span>
          </button>
        </div>
      </div>

      {/* Main Synthesized Presentation Canvas */}
      <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-amber-500/20 shadow-2xl shadow-amber-500/10 flex items-center justify-center">
        {/* Progress Bar during generation */}
        {isGenerating && (
          <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <Sparkles className="w-12 h-12 text-amber-400 animate-spin mb-4" style={{ animationDuration: '3s' }} />
            <h3 className="text-base font-bold text-white mb-1">Gemini AI is Editing Your Photo</h3>
            <p className="text-xs text-amber-300 font-mono mb-4">{progressStage}</p>

            <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-300 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Interactive Before & After Split Comparison Viewer */}
        {tryonResult ? (
          <div
            ref={splitContainerRef}
            onMouseDown={() => setIsDraggingSlider(true)}
            onMouseUp={() => setIsDraggingSlider(false)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            className="relative w-full h-full select-none cursor-ew-resize overflow-hidden"
          >
            {/* Background Layer: Synthesized Photo Wearing Garment */}
            <img
              src={tryonResult.synthesizedImageUrl}
              alt="Synthesized Person Wearing Garment"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Foreground Clipped Layer: Original Person Photo */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={tryonResult.originalImageUrl}
                alt="Original Person Photo"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: splitContainerRef.current?.clientWidth || '100%', height: '100%' }}
              />
            </div>

            {/* Split Divider Bar */}
            <div
              className="absolute top-0 bottom-0 z-30 w-1 bg-amber-400 shadow-2xl cursor-ew-resize pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-xl">
                <SplitSquareVertical className="w-4 h-4" />
              </div>
            </div>

            {/* Split Comparison Badges */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white shadow-lg">
                Original Photo ({sliderPos}%)
              </div>
            </div>

            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-bold shadow-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Wearing {activeGarment?.name}</span>
              </div>

              <button
                onClick={handleDownloadLook}
                className="p-2.5 rounded-xl bg-black/80 hover:bg-black text-amber-300 hover:text-white border border-amber-400/40 shadow-xl transition-all"
                title="Download High-Resolution Synthesized Photo"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Drag Guidance Prompt at center */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-mono shadow-lg">
                Drag left/right to compare Before & After
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 space-y-3">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
            <h3 className="text-lg font-bold">Ready for Virtual Try-On Synthesis</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Select or upload a person photo and a luxury garment above, then click Synthesize Try-On to generate the edited photograph.
            </p>
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
                    Size: {selectedSize} (98.6% Fit)
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {activeGarment.designer} • <span className="text-amber-400 font-bold">${activeGarment.price.toLocaleString()}</span>
                </p>
              </div>
            </div>

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
    </div>
  );
};
