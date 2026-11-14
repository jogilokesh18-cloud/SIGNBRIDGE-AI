import { BodyAnalysisResult, BodyLandmark, SkinUndertone, BodySilhouette } from '@signbridge/shared-types';

export class AuraVisionService {
  /**
   * Samples center facial/torso pixels from the live video feed
   * to determine skin undertone and ambient color temperature.
   */
  sampleColorimetry(video: HTMLVideoElement): {
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
        return {
          skin_undertone: 'neutral_olive',
          lighting_kelvin: 3200,
          color_palette: ['#0b0f19', '#064e3b', '#d6c7b2', '#78350f']
        };
      }

      ctx.drawImage(video, 0, 0, 64, 64);
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

      // Color temperature heuristic
      const kelvin = Math.round(2000 + (b / Math.max(r, 1)) * 3000);

      // Undertone determination
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
      return {
        skin_undertone: 'neutral_olive',
        lighting_kelvin: 3200,
        color_palette: ['#0b0f19', '#064e3b', '#d6c7b2', '#78350f']
      };
    }
  }

  /**
   * Generates a 3D holographic pose & contour mesh over the live video canvas
   */
  drawHolographicMesh(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    garmentHex = '#d4af37'
  ) {
    ctx.save();

    const cx = width / 2;
    const shoulderY = height * 0.42;
    const shoulderWidth = width * 0.36;
    const chestY = height * 0.55;
    const waistY = height * 0.72;
    const waistWidth = shoulderWidth * 0.78;

    // Glowing contour lines
    ctx.strokeStyle = garmentHex;
    ctx.lineWidth = 2;
    ctx.shadowColor = garmentHex;
    ctx.shadowBlur = 12;

    // Left & Right shoulder curves
    ctx.beginPath();
    ctx.moveTo(cx - shoulderWidth / 2, shoulderY);
    ctx.lineTo(cx + shoulderWidth / 2, shoulderY);
    ctx.lineTo(cx + waistWidth / 2, waistY);
    ctx.lineTo(cx - waistWidth / 2, waistY);
    ctx.closePath();
    ctx.stroke();

    // Chest center-line and posture nodes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;

    const nodes = [
      { x: cx, y: shoulderY - height * 0.08, label: 'Cervical Apex' },
      { x: cx - shoulderWidth / 2, y: shoulderY, label: 'L-Acromion' },
      { x: cx + shoulderWidth / 2, y: shoulderY, label: 'R-Acromion' },
      { x: cx, y: chestY, label: 'Sternum Center' },
      { x: cx - waistWidth / 2, y: waistY, label: 'L-Waist' },
      { x: cx + waistWidth / 2, y: waistY, label: 'R-Waist' }
    ];

    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = garmentHex;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });

    ctx.restore();
  }
}

export const auraVisionService = new AuraVisionService();
