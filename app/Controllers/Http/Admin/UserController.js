'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const User = use('App/Models/User');
const Transformer = use('App/Transformers/Admin/UserTransformer');

/**
 * Resourceful controller for interacting with users
 */
class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination, transform }) {
    const name = request.input('name');
    const query = User.query();

    if (name) {
      query.where('name', 'ILIKE', `%${name}%`);
      query.orWhere('surname', 'ILIKE', `%${name}%`);
      query.orWhere('email', 'ILIKE', `%${name}%`);
    }

    var users = await query.paginate(pagination.page, pagination.limit);
    users = await transform.paginate(users, Transformer);

    return response.send(users);
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    try {
      const { name, surname, email, password, image_id } = request.all();

      var user = await User.create({
        name,
        surname,
        email,
        password,
        image_id,
      });

      user = await transform.item(user, Transformer);

      return response.status(201).send(user);
    } catch (error) {
      return response
        .status(400)
        .send({ message: 'Não foi possível criar o usuário!' });
    }
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params: { id }, request, response, transform }) {
    var user = await User.findOrFail(id);
    user = await transform.item(user, Transformer);

    return response.send(user);
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response, transform }) {
    var user = await User.findOrFail(id);
    try {
      const { name, surname, email, password, image_id } = request.all();
      user.merge({ name, surname, email, password, image_id });
      await user.save();
      user = await transform.item(user, Transformer);
      return response.send(user);
    } catch (error) {
      return response
        .status(400)
        .send({ message: 'Não foi possível atualizar os seus dados!' });
    }
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const user = await User.findOrFail(id);

    try {
      await user.delete();
      return response.status(204).send({});
    } catch (error) {
      return response
        .status(500)
        .send({ message: 'Não foi possível deletar o usuário!' });
    }
  }
}

module.exports = UserController;
