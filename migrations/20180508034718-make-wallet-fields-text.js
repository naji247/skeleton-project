'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('wallet', 'public_key', {
        type: Sequelize.TEXT,
        allowNull: false,
      }),
      queryInterface.changeColumn('wallet', 'private_key', {
        type: Sequelize.TEXT,
        allowNull: false,
      }),
      queryInterface.changeColumn('wallet', 'address', {
        type: Sequelize.TEXT,
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('wallet', 'public_key', {
        type: Sequelize.STRING(255),
        allowNull: false,
      }),
      queryInterface.changeColumn('wallet', 'private_key', {
        type: Sequelize.STRING(255),
        allowNull: false,
      }),
      queryInterface.changeColumn('wallet', 'address', {
        type: Sequelize.STRING(255),
        allowNull: false,
      }),
    ]);
  },
};
