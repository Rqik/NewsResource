import { QueryResult } from 'pg';

import db from '../db';
import { PropsWithId } from './types';

const tableName = 'authors';
type AuthorsRow = {
  author_id: number;
  fk_user_id: number;
  description: string;
};

type AuthorProp = { description: string; userId: number };
class AuthorsService {
  static async create({ description, userId }: AuthorProp) {
    const query = `INSERT INTO ${tableName} (description, fk_user_id)
                        VALUES ($1, $2)
                     RETURNING author_id, description, fk_user_id`;

    const result: QueryResult<AuthorsRow> = await db.query(query, [
      description,
      userId,
    ]);
    const data = result.rows[0];

    return {
      id: data.author_id,
      description: data.description,
      userId: data.fk_user_id,
    };
  }

  static async update({ id, description, userId }: PropsWithId<AuthorProp>) {
    const query = `UPDATE ${tableName}
                      SET description = $1,
                          fk_user_id = $2
                    WHERE author_id = $3
                RETURNING author_id, description, fk_user_id`;
    const result: QueryResult<AuthorsRow> = await db.query(query, [
      description,
      userId,
      id,
    ]);
    const data = result.rows[0];

    return {
      id: data.author_id,
      description: data.description,
      userId: data.fk_user_id,
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
      userId: data.fk_user_id,
    };
  }

  static async deleteUserAuthors({ id }: PropsWithId) {
    const query = `DELETE FROM ${tableName}
                    WHERE fk_user_id = $1
                RETURNING author_id, description, fk_user_id`;

    const result: QueryResult<AuthorsRow> = await db.query(query, [id]);
    return result.rows;
  }

  static async delete({ id }: PropsWithId) {
    const query = `DELETE FROM ${tableName}
                    WHERE author_id = $1
                RETURNING author_id, description, fk_user_id`;

    const result: QueryResult<AuthorsRow> = await db.query(query, [id]);
    const data = result.rows[0];
    return {
      id: data.author_id,
      description: data.description,
      userId: data.fk_user_id,
    };
  }
}

export default AuthorsService;
