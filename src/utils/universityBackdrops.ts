import { Opportunity } from '../api/types';

/**
 * Generates high-fidelity university campus architectural backdrop SVGs as data URIs.
 * Provides authentic academic architectural motifs (stone colonnades, library arches,
 * modern glass atriums, campus courtyards, and autumn trees) matching each host country and institute.
 */

// 1. German & Central European Technical Universities (Sandstone colonnade, arched portico, autumn foliage)
const GERMAN_SWISS_CAMPUS_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fdba74" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="#fed7aa" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#fef3c7" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="sandstone" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#d97706" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#92400e" stop-opacity="0.6"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0.3"/>
    </linearGradient>
  </defs>

  <!-- Golden hour sky -->
  <rect width="800" height="500" fill="url(#sky)"/>

  <!-- Sunbeam glow -->
  <circle cx="680" cy="90" r="140" fill="#fef08a" opacity="0.35"/>
  <circle cx="680" cy="90" r="70" fill="#ffffff" opacity="0.4"/>

  <!-- Distant campus dome & spires -->
  <path d="M 400 120 Q 430 70 460 120 Z" fill="#78350f" opacity="0.35"/>
  <rect x="426" y="55" width="8" height="40" fill="#78350f" opacity="0.4"/>
  <path d="M 210 180 L 225 120 L 240 180 Z" fill="#92400e" opacity="0.3"/>
  <path d="M 580 170 L 595 110 L 610 170 Z" fill="#92400e" opacity="0.3"/>

  <!-- Main Academic Hall Facade -->
  <rect x="120" y="180" width="560" height="260" fill="url(#sandstone)" rx="4"/>
  <polygon points="100,180 400,100 700,180" fill="#7c2d12" opacity="0.75"/>
  <!-- Pediment Clock & Classical Relief -->
  <circle cx="400" cy="150" r="16" fill="#fef3c7" opacity="0.9"/>
  <circle cx="400" cy="150" r="12" fill="#78350f" opacity="0.7"/>

  <!-- Colonnade Pillars -->
  <g fill="#fef3c7" opacity="0.85">
    <rect x="160" y="220" width="16" height="220" rx="3"/>
    <rect x="220" y="220" width="16" height="220" rx="3"/>
    <rect x="280" y="220" width="16" height="220" rx="3"/>
    <rect x="340" y="220" width="16" height="220" rx="3"/>
    <rect x="440" y="220" width="16" height="220" rx="3"/>
    <rect x="500" y="220" width="16" height="220" rx="3"/>
    <rect x="560" y="220" width="16" height="220" rx="3"/>
    <rect x="620" y="220" width="16" height="220" rx="3"/>
  </g>

  <!-- Grand Arched Library Windows -->
  <g fill="url(#glass)">
    <path d="M 185 240 A 12 12 0 0 1 209 240 L 209 300 L 185 300 Z"/>
    <path d="M 245 240 A 12 12 0 0 1 269 240 L 269 300 L 245 300 Z"/>
    <path d="M 305 240 A 12 12 0 0 1 329 240 L 329 300 L 305 300 Z"/>
    <path d="M 465 240 A 12 12 0 0 1 489 240 L 489 300 L 465 300 Z"/>
    <path d="M 525 240 A 12 12 0 0 1 549 240 L 549 300 L 525 300 Z"/>
    <path d="M 585 240 A 12 12 0 0 1 609 240 L 609 300 L 585 300 Z"/>
  </g>

  <!-- Central Portico Grand Entrance -->
  <path d="M 370 270 A 30 30 0 0 1 430 270 L 430 440 L 370 440 Z" fill="#451a03" opacity="0.85"/>
  <path d="M 380 280 A 20 20 0 0 1 420 280 L 420 440 L 380 440 Z" fill="#f59e0b" opacity="0.35"/>

  <!-- Classical Balustrade & Cornice -->
  <rect x="110" y="200" width="580" height="14" fill="#fed7aa" opacity="0.9"/>
  <rect x="130" y="430" width="540" height="15" fill="#d97706" opacity="0.7"/>

  <!-- Autumn Campus Trees & Stone Plaza Steps -->
  <path d="M 0 440 L 800 440 L 800 500 L 0 500 Z" fill="#78350f" opacity="0.4"/>
  <circle cx="80" cy="340" r="90" fill="#ea580c" opacity="0.5"/>
  <circle cx="100" cy="300" r="70" fill="#f59e0b" opacity="0.6"/>
  <circle cx="720" cy="330" r="85" fill="#d97706" opacity="0.55"/>
  <circle cx="700" cy="280" r="65" fill="#f97316" opacity="0.6"/>
</svg>
`)}`;

