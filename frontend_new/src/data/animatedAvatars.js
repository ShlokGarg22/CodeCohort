export const animatedAvatars = [
  {
    id: 'gradient-1',
    name: 'Ocean Wave',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1">
            <animate attributeName="stop-color" values="#3B82F6;#06B6D4;#3B82F6" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1">
            <animate attributeName="stop-color" values="#06B6D4;#3B82F6;#06B6D4" dur="3s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="60" fill="url(#ocean)"/>
      <circle cx="45" cy="45" r="3" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="75" cy="35" r="2" fill="white" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </svg>`
  },
  {
    id: 'gradient-2',
    name: 'Sunset Glow',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sunset" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1">
            <animate attributeName="stop-color" values="#F59E0B;#EF4444;#F59E0B" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#EF4444;stop-opacity:1">
            <animate attributeName="stop-color" values="#EF4444;#F59E0B;#EF4444" dur="4s" repeatCount="indefinite"/>
          </stop>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="60" fill="url(#sunset)"/>
      <circle cx="60" cy="60" r="30" fill="none" stroke="white" stroke-width="1" opacity="0.5">
        <animate attributeName="r" values="30;35;30" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>`
  },
  {
    id: 'gradient-3',
    name: 'Forest Green',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="forest" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#10B981;stop-opacity:1">
            <animate attributeName="stop-color" values="#10B981;#059669;#10B981" dur="3.5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1">
            <animate attributeName="stop-color" values="#059669;#10B981;#059669" dur="3.5s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="60" fill="url(#forest)"/>
      <path d="M40 50 Q60 30 80 50 Q60 70 40 50" fill="white" opacity="0.3">
        <animateTransform attributeName="transform" type="rotate" values="0 60 60;360 60 60" dur="8s" repeatCount="indefinite"/>
      </path>
    </svg>`
  },
  {
    id: 'gradient-4',
    name: 'Purple Storm',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="storm" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1">
            <animate attributeName="stop-color" values="#8B5CF6;#A855F7;#8B5CF6" dur="2.5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1">
            <animate attributeName="stop-color" values="#A855F7;#8B5CF6;#A855F7" dur="2.5s" repeatCount="indefinite"/>
          </stop>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="60" fill="url(#storm)"/>
      <polygon points="55,40 65,40 62,55 68,55 58,80 55,65 50,65" fill="white" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite"/>
      </polygon>
    </svg>`
  },
  {
    id: 'gradient-5',
    name: 'Rose Gold',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rose" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F472B6;stop-opacity:1">
            <animate attributeName="stop-color" values="#F472B6;#EC4899;#F472B6" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1">
            <animate attributeName="stop-color" values="#EC4899;#F472B6;#EC4899" dur="4s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="60" fill="url(#rose)"/>
      <circle cx="50" cy="50" r="5" fill="white" opacity="0.6">
        <animate attributeName="cy" values="50;45;50" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="70" cy="50" r="5" fill="white" opacity="0.6">
        <animate attributeName="cy" values="50;45;50" dur="2s" begin="0.5s" repeatCount="indefinite"/>
      </circle>
      <path d="M50 70 Q60 80 70 70" stroke="white" stroke-width="2" fill="none" opacity="0.8"/>
    </svg>`
  },
  {
    id: 'gradient-6',
    name: 'Electric Blue',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="electric" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#06B6D4;stop-opacity:1">
            <animate attributeName="stop-color" values="#06B6D4;#0EA5E9;#06B6D4" dur="2s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#0EA5E9;stop-opacity:1">
            <animate attributeName="stop-color" values="#0EA5E9;#06B6D4;#0EA5E9" dur="2s" repeatCount="indefinite"/>
          </stop>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="60" fill="url(#electric)"/>
      <circle cx="60" cy="60" r="20" fill="none" stroke="white" stroke-width="2" opacity="0.5">
        <animate attributeName="r" values="20;25;20" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="60" cy="60" r="10" fill="white" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>`
  },
  {
    id: 'gradient-7',
    name: 'Cosmic Purple',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cosmic" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1">
            <animate attributeName="stop-color" values="#6366F1;#8B5CF6;#6366F1" dur="5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#1E1B4B;stop-opacity:1"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="60" fill="url(#cosmic)"/>
      <circle cx="45" cy="40" r="1.5" fill="white" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="75" cy="35" r="1" fill="white" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="80" cy="55" r="1.5" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="40" cy="75" r="1" fill="white" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3.5s" repeatCount="indefinite"/>
      </circle>
    </svg>`
  },
  {
    id: 'gradient-8',
    name: 'Emerald Wave',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#34D399;stop-opacity:1">
            <animate attributeName="stop-color" values="#34D399;#10B981;#34D399" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#10B981;stop-opacity:1">
            <animate attributeName="stop-color" values="#10B981;#34D399;#10B981" dur="3s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="60" fill="url(#emerald)"/>
      <path d="M20 60 Q40 45 60 60 Q80 75 100 60" stroke="white" stroke-width="2" fill="none" opacity="0.6">
        <animate attributeName="d" values="M20 60 Q40 45 60 60 Q80 75 100 60;M20 60 Q40 75 60 60 Q80 45 100 60;M20 60 Q40 45 60 60 Q80 75 100 60" dur="4s" repeatCount="indefinite"/>
      </path>
    </svg>`
  }
];

export const humanAvatars = [
  {
    id: 'human-1',
    name: 'Friendly Soul',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="skin1" cx="50%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color:#FBBF24;stop-opacity:1">
            <animate attributeName="stop-color" values="#FBBF24;#F59E0B;#D97706;#FBBF24" dur="5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#92400E;stop-opacity:1"/>
        </radialGradient>
        <linearGradient id="hair1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#A0522D;stop-opacity:1">
            <animate attributeName="stop-color" values="#A0522D;#8B4513;#654321;#A0522D" dur="6s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#3C1810;stop-opacity:1"/>
        </linearGradient>
        <filter id="softGlow1">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Face shadow -->
      <ellipse cx="60" cy="70" rx="38" ry="40" fill="#000" opacity="0.1"/>
      <!-- Face -->
      <ellipse cx="60" cy="68" rx="36" ry="38" fill="url(#skin1)" filter="url(#softGlow1)"/>
      <!-- Hair -->
      <ellipse cx="60" cy="40" rx="42" ry="28" fill="url(#hair1)"/>
      <path d="M18 58 Q35 45 60 50 Q85 45 102 58 Q90 52 75 48 Q60 45 45 48 Q30 52 18 58" fill="url(#hair1)" opacity="0.9"/>
      <!-- Hair texture -->
      <path d="M35 42 Q40 35 45 42" stroke="url(#hair1)" stroke-width="2" fill="none" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" values="0 40 40;3 40 40;0 40 40" dur="4s" repeatCount="indefinite"/>
      </path>
      <path d="M75 42 Q80 35 85 42" stroke="url(#hair1)" stroke-width="2" fill="none" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" values="0 80 40;-3 80 40;0 80 40" dur="4s" repeatCount="indefinite"/>
      </path>
      <!-- Eyes -->
      <ellipse cx="48" cy="58" rx="5" ry="6" fill="#1E40AF">
        <animate attributeName="ry" values="6;2;6" dur="4s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="72" cy="58" rx="5" ry="6" fill="#1E40AF">
        <animate attributeName="ry" values="6;2;6" dur="4s" repeatCount="indefinite" begin="0.1s"/>
      </ellipse>
      <!-- Eye highlights -->
      <ellipse cx="50" cy="56" rx="2" ry="2.5" fill="white" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.6;0.9" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="74" cy="56" rx="2" ry="2.5" fill="white" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.6;0.9" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <!-- Eyebrows -->
      <ellipse cx="48" cy="52" rx="6" ry="1.5" fill="#654321" opacity="0.8"/>
      <ellipse cx="72" cy="52" rx="6" ry="1.5" fill="#654321" opacity="0.8"/>
      <!-- Nose -->
      <ellipse cx="60" cy="68" rx="2.5" ry="4" fill="#E5B017" opacity="0.7"/>
      <ellipse cx="60" cy="66" rx="1" ry="2" fill="#F59E0B" opacity="0.5"/>
      <!-- Mouth -->
      <path d="M50 78 Q60 88 70 78" stroke="#DC2626" stroke-width="3" fill="none" opacity="0.8">
        <animate attributeName="d" values="M50 78 Q60 88 70 78;M50 79 Q60 85 70 79;M50 78 Q60 88 70 78" dur="5s" repeatCount="indefinite"/>
      </path>
      <!-- Cheeks -->
      <ellipse cx="38" cy="72" rx="6" ry="4" fill="#F87171" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="82" cy="72" rx="6" ry="4" fill="#F87171" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <!-- Dimples -->
      <circle cx="46" cy="82" r="1.5" fill="#E5B017" opacity="0.3"/>
      <circle cx="74" cy="82" r="1.5" fill="#E5B017" opacity="0.3"/>
    </svg>`
  },
  {
    id: 'human-2',
    name: 'Professional Elite',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="skin2" cx="50%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color:#E6B887;stop-opacity:1">
            <animate attributeName="stop-color" values="#E6B887;#D4A574;#B8956A;#E6B887" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#8B7355;stop-opacity:1"/>
        </radialGradient>
        <linearGradient id="hair2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#374151;stop-opacity:1">
            <animate attributeName="stop-color" values="#374151;#1F2937;#111827;#374151" dur="6s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1"/>
        </linearGradient>
        <filter id="professionalGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Face shadow -->
      <ellipse cx="60" cy="72" rx="34" ry="40" fill="#000" opacity="0.1"/>
      <!-- Face -->
      <ellipse cx="60" cy="70" rx="32" ry="38" fill="url(#skin2)" filter="url(#professionalGlow)"/>
      <!-- Hair -->
      <ellipse cx="60" cy="38" rx="40" ry="25" fill="url(#hair2)"/>
      <rect x="20" y="38" width="80" height="18" fill="url(#hair2)"/>
      <path d="M20 50 Q40 45 60 48 Q80 45 100 50 Q85 52 70 50 Q60 52 50 50 Q35 52 20 50" fill="url(#hair2)" opacity="0.9"/>
      <!-- Glasses frame -->
      <circle cx="46" cy="62" r="14" fill="none" stroke="#1F2937" stroke-width="2.5" opacity="0.9"/>
      <circle cx="74" cy="62" r="14" fill="none" stroke="#1F2937" stroke-width="2.5" opacity="0.9"/>
      <line x1="60" y1="62" x2="60" y2="62" stroke="#1F2937" stroke-width="2.5"/>
      <path d="M32 60 Q28 58 25 60" stroke="#1F2937" stroke-width="2" fill="none"/>
      <path d="M88 60 Q92 58 95 60" stroke="#1F2937" stroke-width="2" fill="none"/>
      <!-- Glasses reflection -->
      <ellipse cx="40" cy="56" rx="8" ry="10" fill="white" opacity="0.1">
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="80" cy="56" rx="8" ry="10" fill="white" opacity="0.1">
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <!-- Eyes behind glasses -->
      <ellipse cx="46" cy="62" rx="4" ry="5" fill="#059669">
        <animate attributeName="ry" values="5;2;5" dur="5s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="74" cy="62" rx="4" ry="5" fill="#059669">
        <animate attributeName="ry" values="5;2;5" dur="5s" repeatCount="indefinite" begin="0.2s"/>
      </ellipse>
      <!-- Eye highlights -->
      <ellipse cx="47" cy="60" rx="1.5" ry="2" fill="white" opacity="0.9"/>
      <ellipse cx="75" cy="60" rx="1.5" ry="2" fill="white" opacity="0.9"/>
      <!-- Eyebrows -->
      <ellipse cx="46" cy="50" rx="8" ry="2" fill="#111827" opacity="0.7"/>
      <ellipse cx="74" cy="50" rx="8" ry="2" fill="#111827" opacity="0.7"/>
      <!-- Nose -->
      <path d="M58 70 L60 78 L62 70" stroke="#B8956A" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="76" rx="1.5" ry="1" fill="#A78B71" opacity="0.6"/>
      <!-- Mouth -->
      <path d="M50 86 Q60 92 70 86" stroke="#7C2D12" stroke-width="2.5" fill="none" opacity="0.8">
        <animate attributeName="d" values="M50 86 Q60 92 70 86;M50 87 Q60 90 70 87;M50 86 Q60 92 70 86" dur="4s" repeatCount="indefinite"/>
      </path>
      <!-- Subtle facial structure -->
      <path d="M28 75 Q35 85 45 88" stroke="#A78B71" stroke-width="1" fill="none" opacity="0.3"/>
      <path d="M92 75 Q85 85 75 88" stroke="#A78B71" stroke-width="1" fill="none" opacity="0.3"/>
    </svg>`
  },
  {
    id: 'human-3',
    name: 'Radiant Joy',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="skin3" cx="50%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color:#F8D7C2;stop-opacity:1">
            <animate attributeName="stop-color" values="#F8D7C2;#F3D2C1;#F5C2A8;#F8D7C2" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#D4A574;stop-opacity:1"/>
        </radialGradient>
        <linearGradient id="hair3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#EF4444;stop-opacity:1">
            <animate attributeName="stop-color" values="#EF4444;#DC2626;#B91C1C;#EF4444" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style="stop-color:#F97316;stop-opacity:1">
            <animate attributeName="stop-color" values="#F97316;#EA580C;#DC2626;#F97316" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#92400E;stop-opacity:1"/>
        </linearGradient>
        <filter id="joyGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Face shadow -->
      <ellipse cx="60" cy="70" rx="38" ry="40" fill="#000" opacity="0.08"/>
      <!-- Face -->
      <ellipse cx="60" cy="68" rx="36" ry="38" fill="url(#skin3)" filter="url(#joyGlow)"/>
      <!-- Hair base -->
      <ellipse cx="60" cy="42" rx="42" ry="30" fill="url(#hair3)"/>
      <path d="M18 55 Q35 40 60 45 Q85 40 102 55 Q90 50 75 47 Q60 44 45 47 Q30 50 18 55" fill="url(#hair3)" opacity="0.9"/>
      <!-- Curly hair details -->
      <circle cx="32" cy="48" r="6" fill="url(#hair3)" opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" values="0 32 48;15 32 48;0 32 48" dur="5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="88" cy="48" r="6" fill="url(#hair3)" opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" values="0 88 48;-15 88 48;0 88 48" dur="5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="45" cy="35" r="4" fill="url(#hair3)" opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" values="0 45 35;10 45 35;0 45 35" dur="6s" repeatCount="indefinite"/>
      </circle>
      <circle cx="75" cy="35" r="4" fill="url(#hair3)" opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" values="0 75 35;-10 75 35;0 75 35" dur="6s" repeatCount="indefinite"/>
      </circle>
      <!-- Eyes -->
      <ellipse cx="46" cy="58" rx="6" ry="7" fill="#16A34A">
        <animate attributeName="ry" values="7;3;7" dur="4s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="74" cy="58" rx="6" ry="7" fill="#16A34A">
        <animate attributeName="ry" values="7;3;7" dur="4s" repeatCount="indefinite" begin="0.1s"/>
      </ellipse>
      <!-- Eye highlights -->
      <ellipse cx="48" cy="56" rx="2.5" ry="3" fill="white" opacity="0.95">
        <animate attributeName="opacity" values="0.95;0.7;0.95" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="76" cy="56" rx="2.5" ry="3" fill="white" opacity="0.95">
        <animate attributeName="opacity" values="0.95;0.7;0.95" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      <!-- Freckles -->
      <circle cx="50" cy="66" r="1" fill="#D97706" opacity="0.6"/>
      <circle cx="70" cy="68" r="1" fill="#D97706" opacity="0.6"/>
      <circle cx="42" cy="72" r="0.8" fill="#D97706" opacity="0.5"/>
      <circle cx="78" cy="70" r="0.8" fill="#D97706" opacity="0.5"/>
      <circle cx="55" cy="74" r="0.7" fill="#D97706" opacity="0.4"/>
      <!-- Nose -->
      <ellipse cx="60" cy="70" rx="3" ry="4.5" fill="#E8B59C" opacity="0.8"/>
      <ellipse cx="60" cy="68" rx="1.5" ry="2" fill="#F3D2C1" opacity="0.6"/>
      <!-- Big joyful smile -->
      <path d="M42 80 Q60 95 78 80" stroke="#DC2626" stroke-width="4" fill="none" opacity="0.9">
        <animate attributeName="d" values="M42 80 Q60 95 78 80;M42 81 Q60 92 78 81;M42 80 Q60 95 78 80" dur="3s" repeatCount="indefinite"/>
      </path>
      <!-- Smile highlight -->
      <path d="M45 82 Q60 92 75 82" stroke="#FECACA" stroke-width="1.5" fill="none" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite"/>
      </path>
      <!-- Dimples -->
      <ellipse cx="38" cy="82" rx="3" ry="2" fill="#E8B59C" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.8;0.6" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="82" cy="82" rx="3" ry="2" fill="#E8B59C" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.8;0.6" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <!-- Cheek glow -->
      <ellipse cx="35" cy="75" rx="8" ry="6" fill="#F87171" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2.5s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="85" cy="75" rx="8" ry="6" fill="#F87171" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2.5s" repeatCount="indefinite"/>
      </ellipse>
    </svg>`
  },
  {
    id: 'human-4',
    name: 'Enigmatic Shadow',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skin4" x1="30%" y1="20%" x2="70%" y2="80%">
          <stop offset="0%" style="stop-color:#B8956A;stop-opacity:1">
            <animate attributeName="stop-color" values="#B8956A;#A78B71;#8B7355;#B8956A" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#654321;stop-opacity:1"/>
        </linearGradient>
        <radialGradient id="hair4" cx="50%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:#334155;stop-opacity:1">
            <animate attributeName="stop-color" values="#334155;#1E293B;#0F172A;#334155" dur="6s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1"/>
        </radialGradient>
        <filter id="mysteriousGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Face shadow -->
      <ellipse cx="60" cy="74" rx="32" ry="38" fill="#000" opacity="0.15"/>
      <!-- Face -->
      <ellipse cx="60" cy="72" rx="30" ry="36" fill="url(#skin4)" filter="url(#mysteriousGlow)"/>
      <!-- Hair -->
      <ellipse cx="60" cy="38" rx="38" ry="30" fill="url(#hair4)"/>
      <path d="M22 58 Q40 42 60 48 Q80 42 98 58 Q85 52 70 48 Q60 50 50 48 Q35 52 22 58" fill="url(#hair4)" opacity="0.95"/>
      <!-- Hair strands -->
      <path d="M30 50 Q25 60 28 70" stroke="url(#hair4)" stroke-width="4" fill="none" opacity="0.7">
        <animate attributeName="d" values="M30 50 Q25 60 28 70;M30 50 Q22 65 25 75;M30 50 Q25 60 28 70" dur="8s" repeatCount="indefinite"/>
      </path>
      <path d="M90 50 Q95 60 92 70" stroke="url(#hair4)" stroke-width="4" fill="none" opacity="0.7">
        <animate attributeName="d" values="M90 50 Q95 60 92 70;M90 50 Q98 65 95 75;M90 50 Q95 60 92 70" dur="8s" repeatCount="indefinite"/>
      </path>
      <!-- Intense eyebrows -->
      <path d="M40 56 Q50 52 58 56" stroke="#0F172A" stroke-width="3" fill="none" opacity="0.9">
        <animate attributeName="stroke-width" values="3;4;3" dur="3s" repeatCount="indefinite"/>
      </path>
      <path d="M62 56 Q70 52 80 56" stroke="#0F172A" stroke-width="3" fill="none" opacity="0.9">
        <animate attributeName="stroke-width" values="3;4;3" dur="3s" repeatCount="indefinite"/>
      </path>
      <!-- Eyes with depth -->
      <ellipse cx="48" cy="64" rx="5" ry="6" fill="#1E1B4B">
        <animate attributeName="fill" values="#1E1B4B;#312E81;#6366F1;#1E1B4B" dur="4s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="72" cy="64" rx="5" ry="6" fill="#1E1B4B">
        <animate attributeName="fill" values="#1E1B4B;#312E81;#6366F1;#1E1B4B" dur="4s" repeatCount="indefinite" begin="0.5s"/>
      </ellipse>
      <!-- Mysterious eye highlights -->
      <ellipse cx="50" cy="62" rx="2" ry="2.5" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="white;#C084FC;white" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="74" cy="62" rx="2" ry="2.5" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.1s"/>
        <animate attributeName="fill" values="white;#C084FC;white" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <!-- Nose with shadow -->
      <path d="M58 72 L60 80 L62 72" stroke="#654321" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="78" rx="1.5" ry="1" fill="#8B7355" opacity="0.6"/>
      <!-- Subtle, mysterious smile -->
      <path d="M52 88 Q60 92 68 88" stroke="#6B5B95" stroke-width="2.5" fill="none" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.4;0.7" dur="5s" repeatCount="indefinite"/>
        <animate attributeName="stroke" values="#6B5B95;#8B5CF6;#6B5B95" dur="6s" repeatCount="indefinite"/>
      </path>
      <!-- Cheekbone definition -->
      <path d="M25 70 Q35 75 40 82" stroke="#8B7355" stroke-width="1" fill="none" opacity="0.4"/>
      <path d="M95 70 Q85 75 80 82" stroke="#8B7355" stroke-width="1" fill="none" opacity="0.4"/>
      <!-- Shadow aura -->
      <ellipse cx="60" cy="72" rx="35" ry="40" fill="none" stroke="#1E293B" stroke-width="0.5" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="rx" values="35;40;35" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="40;45;40" dur="4s" repeatCount="indefinite"/>
      </ellipse>
    </svg>`
  },
  {
    id: 'human-5',
    name: 'Creative Spirit',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="skin5" cx="50%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color:#FFEAA7;stop-opacity:1">
            <animate attributeName="stop-color" values="#FFEAA7;#FED7AA;#FDBA74;#FFEAA7" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#FB923C;stop-opacity:1"/>
        </radialGradient>
        <linearGradient id="hair5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#C084FC;stop-opacity:1">
            <animate attributeName="stop-color" values="#C084FC;#A855F7;#8B5CF6;#C084FC" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="25%" style="stop-color:#F472B6;stop-opacity:1">
            <animate attributeName="stop-color" values="#F472B6;#EC4899;#DB2777;#F472B6" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style="stop-color:#22D3EE;stop-opacity:1">
            <animate attributeName="stop-color" values="#22D3EE;#06B6D4;#0891B2;#22D3EE" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="75%" style="stop-color:#4ADE80;stop-opacity:1">
            <animate attributeName="stop-color" values="#4ADE80;#22C55E;#16A34A;#4ADE80" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:1">
            <animate attributeName="stop-color" values="#F59E0B;#D97706;#B45309;#F59E0B" dur="3s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
        <filter id="artisticGlow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Face shadow -->
      <ellipse cx="60" cy="72" rx="36" ry="38" fill="#000" opacity="0.1"/>
      <!-- Face -->
      <ellipse cx="60" cy="70" rx="34" ry="36" fill="url(#skin5)" filter="url(#artisticGlow)"/>
      <!-- Colorful hair -->
      <ellipse cx="60" cy="40" rx="40" ry="28" fill="url(#hair5)"/>
      <path d="M20 55 Q35 42 55 48 Q60 38 65 48 Q85 42 100 55 Q85 50 65 46 Q60 48 55 46 Q35 50 20 55" fill="url(#hair5)" opacity="0.9"/>
      <!-- Artistic hair strands -->
      <path d="M32 48 Q28 35 35 50" stroke="url(#hair5)" stroke-width="4" fill="none" opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" values="0 32 45;8 32 45;0 32 45" dur="5s" repeatCount="indefinite"/>
      </path>
      <path d="M88 48 Q92 35 85 50" stroke="url(#hair5)" stroke-width="4" fill="none" opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" values="0 88 45;-8 88 45;0 88 45" dur="5s" repeatCount="indefinite"/>
      </path>
      <!-- Hair highlights -->
      <circle cx="45" cy="38" r="3" fill="white" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="75" cy="42" r="2.5" fill="white" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <!-- Eyes -->
      <ellipse cx="48" cy="62" rx="6" ry="7" fill="#7C2D12">
        <animate attributeName="ry" values="7;3;7" dur="5s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="72" cy="62" rx="6" ry="7" fill="#7C2D12">
        <animate attributeName="ry" values="7;3;7" dur="5s" repeatCount="indefinite" begin="0.2s"/>
      </ellipse>
      <!-- Colorful eye highlights -->
      <ellipse cx="50" cy="60" rx="2.5" ry="3" fill="#F59E0B" opacity="0.9">
        <animate attributeName="fill" values="#F59E0B;#EF4444;#8B5CF6;#22D3EE;#F59E0B" dur="6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="74" cy="60" rx="2.5" ry="3" fill="#8B5CF6" opacity="0.9">
        <animate attributeName="fill" values="#8B5CF6;#F59E0B;#EF4444;#22D3EE;#8B5CF6" dur="6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      <!-- Artistic eyebrows -->
      <path d="M42 56 Q48 52 54 56" stroke="#6B5B95" stroke-width="2.5" fill="none" opacity="0.8">
        <animate attributeName="stroke" values="#6B5B95;#8B5CF6;#EC4899;#6B5B95" dur="4s" repeatCount="indefinite"/>
      </path>
      <path d="M66 56 Q72 52 78 56" stroke="#6B5B95" stroke-width="2.5" fill="none" opacity="0.8">
        <animate attributeName="stroke" values="#6B5B95;#8B5CF6;#EC4899;#6B5B95" dur="4s" repeatCount="indefinite" begin="0.5s"/>
      </path>
      <!-- Nose -->
      <ellipse cx="60" cy="74" rx="2.5" ry="3.5" fill="#FB923C" opacity="0.8"/>
      <ellipse cx="60" cy="72" rx="1.2" ry="2" fill="#FDBA74" opacity="0.6"/>
      <!-- Artistic smile -->
      <path d="M48 84 Q60 92 72 84" stroke="#EC4899" stroke-width="3" fill="none" opacity="0.9">
        <animate attributeName="stroke" values="#EC4899;#A855F7;#06B6D4;#4ADE80;#EC4899" dur="5s" repeatCount="indefinite"/>
        <animate attributeName="d" values="M48 84 Q60 92 72 84;M48 85 Q60 90 72 85;M48 84 Q60 92 72 84" dur="3s" repeatCount="indefinite"/>
      </path>
      <!-- Paint splatter effects -->
      <circle cx="78" cy="45" r="2" fill="#F59E0B" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.9;0.7" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#F59E0B;#EF4444;#8B5CF6;#F59E0B" dur="4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="42" cy="88" r="1.5" fill="#EC4899" opacity="0.8">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#EC4899;#22D3EE;#4ADE80;#EC4899" dur="5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="85" cy="78" r="1.2" fill="#22D3EE" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="35" cy="75" r="1" fill="#4ADE80" opacity="0.7">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.8s" repeatCount="indefinite"/>
      </circle>
      <!-- Artistic aura -->
      <circle cx="60" cy="70" r="45" fill="none" stroke="url(#hair5)" stroke-width="1" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="r" values="45;50;45" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>`
  },
  {
    id: 'human-6',
    name: 'Ethereal Beauty',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="skin6" cx="50%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color:#FEF3F2;stop-opacity:1">
            <animate attributeName="stop-color" values="#FEF3F2;#FDF2F8;#FAF5FF;#FEF3F2" dur="5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#E0E7FF;stop-opacity:1"/>
        </radialGradient>
        <linearGradient id="hair6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FDE047;stop-opacity:1">
            <animate attributeName="stop-color" values="#FDE047;#FACC15;#EAB308;#FDE047" dur="6s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style="stop-color:#F59E0B;stop-opacity:1">
            <animate attributeName="stop-color" values="#F59E0B;#D97706;#B45309;#F59E0B" dur="6s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#92400E;stop-opacity:1"/>
        </linearGradient>
        <filter id="etherealGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Face shadow -->
      <ellipse cx="60" cy="74" rx="34" ry="38" fill="#000" opacity="0.05"/>
      <!-- Face -->
      <ellipse cx="60" cy="72" rx="32" ry="36" fill="url(#skin6)" filter="url(#etherealGlow)"/>
      <!-- Flowing hair -->
      <ellipse cx="60" cy="42" rx="38" ry="28" fill="url(#hair6)"/>
      <path d="M22 58 Q38 45 58 50 Q60 42 62 50 Q82 45 98 58 Q85 52 70 48 Q60 50 50 48 Q35 52 22 58" fill="url(#hair6)" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate" values="0 60 50;3 60 50;0 60 50" dur="8s" repeatCount="indefinite"/>
      </path>
      <!-- Flowing hair strands -->
      <path d="M25 62 Q20 70 25 78" stroke="url(#hair6)" stroke-width="5" fill="none" opacity="0.7">
        <animate attributeName="d" values="M25 62 Q20 70 25 78;M25 62 Q15 75 20 85;M25 62 Q20 70 25 78" dur="6s" repeatCount="indefinite"/>
      </path>
      <path d="M95 62 Q100 70 95 78" stroke="url(#hair6)" stroke-width="5" fill="none" opacity="0.7">
        <animate attributeName="d" values="M95 62 Q100 70 95 78;M95 62 Q105 75 100 85;M95 62 Q100 70 95 78" dur="6s" repeatCount="indefinite"/>
      </path>
      <path d="M30 68 Q25 78 30 88" stroke="url(#hair6)" stroke-width="3" fill="none" opacity="0.5">
        <animate attributeName="d" values="M30 68 Q25 78 30 88;M30 68 Q20 82 25 92;M30 68 Q25 78 30 88" dur="7s" repeatCount="indefinite"/>
      </path>
      <path d="M90 68 Q95 78 90 88" stroke="url(#hair6)" stroke-width="3" fill="none" opacity="0.5">
        <animate attributeName="d" values="M90 68 Q95 78 90 88;M90 68 Q100 82 95 92;M90 68 Q95 78 90 88" dur="7s" repeatCount="indefinite"/>
      </path>
      <!-- Gentle eyes -->
      <ellipse cx="48" cy="66" rx="5" ry="6" fill="#3B82F6">
        <animate attributeName="ry" values="6;3;6" dur="7s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="72" cy="66" rx="5" ry="6" fill="#3B82F6">
        <animate attributeName="ry" values="6;3;6" dur="7s" repeatCount="indefinite" begin="0.3s"/>
      </ellipse>
      <!-- Soft eye highlights -->
      <ellipse cx="50" cy="64" rx="2" ry="2.5" fill="white" opacity="0.95">
        <animate attributeName="opacity" values="0.95;0.7;0.95" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="74" cy="64" rx="2" ry="2.5" fill="white" opacity="0.95">
        <animate attributeName="opacity" values="0.95;0.7;0.95" dur="3s" repeatCount="indefinite" begin="0.1s"/>
      </ellipse>
      <!-- Long eyelashes -->
      <path d="M44 62 L42 58" stroke="#1F2937" stroke-width="1.5" opacity="0.7"/>
      <path d="M46 61 L45 57" stroke="#1F2937" stroke-width="1.5" opacity="0.7"/>
      <path d="M50 61 L50 57" stroke="#1F2937" stroke-width="1.5" opacity="0.7"/>
      <path d="M76 62 L78 58" stroke="#1F2937" stroke-width="1.5" opacity="0.7"/>
      <path d="M74 61 L75 57" stroke="#1F2937" stroke-width="1.5" opacity="0.7"/>
      <path d="M70 61 L70 57" stroke="#1F2937" stroke-width="1.5" opacity="0.7"/>
      <!-- Delicate eyebrows -->
      <path d="M42 60 Q48 58 54 60" stroke="#B45309" stroke-width="1.5" fill="none" opacity="0.6"/>
      <path d="M66 60 Q72 58 78 60" stroke="#B45309" stroke-width="1.5" fill="none" opacity="0.6"/>
      <!-- Small nose -->
      <ellipse cx="60" cy="76" rx="2" ry="3" fill="#F3E8FF" opacity="0.8"/>
      <ellipse cx="60" cy="75" rx="0.8" ry="1.5" fill="white" opacity="0.4"/>
      <!-- Gentle smile -->
      <path d="M50 86 Q60 92 70 86" stroke="#F472B6" stroke-width="2.5" fill="none" opacity="0.8">
        <animate attributeName="d" values="M50 86 Q60 92 70 86;M50 87 Q60 90 70 87;M50 86 Q60 92 70 86" dur="6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0.5;0.8" dur="4s" repeatCount="indefinite"/>
      </path>
      <!-- Soft blush -->
      <ellipse cx="36" cy="80" rx="8" ry="5" fill="#F472B6" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.3;0.15" dur="4s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="84" cy="80" rx="8" ry="5" fill="#F472B6" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.3;0.15" dur="4s" repeatCount="indefinite"/>
      </ellipse>
      <!-- Ethereal glow -->
      <circle cx="60" cy="72" r="40" fill="none" stroke="white" stroke-width="0.5" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite"/>
        <animate attributeName="r" values="40;45;40" dur="5s" repeatCount="indefinite"/>
      </circle>
    </svg>`
  },
  {
    id: 'human-7',
    name: 'Bold Confidence',
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skin7" x1="20%" y1="20%" x2="80%" y2="80%">
          <stop offset="0%" style="stop-color:#A0522D;stop-opacity:1">
            <animate attributeName="stop-color" values="#A0522D;#8B4513;#654321;#A0522D" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#3C1810;stop-opacity:1"/>
        </linearGradient>
        <radialGradient id="hair7" cx="50%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:#1F2937;stop-opacity:1">
            <animate attributeName="stop-color" values="#1F2937;#111827;#000000;#1F2937" dur="5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1"/>
        </radialGradient>
        <filter id="boldGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Face shadow -->
      <ellipse cx="60" cy="76" rx="30" ry="34" fill="#000" opacity="0.2"/>
      <!-- Face -->
      <ellipse cx="60" cy="74" rx="28" ry="32" fill="url(#skin7)" filter="url(#boldGlow)"/>
      <!-- Modern hair cut -->
      <ellipse cx="60" cy="42" rx="34" ry="22" fill="url(#hair7)"/>
      <rect x="26" y="42" width="68" height="22" fill="url(#hair7)"/>
      <path d="M26 55 Q42 50 60 52 Q78 50 94 55 Q85 58 70 56 Q60 58 50 56 Q35 58 26 55" fill="url(#hair7)" opacity="0.95"/>
      <!-- Fade effect on sides -->
      <ellipse cx="32" cy="62" rx="10" ry="18" fill="url(#hair7)" opacity="0.8"/>
      <ellipse cx="88" cy="62" rx="10" ry="18" fill="url(#hair7)" opacity="0.8"/>
      <ellipse cx="28" cy="62" rx="6" ry="12" fill="url(#hair7)" opacity="0.6"/>
      <ellipse cx="92" cy="62" rx="6" ry="12" fill="url(#hair7)" opacity="0.6"/>
      <!-- Strong eyebrows -->
      <ellipse cx="46" cy="64" rx="8" ry="2.5" fill="#000000" opacity="0.9">
        <animate attributeName="ry" values="2.5;3;2.5" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="74" cy="64" rx="8" ry="2.5" fill="#000000" opacity="0.9">
        <animate attributeName="ry" values="2.5;3;2.5" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <!-- Determined eyes -->
      <ellipse cx="46" cy="70" rx="5" ry="5" fill="#654321">
        <animate attributeName="ry" values="5;2;5" dur="6s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="74" cy="70" rx="5" ry="5" fill="#654321">
        <animate attributeName="ry" values="5;2;5" dur="6s" repeatCount="indefinite" begin="0.1s"/>
      </ellipse>
      <!-- Eye highlights -->
      <ellipse cx="47" cy="68" rx="2" ry="2.5" fill="white" opacity="0.9"/>
      <ellipse cx="75" cy="68" rx="2" ry="2.5" fill="white" opacity="0.9"/>
      <!-- Strong nose -->
      <path d="M58 78 L60 86 L62 78" stroke="#3C1810" stroke-width="2.5" fill="none"/>
      <ellipse cx="60" cy="84" rx="2" ry="1.5" fill="#654321" opacity="0.6"/>
      <!-- Confident smile -->
      <path d="M48 94 Q60 102 72 94" stroke="#DC2626" stroke-width="3" fill="none" opacity="0.9">
        <animate attributeName="d" values="M48 94 Q60 102 72 94;M48 95 Q60 100 72 95;M48 94 Q60 102 72 94" dur="4s" repeatCount="indefinite"/>
      </path>
      <!-- Jawline definition -->
      <path d="M32 88 Q46 98 60 100 Q74 98 88 88" stroke="#3C1810" stroke-width="1.5" fill="none" opacity="0.6"/>
      <path d="M30 85 Q35 90 42 92" stroke="#3C1810" stroke-width="1" fill="none" opacity="0.4"/>
      <path d="M90 85 Q85 90 78 92" stroke="#3C1810" stroke-width="1" fill="none" opacity="0.4"/>
      <!-- Confident aura -->
      <ellipse cx="60" cy="74" rx="32" ry="36" fill="none" stroke="#8B4513" stroke-width="1" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite"/>
      </ellipse>
    </svg>`
  }]

export const getAvatarDataUrl = (avatar) => {
  return `data:image/svg+xml;base64,${btoa(avatar.svg)}`;
};
