export interface CryptoData {
  symbol: string;
  price: number;
  percentChange: number;
  marketCap: number;
  volume: number;
  image:string;
  name:string;
}

export interface BubbleData extends CryptoData {
  r: number;  // radius for d3
  x: number;  // x position
  y: number;  // y position
}