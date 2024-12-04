import { Types } from 'phaser';

export const GameConfig: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#282c34',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: []
};