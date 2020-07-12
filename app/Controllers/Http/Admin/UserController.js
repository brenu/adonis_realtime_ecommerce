'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const User = use('App/Models/User');

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
  async index({ request, response, pagination }) {
    const name = request.input('name');
    const query = User.query();

    if (name) {
      query.where('name', 'ILIKE', `%${name}%`);
      query.orWhere('surname', 'ILIKE', `%${name}%`);
      query.orWhere('email', 'ILIKE', `%${name}%`);
    }

    const users = await query.paginate(pagination.page, pagination.limit);

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
  async store({ request, response }) {
    try {
      const { name, surname, email, password, image_id } = request.all();

      const user = await User.create({
        name,
        surname,
        email,
        password,
        image_id,
      });

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
  async show({ params: { id }, request, response }) {
    const user = User.findOrFail(id);

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
  async update({ params: { id }, request, response }) {
    const user = User.findOrFail(id);
    try {
      const userData = request.only([
        'name',
        'surname',
        'email',
        'password',
        'image_id',
      ]);
      user.merge(userData);
      await user.save();
      return response.send(user);
    } catch (error) {
      user
        .status(400)
        .send({ message: 'Não foi possível atualizar o usuário!' });
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
