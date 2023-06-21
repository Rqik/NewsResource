import Joi from 'joi';

import { BaseValidator } from '../types';

interface IAuth {
  login: string;
  password: string;
}

const authSchema = Joi.object<IAuth>({
  login: Joi.string().required(),
  password: Joi.string().required(),
});
class AuthDto implements IAuth, BaseValidator {
  login: string;

  password: string;

  constructor(auth: IAuth) {
    this.login = auth.login;
    this.password = auth.password;
  }

  validate() {
    const data = authSchema.validate(this);

    return data;
  }
}

export type { IAuth };
export default AuthDto;
