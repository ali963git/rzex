import { Router, Request, Response } from 'express';
import { TickerModel } from '../models/Ticker';
import { CandlestickModel } from '../models/Candlestick';
import { logger } from '../config/logger';

const router = Router();

// GET /api/market/tickers — Get all tickers
router.get('/tickers', async (_req: Request, res: Response): Promise<void> => {
  try {
    const tickers = await TickerModel.find().lean();
    res.json({ success: true, data: tickers });
  } catch (err) {
    logger.error('Get tickers failed', { error: (err as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to get tickers' },
    });
  }
});

// GET /api/market/ticker/:pair — Get ticker for a pair
router.get('/ticker/:pair', async (req: Request, res: Response): Promise<void> => {
  const pair = req.params.pair.replace('-', '/');

  try {
    const ticker = await TickerModel.findOne({ pair }).lean();
    if (!ticker) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Ticker not found' },
      });
      return;
    }
    res.json({ success: true, data: ticker });
  } catch (err) {
    logger.error('Get ticker failed', { error: (err as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to get ticker' },
    });
  }
});

// GET /api/market/candlesticks/:pair — Get candlestick data
router.get('/candlesticks/:pair', async (req: Request, res: Response): Promise<void> => {
  const pair = req.params.pair.replace('-', '/');
  const interval = (req.query.interval as string) || '1h';
  const limit = parseInt(req.query.limit as string || '100', 10);

  try {
    const candlesticks = await CandlestickModel
      .find({ pair, interval })
      .sort({ openTime: -1 })
      .limit(Math.min(limit, 1000))
      .lean();

    res.json({ success: true, data: candlesticks.reverse() });
  } catch (err) {
    logger.error('Get candlesticks failed', { error: (err as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to get candlesticks' },
    });
  }
});

// GET /api/market/pairs — Get available trading pairs
router.get('/pairs', (_req: Request, res: Response): void => {
  const pairs = [
    { symbol: 'BTC/USDT', baseAsset: 'BTC', quoteAsset: 'USDT', status: 'active' },
    { symbol: 'ETH/USDT', baseAsset: 'ETH', quoteAsset: 'USDT', status: 'active' },
    { symbol: 'BNB/USDT', baseAsset: 'BNB', quoteAsset: 'USDT', status: 'active' },
    { symbol: 'SOL/USDT', baseAsset: 'SOL', quoteAsset: 'USDT', status: 'active' },
    { symbol: 'XRP/USDT', baseAsset: 'XRP', quoteAsset: 'USDT', status: 'active' },
    { symbol: 'ADA/USDT', baseAsset: 'ADA', quoteAsset: 'USDT', status: 'active' },
    { symbol: 'DOGE/USDT', baseAsset: 'DOGE', quoteAsset: 'USDT', status: 'active' },
    { symbol: 'ETH/BTC', baseAsset: 'ETH', quoteAsset: 'BTC', status: 'active' },
    { symbol: 'BNB/BTC', baseAsset: 'BNB', quoteAsset: 'BTC', status: 'active' },
    { symbol: 'SOL/BTC', baseAsset: 'SOL', quoteAsset: 'BTC', status: 'active' },
  ];

  res.json({ success: true, data: pairs });
});

export default router;
