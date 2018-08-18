/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Accounts from './Accounts';

const title = 'Accounts';

function action() {
  return {
    chunks: ['accounts'],
    title,
    component: <Accounts title={title} />,
  };
}

export default action;
