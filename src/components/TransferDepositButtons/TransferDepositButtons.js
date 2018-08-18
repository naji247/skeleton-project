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
import s from './TransferDepositButtons.css';

class TransferDepositButtons extends React.Component {
  render() {
    return (
      <div className={s.container}>
        <div className={s.transferButton}>Transfer Money</div>
        <div className={s.depositButton}>Make Deposit</div>
      </div>
    );
  }
}

export default withStyles(s)(TransferDepositButtons);