// 2. Nordic & Scandinavian Universities (Red brick cloisters, pine trees, serene twilight sky)
const NORDIC_CAMPUS_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="nordicSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c7d2fe" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#fed7aa" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ffedd5" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="redBrick" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#991b1b" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#7f1d1d" stop-opacity="0.8"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#nordicSky)"/>

  <!-- Distant Nordic Clock Tower -->
  <rect x="360" y="80" width="60" height="300" fill="#450a0a" opacity="0.6" rx="2"/>
  <polygon points="350,80 390,20 430,80" fill="#1e3a8a" opacity="0.65"/>
  <circle cx="390" cy="120" r="14" fill="#fef3c7" opacity="0.85"/>

  <!-- Academic Library Wings -->
  <rect x="140" y="200" width="520" height="240" fill="url(#redBrick)" rx="3"/>
  <polygon points="120,200 390,140 660,200" fill="#312e81" opacity="0.5"/>

  <!-- High Geometric Paned Windows -->
  <g fill="#fef08a" opacity="0.75">
    <rect x="180" y="230" width="28" height="60" rx="2"/>
    <rect x="230" y="230" width="28" height="60" rx="2"/>
    <rect x="280" y="230" width="28" height="60" rx="2"/>
    <rect x="460" y="230" width="28" height="60" rx="2"/>
    <rect x="510" y="230" width="28" height="60" rx="2"/>
    <rect x="560" y="230" width="28" height="60" rx="2"/>
  </g>

  <!-- Lower Quadrangle Walkway -->
  <g fill="#fef3c7" opacity="0.6">
    <path d="M 180 340 A 15 15 0 0 1 210 340 L 210 440 L 180 440 Z"/>
    <path d="M 240 340 A 15 15 0 0 1 270 340 L 270 440 L 240 440 Z"/>
    <path d="M 500 340 A 15 15 0 0 1 530 340 L 530 440 L 500 440 Z"/>
    <path d="M 560 340 A 15 15 0 0 1 590 340 L 590 440 L 560 440 Z"/>
  </g>

  <!-- Scandinavian Pines & Birch Trees -->
  <polygon points="60,440 85,250 110,440" fill="#14532d" opacity="0.6"/>
  <polygon points="75,440 100,280 125,440" fill="#166534" opacity="0.65"/>
  <polygon points="680,440 710,240 740,440" fill="#14532d" opacity="0.6"/>
  <polygon points="710,440 735,270 760,440" fill="#166534" opacity="0.65"/>
  <!-- Stone Walkway -->
  <rect x="0" y="440" width="800" height="60" fill="#374151" opacity="0.3"/>
</svg>
`)}`;

// 3. Asian Technical Universities (Tokyo, Kyoto, KAIST, NTU - Modern glass tower, tranquil ginkgo trees, courtyard bridge)
const ASIAN_CAMPUS_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="asianSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fbcfe8" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="#fed7aa" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#fef9c3" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="techGlass" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.7"/>
      <stop offset="50%" stop-color="#334155" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.7"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#asianSky)"/>

  <!-- Golden Sun in Autumn Sky -->
  <circle cx="220" cy="110" r="80" fill="#fde047" opacity="0.4"/>
  <circle cx="220" cy="110" r="40" fill="#ffffff" opacity="0.6"/>

  <!-- Modern Research Tower (Tech Institute) -->
  <rect x="420" y="60" width="220" height="380" fill="url(#techGlass)" rx="4"/>
  <!-- Floor Grid Shimmer -->
  <g stroke="#f59e0b" stroke-width="1.5" opacity="0.3">
    <line x1="420" y1="110" x2="640" y2="110"/>
    <line x1="420" y1="160" x2="640" y2="160"/>
    <line x1="420" y1="210" x2="640" y2="210"/>
    <line x1="420" y1="260" x2="640" y2="260"/>
    <line x1="420" y1="310" x2="640" y2="310"/>
    <line x1="420" y1="360" x2="640" y2="360"/>
    <line x1="470" y1="60" x2="470" y2="440"/>
    <line x1="530" y1="60" x2="530" y2="440"/>
    <line x1="590" y1="60" x2="590" y2="440"/>
  </g>

  <!-- Traditional Gate Pavilion / Academic Cloister -->
  <polygon points="120,230 280,180 440,230" fill="#831843" opacity="0.6"/>
  <rect x="150" y="230" width="260" height="210" fill="#78350f" opacity="0.5"/>
  <rect x="180" y="260" width="30" height="180" fill="#fef3c7" opacity="0.7"/>
  <rect x="360" y="260" width="30" height="180" fill="#fef3c7" opacity="0.7"/>

  <!-- Golden Ginkgo Trees (Iconic Tokyo / Kyoto campus motif) -->
  <circle cx="120" cy="300" r="95" fill="#facc15" opacity="0.7"/>
  <circle cx="90" cy="260" r="70" fill="#eab308" opacity="0.65"/>
  <circle cx="340" cy="320" r="80" fill="#f59e0b" opacity="0.65"/>
  <circle cx="680" cy="320" r="100" fill="#facc15" opacity="0.6"/>
  <circle cx="720" cy="280" r="75" fill="#eab308" opacity="0.6"/>

  <!-- Courtyard Stone Bridge & Reflective Water Basin -->
  <path d="M 0 430 Q 400 400 800 430 L 800 500 L 0 500 Z" fill="#0284c7" opacity="0.25"/>
  <path d="M 200 440 Q 300 410 400 440" stroke="#fef3c7" stroke-width="12" fill="none" opacity="0.8"/>
