import express from 'express';
import { getAnalytics } from './analytics';
import * as cronApi from './crons';
import * as usersApi from './users';
export const api = express.Router();

api.route('/analytics').get(getAnalytics);

// CRON JOBS
api.route('/crons/marketcaps/start').get(cronApi.startMarketCapCron);
api.route('/crons/marketcaps/stop').get(cronApi.stopMarketCapCron);
api.route('/crons/marketcaps/status').get(cronApi.statusMarketCapCron);

api.route('/crons/prices/start').get(cronApi.startPricesCron);
api.route('/crons/prices/stop').get(cronApi.stopPricesCron);
api.route('/crons/prices/status').get(cronApi.statusPricesCron);

api.route('/crons/pricehistory/run').get(cronApi.runPriceHistoryCron);
api.route('/crons/pricehistory/start').get(cronApi.startPriceHistoryCron);
api.route('/crons/pricehistory/status').get(cronApi.statusPriceHistoryCron);
api.route('/crons/pricehistory/stop').get(cronApi.stopPriceHistoryCron);

api.route('/users/:user_id/transactions').get(usersApi.getAllTransactions);
api.route('/users/:user_id').get(usersApi.getUserInfo);
// api.route('/users/:user_id/wallets').post(usersApi.createWalletForUser);
// api.route('/testEncrypt').post(usersApi.testEncryption);
