import sequelize from '../data/sequelize';
import passport from '../passport';
import bip39 from 'bip39';
import walletjs from 'ethereumjs-wallet/hdkey';
import Wallet from '../data/models/Wallet';
import * as kmsUtil from '../kmsUtils';
import crypto from 'crypto-js';

export const testEncryption = (req, res) => {
  // var input = new Buffer(
  //   'AQICAHg3YEjnrKff+p2Fo0uTMcnmcnl64X/XKSRTEqGag6xmUAEfoAvDk0uFbrJ2J/rrnhBkAAAAujCBtwYJKoZIhvcNAQcGoIGpMIGmAgEAMIGgBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDB98DZACm7xYA3k78QIBEIBzfsVO/t++p4+j225E0pYVpjvguCodPDiVllcgBqbTKxQDQDQzw73QPvbSQjMNTLQhp0Pog3JF3yfzNglEYfcFU2Vw+sCevW/ppS1E+D+SJYOIGOJ6API054T7TcqkYXG+rBpfdXzCGH8WbRfwfuTJM54Wqg==',
  //   'base64',
  // );
  // kmsUtil
  //   .decrypt(input)
  //   .then(address => {
  //     res.send(address);
  //   })
  //   .catch(error => {
  //     res.send(error);
  //   });
  // kmsUtil
  //   .encrypt(input)
  //   .then(encryptedBuffer => {
  //     return encryptedBuffer;
  //   })
  //   .then(encryptedBuffer => {
  //     return kmsUtil.decrypt(encryptedBuffer);
  //   })
  //   .then(message => {
  //     res.send(message);
  //   })
  //   .catch(err => res.send(err));
};

export const createWalletForUser = (req, res) => {
  passport.authenticate('jwt', { session: false })(req, res, function() {
    const authorizedUserId = req.user.id;

    if (!req.params || !req.params.user_id) {
      res
        .status(400)
        .send({ message: 'No user ID provided to create wallet for.' });
    }

    if (req.params.user_id !== authorizedUserId) {
      res.status(401).send({
        message: 'You are unauthorized to create wallets for this user.',
      });
    }

    const userId = req.params.user_id;

    const walletSeed = bip39.generateMnemonic();
    const hdWallet = walletjs.fromMasterSeed(walletSeed);
    const normalWallet = hdWallet.getWallet();

    const unencryptedPublicKey = normalWallet.getPublicKey();
    const unencryptedPrivateKey = normalWallet.getPrivateKey();
    const unencryptedWalletAddress = normalWallet.getAddress();

    Promise.all([
      kmsUtil.encrypt(unencryptedPublicKey.toString('hex')),
      kmsUtil.encrypt(unencryptedPrivateKey.toString('hex')),
      kmsUtil.encrypt(unencryptedWalletAddress.toString('hex')),
    ])
      .then(
        encryptedResults =>
          // In order to decrypt, use new Buffer(encryptedString, 'base64')
          Wallet.create({
            user_id: userId,
            public_key: encryptedResults[0].toString('base64'),
            private_key: encryptedResults[1].toString('base64'),
            address: encryptedResults[2].toString('base64'),
          }),
        error => {
          res.status(500).send({
            message: 'Failed to encrypt wallet, so we did not make one!',
          });
        },
      )
      .then(writtenWallet => {
        res.send({ address: unencryptedWalletAddress.toString('hex') });
      })
      .catch(err => {
        res
          .status(500)
          .send({ message: 'Failed to create a wallet for user.' });
      });
  });
};

export const getUserInfo = (req, res) => {
  passport.authenticate('jwt', { session: false })(req, res, function() {
    const authorizedUserId = req.user.id;

    if (!req.params || !req.params.user_id) {
      res.status(400).send('No user ID provided to fetch information for.');
    }

    if (req.params.user_id !== authorizedUserId) {
      res.status(401).send({
        message: 'You are unauthorized to see this users information.',
      });
    }

    const userId = req.params.user_id;
    const sqlString = `SELECT usr.email, usr.first_name, usr.last_name, usr.phone_number, usr.country, wlt.address FROM "user" usr
                            LEFT OUTER JOIN wallet wlt 
                              ON wlt.user_id = usr.id
                            WHERE usr.id = '${userId}'`;

    sequelize
      .query(sqlString, { type: sequelize.QueryTypes.SELECT })
      .then(results => {
        if (results.length === 0) {
          res.status(404).send('No user found for user information.');
        } else {
          var user = { ...results[0] };
          delete user.address;
          var wallets = [];

          results.forEach(row => {
            // TODO: Implement KMS here
            if (row.address) wallets.push({ address: row.address });
          });

          user.wallets = { count: wallets.length, addresses: wallets };
          res.send(user);
        }
      })
      .catch(error => {
        res
          .status(500)
          .send('Unexpected error when trying to get information for user.');
      });
  });
};

export const getAllTransactions = (req, res) => {
  passport.authenticate('jwt', { session: false })(req, res, function() {
    const authorizedUserId = req.user.id;

    if (!req.params || !req.params.user_id) {
      res.status(400).send('No user ID provided to fetch transactions for.');
    }

    if (req.params.user_id !== authorizedUserId) {
      res.status(401).send({
        message: 'You are unauthorized to see this users transactions.',
      });
    }

    const userId = req.params.user_id;

    const sqlString = `SELECT t.created_at as "date", sender.id as "senderId", sender.first_name as "sender", recipient.id as "recipientId", recipient.first_name as "recipient", t.memo, t.amount 
    FROM transaction t
      JOIN wallet sender_wallet
        ON t.sender_address = sender_wallet.address
      JOIN wallet recipient_wallet
         ON t.recipient_address = recipient_wallet.address
      JOIN "user" sender
        ON sender.id = sender_wallet.user_id
      JOIN "user" recipient
        ON recipient.id = recipient_wallet.user_id
      WHERE sender.id = '${userId}' 
        OR recipient.id = '${userId}';`;

    sequelize
      .query(sqlString, { type: sequelize.QueryTypes.SELECT })
      .then(result => {
        res.send(negateUserTransactions(userId, result));
      })
      .catch(error => {
        res.status(500).send({
          message: 'There was a problem fetching your transactions.',
        });
      });
  });
};

function negateUserTransactions(userId, transactions) {
  return transactions.map(trans => {
    if (trans.senderId !== userId) return trans;
    return { ...trans, amount: -1 * trans.amount };
  });
}
