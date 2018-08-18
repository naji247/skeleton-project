import { CronJob } from 'cron';
import { ALPHA_VANTAGE_API_KEY } from '../secrets';
import Price from '../data/models/Price';
import DailyPrice from '../data/models/DailyPrice';
import MarketCap from '../data/models/MarketCap';
import request from 'request-promise';
import _ from 'lodash';
import moment from 'moment';
import uuid from 'aguid';

const COINBASE_URL = 'https://www.coinbase.com/api/v2/prices/';
const ALPHAVANTAGE_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=1min&apikey=${ALPHA_VANTAGE_API_KEY}&symbol=`;
const ALPHAVANTAGE_DAILY_PRICE = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&apikey=${ALPHA_VANTAGE_API_KEY}&symbol=`;
const COINMARKETCAP_URL = 'https://api.coinmarketcap.com/v1/ticker/';
const GOOGLE_FINANCE_API = 'https://finance.google.com/finance?output=json&q=';
const COINMARKETCAP_HISTORY_URL = (coin, start, end) => {
  return `https://graphs2.coinmarketcap.com/currencies/${_.toLower(
    coin,
  )}/${start.getTime()}/${end.getTime()}/`;
};

const coins = [
  { ticker: 'BTC', name: 'Bitcoin' },
  { ticker: 'ETH', name: 'Ethereum' },
  { ticker: 'LTC', name: 'Litecoin' },
  { ticker: 'DAI', name: 'Dai' },
  { ticker: 'USDT', name: 'Tether' },
  { ticker: 'BITUSD', name: 'bitUSD' },
];

const etfs = ['SPY', 'AGG', 'GLD'];

const getPriceHistory = async () => {
  _.forEach(coins, async coin => {
    // History Coin Prices

    if (_.includes(['BTC', 'ETH', 'LTC'], coin.ticker)) {
      // Get from Coinbase
      const historyUrl =
        COINBASE_URL + coin.ticker + '-USD/historic?period=year';
      const response = await request({ url: historyUrl, json: true });

      try {
        _.forEach(response.data.prices, async date_price_obj => {
          const { price, time } = date_price_obj;
          const formattedTime = moment(time)
            .startOf('day')
            .toDate();
          await DailyPrice.upsert({
            id: uuid(coin.ticker + formattedTime.toISOString()),
            price: price,
            ticker: coin.ticker,
            timestamp: formattedTime,
          });
        });
      } catch (error) {}
    } else {
      // Get from CoinMC
      const historyUrl = COINMARKETCAP_HISTORY_URL(
        coin.name,
        moment()
          .startOf('day')
          .subtract(1, 'year')
          .toDate(),
        moment()
          .startOf('day')
          .toDate(),
      );
      const response = await request({ url: historyUrl, json: true });
      if (response && response['price_usd']) {
        try {
          _.forEach(response['price_usd'], async priceArray => {
            const time = moment(priceArray[0])
              .startOf('day')
              .toDate();
            const price = priceArray[1];
            await DailyPrice.upsert({
              id: uuid(coin.ticker + time.toISOString()),
              ticker: coin.ticker,
              price: price,
              timestamp: time,
            });
          });
        } catch (error) {}
      }
    }
  });

  _.forEach(etfs, async etf => {
    const alphavantageUrl = ALPHAVANTAGE_DAILY_PRICE + etf;
    const response = await request({ url: alphavantageUrl, json: true });
    _.forEach(response[`Time Series (Daily)`], async (value, key) => {
      const date = moment(key)
        .startOf('day')
        .toDate();
      const price = value[`5. adjusted close`];

      await DailyPrice.upsert({
        id: uuid(etf + date.toISOString()),
        price: price,
        ticker: etf,
        timestamp: date,
      });
    });
  });
};

const priceHistoryCron = new CronJob(
  '00 06 * * * *',
  getPriceHistory,
  null,
  false,
  'America/Los_Angeles',
);

