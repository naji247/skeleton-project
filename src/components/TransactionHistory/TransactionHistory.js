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
import s from './TransactionHistory.css';
import Link from '../Link';
import transactionState from '../../reducers/transactions';
import { connect } from 'react-redux';
import _ from 'lodash';
import { getTransactionsForUser } from '../../actions/transactionActions';
import AuthRequiringComponent, {
  authRequiringState,
} from '../AuthRequiringComponent/AuthRequiringComponent';
import history from '../../history';

class TransactionHistory extends AuthRequiringComponent {
  componentDidMount() {
    const { getTransactionsForUser, userToken } = this.props;
    if (!this.props.isAuthenticated && !this.props.isHydrating) {
      history.push('/login');
    } else if (userToken) {
      getTransactionsForUser(userToken);
    }
  }

  componentDidUpdate() {
    const {
      getTransactionsForUser,
      userToken,
      isLoading,
      transactions,
    } = this.props;
    if (!this.props.isAuthenticated && !this.props.isHydrating) {
      history.push('/login');
    } else if (userToken && !isLoading && !transactions) {
      getTransactionsForUser(userToken);
    }
  }

  render() {
    const { transactions } = this.props;
    const transactionRows = _.map(transactions, transaction => {
      return TransactionRow({ transaction });
    });
    return (
      <div className={s.container}>
        <h1 className={s.tableTitle}> Your Transaction History</h1>
        <div className={s.tableWrapper}>
          <table className={s.transactionTable}>
            <tr className={s.tableHeaderRow}>
              <th>Date</th>
              <th>Description</th>
              <th>Recipient</th>
              <th>Amount</th>
            </tr>
            <tbody>{transactionRows}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

const TransactionRow = ({ transaction }) => {
  return (
    <tr className={s.transactionRow}>
      <td className={s.transactionElem}>{transaction.date}</td>
      <td className={s.transactionElem}>{transaction.memo}</td>
      <td className={s.transactionElem}>{transaction.recipient}</td>
      <td className={s.transactionElem}>
        <font color="#61a414">{transaction.amount}</font>
      </td>
    </tr>
  );
};

const mapState = state => {
  return {
    ...authRequiringState(state),
    userToken: state.userState.token,
    ...state.transactionState,
  };
};

const mapDispatch = {
  getTransactionsForUser,
};

export default connect(mapState, mapDispatch)(
  withStyles(s)(TransactionHistory),
);
