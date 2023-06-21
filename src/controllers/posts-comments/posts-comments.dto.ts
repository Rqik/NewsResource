import Joi from 'joi';

import { BaseValidator } from '../types';

interface IPostsComments {
  body: string;
}

class PostsCommentsDto implements IPostsComments, BaseValidator {
  body: string;

  constructor(postDrafts: IPostsComments) {
    this.body = postDrafts.body;
  }

  validate() {
    return PostsCommentsDto.getSchema.validate(this);
  }

  static get getSchema() {
    return Joi.object<IPostsComments>({
      body: Joi.string().min(1).required(),
    });
  }
}
export type { IPostsComments };
export default PostsCommentsDto;
