'use strict';

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

Route.group(() => {
  Route.post('register', 'AuthController.register')
    .as('auth.register')
    .middleware(['guest'])
    .validator('Auth/Register');
  Route.post('login', 'AuthController.login')
    .as('auth.login')
    .middleware(['guest'])
    .validator('Auth/Login');
  Route.put('refresh', 'AuthController.refresh')
    .as('auth.refresh')
    .middleware(['guest']);
  Route.delete('logout', 'AuthController.logout')
    .as('auth.logout')
    .middleware(['auth']);

  // Password Reset routes
  Route.post('password-reset', 'AuthController.forgot')
    .as('auth.forgot')
    .middleware(['guest']);
  Route.get('password-reset', 'AuthController.remember')
    .as('auth.remember')
    .middleware(['guest']);
  Route.put('password-reset', 'AuthController.reset')
    .as('auth.reset')
    .middleware(['guest']);
})
  .prefix('api/v1/auth')
  .namespace('Auth');
