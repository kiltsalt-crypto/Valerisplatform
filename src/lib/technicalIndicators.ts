import { HistoricalData } from './marketData';

export interface SMAData {
  timestamp: number;
  value: number;
}

export interface RSIData {
  timestamp: number;
  value: number;
}

export interface MACDData {
  timestamp: number;
  macd: number;
  signal: number;
  histogram: number;
}

export interface BollingerBandsData {
  timestamp: number;
  upper: number;
  middle: number;
  lower: number;
}

export function calculateSMA(data: HistoricalData[], period: number): SMAData[] {
  const result: SMAData[] = [];

  if (!data || data.length < period) return result;

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, d) => acc + d.close, 0);
    const avg = sum / period;

    result.push({
      timestamp: data[i].timestamp,
      value: avg,
    });
  }

  return result;
}

export function calculateEMA(data: HistoricalData[], period: number): SMAData[] {
  const result: SMAData[] = [];

  if (!data || data.length < period) return result;

  const multiplier = 2 / (period + 1);

  let ema = data.slice(0, period).reduce((acc, d) => acc + d.close, 0) / period;
  result.push({ timestamp: data[period - 1].timestamp, value: ema });

  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({
      timestamp: data[i].timestamp,
      value: ema,
    });
  }

  return result;
}

export function calculateRSI(data: HistoricalData[], period: number = 14): RSIData[] {
  const result: RSIData[] = [];

  if (!data || data.length < period + 2) return result;

  const changes: number[] = [];

  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }

  for (let i = period; i < changes.length; i++) {
    if (i + 1 >= data.length) break;

    const slice = changes.slice(i - period, i);
    const gains = slice.filter(c => c > 0).reduce((acc, c) => acc + c, 0) / period;
    const losses = Math.abs(slice.filter(c => c < 0).reduce((acc, c) => acc + c, 0)) / period;

    const rs = gains / (losses || 0.0001);
    const rsi = 100 - (100 / (1 + rs));

    result.push({
      timestamp: data[i + 1].timestamp,
      value: rsi,
    });
  }

  return result;
}

export function calculateMACD(
  data: HistoricalData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDData[] {
  if (!data || data.length < slowPeriod) return [];

  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  const macdLine: { timestamp: number; value: number }[] = [];

  for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
    const fastIndex = fastEMA.findIndex(d => d.timestamp === slowEMA[i].timestamp);
    if (fastIndex !== -1) {
      macdLine.push({
        timestamp: slowEMA[i].timestamp,
        value: fastEMA[fastIndex].value - slowEMA[i].value,
      });
    }
  }

  const macdData: HistoricalData[] = macdLine.map(d => ({
    timestamp: d.timestamp,
    open: d.value,
    high: d.value,
    low: d.value,
    close: d.value,
    volume: 0,
  }));

  const signalLine = calculateEMA(macdData, signalPeriod);

  const result: MACDData[] = [];
  for (let i = 0; i < signalLine.length; i++) {
    const macdIndex = macdLine.findIndex(d => d.timestamp === signalLine[i].timestamp);
    if (macdIndex !== -1) {
      const macdValue = macdLine[macdIndex].value;
      const signalValue = signalLine[i].value;
      result.push({
        timestamp: signalLine[i].timestamp,
        macd: macdValue,
        signal: signalValue,
        histogram: macdValue - signalValue,
      });
    }
  }

  return result;
}

export function calculateBollingerBands(
  data: HistoricalData[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsData[] {
  const result: BollingerBandsData[] = [];

  if (!data || data.length < period) return result;

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const closes = slice.map(d => d.close);

    const sum = closes.reduce((acc, c) => acc + c, 0);
    const mean = sum / period;

    const squaredDiffs = closes.map(c => Math.pow(c - mean, 2));
    const variance = squaredDiffs.reduce((acc, d) => acc + d, 0) / period;
    const standardDeviation = Math.sqrt(variance);

    result.push({
      timestamp: data[i].timestamp,
      upper: mean + (standardDeviation * stdDev),
      middle: mean,
      lower: mean - (standardDeviation * stdDev),
    });
  }

  return result;
}

export function calculateVolume(data: HistoricalData[]): { timestamp: number; volume: number }[] {
  return data.map(d => ({
    timestamp: d.timestamp,
    volume: d.volume,
  }));
}
