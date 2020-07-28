'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order');
const Transformer = use('App/Transformers/Admin/OrderTransformer');

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, transform, pagination, auth }) {
    // Order number
    const client = await auth.getUser();
    const number = request.input('number');

    const query = Order.query();

    if (number) {
      query.where('id', 'ILIKE', `${number}`);
    }

    query.where('user_id', client.id);

    const results = await query
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.limit);

    const orders = await transform.paginate(results, Transformer);

    return response.send(orders);
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {}

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, request, response, transform, auth }) {
    const customer = await auth.getUser();
    const result = await Order.query()
      .where('user_id', customer.id)
      .where('id', id)
      .firstOrFail();

    const order = await transform.item(result, Transformer);

    return response.send(order);
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = OrderController;
