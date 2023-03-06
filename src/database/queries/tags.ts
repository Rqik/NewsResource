import { BaseQuery } from './types';

const tags: BaseQuery = {
  create: `CREATE TABLE IF NOT EXISTS tags (
    tag_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
    title varchar(512),

    CONSTRAINT PK_tags_tag_id PRIMARY KEY(tag_id)
  );`,
  remove: `DROP TABLE IF EXISTS tags;`,
};

export default tags;
