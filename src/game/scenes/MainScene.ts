import { Scene } from 'phaser';

export class MainScene extends Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Load game assets here
  }

  create() {
    const text = this.add.text(400, 300, 'Welcome to Phaser + React!', {
      fontSize: '32px',
      color: '#fff'
    });
    text.setOrigin(0.5);
  }

  update() {
    // Game loop logic here
  }
}