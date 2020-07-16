'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon');
const Database = use('Database');
const Service = use('App/Services/Coupon/CouponService');

/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const code = request.input('code');
    const query = Coupon.query();

    if (code) {
      query.where('code', 'ILIKE', `%${code}%`);
    }

    const coupons = await query.paginate(pagination.page, pagination.limit);

    return response.send(coupons);
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const trx = await Database.beginTransaction();
    /**
     * 1 - produto - O cupom pode ser utilizado apenas em produtos específicos
     * 2 - customers - O cupom pode ser utilizado apenas por clientes específicos
     * 3 - customers e products - O cupom pode ser utilizado apenas por
     *            clientes específicos em produtos específicos.
     * 4 - O cupom pode ser utilizado por qualquer cliente em qualquer pedido
     */

    var canUseFor = {
      customer: false,
      product: false,
    };

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive',
      ]);

      const { users, products } = request.only(['users', 'products']);

      const coupon = await Coupon.create(couponData, trx);

      // Starts service layer
      const service = new Service(coupon, trx);

      // Insere os relacionamentos no BD
      if (users && users.length > 0) {
        await service.syncUsers(users);

        canUseFor.customer = true;
      }

      if (products && products.length > 0) {
        await service.syncProducts(products);

        canUseFor.product = true;
      }

      if (canUseFor.product && canUseFor.customer) {
        coupon.can_use_for = 'product_client';
      } else if (canUseFor.product && !canUseFor.customer) {
        coupon.can_use_for = 'product';
      } else if (!canUseFor.product && canUseFor.customer) {
        coupon.can_use_for = 'customer';
      } else {
        coupon.can_use_for = 'all';
      }

      await coupon.save(trx);
      await trx.commit();

      return response.status(201).send(coupon);
    } catch (error) {
      await trx.rollback();
      response.status(400).send({ message: 'Não foi possível criar o cupom' });
    }
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, request, response }) {
    const coupon = await Coupon.findOrFail(id);

    return response.send(coupon);
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const trx = await Database.beginTransaction();

    const coupon = await Coupon.findOrFail(id);
    try {
      await coupon.products().detach([], trx);
      await coupon.orders().detach([], trx);
      await coupon.users().detach([], trx);
      await coupon.delete(trx);

      await trx.commit();

      return response.status(204).send({});
    } catch (error) {
      await trx.rollback();
      return response
        .status(400)
        .send({ message: 'Não foi possível deletar o cupom' });
    }
  }
}

module.exports = CouponController;
