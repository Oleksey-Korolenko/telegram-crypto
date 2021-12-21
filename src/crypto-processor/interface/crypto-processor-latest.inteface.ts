export interface ICryptoProcessorCryptocurrencyQuote {
  USD: {
    price: number;
  };
}

export interface ICryptoProcessorCryptocurrency {
  symbol: string;
  quote: ICryptoProcessorCryptocurrencyQuote;
}

export interface ICryptoProcessorCryptocurrencySingle {
  [key: string]: ICryptoProcessorCryptocurrency;
}

export interface ICryptoProcessorPreparedCryptocurrency {
  symbol: string;
  priceInUSD: number;
}
