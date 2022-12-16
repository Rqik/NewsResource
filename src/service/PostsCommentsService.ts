import { QueryResult } from 'pg';
import db from '../db';
import CommentsService from './CommentsService';
import { PropsWithId } from './types';

const tableName = 'post_comments';

type NewsCommentRow = {
  fk_post_id: number;
  fk_comment_id: number;
};

class NewsCommentsService {
  static async create({
    commentId,
    postId,
  }: {
    commentId: number;
    postId: number;
  }) {
    const query = `INSERT INTO ${tableName} (fk_post_id, fk_comment_id)
                        VALUES ($1, $2)`;

    const result: QueryResult<NewsCommentRow> = await db.query(query, [
      postId,
      commentId,
    ]);

    return result.rows;
  }

  static async getCommentsPost({ id }: PropsWithId) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1
    `;
    const result: QueryResult<NewsCommentRow> = await db.query(query, [id]);

    const cIds = result.rows.map((el) => el.fk_comment_id);

    const comments = await CommentsService.getComments({ cIds });

    return comments;
  }

  static async delete({ nId, cId }: { nId: number; cId: number }) {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE fk_post_id = $1 AND fk_comment_id = $2`;

    await db.query(query, [nId, cId]);

    const comment = await CommentsService.delete({ cId });
    return comment;
  }
}

export default NewsCommentsService;
