import Joi from 'joi';

import { BaseValidator } from '../types';

interface ICategory {
  description: string;
  category?: number;
}

class CategoriesDto implements ICategory, BaseValidator {
  description: string;

  category?: number;

  constructor(post: ICategory) {
    this.description = post.description;
    this.category = post.category;
  }

  validate() {
    return CategoriesDto.getSchema.validate(this);
  }

  static get getSchema() {
    return Joi.object<ICategory>({
      description: Joi.string().required(),
      category: Joi.number(),
    });
  }
}
export type { ICategory };
export default CategoriesDto;
