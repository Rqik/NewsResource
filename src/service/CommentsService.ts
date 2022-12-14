import { QueryResult } from 'pg';
import db from '../db';

const tableName = 'comments';

type CommentRow = {
  comment_id: number;
  title: string;
  create_at: Date;
  fk_user_id: number;
  body: string;
};
class CommentsService {
  static async create({
    title,
    userId,
    body,
  }: {
    title: string;
    userId: number;
    body: string;
  }) {
    const query = `INSERT INTO ${tableName} (title, fk_user_id, body)
                        VALUES ($1, $2, $3)
                        RETURNING comment_id, title, fk_user_id, body
    `;
    const result: QueryResult<CommentRow> = await db.query(query, [
      title,
      userId,
      body,
    ]);
    return result.rows[0];
  }

  static async getComments({ cIds }: { cIds: number[] }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE comment_id = ANY ($1)
    `;

    const result: QueryResult<CommentRow> = await db.query(query, [cIds]);

    return result.rows;
  }

  static async delete({ cId }: { cId: number }) {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE comment_id = $1
                RETURNING comment_id, title, fk_user_id, body`;

    const result: QueryResult<CommentRow> = await db.query(query, [cId]);
    return result.rows[0];
  }
}

export default CommentsService;
