import { QueryResult } from 'pg';

import db from '../db';

const tableName = 'comments';

type CommentRow = {
  comment_id: number;
  created_at: Date;
  fk_user_id: number;
  body: string;
  total_count?: number;
};

type Comment = {
  id: number;
  createdAt: Date;
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
                     RETURNING comment_id, fk_user_id, body, created_at
    `;
    const { rows }: QueryResult<CommentRow> = await db.query(query, [
      userId,
      body,
    ]);

    const comment = rows[0];

    return CommentsService.convertComment(comment);
  }

  static async getComments(
    { commentIds }: { commentIds: number[] },
    { page, perPage }: { page: number; perPage: number },
  ) {
    const query = `SELECT comment_id AS id, created_at AS "createdAt", fk_user_id AS "userId", body
                     FROM ${tableName}
                    WHERE comment_id = ANY ($1)
                    LIMIT $2
                   OFFSET $3
    `;

    const queryTotal = `SELECT count(*)
                          FROM ${tableName}
                         WHERE comment_id = ANY ($1)
    `;

    const { rows, rowCount: count }: QueryResult<CommentRow> = await db.query(
      query,
      [commentIds, perPage, page * perPage],
    );

    const resultTotal: QueryResult<{ count: number }> = await db.query(
      queryTotal,
      [commentIds],
    );

    const totalCount = resultTotal.rows[0].count || null;
    const comments = rows.map((comment) => comment);

    return { totalCount, count, comments };
  }

  static async delete({ id }: { id: number }): Promise<Comment> {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE comment_id = $1
                RETURNING comment_id, created_at, fk_user_id, body`;

    const { rows }: QueryResult<CommentRow> = await db.query(query, [id]);
    const comment = rows[0];

    return CommentsService.convertComment(comment);
  }

  static convertComment(comment: CommentRow): Comment {
    return {
      id: comment.comment_id,
      userId: comment.fk_user_id,
      createdAt: comment.created_at,
      body: comment.body,
    };
  }
}

export type { CommentRow };
export default CommentsService;
