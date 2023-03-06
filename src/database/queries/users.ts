import { BaseQuery } from './types';

const users: BaseQuery = {
  create: `CREATE TABLE IF NOT EXISTS users (
    user_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
    first_name varchar(128) NOT NULL,
    last_name varchar(128),
    avatar varchar(128),
    login varchar(128) NOT NULL UNIQUE,
    password text NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    admin boolean NOT NULL DEFAULT false,
    activate_link varchar(128),
    is_activated boolean NOT NULL DEFAULT false,
    email text,

    CONSTRAINT PK_users_user_id PRIMARY KEY(user_id)
  );`,
  remove: `DROP TABLE IF EXISTS users;`,
};

export default users;
