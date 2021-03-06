'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Product extends Model {
  // Relacionamento entre produto e imagem
  image() {
    return this.belongsTo('App/Models/Image');
  }

  // Relacionamento entre produto e imagens (galeria de imagens)
  images() {
    return this.belongsToMany('App/Models/Image');
  }

  // Relacionamento entre produtos e categorias
  categories() {
    return this.belongsToMany('App/Models/Category');
  }

  // Relacionamento entre produtos e cupons
  coupons() {
    return this.belongsToMany('App/Models/Coupon');
  }
}

module.exports = Product;
