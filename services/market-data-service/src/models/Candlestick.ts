import mongoose, { Schema, Document } from 'mongoose';

export interface ICandlestick extends Document {
  pair: string;
  interval: string;
  openTime: Date;
  closeTime: Date;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  tradeCount: number;
}

const CandlestickSchema = new Schema<ICandlestick>({
  pair: { type: String, required: true, index: true },
  interval: { type: String, required: true, index: true },
  openTime: { type: Date, required: true },
  closeTime: { type: Date, required: true },
  open: { type: String, required: true },
  high: { type: String, required: true },
  low: { type: String, required: true },
  close: { type: String, required: true },
  volume: { type: String, default: '0' },
  tradeCount: { type: Number, default: 0 },
});

CandlestickSchema.index({ pair: 1, interval: 1, openTime: -1 });

export const CandlestickModel = mongoose.model<ICandlestick>('Candlestick', CandlestickSchema);
