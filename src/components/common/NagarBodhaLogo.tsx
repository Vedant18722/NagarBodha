/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const NagarBodhaLogo: React.FC<LogoProps> = ({ 
  size = 36, 
  className = '', 
  showText = true 
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Geometric Sanskrit Compass & Smart City Vector Icon */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="nb-cyan-teal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="nb-gold" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>

        {/* Outer Hexagonal Urban Grid Shield */}
        <polygon 
          points="24,2 43,13 43,35 24,46 5,35 5,13" 
          fill="#0F172A" 
          stroke="url(#nb-cyan-teal)" 
          strokeWidth="1.75" 
          strokeLinejoin="round" 
        />

        {/* Inner Subdued Octagonal Ring */}
        <circle 
          cx="24" 
          cy="24" 
          r="14" 
          stroke="#1E293B" 
          strokeWidth="1" 
          strokeDasharray="2 3" 
        />

        {/* Cardinal Axis Network Nodes (Sanskrit Bodha Compass Directions) */}
        <line x1="24" y1="6" x2="24" y2="42" stroke="url(#nb-cyan-teal)" strokeWidth="1.25" strokeLinecap="round" opacity="0.8" />
        <line x1="6" y1="24" x2="42" y2="24" stroke="url(#nb-cyan-teal)" strokeWidth="1.25" strokeLinecap="round" opacity="0.8" />
        
        {/* Diagonal Lotus-Petal Rays */}
        <line x1="11" y1="11" x2="37" y2="37" stroke="#334155" strokeWidth="1" strokeLinecap="round" />
        <line x1="11" y1="37" x2="37" y2="11" stroke="#334155" strokeWidth="1" strokeLinecap="round" />

        {/* Central Lotus Seed / City Center Core */}
        <circle cx="24" cy="24" r="5" fill="#0284C7" />
        <circle cx="24" cy="24" r="2.5" fill="#F8FAFC" />

        {/* Strategic Intelligence Waypoints (North-South-East-West Nodes) */}
        <circle cx="24" cy="8" r="2.2" fill="url(#nb-gold)" />
        <circle cx="40" cy="24" r="1.8" fill="#22D3EE" />
        <circle cx="24" cy="40" r="1.8" fill="#22D3EE" />
        <circle cx="8" cy="24" r="1.8" fill="#22D3EE" />

        {/* Sanskrit Crescent Motif Accent */}
        <path 
          d="M20 16 C22 14, 26 14, 28 16" 
          stroke="url(#nb-gold)" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-base font-bold tracking-tight text-white font-sans">
              NagarBodha
            </span>
            <span className="text-xs text-cyan-400 font-medium">
              नगरबोध
            </span>
          </div>
          <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase mt-0.5">
            One City. Awakened Decisions.
          </span>
        </div>
      )}
    </div>
  );
};
