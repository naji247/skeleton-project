/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Link from '../Link';
import Navigation from '../Navigation';
import logoUrl from './logo-small.png';
import { connect } from 'react-redux';
import _ from 'lodash';
import { formatPrice } from '../../routes/home/Home';

class Header extends React.Component {
  render() {
    var bitcoinPrice = '...';
    var tetherPrice = '...';
    const prices = this.props.prices;
    const btcObj = _.find(prices, priceObj => priceObj.ticker === 'BTC');
    const usdtObj = _.find(prices, priceObj => priceObj.ticker === 'USDT');
    if (btcObj && btcObj.latest) {
      bitcoinPrice = formatPrice(btcObj.latest);
    }
    if (usdtObj && usdtObj.latest) {
      tetherPrice = formatPrice(usdtObj.latest);
    }
    return (
      <div className={s.root}>
        <div className={s.container}>
          <Navigation />
          <Link className={s.brand} to="/">
            <img
              src={logoUrl}
              srcSet={`${logoUrl} 2x`}
              alt="SCX Logo"
              className={s.logo}
            />
            <span className={s.brandTxt}>SCX</span>
          </Link>
          <div className={s.banner}>
            <div className={s.pricesContainer}>
              <div className={s.price}>
                <span className={s.bannerTitle}>{bitcoinPrice}</span>
                <span className={s.ticker}>Bitcoin</span>
              </div>
              <div className={s.price}>
                <span className={s.bannerTitle}>{tetherPrice}</span>
                <span className={s.ticker}>Tether</span>
              </div>
            </div>
            <div className={s.bannerDescContainer}>
              <p className={s.bannerDesc}>Volatility is not your friend.</p>
              <p className={s.bannerDesc}>
                Take back control of your wealth with stable coins.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapState = state => ({
  ...state.price,
});

const mapDispatch = {};

export default connect(mapState, mapDispatch)(withStyles(s)(Header));
