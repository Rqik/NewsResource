import Joi from 'joi';

import { BaseValidator } from '../types';

interface ITag {
  title: string;
}

const tagSchema = Joi.object<ITag>({
  title: Joi.string().min(1).required(),
});

class TagDto implements ITag, BaseValidator {
  title!: string;

  constructor(tag: ITag) {
    Object.entries(tag).forEach(([key, value]: (keyof ITag)[]) => {
      this[key] = value;
    });
  }

  validate() {
    return tagSchema.validate(this);
  }
}
export type { ITag };
export default TagDto;
