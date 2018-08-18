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
import s from '../login/Login.css';
import { ErrorList } from '../login/Login';
import { connect } from 'react-redux';
import { signup, logout } from '../../actions/authActions';
import validate from 'validate.js';
import { BeatLoader } from 'react-spinners';
import history from '../../history';
import Shake from 'react-reveal/Shake';

class Signup extends React.Component {
  state = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    signupAttempts: 0,
  };

  componentWillMount() {
    this.setState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      signupAttempts: 0,
      validationIssues: undefined,
    });
  }

  handleFirstNameChange(event) {
    this.setState({ firstName: event.target.value });
  }
  handleLastNameChange(event) {
    this.setState({ lastName: event.target.value });
  }

  handleEmailChange(event) {
    this.setState({ email: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  handleConfirmPasswordChange(event) {
    this.setState({ confirmPassword: event.target.value });
  }

  onSignupClick() {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      signupAttempts,
    } = this.state;
    const { signup } = this.props;

    const signupConstraints = {
      firstName: {
        presence: true,
        length: {
          minimum: 1,
          message: 'must not be empty.',
        },
      },
      lastName: {
        presence: true,
        length: {
          minimum: 1,
          message: 'must not be empty.',
        },
      },

      email: {
        presence: true,
        email: {
          message: 'does not seem valid.',
        },
      },
      password: {
        presence: true,
        length: {
          minimum: 6,
          message: 'must be at least 6 characters.',
        },
      },
      confirmPassword: {
        equality: 'password',
      },
    };
    const validationIssues = validate(
      { firstName, lastName, email, password, confirmPassword },
      signupConstraints,
    );
    this.setState({
      validationIssues: validationIssues,
    });
    if (!validationIssues) {
      signup(firstName, lastName, email, password);
    } else {
      this.setState({
        signupAttempts: signupAttempts + 1,
        validationIssues: { ...validationIssues, server: [] },
      });
    }
  }

  handleKeyPress(event) {
    if (event.charCode == 13) {
      event.preventDefault();
      event.stopPropagation();
      this.onSignupClick();
    }
  }

  onExitClick() {
    this.props.logout();
    history.push('/');
  }

  signupDisabled() {
    return (
      this.state.firstName.length < 1 ||
      this.state.lastName.length < 1 ||
      this.state.email.length < 3 ||
      this.state.password.length < 3 ||
      this.state.confirmPassword.length < 3
    );
  }

  render() {
    var issues = this.state.validationIssues;
    if (!issues && this.props.error) {
      issues = { server: [this.props.error.error.message] };
    }
    var disabled = this.signupDisabled();
    console.log(this.state.signupAttempts + this.props.serverSignupAttempts);
    return (
      <div className={s.root} onKeyPress={event => this.handleKeyPress(event)}>
        <div className={s.exit} onClick={() => this.onExitClick()}>
          X
        </div>
        <div className={s.container}>
          <p className={s.lead}>Create an Account</p>
          <ErrorList issues={issues} />
          <Shake
            spy={this.state.signupAttempts + this.props.serverSignupAttempts}
          >
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="first-name">
                <input
                  className={s.input}
                  id="signup-first-name"
                  value={this.state.firstName}
                  placeholder="First Name"
                  onChange={event => this.handleFirstNameChange(event)}
                  type="text"
                  name="first-name"
                  autoFocus // eslint-disable-line jsx-a11y/no-autofocus
                />
              </label>
            </div>

            <div className={s.formGroup}>
              <label className={s.label} htmlFor="last-name">
                <input
                  className={s.input}
                  id="signup-last-name"
                  value={this.state.lastName}
                  placeholder="Last Name"
                  onChange={event => this.handleLastNameChange(event)}
                  type="text"
                  name="last-name"
                />
              </label>
            </div>

            <div className={s.formGroup}>
              <label className={s.label} htmlFor="email">
                <input
                  className={s.input}
                  id="signup-email"
                  value={this.state.email}
                  placeholder="Email Address"
                  onChange={event => this.handleEmailChange(event)}
                  type="text"
                  name="email"
                />
              </label>
            </div>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="password">
                <input
                  className={s.input}
                  id="signup-password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={event => this.handlePasswordChange(event)}
                  type="password"
                  name="password"
                />
              </label>
            </div>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="confirm-password">
                <input
                  className={s.input}
                  id="signup-confirm-password"
                  placeholder="Confirm Password"
                  value={this.state.confirmPassword}
                  onChange={event => this.handleConfirmPasswordChange(event)}
                  type="password"
                  name="password"
                />
              </label>
            </div>
            <div className={s.formGroup}>
              <button
                onClick={() => this.onSignupClick()}
                className={s.button}
                type="submit"
                disabled={disabled}
              >
                {!this.props.loading ? (
                  'Sign Up'
                ) : (
                  <BeatLoader color={'#055ea8'} />
                )}
              </button>
            </div>
          </Shake>
        </div>
      </div>
    );
  }
}

const mapState = state => ({
  error: state.userState.signupError,
  loading: state.userState.isLoadingSignup,
  serverSignupAttempts: state.userState.serverSignupAttempts,
});

const mapDispatch = {
  signup,
  logout,
};

export default connect(mapState, mapDispatch)(withStyles(s)(Signup));
