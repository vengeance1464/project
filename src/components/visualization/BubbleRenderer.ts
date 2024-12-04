import * as PIXI from 'pixi.js';
import { CryptoData } from '../../types/CryptoTypes';

export class BubbleRenderer {
  private app: PIXI.Application;
  private bubbleContainer: PIXI.Container;
  private bubbles: Map<string, PIXI.Container>;
  private ticker: PIXI.Ticker | null = null;

  constructor(width: number, height: number) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x1a1a1a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });

    this.bubbleContainer = new PIXI.Container();
    this.app.stage.addChild(this.bubbleContainer);
    this.bubbleContainer.x = width / 2;
    this.bubbleContainer.y = height / 2;

    this.bubbles = new Map();
    this.setupInteractivity();
  }

  private setupInteractivity() {
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
  }

  public getView(): HTMLCanvasElement {
    return this.app.view as HTMLCanvasElement;
  }

  public updateBubbles(
    cryptoData: CryptoData[],
    onSelect: (symbol: string) => void
  ) {
    const maxMarketCap = Math.max(...cryptoData.map(d => d.marketCap));
    
    cryptoData.forEach(data => this.updateBubble(data, maxMarketCap, onSelect));
    this.startPhysicsSimulation();
  }

  private updateBubble(
    data: CryptoData,
    maxMarketCap: number,
    onSelect: (symbol: string) => void
  ) {
    let bubbleGroup = this.bubbles.get(data.symbol);
    const radius = Math.sqrt(data.marketCap / maxMarketCap) * 50 + 20;

    if (!bubbleGroup) {
      bubbleGroup = this.createBubbleGroup(data.symbol, onSelect);
    }

    this.updateBubbleGraphics(bubbleGroup, data, radius);
  }

  private createBubbleGroup(
    symbol: string,
    onSelect: (symbol: string) => void
  ): PIXI.Container {
    const bubbleGroup = new PIXI.Container();
    bubbleGroup.eventMode = 'static';
    bubbleGroup.x = (Math.random() - 0.5) * 400;
    bubbleGroup.y = (Math.random() - 0.5) * 400;
    bubbleGroup.onclick = () => onSelect(symbol);

    this.bubbleContainer.addChild(bubbleGroup);
    this.bubbles.set(symbol, bubbleGroup);

    return bubbleGroup;
  }

  private updateBubbleGraphics(
    bubbleGroup: PIXI.Container,
    data: CryptoData,
    radius: number
  ) {
    bubbleGroup.removeChildren();

    const circle = this.createCircle(data.percentChange, radius);
    const symbolText = this.createSymbolText(data.symbol, radius);
    const priceText = this.createPriceText(data.price, radius);

    bubbleGroup.addChild(circle, symbolText, priceText);
    this.setupBubbleInteractivity(bubbleGroup, circle);
  }

  private createCircle(percentChange: number, radius: number): PIXI.Graphics {
    const circle = new PIXI.Graphics();
    const color = percentChange >= 0 ? 0x22c55e : 0xef4444;
    
    circle.beginFill(color, 0.6)
      .lineStyle(2, color, 0.8)
      .drawCircle(0, 0, radius)
      .endFill();

    return circle;
  }

  private createSymbolText(symbol: string, radius: number): PIXI.Text {
    const text = new PIXI.Text(symbol, {
      fontFamily: 'Arial',
      fontSize: Math.min(radius * 0.4, 16),
      fill: 0xffffff,
      align: 'center',
    });
    text.anchor.set(0.5);
    return text;
  }

  private createPriceText(price: number, radius: number): PIXI.Text {
    const text = new PIXI.Text(
      `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      {
        fontFamily: 'Arial',
        fontSize: Math.min(radius * 0.3, 12),
        fill: 0xcccccc,
        align: 'center',
      }
    );
    text.anchor.set(0.5);
    text.y = radius * 0.4;
    return text;
  }

  private setupBubbleInteractivity(
    bubbleGroup: PIXI.Container,
    circle: PIXI.Graphics
  ) {
    bubbleGroup.onpointerover = () => {
      circle.alpha = 0.8;
      bubbleGroup.scale.set(1.1);
    };

    bubbleGroup.onpointerout = () => {
      circle.alpha = 0.6;
      bubbleGroup.scale.set(1);
    };
  }

  private startPhysicsSimulation() {
    if (this.ticker) {
      this.ticker.destroy();
    }

    this.ticker = this.app.ticker.add(() => {
      const bubbles = Array.from(this.bubbles.values());
      this.updateBubblePositions(bubbles);
    });
  }

  private updateBubblePositions(bubbles: PIXI.Container[]) {
    bubbles.forEach(bubble => {
      bubble.x += (Math.random() - 0.5) * 2;
      bubble.y += (Math.random() - 0.5) * 2;

      const bounds = 400;
      bubble.x = Math.max(-bounds, Math.min(bounds, bubble.x));
      bubble.y = Math.max(-bounds, Math.min(bounds, bubble.y));

      this.handleCollisions(bubble, bubbles);
    });
  }

  private handleCollisions(bubble: PIXI.Container, bubbles: PIXI.Container[]) {
    bubbles.forEach(other => {
      if (bubble !== other) {
        const dx = other.x - bubble.x;
        const dy = other.y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (bubble.width + other.width) / 2;

        if (distance < minDistance) {
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * (minDistance - distance) * 0.05;
          const pushY = Math.sin(angle) * (minDistance - distance) * 0.05;
          
          bubble.x -= pushX;
          bubble.y -= pushY;
          other.x += pushX;
          other.y += pushY;
        }
      }
    });
  }

  public destroy() {
    if (this.ticker) {
      this.ticker.destroy();
      this.ticker = null;
    }
    this.bubbles.clear();
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
  }
}