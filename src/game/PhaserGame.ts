import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { MainScene } from './scenes/MainScene';

export class PhaserGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super({ ...GameConfig, ...config });
    this.scene.add('MainScene', MainScene);
    this.scene.start('MainScene');
  }
}