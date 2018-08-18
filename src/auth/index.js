//routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
export const auth = express.Router();
import config from '../config';
import User from '../data/models/User';
import moment from 'moment';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import bip39 from 'bip39';
import walletjs from 'ethereumjs-wallet/hdkey';
import Wallet from '../data/models/Wallet';
import * as kmsUtil from '../kmsUtils';
import crypto from 'crypto-js';

/* POST login. */

const authenticate = (req, res, err, user, info) => {
  if (err) {
    return res.status(500).json({
      message: err.message
    });
  }

  if (!user) {
    return res.status(400).json({
      message: 'Incorrect email or password.'
    });
  }

  req.login(user, { session: false }, err => {
    if (err) {
      res.status(500).send(err);
    }

    // generate a signed son web token with the contents of user object and return it in the response
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.auth.jwt.secret,
      { expiresIn: '10h' }
    );

    const noPasswordUser = _.omit(user.dataValues, [
      'emailConfirmed',
      'password'
    ]);
    return res.json({ ...noPasswordUser, token });
  });
};

auth.post('/signup', async function(req, res, next) {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    country
  } = req.body;

  var errorMessage = [];
  if (!firstName) {
    errorMessage.push('Missing first name.');
  }

  if (!lastName) {
    errorMessage.push('Missing last name.');
  }

  if (!email) {
    errorMessage.push('Missing email.');
  }

  if (!password) {
    errorMessage.push('Missing password.');
  }

  // if (!phoneNumber) {
  //   errorMessage.push('Missing phone number.');
  // }

  if (errorMessage.length > 0) {
    return res.status(400).json({
      message: errorMessage
    });
  }

  try {
    let hashedPassword = await bcrypt.hash(password, 10);
    let user = User.build({
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: hashedPassword,
      phone_number: phoneNumber,
      created_at: moment(),
      updated_at: moment()
    });

    const newUser = await user.save();

    try {
      const userId = newUser.id;
      const walletSeed = bip39.generateMnemonic();
      const hdWallet = walletjs.fromMasterSeed(walletSeed);
      const normalWallet = hdWallet.getWallet();

      const unencryptedPublicKey = normalWallet.getPublicKey();
      const unencryptedPrivateKey = normalWallet.getPrivateKey();
      const unencryptedWalletAddress = normalWallet.getAddress();

      const kmsEncryptedPublicKey = await kmsUtil.encrypt(
        unencryptedPublicKey.toString('hex')
      );
      const kmsEncryptedPrivateKey = await kmsUtil.encrypt(
        unencryptedPrivateKey.toString('hex')
      );
      const kmsEncryptedWalletAddress = await kmsUtil.encrypt(
        unencryptedWalletAddress.toString('hex')
      );

      const writtenWallet = await Wallet.create({
        user_id: userId,
        public_key: kmsEncryptedPublicKey.toString('base64'),
        private_key: kmsEncryptedPrivateKey.toString('base64'),
        address: kmsEncryptedWalletAddress.toString('base64')
      });
    } catch (walletError) {
      await newUser.destroy({ force: true });
      throw new Error('Failed to create user. (Error code 142388)');
    }

    await authenticate(req, res, null, newUser, null);
  } catch (err) {
    if (
      err.original &&
      err.original.code == 23505 &&
      err.original.constraint === 'User_email_key'
    ) {
      return res.status(409).send({
        message: `User with the email ${email} already exists.`
      });
    }
    return res.status(500).send({
      message: err.message
    });
  }
});

auth.post('/login', function(req, res, next) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    return authenticate(req, res, err, user, info);
  })(req, res);
});
