import { BaseQuery } from './types';

const posts: BaseQuery = {
  create: `CREATE TABLE IF NOT EXISTS posts (
    post_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
    title varchar(512),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    body text,
    main_img text,
    other_imgs text[],
    fk_author_id int,
    fk_category_id int,
    is_published boolean NOT NULL DEFAULT true,

    CONSTRAINT PK_posts_post_id PRIMARY KEY(post_id),
    CONSTRAINT FK_posts_author_id FOREIGN KEY(fk_author_id) REFERENCES authors(author_id),
    CONSTRAINT FK_posts_category_id FOREIGN KEY(fk_category_id) REFERENCES categories(category_id)
  );`,
  remove: `DROP TABLE IF EXISTS posts;`,
};

export default posts;
