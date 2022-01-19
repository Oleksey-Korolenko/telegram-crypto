export interface ICryptocurrencyAPIQuote {
  USD: {
    price: number;
    volume_24h: number;
    volume_change_24h: number;
    volume_24h_reported: number;
    volume_7d: number;
    volume_7d_reported: number;
    volume_30d: number;
    volume_30d_reported: number;
    market_cap: number;
    market_cap_dominance: number;
    fully_diluted_market_cap: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    percent_change_60d: number;
    percent_change_90d: number;
  };
}

export interface ICryptocurrencyAPI {
  id: number;
  symbol: string;
  name: string;
  is_active: number;
  circulating_supply: number;
  total_supply: number;
  market_cap_by_total_supply: number;
  max_supply: number;
  quote: ICryptocurrencyAPIQuote;
}

export interface ICryptocurrencyAPISingle {
  [key: string]: ICryptocurrencyAPI;
}

export interface ICryptocurrencyAPIPrepared {
  symbol: string;
  priceInUSD: number;
}
