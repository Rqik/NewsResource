import { BaseQuery } from './types';

const drafts: BaseQuery = {
  create: `CREATE TABLE IF NOT EXISTS drafts (
    draft_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    title varchar(512),
    body text,
    main_img text,
    other_imgs text[],
    fk_author_id int,
    fk_category_id int,

    CONSTRAINT PK_drafts_draft_id PRIMARY KEY(draft_id),
    CONSTRAINT FK_posts_author_id FOREIGN KEY(fk_author_id) REFERENCES authors(author_id),
    CONSTRAINT FK_drafts_category_id FOREIGN KEY(fk_category_id) REFERENCES categories(category_id)
  );`,
  remove: `DROP TABLE IF EXISTS drafts;`,
};

export default drafts;
