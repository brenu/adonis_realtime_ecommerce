'use strict';

class Register {
  get rules() {
    return {
      // validation rules
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed|min:8',
    };
  }

  get messages() {
    return {
      'name.required': 'O nome é obrigatório!',
      'surname.required': 'O sobrenome é obrigatório!',
      'email.required': 'O E-Mail é obrigatório!',
      'email.email': 'E-Mail inválido!',
      'email.unique': 'O E-Mail já está em uso!',
      'password.required': 'A senha é obrigatória!',
      'password.confirmed': 'As senhas não são iguais!',
    };
  }
}

module.exports = Register;
