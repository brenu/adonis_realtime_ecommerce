'use strict';

class Login {
  get rules() {
    return {
      // validation rules
      email: 'required|email|unique:users',
      password: 'required|min:8',
    };
  }
}

module.exports = Login;
