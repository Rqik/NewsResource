import { QueryResult } from 'pg';

import db from '../db';
import { PropsWithId } from './types';

const tableName = 'authors';
type AuthorsRow = {
  author_id: number;
  fk_user_id: number;
  description: string;
};

type AuthorProp = { description: string; user: number };
class AuthorsService {
  static async create({ description, user }: AuthorProp) {
    const query = `INSERT INTO ${tableName} (description, fk_user_id)
                        VALUES ($1, $2)
                     RETURNING author_id, description, fk_user_id`;

    const result: QueryResult<AuthorsRow> = await db.query(query, [
      description,
      user,
    ]);
    const data = result.rows[0];

    return {
      id: data.author_id,
      description: data.description,
      user: data.fk_user_id,
    };
  }

  static async update({ id, description, user }: PropsWithId<AuthorProp>) {
    const query = `UPDATE ${tableName}
                      SET description = $1,
                          fk_user_id = $2
                    WHERE authors_id = $3
                RETURNING authors_id, description, fk_user_id`;
    const result: QueryResult<AuthorsRow> = await db.query(query, [
      description,
      user,
      id,
    ]);
    const data = result.rows[0];

    return {
      id: data.author_id,
      description: data.description,
      user: data.fk_user_id,
    };
  }

  static async getAll() {
    const result: QueryResult<AuthorsRow> = await db.query(
      `SELECT *
           FROM ${tableName}`,
    );

    return result.rows;
  }

  static async getOne({ id }: PropsWithId) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE author_id = $1`;
    const result: QueryResult<AuthorsRow> = await db.query(query, [id]);
    const data = result.rows[0];

    return {
      id: data.author_id,
      description: data.description,
      user: data.fk_user_id,
    };
  }

  static async delete({ id }: PropsWithId) {
    const query = `DELETE FROM ${tableName}
                    WHERE authors_id = $1
                RETURNING authors_id, description, fk_user_id`;

    const selectData: QueryResult<AuthorsRow> = await db.query(
      `SELECT *
           FROM ${tableName}
          WHERE authors_id = $1
      `,
      [id],
    );

    if (selectData.rows.length > 0) {
      const result: QueryResult<AuthorsRow> = await db.query(query, [id]);
      const data = result.rows[0];
      return {
        id: data.author_id,
        description: data.description,
        user: data.fk_user_id,
      };
    }
    // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app
    throw new Error('Author not found');
  }
}

export default AuthorsService;
