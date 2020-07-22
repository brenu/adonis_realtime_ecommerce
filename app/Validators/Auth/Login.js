'use strict';

class Login {
  get rules() {
    return {
      // validation rules
      email: 'required|email|unique',
      password: 'required',
    };
  }

  get messages() {
    return {
      'email.required': 'O E-Mail é obrigatório!',
      'email.unique': 'O E-Mail já existe!',
      'password.required': 'A senha é obrigatória!',
    };
  }
}

module.exports = Login;
