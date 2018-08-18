/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import React from 'react';
import s from './Home.css';
import { connect } from 'react-redux';
import { getPrices } from '../../actions/runtime';
import _ from 'lodash';
import numeral from 'numeral';

class Home extends React.Component {
  componentDidMount() {
    this.props.getPrices();
  }
  render() {
    return (
      <div className={s.tableContainer}>
        <h1 className={s.tableHeader}>Stability Analytics</h1>
        <Table selectable={false}>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Ticker</TableHeaderColumn>
              <TableHeaderColumn>Name</TableHeaderColumn>
              <TableHeaderColumn>Price</TableHeaderColumn>
              <TableHeaderColumn>Market Cap</TableHeaderColumn>
              <TableHeaderColumn>
                3 Month Range<br />(%)
              </TableHeaderColumn>
              <TableHeaderColumn>Volatility</TableHeaderColumn>
            </TableRow>
          </TableHeader>
        </Table>

        <PriceTable
          name="Stable Coins"
          prices={this.props.prices}
          members={['USDT', 'DAI', 'BITUSD']}
        />

        <PriceTable
          name="Other Coins"
          prices={this.props.prices}
          members={['BTC', 'ETH', 'LTC']}
        />
        <PriceTable
          name="Traditional Financial Assets"
          prices={this.props.prices}
          members={['SPY', 'AGG', 'GLD']}
        />
      </div>
    );
  }
}

class PriceTable extends React.PureComponent {
  render() {
    const { prices, members } = this.props;
    const filteredPrices = _.filter(prices, row =>
      _.includes(members, row.ticker),
    );
    const orderedFilteredPrices = _.orderBy(filteredPrices, row =>
      _.indexOf(members, row.ticker),
    );
    const rows = orderedFilteredPrices.map((obj, i) => (
      <PriceRow key={i} {...obj} />
    ));
    return (
      <Table selectable={false}>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow className={s.titleRow}>
            <TableHeaderColumn colSpan="7" style={{ height: '36px' }}>
              <div className={s.tableSubHeader}>{this.props.name}</div>
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} showRowHover>
          {rows}
        </TableBody>
      </Table>
    );
  }
}

class PriceRow extends React.PureComponent {
  render() {
    const {
      ticker,
      latest,
      marketCap,
      max,
      min,
      volatility,
      name,
    } = this.props;
    return (
      <TableRow>
        <TableRowColumn>{ticker}</TableRowColumn>
        <TableRowColumn>{name}</TableRowColumn>
        <TableRowColumn>{formatPrice(latest)}</TableRowColumn>
        <TableRowColumn>{formatMktCap(marketCap)}</TableRowColumn>
        <TableRowColumn style={{ textAlign: 'center' }}>
          {formatPrice(min)} - {formatPrice(max)}
          <br />
          ({formatPct(100 * (max - min) / latest)})
        </TableRowColumn>
        <TableRowColumn>{formatPct(volatility)}</TableRowColumn>
      </TableRow>
    );
  }
}

function formatPct(x) {
  return Number.parseFloat(x).toPrecision(3) + '%';
}

function formatMktCap(x) {
  return numeral(x)
    .format('$0a')
    .toString()
    .toUpperCase();
}

export function formatPrice(x) {
  return (
    '$' +
    Number.parseFloat(x)
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  );
}

const mapState = state => ({
  ...state.price,
});

const mapDispatch = {
  getPrices,
};

export default connect(mapState, mapDispatch)(withStyles(s)(Home));
