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
    const result: QueryResult<CommentRow> = await db.query(query, [
      userId,
      body,
    ]);

    const comment = result.rows[0];

    return CommentsService.convertComment(comment);
  }

  static async getComments(
    { cIds }: { cIds: number[] },
    { page, perPage }: { page: number; perPage: number },
  ) {
    const query = `SELECT comment_id AS id, created_at AS "createdAt", fk_user_id AS "userId", body,
                          count(*) OVER() AS total_count
                     FROM ${tableName}
                    WHERE comment_id = ANY ($1)
                    LIMIT $2
                   OFFSET $3
    `;

    const result: QueryResult<CommentRow> = await db.query(query, [
      cIds,
      perPage,
      page * perPage,
    ]);
    const totalCount = result.rows[0]?.total_count || null;
    const comments = result.rows.map((comment) =>
      CommentsService.convertComment(comment),
    );
    return { totalCount, count: result.rowCount, comments };
  }

  static async delete({ cId }: { cId: number }): Promise<Comment> {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE comment_id = $1
                RETURNING comment_id, created_at, fk_user_id, body`;

    const result: QueryResult<CommentRow> = await db.query(query, [cId]);
    const comment = result.rows[0];
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
