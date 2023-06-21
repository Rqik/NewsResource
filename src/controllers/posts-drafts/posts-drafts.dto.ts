import Joi from 'joi';

import { BaseValidator } from '../types';

interface IPostDrafts {
  body: string;
  title: string;
  categoryId: number;
}

class PostsDraftsDto implements IPostDrafts, BaseValidator {
  title: string;

  body: string;

  categoryId: number;

  constructor(postDrafts: IPostDrafts) {
    this.title = postDrafts.title;

    this.body = postDrafts.body;

    this.categoryId = postDrafts.categoryId;
  }

  validate() {
    return PostsDraftsDto.getSchema.validate(this);
  }

  static get getSchema() {
    return Joi.object<IPostDrafts>({
      body: Joi.string().min(1).required(),
      title: Joi.string().min(1).required(),
      categoryId: Joi.number().required(),
    });
  }
}
export type { IPostDrafts };
export default PostsDraftsDto;
