/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import DataType from 'sequelize';
import Model from '../sequelize';
import User from './User';

const Wallet = Model.define('wallet', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  user_id: {
    type: DataType.UUID,

    references: {
      model: User,
      key: 'id',
      deferrable: DataType.Deferrable.INITIALLY_IMMEDIATE,
    },
  },

  address: {
    type: DataType.TEXT,
    allowNull: false,
  },

  private_key: {
    type: DataType.TEXT,
    allowNull: false,
  },

  public_key: {
    type: DataType.TEXT,
    allowNull: false,
  },

  createdAt: {
    type: DataType.DATE,
    field: 'created_at',
  },

  updatedAt: {
    type: DataType.DATE,
    field: 'updated_at',
  },

  // TODO: Add refresh token later to invalidate auth tokens
  // token: {
  //   type: DataType.STRING(255),
  //   defaultValue: null,
  //   unique: true,
  //   allowNull: true,
  // },
});

export default Wallet;
