import { BaseQuery } from './types';

const categories: BaseQuery = {
  create: `CREATE TABLE IF NOT EXISTS categories (
    category_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
    description varchar(512) NOT NULL,
    fk_category_id int,

    CONSTRAINT PK_categories_category_id PRIMARY KEY(category_id),
    CONSTRAINT FK_categories_category_id FOREIGN KEY(fk_category_id) REFERENCES categories(category_id)
  );`,
  remove: `DROP TABLE IF EXISTS categories;`,
};

export default categories;
