/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import React from 'react';
import s from './Account.css';
import { connect } from 'react-redux';
import Navbar from '../../components/Navbar';
import AccountSummary from '../../components/AccountSummary';
import TransferDepositButtons from '../../components/TransferDepositButtons';
import TransactionHistory from '../../components/TransactionHistory';

class Account extends React.Component {
  render() {
    return (
      <div>
        <Navbar />
        <AccountSummary />
        <TransferDepositButtons />
        <TransactionHistory />;
      </div>
    );

    /* 
        <TransferDeposit /> */
  }
}
export default withStyles(s)(Account);
