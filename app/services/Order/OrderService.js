'use strict';

const Database = use('Database');

class OrderService {
  constructor(model, trx = null) {
    this.model = model;
    this.trx = trx;
  }

  async syncItems(items) {
    if (!Array.isArray(items)) {
      return false;
    }

    await this.model.items().delete(this.trx);
    await this.model.items().createMany(items, this.trx);
  }

  async updateItems(items) {
    let currentItems = await this.model
      .items()
      .whereIn(
        'id',
        items.map(item => item.id)
      )
      .fetch();

    // Deleta os itens que o user não quer mais
    await this.model
      .items()
      .whereNotIn('id', items.map(item => item.id).delete(this.trx));

    // Atualiza os valores e quantidades
    await Promise.all(
      currentItems.rows.map(async item => {
        item.fill(items.find(n => n.id === item.id));
        await item.save(this.trx);
      })
    );
  }

  async canApplyDiscount(coupon) {
    // Verifica a validade por data
    const now = new Date().getTime();
    if (
      now < coupon.valid_from.getTime() ||
      (typeof coupon.valid_until == 'object' &&
        coupon.valid_until.getTime < now)
    ) {
      // Verifica se o cupom já entrou em validade
      // Verifica se há data para expirar
      // Verifica se já expirou
      return false;
    }

    // Realizando query
    const couponProducts = await Database.from('coupon_products')
      .where('coupon_id', coupon.id)
      .pluck('product_id');

    const couponCustomers = await Database.from('coupon_user')
      .where('coupon_id', coupon.id)
      .pluck('user_id');

    // Verifica se o cupom não está associado a produtos e clientes específicos
    if (
      Array.isArray(couponProducts) &&
      couponProducts.length < 1 &&
      Array.isArray(couponCustomers) &&
      couponCustomers < 1
    ) {
      /**
       * Caso não esteja associado a parâmetros específicos, é uso livre
       */

      return true;
    }

    let isAssociatedToProducts,
      isAssociatedToCustomers = false;

    if (Array.isArray(couponProducts) && couponProducts.length > 0) {
      isAssociatedToProducts = true;
    }

    if (Array.isArray(couponCustomers) && couponCustomers.length > 0) {
      isAssociatedToCustomers = true;
    }

    const productsMatch = await Database.from('order_items')
      .where('order_id', this.model.id)
      .whereIn('product_id', couponProducts)
      .pluck('product_id');

    /**
     * Caso de uso 1
     *
     * O cupom tá associado a clientes && produtos
     */
    if (isAssociatedToCustomers && isAssociatedToProducts) {
      const customerMatch = couponCustomers.find(
        customer => customer == this.model.user_id
      );

      if (
        customerMatch &&
        Array.isArray(productsMatch) &&
        productsMatch.length > 0
      ) {
        return true;
      }
    }

    /**
     * Caso de uso 2
     *
     * O cupom tá associado só a produtos
     */
    if (
      isAssociatedToProducts &&
      Array.isArray(productsMatch) &&
      productsMatch.length > 0
    ) {
      return true;
    }

    /**
     * Caso de uso 2
     *
     * O cupom tá associado só a clientes
     */
    if (
      isAssociatedToCustomers &&
      Array.isArray(couponCustomers) &&
      couponCustomers > 0
    ) {
      const match = couponCustomers.find(
        customer => customer === this.model.user_id
      );

      if (match) {
        return true;
      }
    }

    /**
     * Caso nenhum dos outros dê positivo...
     * o cupom está associado a clientes ou produtos ou os dois
     * mas nenhum deles está elegível ao desconto
     * e o cliente que fez a compra também não poderá utilizar
     */
    return false;
  }
}

module.exports = OrderService;
