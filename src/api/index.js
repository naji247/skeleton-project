import express from 'express';
import { getAnalytics } from './analytics';
import * as cronApi from './crons';
import * as usersApi from './users';
export const api = express.Router();

api.route('/users/:user_id').get(usersApi.getUserInfo);
