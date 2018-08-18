'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('User', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUID,
        primaryKey: true,
      },

      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING(255),
        validate: { isEmail: true },
        unique: true,
      },

      emailConfirmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      firstName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      lastName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      phoneNumber: {
        type: Sequelize.STRING(20),
      },

      country: {
        type: Sequelize.STRING(255),
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

  down: (queryInterface, Sequelize) => queryInterface.dropTable('User'),
};
