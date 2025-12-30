
import React from 'react';

export const SapfireLogo = ({ size = 80, animated = true }: { size?: number, animated?: boolean }) => (
  <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className={`w-full h-full overflow-visible active-glow`}>
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-primary)" />
          <stop offset="100%" stopColor="var(--accent-secondary)" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGrad)" strokeWidth="1" strokeDasharray="10 20" className={animated ? "animate-[spin_10s_linear_infinite]" : ""} style={{ opacity: 0.3 }} />
      <path d="M50 15 L80 32 L80 68 L50 85 L20 68 L20 32 Z" fill="none" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="250" strokeDashoffset={animated ? "250" : "0"} className={animated ? "animate-[dash_3s_ease-in-out_infinite_alternate]" : ""} />
      <path d="M40 35 C40 25, 60 25, 60 40 C60 50, 40 50, 40 60 C40 75, 60 75, 60 65" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" className={animated ? "animate-pulse" : ""} style={{ filter: 'drop-shadow(0 0 5px var(--accent-primary))' }} />
      <circle cx="50" cy="50" r="3" fill="white" className={animated ? "animate-ping" : ""} />
    </svg>
    <style>{` @keyframes dash { to { stroke-dashoffset: 0; } } `}</style>
  </div>
);
