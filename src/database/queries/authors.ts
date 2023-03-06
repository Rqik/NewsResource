import { BaseQuery } from './types';

const authors: BaseQuery = {
  create: `CREATE TABLE IF NOT EXISTS authors (
    author_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
    fk_user_id int NOT NULL UNIQUE,
    description varchar(512),

    CONSTRAINT PK_authors_author_id PRIMARY KEY(author_id),
    CONSTRAINT FK_authors_user_id FOREIGN KEY(fk_user_id) REFERENCES users(user_id)
  );`,
  remove: `DROP TABLE IF EXISTS authors;`,
};

export default authors;
