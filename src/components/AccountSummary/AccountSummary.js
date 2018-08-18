/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
// import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './AccountSummary.css';

class AccountSummary extends React.Component {
  render() {
    return (
      <div className={s.container}>
        <div className={s.welcomeBackContainer}>
          <h1 className={s.welcomeBackHeader}>Welcome back, Naseem</h1>
          <p className={s.balanceChangeText}>
            Your 30-day change <br />in balance is{' '}
            <font color="#61a414">+$10.11</font>
          </p>
        </div>
        <div className={s.balanceWrapper}>
          <h2 className={s.balanceHeader}>Your Balance</h2>
          <h1 className={s.balance}>$10,785.39</h1>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(AccountSummary);
