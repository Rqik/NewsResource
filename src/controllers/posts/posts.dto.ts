import Joi from 'joi';
import { BaseValidator } from '../types';

interface IPost {
  title: string;
  authorId: number;
  categoryId: number;
  body: string;
  tags: number[] | string;
}

class PostsDto implements IPost, BaseValidator {
  title: string;

  authorId: number;

  categoryId: number;

  body: string;

  tags: number[] | string;

  constructor(post: IPost) {
    this.title = post.title;
    this.authorId = post.authorId;
    this.categoryId = post.categoryId;
    this.body = post.body;
    this.tags = post.tags;
  }

  validate() {
    return PostsDto.getSchema.validate(this);
  }

  static get getSchema() {
    return Joi.object<IPost>({
      title: Joi.string().min(1).required(),
      authorId: Joi.number().required(),
      categoryId: Joi.number().required(),
      body: Joi.string().min(1).required(),
      tags: Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.number()),
      ),
    });
  }
}
export type { IPost };
export default PostsDto;
