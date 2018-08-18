'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('wallet', 'public_key', Sequelize.STRING(255), {
        allowNull: false,
      }),
      queryInterface.addColumn('wallet', 'private_key', Sequelize.STRING(255), {
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'wallet',
        'public_key',
        Sequelize.STRING(255),
        {
          allowNull: false,
        }
      ),
      queryInterface.removeColumn(
        'wallet',
        'private_key',
        Sequelize.STRING(255),
        {
          allowNull: false,
        }
      ),
    ]);
  },
};
