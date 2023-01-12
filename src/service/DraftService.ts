import { QueryResult } from 'pg';
import db from '../db';
import { ApiError } from '../exceptions/index';

type DraftsRow = {
  draft_id: number;
  created_at: Date;
  updated_at: Date;
  fk_user_id: number;
  body: string;
};

type Draft = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  body: string;
};

const tableName = 'drafts';

class DraftService {
  static async create({ userId, body }: { userId: number; body: string }) {
    const query = `INSERT INTO ${tableName} (fk_user_id, body)
                        VALUES ($1, $2)
                     RETURNING draft_id, created_at, updated_at, fk_user_id, body`;
    const result: QueryResult<DraftsRow> = await db.query(query, [
      userId,
      body,
    ]);
    const data = result.rows[0];

    return {
      id: data.draft_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.fk_user_id,
      body: data.body,
    };
  }

  static async update({
    id,
    body,
    userId,
  }: {
    id: number;
    body: string;
    userId: number;
  }): Promise<Draft> {
    const query = `UPDATE ${tableName}
                      SET body = $1,
                          fk_user_id = $2,
                          updated_at = NOW()
                    WHERE draft_id = $3
                RETURNING draft_id, created_at, updated_at, fk_user_id, body`;

    const result: QueryResult<DraftsRow> = await db.query(query, [
      body,
      userId,
      id,
    ]);

    const data = result.rows[0];

    return {
      id: data.draft_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.fk_user_id,
      body: data.body,
    };
  }

  static async getOne({ id }: { id: number }): Promise<Draft> {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE draft_id = $1`;
    const result: QueryResult<DraftsRow> = await db.query(query, [id]);
    const data = result.rows[0];

    return {
      id: data.draft_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.fk_user_id,
      body: data.body,
    };
  }

  static async getDrafts({ dIds }: { dIds: number[] }): Promise<Draft[]> {
    const query = `SELECT draft_id AS id, created_at AS "createdAt", updated_at as "updatedAt", fk_user_id AS "userId", body
                       FROM ${tableName}
                      WHERE draft_id = ANY ($1)
      `;

    const result: QueryResult<Draft> = await db.query(query, [dIds]);

    return result.rows;
  }

  static async delete({ id }: { id: number }): Promise<Draft> {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE draft_id = $1
                RETURNING draft_id, created_at, updated_at, fk_user_id, body`;
    const queryPostsTags = `DELETE
                             FROM post_${tableName}
                            WHERE fk_draft_id = $1

    `;
    const selectData: QueryResult<DraftsRow> = await db.query(
      `SELECT * FROM ${tableName}
          WHERE draft_id = $1
      `,
      [id],
    );

    if (selectData.rows.length > 0) {
      await db.query(queryPostsTags, [id]);
      const result: QueryResult<DraftsRow> = await db.query(query, [id]);
      const data = result.rows[0];

      return {
        id: data.draft_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.fk_user_id,
        body: data.body,
      };
    }
    // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app

    throw ApiError.BadRequest('Tag not found');
  }
}

export default DraftService;
