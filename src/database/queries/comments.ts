import { BaseQuery } from './types';

const comments: BaseQuery = {
  create: `CREATE TABLE IF NOT EXISTS comments (
    comment_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    fk_user_id int NOT NULL,
    body text,

    CONSTRAINT PK_comments_comment_id PRIMARY KEY(comment_id),
    CONSTRAINT FK_comments_user_id FOREIGN KEY(fk_user_id) REFERENCES users(user_id)
  );`,
  remove: `DROP TABLE IF EXISTS comments;`,
};

export default comments;