const pricesCron = new CronJob(
  '*/40 * * * * *',
  async () => {
    _.forEach(coins, async coin => {
      // Coin Prices
      const priceUrl = COINMARKETCAP_URL + coin.name;
      const response = await request({ url: priceUrl, json: true });
      if (response && response.length > 0 && response[0]['price_usd']) {
        try {
          const price = response[0]['price_usd'];
          const time = new Date(parseInt(response[0]['last_updated']) * 1000);
          await Price.upsert({
            id: uuid(coin.ticker + time.toISOString()),
            ticker: coin.ticker,
            price: price,
            timestamp: time,
          });
        } catch (error) {}
      }
    });

    _.forEach(etfs, async etf => {
      const etfPriceUrl = ALPHAVANTAGE_URL + etf;
      const res3 = await request({ url: etfPriceUrl, json: true });
      if (res3) {
        try {
          const lastRefresh = res3['Meta Data']['3. Last Refreshed'];
          const etfPrice = parseFloat(
            res3['Time Series (1min)'][lastRefresh]['4. close'],
          );

          await Price.upsert({
            id: uuid(etf + new Date(lastRefresh).toISOString()),
            ticker: etf,
            price: etfPrice,
            timestamp: new Date(lastRefresh),
          });
        } catch (error) {}
      }
    });
  },
  null,
  false,
  'America/Los_Angeles',
);

const marketCapCron = new CronJob(
  '*/60 * * * * *',
  async () => {
    _.forEach(coins, async coin => {
      // Market Caps
      const marketCapUrl = COINMARKETCAP_URL + coin.name;
      const res2 = await request({ url: marketCapUrl, json: true });
      if (res2 && res2.length > 0 && res2[0]['market_cap_usd']) {
        const marketCap = res2[0]['market_cap_usd'];
        try {
          await MarketCap.upsert({
            ticker: coin.ticker,
            market_cap: marketCap,
          });
        } catch (error) {}
      }
    });

    _.forEach(etfs, async etf => {
      const etfMarketCapUrl = GOOGLE_FINANCE_API + etf;
      const res3 = await request({ url: etfMarketCapUrl, json: true });
      if (res3) {
        try {
          const json = JSON.parse(res3.substring(3));
          // REMOVE the B for Billion
          const etfMarketCap =
            parseFloat(json[0]['mc'].replace(/B/g, '')) * 1e9;

          await MarketCap.upsert({
            ticker: etf,
            market_cap: etfMarketCap,
          });
        } catch (error) {}
      }
    });
  },
  null,
  false,
  'America/Los_Angeles',
);

export const startMarketCapCron = (req, res, next) => {
  try {
    marketCapCron.start();
    marketCapCron.running = true;
    res.send('Market Cap CRON started');
  } catch (error) {
    res.send(error);
  }
};

export const statusMarketCapCron = (req, res, next) => {
  if (marketCapCron.running) {
    res.send('Market Cap CRON is RUNNING');
  } else {
    res.send('Market Cap CRON is STOPPED');
  }
};

export const stopMarketCapCron = (req, res, next) => {
  try {
    marketCapCron.stop();
    marketCapCron.running = false;
    res.send('Market Cap CRON stopped');
  } catch (error) {
    res.send(error);
  }
};

export const startPricesCron = (req, res, next) => {
  try {
    pricesCron.start();
    pricesCron.running = true;
    res.send('Prices CRON started');
  } catch (error) {
    res.send(error);
  }
};

export const statusPricesCron = (req, res, next) => {
  if (pricesCron.running) {
    res.send('Prices CRON is RUNNING');
  } else {
    res.send('Prices CRON is STOPPED');
  }
};

export const stopPricesCron = (req, res, next) => {
  try {
    pricesCron.stop();
    pricesCron.running = false;
    res.send('Prices CRON stopped');
  } catch (error) {
    res.send(error);
  }
};

export const runPriceHistoryCron = async (req, res, next) => {
  try {
    await getPriceHistory();
    res.send('Seeded DAILY PRICES');
  } catch (error) {
    console.error(error);
    res.send('Failed seeding DAILY PRICES');
  }
};

export const startPriceHistoryCron = (req, res, next) => {
  try {
    priceHistoryCron.start();
    priceHistoryCron.running = true;
    res.send('priceHistory CRON started');
  } catch (error) {
    res.send(error);
  }
};

export const statusPriceHistoryCron = (req, res, next) => {
  if (priceHistoryCron.running) {
    res.send('priceHistory CRON is RUNNING');
  } else {
    res.send('priceHistory CRON is STOPPED');
  }
};

export const stopPriceHistoryCron = (req, res, next) => {
  try {
    priceHistoryCron.stop();
    priceHistoryCron.running = false;
    res.send('priceHistory CRON stopped');
  } catch (error) {
    res.send(error);
  }
};
