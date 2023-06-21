import Joi from 'joi';

import { BaseValidator } from '../types';

interface IUser {
  firstName: string;
  lastName: string;
  login: string;
  password: string;
  email: string;
  avatar: string | null;
}

const userSchema = Joi.object<IUser>({
  firstName: Joi.string().required(),
  lastName: Joi.string().allow(null),
  login: Joi.string().min(4).required(),
  password: Joi.string().min(4).required(),
  email: Joi.string().email().required(),
  avatar: Joi.string().allow(null),
});

const partialUpdateSchema = userSchema.fork(
  Object.keys(userSchema.describe().keys),
  (field) => field.optional(),
);

class UserDto implements IUser, BaseValidator {
  firstName!: string;

  lastName!: string;

  login!: string;

  password!: string;

  email!: string;

  avatar: string | null = null;

  constructor(user: IUser) {
    Object.entries(user).forEach((val) => {
      const [key, value] = val as [keyof IUser, any];
      this[key] = value;
    });
  }

  validate() {
    return userSchema.validate(this);
  }

  partialValidate() {
    return partialUpdateSchema.validate(this);
  }
}
export type { IUser };
export default UserDto;
