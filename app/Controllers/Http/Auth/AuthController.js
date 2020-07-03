'use strict';

const Database = use('Database');
const User = use('App/Models/User');
const Role = use('Role');

class AuthController {
  async register({ req, res }) {
    const trx = await Database.beginTransaction();
    try {
      const { name, surname, email, password } = request.all();

      const user = await User.create(
        {
          name,
          surname,
          email,
          password,
        },
        trx
      );

      const userRole = await Role.findBy('slug', 'customer');

      await user.roles().attach([userRole.id], null, trx);

      await trx.commit();

      return res.status(201).send({ data: user });
    } catch (error) {
      await trx.rollback();
      return res.status(400).send({
        message: 'Erro ao realizar cadastro!',
      });
    }
  }

  /* Auth appears down there because Node.js is async */
  async login(ctx) {
    const { email, password } = request.all();

    let data = await auth.withRefreshToken().attempt(email, password);

    return Response.send({ data });
  }

  async refresh({ req, res, auth }) {
    //
  }

  async logout({ req, res, auth }) {
    //
  }

  async forgot({ req, res }) {
    //
  }

  async remember({ req, res }) {
    //
  }

  async reset({ req, res }) {
    //
  }
}

module.exports = AuthController;
