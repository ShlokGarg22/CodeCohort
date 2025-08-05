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

export const getAvatarDataUrl = (avatar) => {
  return `data:image/svg+xml;base64,${btoa(avatar.svg)}`;
};
