import { WebSocketMessage, ProcessedTickerData } from '../types/WebSocketTypes';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private subscribers: ((data: ProcessedTickerData) => void)[] = [];
  private symbols: string[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(symbols: string[] = []) {
    this.symbols = symbols;
    this.connect();
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const streams = this.symbols.length > 0 
        ? this.symbols.map(s => `${s.toLowerCase()}@ticker`).join('/')
        : 'btcusdt@ticker/ethusdt@ticker';

      const wsEndpoint = `wss://stream.binance.com:9443/stream?streams=${streams}`;
      this.ws = new WebSocket(wsEndpoint);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  private handleOpen() {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const { data } = JSON.parse(event.data);
      if (data) {
        const processedData = this.processMessage(data);
        this.notifySubscribers(processedData);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    if (!event.wasClean) {
      console.log('WebSocket connection closed unexpectedly');
      this.scheduleReconnect();
    }
  }

  private handleError() {
    console.error('WebSocket error occurred');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.scheduleReconnect();
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.reconnectTimer) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, this.reconnectTimeout * this.reconnectAttempts);
    }
  }

  private processMessage(message: WebSocketMessage): ProcessedTickerData {
    return {
      symbol: message.s,
      price: parseFloat(message.c),
      percentChange: parseFloat(message.P),
      volume: parseFloat(message.v)
    };
  }

  public subscribe(callback: (data: ProcessedTickerData) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(data: ProcessedTickerData) {
    this.subscribers.forEach(callback => callback(data));
  }

  public updateSymbols(symbols: string[]) {
    this.symbols = symbols;
    if (this.ws) {
      this.ws.close();
      this.connect();
    }
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers = [];
  }
}