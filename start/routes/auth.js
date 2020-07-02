'use strict';

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

Route.group(() => {
  Route.post('register', 'AuthController.register').as('auth.register');
  Route.post('login', 'AuthController.login').as('auth.login');
  Route.put('refresh', 'AuthController.refresh').as('auth.refresh');
  Route.delete('logout', 'AuthController.logout').as('auth.logout');

  // Password Reset routes
  Route.post('password-reset', 'AuthController.forgot').as('auth.forgot');
  Route.get('password-reset', 'AuthController.remember').as('auth.remember');
  Route.put('password-reset', 'AuthController.reset').as('auth.reset');
})
  .prefix('api/v1/auth')
  .namespace('Auth');
