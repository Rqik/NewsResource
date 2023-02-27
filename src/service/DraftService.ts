import { QueryResult } from 'pg';

import db from '../db';
import { ApiError } from '../exceptions/index';
import { PropsWithId } from './types';

type DraftsRow = {
  draft_id: number;
  created_at: Date;
  updated_at: Date;
  fk_user_id: number;
  body: string;
  total_count?: number;
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

    const { rows }: QueryResult<DraftsRow> = await db.query(query, [
      Number(userId),
      body,
    ]);

    const draft = rows[0];

    return DraftService.convertDraft(draft);
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

    const { rows }: QueryResult<DraftsRow> = await db.query(query, [
      body,
      userId,
      id,
    ]);

    const draft = rows[0];

    return DraftService.convertDraft(draft);
  }

  static async getOne({ id }: { id: number }): Promise<Draft> {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE draft_id = $1`;
    const { rows }: QueryResult<DraftsRow> = await db.query(query, [id]);
    const draft = rows[0];

    return DraftService.convertDraft(draft);
  }

  static async getDrafts(
    { dIds }: { dIds: number[] },
    { page, perPage }: { page: number; perPage: number },
  ) {
    const query = `SELECT draft_id AS id, created_at AS "createdAt", updated_at as "updatedAt", fk_user_id AS "userId", body,
                          count(*) OVER() AS total_count
                     FROM ${tableName}
                    WHERE draft_id = ANY ($1)
                    LIMIT $2
                   OFFSET $3
      `;

    const { rows, rowCount: count }: QueryResult<DraftsRow> = await db.query(
      query,
      [dIds, perPage, page * perPage],
    );

    const totalCount = rows[0]?.total_count || null;
    const drafts = rows.map((draft) => DraftService.convertDraft(draft));

    return { totalCount, count, drafts };
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
      const { rows }: QueryResult<DraftsRow> = await db.query(query, [id]);
      const data = rows[0];

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

  static convertDraft(draft: DraftsRow): PropsWithId<Draft> {
    return {
      id: draft.draft_id,
      createdAt: draft.created_at,
      updatedAt: draft.updated_at,
      userId: draft.fk_user_id,
      body: draft.body,
    };
  }
}

export default DraftService;
