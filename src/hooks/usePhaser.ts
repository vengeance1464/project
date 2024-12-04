import { useEffect, useRef } from 'react';
import { PhaserGame } from '../game/PhaserGame';
import { GameConfig } from '../game/config/GameConfig';

export const usePhaser = (containerRef: React.RefObject<HTMLDivElement>) => {
  const gameRef = useRef<PhaserGame | null>(null);

  useEffect(() => {
    if (!gameRef.current && containerRef.current) {
      gameRef.current = new PhaserGame({
        ...GameConfig,
        parent: containerRef.current
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [containerRef]);

  return gameRef.current;
};