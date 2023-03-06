import { Pool } from 'pg';

import queryList from './queries';

const {
  authors,
  categories,
  comments,
  drafts,
  postsComments,
  postsDrafts,
  postsTags,
  posts,
  tags,
  tokens,
  users,
} = queryList;

class Tables {
  constructor(private db: Pool) {}

  async init() {
    await this.db.query(`
      ${users.create}
      ${authors.create}
      ${categories.create}
      ${tags.create}
      ${drafts.create}
      ${comments.create}
      ${posts.create}
      ${postsTags.create}
      ${tokens.create}
      ${postsComments.create}
      ${postsDrafts.create}
    `);
  }
}

export default Tables;
