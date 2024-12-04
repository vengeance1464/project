import React, { useRef } from 'react';
import { usePhaser } from '../hooks/usePhaser';

export const Game: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  usePhaser(containerRef);

  return (
    <div 
      ref={containerRef}
      className="w-full h-[600px] flex items-center justify-center"
    />
  );
};