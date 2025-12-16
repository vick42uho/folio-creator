import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', padding = 'p-6' }) => {
  return (
    <div className={`
      relative overflow-hidden
      bg-glass-100 
      backdrop-blur-xl 
      border border-glass-border 
      rounded-2xl 
      shadow-2xl 
      text-blue-50
      ${padding}
      ${className}
    `}>
      {/* Decorative gradient blobs - Updated to Metallic Blue/Cyan */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
      
      {/* Shine effect on top border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-50"></div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;