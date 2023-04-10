import Joi from 'joi';
import { BaseValidator } from '../types';

interface ICategory {
  description: string;
  category?: string;
}

class CategoriesDto implements ICategory, BaseValidator {
  description: string;

  category?: string;

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
      category: Joi.string(),
    });
  }
}
export type { ICategory };
export default CategoriesDto;
