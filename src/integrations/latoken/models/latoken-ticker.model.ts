export interface LatokenTickerModel {
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  volume24h: string;
  volume7d: string;
  change24h: string;
  change7d: string;
  amount24h: string;
  amount7d: string;
  lastPrice: string;
  lastQuantity: string;
  bestBid: string;
  bestBidQuantity: string;
  bestAsk: string;
  bestAskQuantity: string;
  updateTimestamp: number;
}
