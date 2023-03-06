import { BaseQuery } from './types';

const postsDrafts: BaseQuery = {
  create: `CREATE TABLE IF NOT EXISTS posts_drafts (
    fk_draft_id int,
    fk_post_id int,

    CONSTRAINT PK_posts_drafts_id PRIMARY KEY(fk_draft_id, fk_post_id),
    CONSTRAINT FK_posts_drafts_drafts_id FOREIGN KEY(fk_draft_id) REFERENCES drafts(draft_id),
    CONSTRAINT FK_posts_drafts_post_id FOREIGN KEY(fk_post_id) REFERENCES posts(post_id)
  );`,
  remove: `DROP TABLE IF EXISTS posts_drafts;`,
};

export default postsDrafts;
