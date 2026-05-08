db = db.getSiblingDB('market_data');

db.createCollection('candles');
db.candles.createIndex({ pair: 1, interval: 1, timestamp: 1 });
db.candles.createIndex({ timestamp: -1 });

db.createCollection('trades');
db.trades.createIndex({ pair: 1, timestamp: -1 });
db.trades.createIndex({ timestamp: -1 });

db.createCollection('order_books');
db.order_books.createIndex({ pair: 1, timestamp: -1 });

db.createCollection('tickers');
db.tickers.createIndex({ pair: 1 }, { unique: true });
db.tickers.createIndex({ lastUpdate: -1 });

db.createCollection('market_stats');
db.market_stats.createIndex({ pair: 1, timestamp: -1 });

print('MongoDB market_data database initialized successfully!');
