'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order');
const Transformer = use('App/Transformers/Admin/OrderTransformer');
const Database = use('Database');
const Service = use('App/Services/Order/OrderService');
const Ws = use('Ws');

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
  async store({ request, response, auth, transform }) {
    const trx = await Database.beginTransaction();

    try {
      const items = request.input('items'); // Array
      const client = await auth.getUser();
      var order = await Order.create({ user_id: client.id }, trx);
      const service = new Service(order, trx);

      if (items.length > 0) {
        await service.syncItems(items);
      }

      await trx.commit();

      // Instancia os hooks de cálculos dos subtotais
      order = await Order.find(order.id);
      order = await transform.include('items').item(order, Transformer);

      // Emite um broadcast no websocket
      const topic = Ws.getCHannel('notifications').topic('notifications');

      if (topic) {
        topic.broadcast('new:order', order);
      }

      return response.status(201).send(order);
    } catch (error) {
      await trx.rollback();
      return response
        .status(400)
        .send({ message: 'Não foi possível fazer seu pedido!' });
    }
  }

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
  async update({ params: { id }, request, response, auth, transform }) {
    const customer = await auth.getUser();

    var order = await Order.query()
      .where('user_id', client.id)
      .where('id', id)
      .firstOrFail();

    const trx = await Database.beginTransaction();

    try {
      const { items, status } = request.all();

      order.merge({ user_id: customer.id, status });

      const service = new Service(order, trx);
      await service.updateItems(items);
      await order.save(trx);
      await trx.commit();

      order = await transform
        .include('items,coupons,discounts')
        .item(order, Transformer);

      return response.send(order);
    } catch (error) {
      await trx.rollback();
      return response
        .status(400)
        .send({ message: 'Não foi possível atualizar o pedido!' });
    }
  }

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
