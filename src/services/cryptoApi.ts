import axios from 'axios';
import { CryptoData } from '../types/CryptoTypes';

const BINANCE_API = 'https://api.binance.com/api/v3';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export const getCryptoData = async (): Promise<CryptoData[]> => {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        sparkline: false
      }
    });

    console.log("Response ",response)

    return response.data.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      percentChange: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      image:coin.image
    }));
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return [];
  }
}