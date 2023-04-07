import Joi from 'joi';
import { BaseValidator } from '../types';

interface Auth {
  login: string;
  password: string;
}

const authSchema = Joi.object();
class Auth implements Auth, BaseValidator {
  constructor(auth: Auth) {
    this.login = auth.login;
    this.password = auth.password;
  }

  validate(): void {}
}
