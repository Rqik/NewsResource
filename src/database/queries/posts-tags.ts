import { BaseQuery } from './types';

const postsTags: BaseQuery = {
  create: `CREATE TABLE IF NOT EXISTS posts_tags (
    fk_post_id int,
    fk_tag_id int,

    CONSTRAINT PK_posts_tags_id PRIMARY KEY(fk_post_id, fk_tag_id),
    CONSTRAINT FK_posts_tags_post_id FOREIGN KEY(fk_post_id) REFERENCES posts(post_id),
    CONSTRAINT FK_posts_tags_tag_id FOREIGN KEY(fk_tag_id) REFERENCES tags(tag_id)
  );`,
  remove: `DROP TABLE IF EXISTS posts_tags;`,
};

export default postsTags;
