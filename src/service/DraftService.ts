import { Request, Response } from 'express';
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
  static async create({ title }: { title: string }) {
    const query = `INSERT INTO ${tableName} (title)
                        VALUES ($1)
                     RETURNING tag_id, title`;
    const result: QueryResult<DraftsRow> = await db.query(query, [title]);
    const data = result.rows[0];

    return {
      id: data.draft_id,
      createAt: data.create_at,
      updateAt: data.updated_at,
      userId: data.fk_user_id,
      body: data.body,
    };
  }

  static async update({ id, title }: { id: string; title: string }) {
    const query = `UPDATE ${tableName}
                      SET title = $1
                    WHERE tag_id = $2
                RETURNING tag_id, title`;
    const result: QueryResult<DraftsRow> = await db.query(query, [title, id]);
    const data = result.rows[0];

    return {
      id: data.draft_id,
      createAt: data.create_at,
      updateAt: data.updated_at,
      userId: data.fk_user_id,
      body: data.body,
    };
  }

  static async getAll(req: Request, res: Response) {
    try {
      const result: QueryResult<DraftsRow> = await db.query(
        `SELECT *
           FROM ${tableName}`,
      );

      res.send(result.rows);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne({ id }: { id: string }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE tag_id = $1`;
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

export default new DraftService();
