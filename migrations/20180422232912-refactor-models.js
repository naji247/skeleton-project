module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameTable('User', 'user'),
      queryInterface.renameTable('MarketCaps', 'market_cap'),
      queryInterface.renameTable('DailyPrices', 'daily_price'),
      queryInterface.renameTable('Prices', 'price'),
    ]).then(() => {
      return Promise.all([
        queryInterface.renameColumn(
          'user',
          'emailConfirmed',
          'email_confirmed'
        ),
        queryInterface.renameColumn('user', 'firstName', 'first_name'),
        queryInterface.renameColumn('user', 'lastName', 'last_name'),
        queryInterface.renameColumn('user', 'phoneNumber', 'phone_number'),
        queryInterface.renameColumn('user', 'createdAt', 'created_at'),
        queryInterface.renameColumn('user', 'updatedAt', 'updated_at'),
        queryInterface.renameColumn('market_cap', 'marketCap', 'market_cap'),
        queryInterface.renameColumn('market_cap', 'createdAt', 'created_at'),
        queryInterface.renameColumn('market_cap', 'updatedAt', 'updated_at'),
        queryInterface.renameColumn('daily_price', 'createdAt', 'created_at'),
        queryInterface.renameColumn('daily_price', 'updatedAt', 'updated_at'),
        queryInterface.renameColumn('price', 'createdAt', 'created_at'),
        queryInterface.renameColumn('price', 'updatedAt', 'updated_at'),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameTable('user', 'User'),
      queryInterface.renameTable('market_cap', 'MarketCaps'),
      queryInterface.renameTable('daily_price', 'DailyPrices'),
      queryInterface.renameTable('price', 'Prices'),
    ]).then(() => {
      return Promise.all([
        queryInterface.renameColumn(
          'user',
          'email_confirmed',
          'emailConfirmed'
        ),
        queryInterface.renameColumn('user', 'first_name', 'firstName'),
        queryInterface.renameColumn('user', 'last_name', 'lastName'),
        queryInterface.renameColumn('user', 'phone_number', 'phoneNumber'),
        queryInterface.renameColumn('user', 'created_at', 'createdAt'),
        queryInterface.renameColumn('user', 'updated_at', 'updatedAt'),
        queryInterface.renameColumn('market_cap', 'market_cap', 'marketCap'),
        queryInterface.renameColumn('market_cap', 'created_at', 'createdAt'),
        queryInterface.renameColumn('market_cap', 'updated_at', 'updatedAt'),
        queryInterface.renameColumn('daily_price', 'created_at', 'createdAt'),
        queryInterface.renameColumn('daily_price', 'updated_at', 'updatedAt'),
        queryInterface.renameColumn('price', 'created_at', 'createdAt'),
        queryInterface.renameColumn('price', 'updated_at', 'updatedAt'),
      ]);
    });
  },
};
