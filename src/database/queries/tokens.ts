import { BaseQuery } from './types';

const tokens: BaseQuery = {
  create: `CREATE TABLE IF NOT EXISTS tokens (
    refresh_token text,
    fk_user_id int,

    CONSTRAINT PK_pk_refresh_token PRIMARY KEY(refresh_token),
    CONSTRAINT FK_tokens_user_id FOREIGN KEY(fk_user_id) REFERENCES users(user_id)
  );`,
  remove: `DROP TABLE IF EXISTS tokens;`,
};

export default tokens;
