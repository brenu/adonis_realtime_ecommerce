'use strict';

class Login {
  get rules() {
    return {
      // validation rules
      email: 'required|email|unique',
      password: 'required',
    };
  }
}

module.exports = Login;
