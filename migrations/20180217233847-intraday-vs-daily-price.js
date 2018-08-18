'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('DailyPrices', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
      },
      price: {
        type: Sequelize.FLOAT,
      },
      timestamp: {
        type: Sequelize.DATEONLY,
      },
      ticker: {
        type: Sequelize.STRING(6),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('DailyPrices'),
};
