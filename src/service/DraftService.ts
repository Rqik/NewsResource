import { QueryResult } from 'pg';
import db from '../db';

type DraftsRow = {
  draft_id: number;
  create_at: Date;
  updated_at: Date;
  fk_user_id: number;
  body: string;
};

const tableName = 'drafts';

class DraftService {
  static async create({ userId, body }: { userId: number; body: string }) {
    const query = `INSERT INTO ${tableName} (fk_user_id, body)
                        VALUES ($1, $2)
                     RETURNING draft_id, create_at, updated_at, fk_user_id, body`;
    const result: QueryResult<DraftsRow> = await db.query(query, [
      userId,
      body,
    ]);
    const data = result.rows[0];

    return {
      id: data.draft_id,
      createAt: data.create_at,
      updateAt: data.updated_at,
      userId: data.fk_user_id,
      body: data.body,
    };
  }

  static async update({
    id,
    body,
    userId,
  }: {
    id: string;
    body: string;
    userId: number;
  }) {
    const query = `UPDATE ${tableName}
                      SET body = $1,
                          fk_user_id = $2,
                          update_at = NOW()
                    WHERE draft_id = $3
                RETURNING draft_id, create_at, updated_at, fk_user_id, body`;

    const result: QueryResult<DraftsRow> = await db.query(query, [
      body,
      userId,
      id,
    ]);
    const data = result.rows[0];

    return {
      id: data.draft_id,
      createAt: data.create_at,
      updateAt: data.updated_at,
      userId: data.fk_user_id,
      body: data.body,
    };
  }

  static async getAll() {
    const result: QueryResult<DraftsRow> = await db.query(
      `SELECT *
           FROM ${tableName}`,
    );

    return result.rows;
  }

  static async getOne({ id }: { id: string }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE draft_id = $1`;
    const result: QueryResult<DraftsRow> = await db.query(query, [id]);
    const data = result.rows[0];

    return {
      id: data.draft_id,
      createAt: data.create_at,
      updateAt: data.updated_at,
      userId: data.fk_user_id,
      body: data.body,
    };
  }

  static async delete({ id }: { id: string }) {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE tag_id = $1
                RETURNING tag_id, title`;
    const queryNewsTags = `DELETE
                             FROM news_${tableName}
                            WHERE fk_tag_id = $1

    `;
    const selectData: QueryResult<DraftsRow> = await db.query(
      `SELECT * FROM ${tableName}
          WHERE tag_id = $1
      `,
      [id],
    );

    if (selectData.rows.length > 0) {
      await db.query(queryNewsTags, [id]);
      const result: QueryResult<DraftsRow> = await db.query(query, [id]);
      const data = result.rows[0];

      return {
        id: data.draft_id,
        createAt: data.create_at,
        updateAt: data.updated_at,
        userId: data.fk_user_id,
        body: data.body,
      };
    }
    // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app

    throw new Error('Tag not found');
  }
}

export default DraftService;
