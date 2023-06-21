import Joi from 'joi';

import { BaseValidator } from '../types';

interface IAuthor {
  description: string;
  userId: number;
}

class AuthorsDto implements IAuthor, BaseValidator {
  description: string;

  userId: number;

  constructor(post: IAuthor) {
    this.description = post.description;
    this.userId = post.userId;
  }

  validate() {
    return AuthorsDto.getSchema.validate(this);
  }

  static get getSchema() {
    return Joi.object<IAuthor>({
      description: Joi.string().required(),
      userId: Joi.number().required(),
    });
  }
}
export type { IAuthor };
export default AuthorsDto;