</svg>
`)}`;

// 4. Dutch & Western European Universities (Delft, Leuven, Eindhoven - Glass atrium, red brick canal quad)
const WESTERN_EUROPE_CAMPUS_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="dutchSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="#fde68a" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#fed7aa" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="facade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c2410c" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#9a3412" stop-opacity="0.8"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#dutchSky)"/>

  <!-- Sunlit Horizon Glow -->
  <circle cx="480" cy="140" r="110" fill="#fef08a" opacity="0.35"/>

  <!-- Modern Stepped Gables & Engineering Lab Wings -->
  <polygon points="120,240 170,160 220,240" fill="url(#facade)"/>
  <polygon points="220,240 270,140 320,240" fill="url(#facade)"/>
  <polygon points="320,240 370,160 420,240" fill="url(#facade)"/>
  <rect x="120" y="240" width="300" height="200" fill="url(#facade)" rx="2"/>

  <!-- Slanted Modern Glass Cone (TU Delft Library Motif) -->
  <polygon points="460,440 560,110 660,440" fill="#0284c7" opacity="0.45"/>
  <polygon points="480,440 560,140 640,440" fill="#38bdf8" opacity="0.35"/>
  <circle cx="560" cy="110" r="16" fill="#fef08a" opacity="0.8"/>

  <!-- Illuminated Lab Windows -->
  <g fill="#fef3c7" opacity="0.85">
    <rect x="150" y="270" width="24" height="40" rx="2"/>
    <rect x="200" y="270" width="24" height="40" rx="2"/>
    <rect x="250" y="270" width="24" height="40" rx="2"/>
    <rect x="300" y="270" width="24" height="40" rx="2"/>
    <rect x="350" y="270" width="24" height="40" rx="2"/>
    <rect x="150" y="340" width="24" height="50" rx="2"/>
    <rect x="200" y="340" width="24" height="50" rx="2"/>
    <rect x="250" y="340" width="24" height="50" rx="2"/>
    <rect x="300" y="340" width="24" height="50" rx="2"/>
    <rect x="350" y="340" width="24" height="50" rx="2"/>
  </g>

  <!-- Green Campus Lawn & Pathway -->
  <path d="M 0 440 L 800 440 L 800 500 L 0 500 Z" fill="#15803d" opacity="0.4"/>
  <circle cx="80" cy="360" r="80" fill="#f97316" opacity="0.55"/>
  <circle cx="720" cy="370" r="80" fill="#d97706" opacity="0.55"/>
</svg>
`)}`;

/**
 * Returns an authentic university campus architectural backdrop based on the opportunity's
 * host country, institution name, or domain.
 */
export function getUniversityBackdrop(opportunity: Opportunity): string {
  const country = (opportunity.host_country || '').toLowerCase();
  const institution = (opportunity.host_institution || '').toLowerCase();

  // 1. Asian Technical Universities
  if (
    country.includes('japan') ||
    country.includes('singapore') ||
    country.includes('korea') ||
    country.includes('taiwan') ||
    institution.includes('tokyo') ||
    institution.includes('kyoto') ||
    institution.includes('kaist') ||
    institution.includes('ntu') ||
    institution.includes('nus')
  ) {
    return ASIAN_CAMPUS_SVG;
  }

  // 2. Nordic & Scandinavian Universities
  if (
    country.includes('sweden') ||
    country.includes('finland') ||
    country.includes('denmark') ||
    country.includes('norway') ||
    institution.includes('kth') ||
    institution.includes('chalmers') ||
    institution.includes('aalto') ||
    institution.includes('uppsala') ||
    institution.includes('helsinki')
  ) {
    return NORDIC_CAMPUS_SVG;
  }

  // 3. Dutch & Western European Universities
  if (
    country.includes('netherlands') ||
    country.includes('belgium') ||
    institution.includes('delft') ||
    institution.includes('eindhoven') ||
    institution.includes('leuven') ||
    institution.includes('ghent') ||
    institution.includes('twente')
  ) {
    return WESTERN_EUROPE_CAMPUS_SVG;
  }

  // 4. German, Swiss, French, Italian & Central European Institutes (Default)
  return GERMAN_SWISS_CAMPUS_SVG;
}
