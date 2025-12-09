export interface Instrument {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'future' | 'forex' | 'crypto' | 'index';
  exchange: string;
  sector?: string;
  price: number;
  change: number;
  volume: string;
  marketCap?: string;
}

export const POPULAR_STOCKS: Instrument[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 189.50, change: 2.45, volume: '58.2M', marketCap: '2.98T' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 378.91, change: 3.12, volume: '22.8M', marketCap: '2.82T' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 141.80, change: 1.25, volume: '25.3M', marketCap: '1.78T' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Consumer Cyclical', price: 155.33, change: -0.89, volume: '45.6M', marketCap: '1.61T' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 495.22, change: 8.75, volume: '48.3M', marketCap: '1.22T' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Consumer Cyclical', price: 242.84, change: -3.22, volume: '112.4M', marketCap: '772B' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 358.47, change: 4.56, volume: '18.9M', marketCap: '910B' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 362.45, change: 1.23, volume: '3.4M', marketCap: '784B' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 162.88, change: 0.95, volume: '9.8M', marketCap: '465B' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 256.73, change: 2.11, volume: '6.2M', marketCap: '532B' },
];

export const TECH_STOCKS: Instrument[] = [
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 118.95, change: 2.34, volume: '58.9M', marketCap: '192B' },
  { symbol: 'INTC', name: 'Intel Corporation', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 43.22, change: -0.55, volume: '45.2M', marketCap: '183B' },
  { symbol: 'CRM', name: 'Salesforce Inc.', type: 'stock', exchange: 'NYSE', sector: 'Technology', price: 229.84, change: 3.45, volume: '5.6M', marketCap: '223B' },
  { symbol: 'ORCL', name: 'Oracle Corporation', type: 'stock', exchange: 'NYSE', sector: 'Technology', price: 108.76, change: 1.89, volume: '8.4M', marketCap: '305B' },
  { symbol: 'ADBE', name: 'Adobe Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 543.21, change: 4.12, volume: '2.8M', marketCap: '243B' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Communication Services', price: 478.33, change: -2.15, volume: '3.9M', marketCap: '206B' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Financial Services', price: 62.45, change: 0.78, volume: '12.3M', marketCap: '67B' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 51.89, change: 0.45, volume: '18.7M', marketCap: '209B' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 895.67, change: 12.34, volume: '2.1M', marketCap: '418B' },
  { symbol: 'QCOM', name: 'QUALCOMM Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 144.56, change: 1.89, volume: '9.8M', marketCap: '161B' },
  { symbol: 'TXN', name: 'Texas Instruments', type: 'stock', exchange: 'NASDAQ', sector: 'Technology', price: 168.92, change: 0.67, volume: '4.5M', marketCap: '153B' },
  { symbol: 'IBM', name: 'IBM Corporation', type: 'stock', exchange: 'NYSE', sector: 'Technology', price: 158.34, change: 1.12, volume: '5.2M', marketCap: '145B' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', type: 'stock', exchange: 'NYSE', sector: 'Technology', price: 672.45, change: 8.23, volume: '1.8M', marketCap: '138B' },
  { symbol: 'SHOP', name: 'Shopify Inc.', type: 'stock', exchange: 'NYSE', sector: 'Technology', price: 72.34, change: -0.98, volume: '8.9M', marketCap: '92B' },
  { symbol: 'SQ', name: 'Block Inc.', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 68.45, change: 1.23, volume: '11.2M', marketCap: '42B' },
];

export const FINANCE_STOCKS: Instrument[] = [
  { symbol: 'BAC', name: 'Bank of America Corp', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 32.67, change: 0.34, volume: '45.8M', marketCap: '254B' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 48.92, change: 0.56, volume: '21.3M', marketCap: '172B' },
  { symbol: 'GS', name: 'Goldman Sachs Group', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 385.67, change: 2.45, volume: '2.1M', marketCap: '129B' },
  { symbol: 'MS', name: 'Morgan Stanley', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 88.34, change: 1.12, volume: '8.9M', marketCap: '142B' },
  { symbol: 'C', name: 'Citigroup Inc.', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 52.78, change: 0.89, volume: '16.7M', marketCap: '99B' },
  { symbol: 'AXP', name: 'American Express', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 189.45, change: 1.67, volume: '3.4M', marketCap: '138B' },
  { symbol: 'BLK', name: 'BlackRock Inc.', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 782.34, change: 3.45, volume: '567K', marketCap: '116B' },
  { symbol: 'SCHW', name: 'Charles Schwab Corp', type: 'stock', exchange: 'NYSE', sector: 'Financial Services', price: 66.89, change: 0.78, volume: '8.2M', marketCap: '123B' },
];

export const HEALTHCARE_STOCKS: Instrument[] = [
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', exchange: 'NYSE', sector: 'Healthcare', price: 156.78, change: 0.89, volume: '12.4M', marketCap: '382B' },
  { symbol: 'UNH', name: 'UnitedHealth Group', type: 'stock', exchange: 'NYSE', sector: 'Healthcare', price: 524.67, change: 4.23, volume: '3.2M', marketCap: '486B' },
  { symbol: 'PFE', name: 'Pfizer Inc.', type: 'stock', exchange: 'NYSE', sector: 'Healthcare', price: 28.45, change: -0.34, volume: '34.5M', marketCap: '161B' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', type: 'stock', exchange: 'NYSE', sector: 'Healthcare', price: 152.34, change: 1.23, volume: '7.8M', marketCap: '269B' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', type: 'stock', exchange: 'NYSE', sector: 'Healthcare', price: 538.90, change: 2.45, volume: '1.4M', marketCap: '208B' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', type: 'stock', exchange: 'NYSE', sector: 'Healthcare', price: 107.89, change: 0.67, volume: '11.2M', marketCap: '273B' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', type: 'stock', exchange: 'NYSE', sector: 'Healthcare', price: 598.23, change: 8.45, volume: '3.1M', marketCap: '568B' },
];

export const ENERGY_STOCKS: Instrument[] = [
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', type: 'stock', exchange: 'NYSE', sector: 'Energy', price: 102.45, change: 1.23, volume: '18.9M', marketCap: '411B' },
  { symbol: 'CVX', name: 'Chevron Corporation', type: 'stock', exchange: 'NYSE', sector: 'Energy', price: 147.89, change: 0.98, volume: '8.7M', marketCap: '272B' },
  { symbol: 'COP', name: 'ConocoPhillips', type: 'stock', exchange: 'NYSE', sector: 'Energy', price: 116.34, change: 1.45, volume: '7.2M', marketCap: '142B' },
  { symbol: 'SLB', name: 'Schlumberger NV', type: 'stock', exchange: 'NYSE', sector: 'Energy', price: 52.67, change: 0.78, volume: '12.3M', marketCap: '74B' },
];

export const CONSUMER_STOCKS: Instrument[] = [
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock', exchange: 'NYSE', sector: 'Consumer Defensive', price: 162.45, change: 1.23, volume: '8.9M', marketCap: '439B' },
  { symbol: 'HD', name: 'Home Depot Inc.', type: 'stock', exchange: 'NYSE', sector: 'Consumer Cyclical', price: 318.67, change: 2.34, volume: '3.8M', marketCap: '321B' },
  { symbol: 'MCD', name: 'McDonalds Corporation', type: 'stock', exchange: 'NYSE', sector: 'Consumer Cyclical', price: 284.56, change: 1.45, volume: '3.2M', marketCap: '208B' },
  { symbol: 'NKE', name: 'Nike Inc.', type: 'stock', exchange: 'NYSE', sector: 'Consumer Cyclical', price: 98.34, change: -0.89, volume: '9.1M', marketCap: '152B' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', type: 'stock', exchange: 'NASDAQ', sector: 'Consumer Cyclical', price: 96.78, change: 0.67, volume: '7.8M', marketCap: '111B' },
  { symbol: 'KO', name: 'Coca-Cola Company', type: 'stock', exchange: 'NYSE', sector: 'Consumer Defensive', price: 58.92, change: 0.34, volume: '15.6M', marketCap: '255B' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', type: 'stock', exchange: 'NASDAQ', sector: 'Consumer Defensive', price: 167.89, change: 0.78, volume: '4.5M', marketCap: '231B' },
];

export const MAJOR_ETFS: Instrument[] = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'etf', exchange: 'NYSE', price: 457.23, change: 1.45, volume: '78.5M', marketCap: '418B' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf', exchange: 'NASDAQ', price: 389.67, change: 2.12, volume: '42.3M', marketCap: '211B' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', type: 'etf', exchange: 'NYSE', price: 202.45, change: 0.89, volume: '28.9M', marketCap: '68B' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average', type: 'etf', exchange: 'NYSE', price: 385.12, change: 1.23, volume: '4.2M', marketCap: '31B' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market', type: 'etf', exchange: 'NYSE', price: 238.90, change: 1.34, volume: '3.8M', marketCap: '322B' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf', exchange: 'NYSE', price: 419.56, change: 1.45, volume: '5.2M', marketCap: '388B' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets', type: 'etf', exchange: 'NYSE', price: 48.23, change: 0.34, volume: '12.1M', marketCap: '115B' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets', type: 'etf', exchange: 'NYSE', price: 42.67, change: -0.23, volume: '14.5M', marketCap: '82B' },
  { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond', type: 'etf', exchange: 'NYSE', price: 98.45, change: 0.12, volume: '5.6M', marketCap: '94B' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond', type: 'etf', exchange: 'NASDAQ', price: 91.34, change: 0.45, volume: '18.9M', marketCap: '42B' },
  { symbol: 'GLD', name: 'SPDR Gold Trust', type: 'etf', exchange: 'NYSE', price: 192.78, change: -0.56, volume: '8.7M', marketCap: '68B' },
  { symbol: 'SLV', name: 'iShares Silver Trust', type: 'etf', exchange: 'NYSE', price: 23.45, change: 0.23, volume: '24.3M', marketCap: '14B' },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR', type: 'etf', exchange: 'NYSE', price: 84.56, change: 0.89, volume: '18.2M', marketCap: '38B' },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR', type: 'etf', exchange: 'NYSE', price: 38.92, change: 0.45, volume: '45.6M', marketCap: '42B' },
  { symbol: 'XLK', name: 'Technology Select Sector SPDR', type: 'etf', exchange: 'NYSE', price: 189.34, change: 2.12, volume: '12.3M', marketCap: '52B' },
  { symbol: 'XLV', name: 'Health Care Select Sector SPDR', type: 'etf', exchange: 'NYSE', price: 132.45, change: 0.78, volume: '9.8M', marketCap: '34B' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'etf', exchange: 'NYSE', price: 48.67, change: 1.89, volume: '8.9M', marketCap: '7.2B' },
];

export const FUTURES: Instrument[] = [
  { symbol: 'ES', name: 'E-mini S&P 500', type: 'future', exchange: 'CME', price: 4850.25, change: 12.50, volume: '2.4M' },
  { symbol: 'NQ', name: 'E-mini Nasdaq', type: 'future', exchange: 'CME', price: 17250.75, change: -25.25, volume: '1.8M' },
  { symbol: 'YM', name: 'E-mini Dow', type: 'future', exchange: 'CBOT', price: 38500.00, change: 45.00, volume: '850K' },
  { symbol: 'RTY', name: 'E-mini Russell 2000', type: 'future', exchange: 'CME', price: 2025.50, change: 8.25, volume: '680K' },
  { symbol: 'CL', name: 'Crude Oil', type: 'future', exchange: 'NYMEX', price: 82.45, change: 1.20, volume: '1.2M' },
  { symbol: 'GC', name: 'Gold', type: 'future', exchange: 'COMEX', price: 2050.30, change: -5.70, volume: '950K' },
  { symbol: 'SI', name: 'Silver', type: 'future', exchange: 'COMEX', price: 24.85, change: 0.15, volume: '420K' },
  { symbol: 'NG', name: 'Natural Gas', type: 'future', exchange: 'NYMEX', price: 2.65, change: -0.08, volume: '580K' },
  { symbol: '6E', name: 'Euro FX', type: 'future', exchange: 'CME', price: 1.0845, change: 0.0012, volume: '310K' },
  { symbol: '6J', name: 'Japanese Yen', type: 'future', exchange: 'CME', price: 0.6720, change: -0.0015, volume: '280K' },
  { symbol: 'ZB', name: '30-Year T-Bond', type: 'future', exchange: 'CBOT', price: 122.15, change: 0.25, volume: '520K' },
  { symbol: 'ZN', name: '10-Year T-Note', type: 'future', exchange: 'CBOT', price: 110.22, change: 0.12, volume: '890K' },
];

export const CRYPTO: Instrument[] = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', exchange: 'Crypto', price: 42567.89, change: 1234.56, volume: '28.9B' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', exchange: 'Crypto', price: 2234.67, change: 89.23, volume: '15.2B' },
  { symbol: 'BNB', name: 'Binance Coin', type: 'crypto', exchange: 'Crypto', price: 312.45, change: -8.90, volume: '1.8B' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', exchange: 'Crypto', price: 98.76, change: 4.32, volume: '2.1B' },
  { symbol: 'ADA', name: 'Cardano', type: 'crypto', exchange: 'Crypto', price: 0.58, change: 0.02, volume: '456M' },
];

export const ALL_INSTRUMENTS = [
  ...POPULAR_STOCKS,
  ...TECH_STOCKS,
  ...FINANCE_STOCKS,
  ...HEALTHCARE_STOCKS,
  ...ENERGY_STOCKS,
  ...CONSUMER_STOCKS,
  ...MAJOR_ETFS,
  ...FUTURES,
  ...CRYPTO,
];

export const getInstrumentBySymbol = (symbol: string): Instrument | undefined => {
  return ALL_INSTRUMENTS.find(i => i.symbol === symbol);
};

export const searchInstruments = (query: string): Instrument[] => {
  const searchTerm = query.toLowerCase();
  return ALL_INSTRUMENTS.filter(i =>
    i.symbol.toLowerCase().includes(searchTerm) ||
    i.name.toLowerCase().includes(searchTerm)
  );
};

export const getInstrumentsByType = (type: Instrument['type']): Instrument[] => {
  return ALL_INSTRUMENTS.filter(i => i.type === type);
};

export const getInstrumentsBySector = (sector: string): Instrument[] => {
  return ALL_INSTRUMENTS.filter(i => i.sector === sector);
};
