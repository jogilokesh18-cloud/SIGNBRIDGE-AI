import fs from 'fs';
import path from 'path';

const outDir = path.resolve('apps/client/public/assets/garments');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const garments = [
  {
    file: 'tuxedo_overlay.svg',
    title: 'Saint Laurent Tuxedo',
    render: `
      <!-- Tuxedo Jacket -->
      <defs>
        <linearGradient id="tuxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#181d29"/>
          <stop offset="50%" stop-color="#0b0f19"/>
          <stop offset="100%" stop-color="#05070c"/>
        </linearGradient>
        <linearGradient id="satinLapel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2d3748"/>
          <stop offset="50%" stop-color="#1a202c"/>
          <stop offset="100%" stop-color="#11151c"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#000000" flood-opacity="0.8"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <!-- White formal pleated dress shirt & bowtie -->
        <polygon points="210,70 290,70 270,190 230,190" fill="#f8fafc"/>
        <polygon points="238,90 262,90 250,110" fill="#0f172a"/>
        <!-- Bowtie -->
        <polygon points="220,95 242,105 220,115" fill="#0b0f19"/>
        <polygon points="280,95 258,105 280,115" fill="#0b0f19"/>
        <circle cx="250" cy="105" r="5" fill="#1e293b"/>
        
        <!-- Left Jacket Shoulder & Torso -->
        <path d="M 210,70 Q 130,85 70,120 L 95,300 L 190,440 L 250,440 L 250,220 Z" fill="url(#tuxGrad)"/>
        <!-- Right Jacket Shoulder & Torso -->
        <path d="M 290,70 Q 370,85 430,120 L 405,300 L 310,440 L 250,440 L 250,220 Z" fill="url(#tuxGrad)"/>
        
        <!-- Silk Peaked Lapels (Left & Right) -->
        <polygon points="210,70 140,160 175,175 250,240 230,180" fill="url(#satinLapel)" stroke="#fde047" stroke-width="0.75" stroke-opacity="0.4"/>
        <polygon points="290,70 360,160 325,175 250,240 270,180" fill="url(#satinLapel)" stroke="#fde047" stroke-width="0.75" stroke-opacity="0.4"/>
        
        <!-- Pocket Square (White Silk) -->
        <polygon points="140,210 175,200 170,220 135,225" fill="#0b0f19" stroke="#334155" stroke-width="1"/>
        <polygon points="145,200 155,185 165,202" fill="#ffffff"/>
        
        <!-- Single Satin Covered Button -->
        <circle cx="250" cy="275" r="7" fill="#0f172a" stroke="#d4af37" stroke-width="1.5"/>
        <circle cx="250" cy="320" r="6" fill="#0f172a" stroke="#475569" stroke-width="1"/>
      </g>
    `
  },
  {
    file: 'emerald_overlay.svg',
    title: 'The Row Emerald Slip & Blazer',
    render: `
      <defs>
        <linearGradient id="emGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#065f46"/>
          <stop offset="40%" stop-color="#047857"/>
          <stop offset="70%" stop-color="#064e3b"/>
          <stop offset="100%" stop-color="#022c22"/>
        </linearGradient>
        <linearGradient id="silkSheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#34d399" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#064e3b" stop-opacity="0.1"/>
        </linearGradient>
      </defs>
      <!-- Fluid silk cowl neckline slip -->
      <path d="M 200,85 Q 250,150 300,85 L 320,480 Q 250,510 180,480 Z" fill="url(#emGrad)"/>
      <path d="M 210,120 Q 250,165 290,120" stroke="#a7f3d0" stroke-width="2" fill="none" opacity="0.6"/>
      <!-- Relaxed fluid blazer drape -->
      <path d="M 200,85 Q 120,105 80,140 L 110,380 L 190,470 L 220,440 L 180,240 Z" fill="#022c22" opacity="0.9"/>
      <path d="M 300,85 Q 380,105 420,140 L 390,380 L 310,470 L 280,440 L 320,240 Z" fill="#022c22" opacity="0.9"/>
      <!-- Soft silk drape highlights -->
      <path d="M 230,220 Q 250,340 240,460" stroke="url(#silkSheen)" stroke-width="4" fill="none"/>
      <path d="M 270,220 Q 250,340 260,460" stroke="url(#silkSheen)" stroke-width="3" fill="none"/>
    `
  },
  {
    file: 'cashmere_overlay.svg',
    title: 'Loro Piana Cashmere Trench',
    render: `
      <defs>
        <linearGradient id="cashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e8dcce"/>
          <stop offset="50%" stop-color="#d6c7b2"/>
          <stop offset="100%" stop-color="#b8a791"/>
        </linearGradient>
      </defs>
      <!-- Wide convertible storm collar -->
      <path d="M 190,60 L 310,60 L 360,130 L 290,160 L 250,140 L 210,160 L 140,130 Z" fill="#cbb9a3" stroke="#8c7760" stroke-width="1.5"/>
      <!-- Double-Breasted Body -->
      <path d="M 190,60 Q 110,80 60,130 L 90,360 L 130,520 L 370,520 L 410,360 L 440,130 Q 390,80 310,60 Z" fill="url(#cashGrad)"/>
      <!-- Storm Flap (Right) -->
      <path d="M 280,110 L 390,130 L 360,250 L 270,220 Z" fill="#cbb9a3" stroke="#9a856e" stroke-width="1"/>
      <!-- Horn Buttons (Double row) -->
      <circle cx="215" cy="220" r="7" fill="#452718" stroke="#1f110a" stroke-width="2"/>
      <circle cx="285" cy="220" r="7" fill="#452718" stroke="#1f110a" stroke-width="2"/>
      <circle cx="215" cy="290" r="7" fill="#452718" stroke="#1f110a" stroke-width="2"/>
      <circle cx="285" cy="290" r="7" fill="#452718" stroke="#1f110a" stroke-width="2"/>
      <circle cx="215" cy="360" r="7" fill="#452718" stroke="#1f110a" stroke-width="2"/>
      <circle cx="285" cy="360" r="7" fill="#452718" stroke="#1f110a" stroke-width="2"/>
      <!-- Belt with buckle -->
      <rect x="140" y="380" width="220" height="24" rx="4" fill="#a8957e" stroke="#7d6a54" stroke-width="1.5"/>
      <rect x="235" y="375" width="30" height="34" rx="4" fill="none" stroke="#d4af37" stroke-width="3"/>
    `
  },
  {
    file: 'gown_overlay.svg',
    title: 'Rick Owens Draped Evening Gown',
    render: `
      <defs>
        <linearGradient id="rickGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#262626"/>
          <stop offset="50%" stop-color="#171717"/>
          <stop offset="100%" stop-color="#0a0a0a"/>
        </linearGradient>
      </defs>
      <!-- Sculptural funnel cowl neck -->
      <path d="M 210,40 Q 250,90 290,40 Q 270,110 210,40" fill="#404040"/>
      <!-- Architectural Statuesque Silhouette -->
      <path d="M 210,40 Q 150,70 120,110 L 150,300 L 180,450 L 150,560 Q 250,580 350,560 L 320,450 L 350,300 L 380,110 Q 350,70 290,40 Z" fill="url(#rickGrad)"/>
      <!-- High side slit drape -->
      <path d="M 320,380 L 350,560 L 310,560 Z" fill="#000000" opacity="0.6"/>
      <!-- Washed lambskin leather panel lines -->
      <path d="M 250,110 L 230,340 L 210,560" stroke="#525252" stroke-width="2" fill="none"/>
      <path d="M 250,110 L 270,340 L 290,560" stroke="#525252" stroke-width="2" fill="none"/>
    `
  },
  {
    file: 'parka_overlay.svg',
    title: 'Prada Linea Rossa Storm Parka',
    render: `
      <defs>
        <linearGradient id="parkaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3f3f46"/>
          <stop offset="50%" stop-color="#27272a"/>
          <stop offset="100%" stop-color="#18181b"/>
        </linearGradient>
      </defs>
      <!-- Storm Collar with Hood silhouette -->
      <path d="M 190,50 L 310,50 L 340,110 L 160,110 Z" fill="#18181b"/>
      <!-- Articulated Boxy Shell -->
      <path d="M 180,70 Q 100,90 50,130 L 75,340 L 120,480 L 380,480 L 425,340 L 450,130 Q 400,90 320,70 Z" fill="url(#parkaGrad)"/>
      <!-- Center Waterproof Zipper -->
      <line x1="250" y1="50" x2="250" y2="480" stroke="#71717a" stroke-width="4"/>
      <!-- Prada Iconic Red Stripe Emblem on chest -->
      <rect x="330" y="210" width="8" height="50" rx="2" fill="#ef4444"/>
      <!-- Taped horizontal storm pockets -->
      <rect x="120" y="280" width="85" height="12" rx="3" fill="#18181b" stroke="#71717a" stroke-width="1"/>
      <rect x="295" y="280" width="85" height="12" rx="3" fill="#18181b" stroke="#71717a" stroke-width="1"/>
    `
  },
  {
    file: 'kimono_overlay.svg',
    title: 'Visvim Raw Indigo Chore Kimono',
    render: `
      <defs>
        <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a"/>
          <stop offset="50%" stop-color="#172554"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <!-- Wide kimono collar band -->
      <polygon points="170,70 210,70 310,320 280,320" fill="#1e40af"/>
      <polygon points="330,70 290,70 190,320 220,320" fill="#1e3a8a"/>
      <!-- Kimono Body & Wide Sleeves -->
      <path d="M 170,70 Q 90,85 30,130 L 60,320 L 130,470 L 370,470 L 440,320 L 470,130 Q 410,85 330,70 Z" fill="url(#indigoGrad)"/>
      <!-- Sashiko white hand-stitched reinforcement dots -->
      <g stroke="#ffffff" stroke-width="2" stroke-dasharray="3,4" opacity="0.75">
        <line x1="160" y1="120" x2="200" y2="120"/>
        <line x1="160" y1="130" x2="200" y2="130"/>
        <line x1="300" y1="120" x2="340" y2="120"/>
        <line x1="300" y1="130" x2="340" y2="130"/>
      </g>
    `
  },
  {
    file: 'cape_overlay.svg',
    title: 'Hermès Reversible Cashmere Cape',
    render: `
      <defs>
        <linearGradient id="hermGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d97706"/>
          <stop offset="50%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
      </defs>
      <!-- Sweeping Cocoon Cape Silhouette -->
      <path d="M 210,65 Q 250,95 290,65 Q 430,95 470,220 L 430,460 Q 250,510 70,460 L 30,220 Q 70,95 210,65 Z" fill="url(#hermGrad)"/>
      <!-- Calfskin Toggle Fastener at Neck -->
      <rect x="230" y="115" width="40" height="12" rx="3" fill="#451a03" stroke="#d4af37" stroke-width="1.5"/>
      <circle cx="238" cy="121" r="3" fill="#d4af37"/>
      <circle cx="262" cy="121" r="3" fill="#d4af37"/>
      <!-- Oatmeal cashmere reverse trim hem -->
      <path d="M 70,460 Q 250,510 430,460 L 435,475 Q 250,525 65,475 Z" fill="#fef3c7"/>
    `
  },
  {
    file: 'bar_jacket_overlay.svg',
    title: 'Dior Hourglass Peplum Bar Jacket',
    render: `
      <defs>
        <linearGradient id="diorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#44403c"/>
          <stop offset="50%" stop-color="#292524"/>
          <stop offset="100%" stop-color="#1c1917"/>
        </linearGradient>
      </defs>
      <!-- Sculpted Notch Collar -->
      <polygon points="210,75 250,135 290,75 270,140 230,140" fill="#1c1917"/>
      <!-- Extreme Hourglass Torso with Padded Basques -->
      <path d="M 210,75 Q 130,95 80,135 L 110,260 L 190,310 L 120,440 Q 250,460 380,440 L 310,310 L 390,260 L 420,135 Q 370,95 290,75 Z" fill="url(#diorGrad)"/>
      <!-- Houndstooth Texture Lines -->
      <g stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="2,3">
        <line x1="120" y1="360" x2="380" y2="360"/>
        <line x1="130" y1="390" x2="370" y2="390"/>
        <line x1="140" y1="420" x2="360" y2="420"/>
      </g>
      <!-- Covered Buttons along pinched waist -->
      <circle cx="250" cy="240" r="5" fill="#1c1917" stroke="#a8a29e" stroke-width="1"/>
      <circle cx="250" cy="275" r="5" fill="#1c1917" stroke="#a8a29e" stroke-width="1"/>
      <circle cx="250" cy="310" r="5" fill="#1c1917" stroke="#a8a29e" stroke-width="1"/>
    `
  },
  {
    file: 'leather_trench_overlay.svg',
    title: 'Bottega Veneta Intrecciato Trench',
    render: `
      <defs>
        <linearGradient id="bvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#15803d"/>
          <stop offset="50%" stop-color="#166534"/>
          <stop offset="100%" stop-color="#14532d"/>
        </linearGradient>
      </defs>
      <!-- Leather Trench Collar -->
      <polygon points="190,70 310,70 350,140 280,170 250,150 220,170 150,140" fill="#14532d" stroke="#22c55e" stroke-width="1"/>
      <!-- Body with Intrecciato weave yoke -->
      <path d="M 190,70 Q 110,90 60,135 L 90,340 L 130,500 L 370,500 L 410,340 L 440,135 Q 390,90 310,70 Z" fill="url(#bvGrad)"/>
      <!-- Intrecciato crosshatch pattern on chest yoke -->
      <g stroke="#14532d" stroke-width="2" opacity="0.6">
        <line x1="160" y1="130" x2="340" y2="130"/>
        <line x1="160" y1="150" x2="340" y2="150"/>
        <line x1="160" y1="170" x2="340" y2="170"/>
        <line x1="200" y1="120" x2="200" y2="190"/>
        <line x1="250" y1="120" x2="250" y2="190"/>
        <line x1="300" y1="120" x2="300" y2="190"/>
      </g>
      <!-- Belt & gunmetal buckle -->
      <rect x="140" y="360" width="220" height="26" fill="#14532d" stroke="#4ade80" stroke-width="1"/>
      <rect x="235" y="355" width="30" height="36" fill="none" stroke="#94a3b8" stroke-width="3"/>
    `
  },
  {
    file: 'cable_knit_overlay.svg',
    title: 'Margiela Deconstructed Cable-Knit',
    render: `
      <defs>
        <linearGradient id="knitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="50%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
      </defs>
      <!-- Chunky rolled mockneck -->
      <rect x="200" y="60" width="100" height="35" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
      <!-- Chunky Knit Body with Asymmetric Hem -->
      <path d="M 200,80 Q 110,95 60,135 L 90,350 L 140,490 L 390,440 L 410,350 L 440,135 Q 390,95 300,80 Z" fill="url(#knitGrad)"/>
      <!-- Vertical Cable Twist Patterns -->
      <g stroke="#94a3b8" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M 190,110 Q 180,180 190,260 Q 200,340 190,420"/>
        <path d="M 250,110 Q 240,180 250,260 Q 260,340 250,420"/>
        <path d="M 310,110 Q 300,180 310,260 Q 320,340 310,420"/>
      </g>
      <!-- Four White Stitches on Nape -->
      <g stroke="#0f172a" stroke-width="2">
        <line x1="230" y1="72" x2="236" y2="72"/>
        <line x1="264" y1="72" x2="270" y2="72"/>
        <line x1="230" y1="84" x2="236" y2="84"/>
        <line x1="264" y1="84" x2="270" y2="84"/>
      </g>
    `
  },
  {
    file: 'gold_gown_overlay.svg',
    title: 'Schiaparelli Gilded Sunburst Gown',
    render: `
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="40%" stop-color="#eab308"/>
          <stop offset="70%" stop-color="#ca8a04"/>
          <stop offset="100%" stop-color="#854d0e"/>
        </linearGradient>
      </defs>
      <!-- Hammered Gilded Breastplate -->
      <ellipse cx="250" cy="150" rx="60" ry="40" fill="url(#goldGrad)" stroke="#fef08a" stroke-width="2"/>
      <!-- Sunburst Accordion Pleated Skirt & Capelet -->
      <path d="M 210,70 Q 250,90 290,70 L 440,480 Q 250,540 60,480 Z" fill="url(#goldGrad)" opacity="0.95"/>
      <!-- Radiating Pleat Lines -->
      <g stroke="#fef9c3" stroke-width="1.5" opacity="0.7">
        <line x1="250" y1="150" x2="100" y2="490"/>
        <line x1="250" y1="150" x2="150" y2="505"/>
        <line x1="250" y1="150" x2="200" y2="515"/>
        <line x1="250" y1="150" x2="250" y2="520"/>
        <line x1="250" y1="150" x2="300" y2="515"/>
        <line x1="250" y1="150" x2="350" y2="505"/>
        <line x1="250" y1="150" x2="400" y2="490"/>
      </g>
    `
  },
  {
    file: 'smoking_overlay.svg',
    title: 'Tom Ford Bordeaux Smoking Jacket',
    render: `
      <defs>
        <linearGradient id="smokGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#701a75"/>
          <stop offset="50%" stop-color="#581c87"/>
          <stop offset="100%" stop-color="#3b0764"/>
        </linearGradient>
      </defs>
      <!-- White formal dress shirt notch -->
      <polygon points="220,70 280,70 260,180 240,180" fill="#f8fafc"/>
      <polygon points="242,95 258,95 250,110" fill="#0b0f19"/>
      <!-- Bordeaux Velvet Body -->
      <path d="M 210,70 Q 130,85 70,120 L 95,300 L 190,440 L 250,440 L 250,220 Z" fill="url(#smokGrad)"/>
      <path d="M 290,70 Q 370,85 430,120 L 405,300 L 310,440 L 250,440 L 250,220 Z" fill="url(#smokGrad)"/>
      <!-- Black Silk Shawl Collar -->
      <path d="M 210,70 Q 160,150 250,240 Q 340,150 290,70 Z" fill="#0b0f19" stroke="#d4af37" stroke-width="1"/>
      <!-- Horn Link Closure Button -->
      <circle cx="250" cy="265" r="7" fill="#451a03" stroke="#d4af37" stroke-width="1.5"/>
    `
  },
  {
    file: 'linen_overlay.svg',
    title: 'Jacquemus Riviera Linen Shirt',
    render: `
      <defs>
        <linearGradient id="linGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fffbeb"/>
          <stop offset="50%" stop-color="#fef3c7"/>
          <stop offset="100%" stop-color="#fde68a"/>
        </linearGradient>
      </defs>
      <!-- Open Relaxed Camp Collar -->
      <polygon points="190,70 230,140 250,110 270,140 310,70 250,85" fill="#fef3c7" stroke="#d97706" stroke-width="1"/>
      <!-- Relaxed Boxy Shirt Body -->
      <path d="M 190,70 Q 110,85 60,130 L 90,330 L 140,460 L 360,460 L 410,330 L 440,130 Q 390,85 310,70 Z" fill="url(#linGrad)"/>
      <!-- Mother of Pearl buttons -->
      <circle cx="250" cy="180" r="5" fill="#ffffff" stroke="#d97706" stroke-width="1"/>
      <circle cx="250" cy="240" r="5" fill="#ffffff" stroke="#d97706" stroke-width="1"/>
      <circle cx="250" cy="300" r="5" fill="#ffffff" stroke="#d97706" stroke-width="1"/>
      <circle cx="250" cy="360" r="5" fill="#ffffff" stroke="#d97706" stroke-width="1"/>
    `
  },
  {
    file: 'cocoon_overlay.svg',
    title: 'Balenciaga Cocoon Puffer',
    render: `
      <defs>
        <linearGradient id="pufferGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#64748b"/>
          <stop offset="50%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
      </defs>
      <!-- Pillow Storm Collar -->
      <ellipse cx="250" cy="65" rx="75" ry="30" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
      <!-- Volumetric Cocoon Silhouette with Horizontal Down Baffles -->
      <path d="M 180,65 Q 80,95 30,150 L 50,330 L 110,470 Q 250,510 390,470 L 450,330 L 470,150 Q 420,95 320,65 Z" fill="url(#pufferGrad)"/>
      <!-- Baffle Segments -->
      <g stroke="#1e293b" stroke-width="3" opacity="0.6">
        <path d="M 50,170 Q 250,210 450,170"/>
        <path d="M 60,250 Q 250,290 440,250"/>
        <path d="M 80,330 Q 250,370 420,330"/>
        <path d="M 100,410 Q 250,440 400,410"/>
      </g>
    `
  }
];

garments.forEach((g) => {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600" width="500" height="600">
  <!-- ${g.title} Haute Couture Try-On Overlay -->
  ${g.render.trim()}
</svg>`;
  fs.writeFileSync(path.join(outDir, g.file), svgContent, 'utf8');
});

console.log(`Generated ${garments.length} haute couture try-on overlays in ${outDir}`);
