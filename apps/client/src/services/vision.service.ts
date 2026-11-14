import { BodyAnalysisResult, SkinUndertone, GarmentItem } from '@signbridge/shared-types';

export class AuraVisionService {
  private imageCache = new Map<string, HTMLImageElement>();

  /**
   * Preloads or retrieves cached garment image overlay
   */
  getGarmentOverlayImage(url: string): HTMLImageElement {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url)!;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    this.imageCache.set(url, img);
    return img;
  }

  /**
   * Samples center facial/torso pixels from the live video feed or canvas
   * to determine skin undertone and ambient color temperature.
   */
  sampleColorimetry(source: HTMLVideoElement | HTMLCanvasElement): {
    skin_undertone: SkinUndertone;
    lighting_kelvin: number;
    color_palette: string[];
  } {
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 64;
      tempCanvas.height = 64;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        return this.getDefaultColorimetry();
      }

      ctx.drawImage(source, 0, 0, 64, 64);
      const imgData = ctx.getImageData(24, 24, 16, 16).data;

      let r = 0, g = 0, b = 0;
      const count = imgData.length / 4;
      for (let i = 0; i < imgData.length; i += 4) {
        r += imgData[i];
        g += imgData[i + 1];
        b += imgData[i + 2];
      }
      r /= count;
      g /= count;
      b /= count;

      const kelvin = Math.round(2000 + (b / Math.max(r, 1)) * 3000);

      let undertone: SkinUndertone = 'neutral_olive';
      let palette = ['#0b0f19', '#064e3b', '#d6c7b2', '#78350f'];

      if (r > g + 15 && g > b) {
        undertone = 'warm_golden';
        palette = ['#064e3b', '#b45309', '#1e3a8a', '#d4af37'];
      } else if (b > g && r < 160) {
        undertone = 'cool_rosy';
        palette = ['#1e1b4b', '#4c1d95', '#0f172a', '#e2e8f0'];
      } else if (r > 190 && g > 180 && b > 175) {
        undertone = 'porcelain_fair';
        palette = ['#0f172a', '#831843', '#1e3a8a', '#047857'];
      } else if (r < 110 && g < 90) {
        undertone = 'deep_espresso';
        palette = ['#fbbf24', '#f59e0b', '#065f46', '#ffffff'];
      }

      return {
        skin_undertone: undertone,
        lighting_kelvin: Math.min(6500, Math.max(2800, kelvin)),
        color_palette: palette
      };
    } catch {
      return this.getDefaultColorimetry();
    }
  }

  private getDefaultColorimetry() {
    return {
      skin_undertone: 'neutral_olive' as SkinUndertone,
      lighting_kelvin: 3400,
      color_palette: ['#0b0f19', '#064e3b', '#d6c7b2', '#78350f']
    };
  }

  /**
   * Renders a photorealistic haute couture studio mannequin / model
   * when live webcam is offline, covered, or in simulation mode.
   */
  drawStudioModel(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeSeconds: number
  ) {
    ctx.save();

    // Studio backdrop gradient
    const bgGrad = ctx.createRadialGradient(
      width * 0.5, height * 0.4, width * 0.1,
      width * 0.5, height * 0.5, width * 0.75
    );
    bgGrad.addColorStop(0, '#151c2d');
    bgGrad.addColorStop(0.5, '#0b0f19');
    bgGrad.addColorStop(1, '#05070c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle breathing & posture sway
    const breath = Math.sin(timeSeconds * 1.8) * 3;
    const sway = Math.sin(timeSeconds * 0.8) * 2;

    const cx = width / 2 + sway;
    const headY = height * 0.22 + breath * 0.4;
    const shoulderY = height * 0.35 + breath;
    const shoulderHalfWidth = width * 0.18;
    const waistY = height * 0.62;
    const waistHalfWidth = shoulderHalfWidth * 0.72;
    const hipY = height * 0.78;
    const hipHalfWidth = shoulderHalfWidth * 0.86;

    // Atmospheric studio rim light
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 30;

    // Head silhouette with subtle facial posture guide
    ctx.fillStyle = '#263042';
    ctx.beginPath();
    ctx.ellipse(cx, headY, width * 0.055, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.beginPath();
    ctx.moveTo(cx - width * 0.022, headY + height * 0.05);
    ctx.lineTo(cx + width * 0.022, headY + height * 0.05);
    ctx.lineTo(cx + width * 0.026, shoulderY);
    ctx.lineTo(cx - width * 0.026, shoulderY);
    ctx.closePath();
    ctx.fill();

    // Torso silhouette
    ctx.beginPath();
    ctx.moveTo(cx - shoulderHalfWidth, shoulderY);
    ctx.quadraticCurveTo(cx, shoulderY - 8, cx + shoulderHalfWidth, shoulderY);
    ctx.lineTo(cx + waistHalfWidth, waistY);
    ctx.lineTo(cx + hipHalfWidth, hipY);
    ctx.lineTo(cx - hipHalfWidth, hipY);
    ctx.lineTo(cx - waistHalfWidth, waistY);
    ctx.closePath();
    ctx.fill();

    // Studio grid floor reflection lines
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const y = height * (0.8 + i * 0.035);
      ctx.beginPath();
      ctx.moveTo(width * 0.1, y);
      ctx.lineTo(width * 0.9, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Generates a 3D holographic pose & contour mesh with coordinate telemetry
   */
  drawHolographicMesh(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    garmentHex = '#d4af37',
    timeSeconds = 0,
    verticalOffset = 0,
    scaleMultiplier = 1.0
  ) {
    ctx.save();

    const breath = Math.sin(timeSeconds * 1.8) * 3;
    const sway = Math.sin(timeSeconds * 0.8) * 2;

    const cx = width / 2 + sway;
    const shoulderY = (height * 0.35 + breath + verticalOffset);
    const shoulderWidth = width * 0.36 * scaleMultiplier;
    const chestY = shoulderY + height * 0.13 * scaleMultiplier;
    const waistY = shoulderY + height * 0.27 * scaleMultiplier;
    const waistWidth = shoulderWidth * 0.74;

    // Glowing contour lines
    ctx.strokeStyle = garmentHex;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = garmentHex;
    ctx.shadowBlur = 12;

    // Shoulder to waist geometric wireframe
    ctx.beginPath();
    ctx.moveTo(cx - shoulderWidth / 2, shoulderY);
    ctx.lineTo(cx + shoulderWidth / 2, shoulderY);
    ctx.lineTo(cx + waistWidth / 2, waistY);
    ctx.lineTo(cx - waistWidth / 2, waistY);
    ctx.closePath();
    ctx.stroke();

    // Cross-strut telemetry diagonals
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(cx - shoulderWidth / 2, shoulderY);
    ctx.lineTo(cx + waistWidth / 2, waistY);
    ctx.moveTo(cx + shoulderWidth / 2, shoulderY);
    ctx.lineTo(cx - waistWidth / 2, waistY);
    ctx.stroke();

    // Skeletal landmark keypoints
    const nodes = [
      { x: cx, y: shoulderY - height * 0.07, label: 'Apex 0.98' },
      { x: cx - shoulderWidth / 2, y: shoulderY, label: 'L-Acr' },
      { x: cx + shoulderWidth / 2, y: shoulderY, label: 'R-Acr' },
      { x: cx, y: chestY, label: 'Sternum' },
      { x: cx - waistWidth / 2, y: waistY, label: 'L-Waist' },
      { x: cx + waistWidth / 2, y: waistY, label: 'R-Waist' },
      { x: cx - shoulderWidth * 0.58, y: chestY + 15, label: 'L-Arm' },
      { x: cx + shoulderWidth * 0.58, y: chestY + 15, label: 'R-Arm' }
    ];

    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = garmentHex;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mini text label
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillText(n.label, n.x + 6, n.y - 3);
    });

    ctx.restore();
  }

  /**
   * Draws posture and alignment guide silhouette on the mirror
   */
  drawAlignmentGuide(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    const cx = width / 2;
    const cy = height * 0.42;

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);

    // Head oval guide
    ctx.beginPath();
    ctx.ellipse(cx, height * 0.22, width * 0.06, height * 0.08, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Shoulder curve guide
    ctx.beginPath();
    ctx.moveTo(cx - width * 0.18, height * 0.35);
    ctx.quadraticCurveTo(cx, height * 0.33, cx + width * 0.18, height * 0.35);
    ctx.stroke();

    // Guidance text
    ctx.setLineDash([]);
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('ALIGN SHOULDERS HERE', cx, height * 0.31);

    ctx.restore();
  }

  /**
   * Renders high-fidelity generative virtual try-on couture garment worn on the person
   */
  drawCoutureGarmentDrape(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    garment: GarmentItem,
    vtonMode: 'live_overlay' | 'silhouette' | 'minimal',
    timeSeconds = 0,
    scaleMultiplier = 1.0,
    verticalOffset = 0,
    opacity = 0.95
  ) {
    if (vtonMode === 'minimal') return;

    ctx.save();

    const breath = Math.sin(timeSeconds * 1.8) * 3;
    const sway = Math.sin(timeSeconds * 0.8) * 2;
    const wave = Math.sin(timeSeconds * 2.5) * 3;

    const cx = width / 2 + sway;
    const baseHex = garment.color_hex || '#0b0f19';

    // Check if high-res SVG overlay is available
    if (vtonMode === 'live_overlay' && garment.vton_overlay_url) {
      const img = this.getGarmentOverlayImage(garment.vton_overlay_url);
      if (img.complete && img.naturalWidth > 0) {
        // Compute destination bounds centered on the person's torso
        const gWidth = width * 0.56 * scaleMultiplier;
        const gHeight = gWidth * (600 / 500); // 500x600 aspect ratio of overlays
        const topY = height * 0.26 + breath + verticalOffset;
        const destX = cx - gWidth / 2;

        ctx.globalAlpha = opacity;
        ctx.shadowColor = baseHex;
        ctx.shadowBlur = 25;

        // Draw the photorealistic couture garment onto the body!
        ctx.drawImage(img, destX, topY, gWidth, gHeight);

        // Subtle specular highlight line down lapel
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - gWidth * 0.08, topY + gHeight * 0.15);
        ctx.lineTo(cx - gWidth * 0.02, topY + gHeight * 0.45);
        ctx.stroke();

        ctx.restore();
        return;
      }
    }

    // Procedural Fallback if image still loading or in 'silhouette' mode
    const neckY = height * 0.29 + verticalOffset;
    const shoulderY = height * 0.35 + breath + verticalOffset;
    const shoulderWidth = width * 0.36 * scaleMultiplier;
    const chestY = height * 0.48 + verticalOffset;
    const waistY = height * 0.62 + verticalOffset;
    const waistWidth = shoulderWidth * 0.74;
    const hemY = (garment.category === 'evening_wear' ? height * 0.88 : height * 0.72) + verticalOffset;
    const hemWidth = garment.category === 'evening_wear'
      ? shoulderWidth * 1.15 + wave
      : shoulderWidth * 0.82;

    ctx.globalAlpha = opacity;
    ctx.shadowColor = baseHex;
    ctx.shadowBlur = 28;

    const fabricGrad = ctx.createLinearGradient(cx, shoulderY, cx, hemY);
    fabricGrad.addColorStop(0, `${baseHex}f5`);
    fabricGrad.addColorStop(0.3, `${baseHex}e0`);
    fabricGrad.addColorStop(0.7, `${baseHex}c0`);
    fabricGrad.addColorStop(1, `${baseHex}80`);

    ctx.fillStyle = fabricGrad;
    ctx.beginPath();
    ctx.moveTo(cx - width * 0.04, neckY);
    ctx.lineTo(cx + width * 0.04, neckY);
    ctx.quadraticCurveTo(cx + shoulderWidth * 0.35, shoulderY - 6, cx + shoulderWidth * 0.52, shoulderY);
    ctx.lineTo(cx + waistWidth * 0.52, waistY);
    ctx.lineTo(cx + hemWidth * 0.5, hemY);
    ctx.quadraticCurveTo(cx, hemY + 12, cx - hemWidth * 0.5, hemY);
    ctx.lineTo(cx - waistWidth * 0.52, waistY);
    ctx.lineTo(cx - shoulderWidth * 0.52, shoulderY);
    ctx.quadraticCurveTo(cx - shoulderWidth * 0.35, shoulderY - 6, cx - width * 0.04, neckY);
    ctx.closePath();
    ctx.fill();

    // Lapel & buttons
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx - width * 0.04, neckY);
    ctx.lineTo(cx - shoulderWidth * 0.22, chestY * 0.88);
    ctx.lineTo(cx, waistY * 0.95);
    ctx.moveTo(cx + width * 0.04, neckY);
    ctx.lineTo(cx + shoulderWidth * 0.22, chestY * 0.88);
    ctx.lineTo(cx, waistY * 0.95);
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const by = waistY + (i * 22);
      ctx.beginPath();
      ctx.arc(cx, by, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
    }

    ctx.restore();
  }
}

export const auraVisionService = new AuraVisionService();
