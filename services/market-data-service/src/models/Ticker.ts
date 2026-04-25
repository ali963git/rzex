import mongoose, { Schema, Document } from 'mongoose';

export interface ITicker extends Document {
  pair: string;
  lastPrice: string;
  highPrice24h: string;
  lowPrice24h: string;
  volume24h: string;
  priceChange24h: string;
  priceChangePercent24h: string;
  updatedAt: Date;
}

const TickerSchema = new Schema<ITicker>({
  pair: { type: String, required: true, unique: true },
  lastPrice: { type: String, default: '0' },
  highPrice24h: { type: String, default: '0' },
  lowPrice24h: { type: String, default: '0' },
  volume24h: { type: String, default: '0' },
  priceChange24h: { type: String, default: '0' },
  priceChangePercent24h: { type: String, default: '0' },
  updatedAt: { type: Date, default: Date.now },
});

export const TickerModel = mongoose.model<ITicker>('Ticker', TickerSchema);
