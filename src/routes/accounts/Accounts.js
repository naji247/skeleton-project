/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Accounts.css';
import { connect } from 'react-redux';
import AuthRequiringComponent, {
  authRequiringState,
} from '../../components/AuthRequiringComponent/AuthRequiringComponent';

class Accounts extends AuthRequiringComponent {
  state = {};

  static propTypes = {
    ...AuthRequiringComponent.propTypes,
    title: PropTypes.string.isRequired,
  };

  render() {
    var message = 'Loading...';
    if (!this.props.isHydrating) {
      message = this.props.isAuthenticated
        ? "You're logged in!"
        : 'Redirecting because you are not logged in.';
    }
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>{this.props.title}</h1>
          <p>{message}</p>
        </div>
      </div>
    );
  }
}

const mapState = authRequiringState;

const mapDispatch = {};

export default connect(mapState, mapDispatch)(withStyles(s)(Accounts));
