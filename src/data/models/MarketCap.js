import DataType from 'sequelize';
import Model from '../sequelize';

const MarketCap = Model.define('market_cap', {
  market_cap: { type: DataType.FLOAT },
  ticker: { type: DataType.STRING, primaryKey: true },
  createdAt: {
    type: DataType.DATE,
    field: 'created_at',
  },
  updatedAt: {
    type: DataType.DATE,
    field: 'updated_at',
  },
});
export default MarketCap;
