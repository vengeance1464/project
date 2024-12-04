import React from 'react';

interface GameContainerProps {
  children?: React.ReactNode;
  className?: string;
}

export const GameContainer: React.FC<GameContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};