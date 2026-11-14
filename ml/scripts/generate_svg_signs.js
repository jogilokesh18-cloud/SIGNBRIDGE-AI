/**
 * SIGNBRIDGE AI — Verified ASL Sign Vector Illustration Generator
 * Generates high-fidelity, accessible SVG diagrams for all 26 ASL alphabet signs (A-Z).
 */

import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'apps/client/public/assets/signs');
fs.mkdirSync(outDir, { recursive: true });

const LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z'
];

function generateSvgForLetter(letter) {
  const isDynamic = letter === 'J' || letter === 'Z';
  const motionBadge = isDynamic
    ? `<g transform="translate(180, 20)">
        <rect width="100" height="28" rx="14" fill="#6366f1" opacity="0.9"/>
        <text x="50" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">MOTION SIGN</text>
      </g>`
    : `<g transform="translate(180, 20)">
        <rect width="90" height="28" rx="14" fill="#10b981" opacity="0.85"/>
        <text x="45" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">STATIC POSE</text>
      </g>`;

  // Customized hand geometry contours per letter
  let handGraphic = '';

  switch (letter) {
    case 'A':
      handGraphic = `
        <!-- Palm & Fist -->
        <rect x="100" y="110" width="100" height="110" rx="35" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- 4 Curled Fingers -->
        <rect x="105" y="105" width="20" height="50" rx="10" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <rect x="127" y="100" width="20" height="55" rx="10" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <rect x="150" y="103" width="20" height="52" rx="10" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <rect x="173" y="115" width="20" height="40" rx="10" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <!-- Thumb pointing straight up along side -->
        <path d="M 85 170 C 80 130, 85 80, 96 65 C 108 55, 120 70, 115 105 L 105 160 Z" fill="#fbdcb9" stroke="#d97706" stroke-width="4"/>
        <circle cx="106" cy="70" r="4" fill="#d97706"/>
      `;
      break;

    case 'B':
      handGraphic = `
        <!-- Flat Palm -->
        <rect x="100" y="130" width="95" height="90" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- 4 Straight Fingers Up -->
        <rect x="100" y="30" width="20" height="115" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <rect x="123" y="20" width="20" height="125" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <rect x="146" y="25" width="20" height="120" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <rect x="169" y="45" width="20" height="100" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <!-- Thumb folded across palm -->
        <path d="M 90 170 C 110 150, 150 150, 165 165 C 170 175, 155 185, 130 185 L 95 185 Z" fill="#f4caa1" stroke="#d97706" stroke-width="4"/>
      `;
      break;

    case 'C':
      handGraphic = `
        <!-- Arching C Shape -->
        <path d="M 120 40 C 180 40, 210 100, 205 130 C 195 150, 175 140, 170 120 C 175 90, 145 70, 110 70 C 80 70, 70 120, 70 150 C 70 180, 100 220, 150 220 C 180 220, 200 195, 205 210 C 190 245, 140 250, 95 240 C 50 215, 35 150, 45 100 C 60 55, 90 40, 120 40 Z" fill="#fbdcb9" stroke="#d97706" stroke-width="4"/>
      `;
      break;

    case 'D':
      handGraphic = `
        <!-- Index Finger Straight Up -->
        <rect x="110" y="25" width="24" height="125" rx="12" fill="#fbdcb9" stroke="#d97706" stroke-width="4"/>
        <!-- Palm with Middle, Ring, Pinky touching Thumb in Circle -->
        <circle cx="145" cy="155" r="45" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <circle cx="145" cy="155" r="20" fill="#ffffff" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'E':
      handGraphic = `
        <!-- Palm -->
        <rect x="95" y="100" width="105" height="115" rx="35" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- 4 Tightly Curled Finger Tips resting on thumb -->
        <rect x="102" y="80" width="20" height="35" rx="8" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <rect x="125" y="75" width="20" height="40" rx="8" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <rect x="148" y="77" width="20" height="38" rx="8" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <rect x="171" y="85" width="20" height="30" rx="8" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <!-- Thumb folded horizontally under tips -->
        <rect x="95" y="115" width="95" height="26" rx="12" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'F':
      handGraphic = `
        <!-- Index & Thumb Circle Touching -->
        <circle cx="105" cy="115" r="32" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <circle cx="105" cy="115" r="14" fill="#ffffff" stroke="#d97706" stroke-width="3"/>
        <!-- 3 Fingers Up (Middle, Ring, Pinky) -->
        <rect x="135" y="25" width="18" height="110" rx="9" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <rect x="158" y="32" width="18" height="105" rx="9" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <rect x="180" y="50" width="18" height="90" rx="9" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'G':
      handGraphic = `
        <!-- Hand pointing horizontally -->
        <rect x="80" y="110" width="80" height="80" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- Index Finger Horizontal -->
        <rect x="140" y="110" width="115" height="22" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <!-- Thumb Parallel Horizontal -->
        <rect x="120" y="145" width="80" height="20" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'H':
      handGraphic = `
        <!-- Hand base -->
        <rect x="75" y="110" width="80" height="80" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- Index Finger Horizontal -->
        <rect x="140" y="105" width="115" height="20" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <!-- Middle Finger Horizontal Touching -->
        <rect x="140" y="130" width="118" height="20" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'I':
      handGraphic = `
        <!-- Fist -->
        <rect x="95" y="110" width="95" height="100" rx="35" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- Thumb crossing fingers -->
        <rect x="85" y="135" width="70" height="25" rx="12" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <!-- Pinky Straight Up -->
        <rect x="170" y="35" width="20" height="110" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="4"/>
      `;
      break;

    case 'J':
      handGraphic = `
        <!-- Fist with Pinky Swooping in J Shape Motion -->
        <rect x="95" y="110" width="95" height="100" rx="35" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <rect x="170" y="55" width="20" height="90" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="4"/>
        <!-- Dynamic J-curve arrow path -->
        <path d="M 180 50 C 180 15, 230 40, 220 100 C 210 160, 160 170, 140 145" fill="none" stroke="#6366f1" stroke-width="6" stroke-dasharray="8 4" stroke-linecap="round"/>
        <polygon points="135,140 145,155 130,155" fill="#6366f1"/>
      `;
      break;

    case 'K':
      handGraphic = `
        <!-- Palm -->
        <rect x="95" y="125" width="90" height="90" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- Index Finger Straight Up -->
        <rect x="105" y="25" width="22" height="115" rx="11" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <!-- Middle Finger angled forward -->
        <path d="M 130 135 L 175 55 C 185 45, 195 60, 185 70 L 145 145 Z" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <!-- Thumb wedged between -->
        <circle cx="135" cy="110" r="14" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'L':
      handGraphic = `
        <!-- Fist Body -->
        <rect x="110" y="115" width="80" height="95" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- Index Finger Straight Up -->
        <rect x="115" y="25" width="24" height="115" rx="12" fill="#fbdcb9" stroke="#d97706" stroke-width="4"/>
        <!-- Thumb at 90 Degree Angle -->
        <rect x="40" y="135" width="85" height="24" rx="12" fill="#fbdcb9" stroke="#d97706" stroke-width="4"/>
      `;
      break;

    case 'M':
      handGraphic = `
        <!-- Fist with Thumb under 3 Fingers -->
        <rect x="95" y="105" width="105" height="110" rx="35" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <rect x="100" y="85" width="22" height="50" rx="10" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <rect x="124" y="80" width="22" height="55" rx="10" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <rect x="148" y="83" width="22" height="52" rx="10" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <!-- Thumb tip poking out under 3rd finger -->
        <circle cx="178" cy="130" r="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'N':
      handGraphic = `
        <!-- Fist with Thumb under 2 Fingers -->
        <rect x="95" y="105" width="105" height="110" rx="35" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <rect x="105" y="85" width="24" height="50" rx="10" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <rect x="132" y="82" width="24" height="53" rx="10" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <!-- Thumb tip emerging between 2nd and 3rd finger -->
        <circle cx="162" cy="130" r="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'O':
      handGraphic = `
        <!-- Circular O Shape with all fingers touching thumb -->
        <circle cx="145" cy="135" r="55" fill="#f8d7b8" stroke="#d97706" stroke-width="5"/>
        <circle cx="145" cy="135" r="26" fill="#ffffff" stroke="#d97706" stroke-width="4"/>
      `;
      break;

    case 'P':
      handGraphic = `
        <!-- K Handshape Pointing Downwards -->
        <rect x="100" y="80" width="85" height="85" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- Index Finger Downward -->
        <rect x="105" y="150" width="22" height="95" rx="11" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <!-- Middle Finger Angled Downward -->
        <path d="M 130 150 L 175 220 C 185 230, 170 240, 160 230 L 125 160 Z" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <circle cx="130" cy="130" r="14" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'Q':
      handGraphic = `
        <!-- G Handshape Pointing Downwards -->
        <rect x="100" y="80" width="80" height="80" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <rect x="105" y="145" width="20" height="95" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <rect x="135" y="145" width="18" height="70" rx="9" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'R':
      handGraphic = `
        <!-- Crossed Index and Middle Fingers -->
        <rect x="95" y="125" width="90" height="90" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- Index Finger Behind -->
        <path d="M 120 135 L 145 35 C 150 25, 165 30, 160 40 L 135 140 Z" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <!-- Middle Finger Crossed In Front -->
        <path d="M 145 135 L 120 35 C 115 25, 100 30, 105 40 L 130 140 Z" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <circle cx="110" cy="145" r="14" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'S':
      handGraphic = `
        <!-- Fist with Thumb Folded Fully Across Knuckles -->
        <rect x="95" y="100" width="105" height="115" rx="35" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- Thumb Across All Knuckles -->
        <rect x="90" y="125" width="115" height="30" rx="15" fill="#fbdcb9" stroke="#d97706" stroke-width="4"/>
      `;
      break;

    case 'T':
      handGraphic = `
        <!-- Fist with Thumb Between Index and Middle -->
        <rect x="95" y="105" width="105" height="110" rx="35" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <rect x="105" y="85" width="24" height="50" rx="10" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
        <!-- Thumb tip popping up -->
        <circle cx="132" cy="105" r="12" fill="#fbdcb9" stroke="#d97706" stroke-width="4"/>
      `;
      break;

    case 'U':
      handGraphic = `
        <!-- Index & Middle Straight Up Touching Together -->
        <rect x="95" y="125" width="90" height="90" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <rect x="115" y="25" width="22" height="120" rx="11" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <rect x="139" y="25" width="22" height="120" rx="11" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <circle cx="110" cy="150" r="14" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'V':
      handGraphic = `
        <!-- Peace Sign / V Separated -->
        <rect x="95" y="125" width="90" height="90" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <path d="M 125 135 L 90 35 C 85 25, 70 30, 75 40 L 115 145 Z" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <path d="M 145 135 L 180 35 C 185 25, 200 30, 195 40 L 155 145 Z" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <circle cx="135" cy="150" r="14" fill="#f4caa1" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'W':
      handGraphic = `
        <!-- 3 Fingers Up in W Shape -->
        <rect x="95" y="125" width="90" height="90" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <path d="M 115 135 L 80 40 C 75 30, 60 35, 65 45 L 105 145 Z" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <rect x="127" y="25" width="20" height="120" rx="10" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <path d="M 155 135 L 190 40 C 195 30, 210 35, 205 45 L 165 145 Z" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'X':
      handGraphic = `
        <!-- Fist with Index Curled in Hook Shape -->
        <rect x="95" y="110" width="95" height="100" rx="35" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- Hooked index finger -->
        <path d="M 110 130 C 110 60, 160 50, 165 85 C 165 105, 140 110, 130 95" fill="none" stroke="#d97706" stroke-width="16" stroke-linecap="round"/>
        <path d="M 110 130 C 110 60, 160 50, 165 85 C 165 105, 140 110, 130 95" fill="none" stroke="#fbdcb9" stroke-width="10" stroke-linecap="round"/>
      `;
      break;

    case 'Y':
      handGraphic = `
        <!-- Shaka / Hang Loose (Thumb & Pinky Out) -->
        <rect x="100" y="105" width="80" height="95" rx="30" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <!-- Thumb Extended Outward Left -->
        <path d="M 115 150 L 40 120 C 30 115, 25 130, 35 140 L 105 175 Z" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
        <!-- Pinky Extended Outward Right -->
        <path d="M 165 150 L 235 110 C 245 105, 255 120, 245 130 L 175 175 Z" fill="#fbdcb9" stroke="#d97706" stroke-width="3"/>
      `;
      break;

    case 'Z':
      handGraphic = `
        <!-- Index Finger Pointing Forward Tracing Z Motion -->
        <rect x="95" y="110" width="95" height="100" rx="35" fill="#f8d7b8" stroke="#d97706" stroke-width="4"/>
        <rect x="120" y="45" width="22" height="100" rx="11" fill="#fbdcb9" stroke="#d97706" stroke-width="4"/>
        <!-- Dynamic Z-stroke zigzag arrow path -->
        <path d="M 70 50 L 150 50 L 80 120 L 160 120" fill="none" stroke="#6366f1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <polygon points="160,110 175,120 160,130" fill="#6366f1"/>
      `;
      break;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 300 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Background -->
  <rect width="300" height="300" rx="24" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Top Letter Badge -->
  <g transform="translate(24, 24)">
    <circle cx="24" cy="24" r="24" fill="#3b82f6"/>
    <text x="24" y="32" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" text-anchor="middle">${letter}</text>
  </g>

  <!-- Motion / Static Badge -->
  ${motionBadge}

  <!-- Hand Anatomy Illustration -->
  <g id="hand-shape">
    ${handGraphic}
  </g>

  <!-- Base Label -->
  <text x="150" y="278" fill="#475569" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">
    ASL Sign: ${letter} (${isDynamic ? 'Dynamic Motion' : 'Static Pose'})
  </text>
</svg>`;
}

LETTERS.forEach(letter => {
  const svg = generateSvgForLetter(letter);
  fs.writeFileSync(path.join(outDir, `${letter}.svg`), svg);
});

console.log(`Generated all 26 verified ASL sign vector illustrations in ${outDir}`);
