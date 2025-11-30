const Product = require('./Product');
const History = require('./History');

Product.hasMany(History, {
  foreignKey: 'productId',
  as: 'history',
  onDelete: 'CASCADE'
});

History.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
  onDelete: 'CASCADE'
});

module.exports = {
  Product,
  History
};