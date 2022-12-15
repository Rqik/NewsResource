import { QueryResult } from 'pg';

import db from '../db';

const tableName = 'comments';

type CommentRow = {
  comment_id: number;
  create_at: Date;
  fk_user_id: number;
  body: string;
};

type Comment = {
  id: number;
  createAt: Date;
  userId: number;
  body: string;
};
class CommentsService {
  static async create({
    userId,
    body,
  }: {
    userId: number;
    body: string;
  }): Promise<Comment> {
    const query = `INSERT INTO ${tableName} (fk_user_id, body)
                        VALUES ($1, $2)
                        RETURNING comment_id, fk_user_id, body, create_at
    `;
    const result: QueryResult<CommentRow> = await db.query(query, [
      userId,
      body,
    ]);

    const comment = result.rows[0];

    return {
      id: comment.comment_id,
      userId: comment.fk_user_id,
      createAt: comment.create_at,
      body: comment.body,
    };
  }

  static async getComments({ cIds }: { cIds: number[] }): Promise<Comment[]> {
    const query = `SELECT comment_id AS id, create_at AS "createAt", fk_user_id AS "userId" , body
                     FROM ${tableName}
                    WHERE comment_id = ANY ($1)
    `;

    const result: QueryResult<Comment> = await db.query(query, [cIds]);

    return result.rows;
  }

  static async delete({ cId }: { cId: number }): Promise<Comment> {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE comment_id = $1
                RETURNING comment_id, create_at, fk_user_id, body`;

    const result: QueryResult<CommentRow> = await db.query(query, [cId]);
    const comment = result.rows[0];
    return {
      id: comment.comment_id,
      userId: comment.fk_user_id,
      createAt: comment.create_at,
      body: comment.body,
    };
  }
}

export default CommentsService;
