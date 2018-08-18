import express from 'express';
import sequelize from '../data/sequelize';
import moment from 'moment';
import jStat from 'jStat';
import Promise from 'promise';
import _ from 'lodash';

export const getAnalytics = (req, res, next) => {
  var tickers = [
    'BTC',
    'ETH',
    'LTC',
    'GLD',
    'AGG',
    'SPY',
    'USDT',
    'BITUSD',
    'DAI',
  ];
  var volPromises = _.map(tickers, getVolatility);
  var allPromises = _.concat(
    getPriceStat('latest'),
    getPriceStat('max'),
    getPriceStat('min'),
    getMarketCaps(),
    volPromises,
  );

  Promise.all(allPromises).then(allRes => {
    const tickerToName = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      LTC: 'Litecoin',
      SPY: 'S&P 500 ETF',
      AGG: 'Agg Bond ETF',
      GLD: 'Gold ETF',
      USDT: 'Tether',
      BITUSD: 'BitUSD',
      DAI: 'Dai',
    };
    var finalOutput = [];
    var latest = allRes.shift();
    var max = allRes.shift();
    var min = allRes.shift();
    var marketCap = allRes.shift();

    _.forEach(tickers, ticker => {
      finalOutput.push({
        ticker: ticker,
        name: tickerToName[ticker],
        latest: latest[ticker],
        max: max[ticker],
        min: min[ticker],
        marketCap: marketCap[ticker] || null,
        volatility: allRes.shift() * 100,
      });
    });
    res.send(finalOutput);
  });
};

function getLatest() {
  sqlString =
    'select distinct on ("ticker") * FROM price ORDER BY ticker, timestamp DESC';

  return sequelize.query(sqlString, { type: sequelize.QueryTypes.SELECT });
}

function getPriceStat(stat) {
  var sqlString = '';
  if (stat == 'latest') {
    sqlString =
      'select distinct on ("ticker") * FROM price ORDER BY ticker, timestamp DESC';
  } else if (stat == 'min') {
    sqlString = `select ticker, min(price) as price from daily_price  where timestamp > now() - interval '3 months' GROUP BY "ticker"`;
  } else if (stat == 'max') {
    sqlString = `select ticker, max(price) as price from daily_price  where timestamp > now() - interval '3 months' GROUP BY "ticker"`;
  }
  return sequelize
    .query(sqlString, { type: sequelize.QueryTypes.SELECT })
    .then(res => {
      var prices = {};
      _.forEach(res, row => {
        prices[row['ticker']] = row['price'];
      });
      return prices;
    });
}

function getMarketCaps() {
  var sqlString = `select ticker, market_cap from market_cap`;
  return sequelize
    .query(sqlString, { type: sequelize.QueryTypes.SELECT })
    .then(res => {
      var marketCaps = {};
      _.forEach(res, row => {
        marketCaps[row.ticker] = row.market_cap;
      });
      return marketCaps;
    });
}

function getVolatility(ticker) {
  var sqlString = `select *
  from daily_price 
  where timestamp > now() - interval '1 year' 
  and ticker='${ticker}'
  ORDER BY timestamp`;

  return sequelize
    .query(sqlString, { type: sequelize.QueryTypes.SELECT })
    .then(results => {
      var prevDate = null;
      var prevPrice = null;
      var dailyRets = [];
      _.forEach(results, result => {
        var currDate = moment(result.timestamp);
        var currPrice = result.price;
        if (prevDate) {
          dailyRets.push((currPrice - prevPrice) / prevPrice);
        }
        prevDate = currDate;
        prevPrice = currPrice;
      });
      var vol = jStat.stdev(dailyRets, false) * Math.sqrt(dailyRets.length);
      return vol;
    });
}
