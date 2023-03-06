import { BaseQuery } from './types';

const postsComments: BaseQuery = {
  create: `CREATE TABLE IF NOT EXISTS posts_comments (
    fk_comment_id int,
    fk_post_id int,

    CONSTRAINT PK_posts_comments_id PRIMARY KEY(fk_comment_id, fk_post_id),
    CONSTRAINT FK_posts_comments_comment_id FOREIGN KEY(fk_comment_id) REFERENCES comments(comment_id),
    CONSTRAINT FK_posts_comments_post_id FOREIGN KEY(fk_post_id) REFERENCES posts(post_id)
  );`,
  remove: `DROP TABLE IF EXISTS posts_comments;`,
};

export default postsComments;
