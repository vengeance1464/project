export interface WebSocketMessage {
  e: string;  // Event type
  E: number;  // Event time
  s: string;  // Symbol
  p: string;  // Price change
  P: string;  // Price change percent
  w: string;  // Weighted average price
  c: string;  // Last price
  Q: string;  // Last quantity
  o: string;  // Open price
  h: string;  // High price
  l: string;  // Low price
  v: string;  // Total traded volume
  q: string;  // Total traded quote asset volume
}

export interface ProcessedTickerData {
  symbol: string;
  price: number;
  percentChange: number;
  volume: number;
}