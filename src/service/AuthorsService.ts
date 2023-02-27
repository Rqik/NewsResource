import { QueryResult } from 'pg';

import db from '../db';
import { PropsWithId } from './types';

const tableName = 'authors';

type AuthorsRow = {
  author_id: number;
  fk_user_id: number;
  description: string;
  total_count?: number;
};

type Author = {
  id: number;
  userId: number;
  description: string;
};

type AuthorProp = { description: string; userId: number };
class AuthorsService {
  static async create({ description, userId }: AuthorProp) {
    const query = `INSERT INTO ${tableName} (description, fk_user_id)
                        VALUES ($1, $2)
                     RETURNING author_id, description, fk_user_id`;

    const { rows }: QueryResult<AuthorsRow> = await db.query(query, [
      description,
      userId,
    ]);
    const author = rows[0];

    return AuthorsService.convertCase(author);
  }

  static async update({ id, description, userId }: PropsWithId<AuthorProp>) {
    const query = `UPDATE ${tableName}
                      SET description = $1,
                          fk_user_id = $2
                    WHERE author_id = $3
                RETURNING author_id, description, fk_user_id`;
    const { rows }: QueryResult<AuthorsRow> = await db.query(query, [
      description,
      userId,
      id,
    ]);
    const author = rows[0];

    return AuthorsService.convertCase(author);
  }

  static async getAll({ page, perPage }: { page: number; perPage: number }) {
    const { rows, rowCount: count }: QueryResult<AuthorsRow> = await db.query(
      `SELECT *,
              count(*) OVER() AS total_count
         FROM ${tableName}
        LIMIT $1
       OFFSET $2
           `,
      [perPage, page * perPage],
    );
    const authors = rows.map((author) => AuthorsService.convertCase(author));
    const totalCount = rows[0]?.total_count || null;

    return { authors, count, totalCount };
  }

  static async getOne({ id }: PropsWithId) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE author_id = $1`;
    const { rows }: QueryResult<AuthorsRow> = await db.query(query, [id]);
    const author = rows[0];

    return AuthorsService.convertCase(author);
  }

  static async deleteUserAuthors({ id }: PropsWithId) {
    const query = `DELETE FROM ${tableName}
                    WHERE fk_user_id = $1
                RETURNING author_id, description, fk_user_id`;

    const { rows }: QueryResult<AuthorsRow> = await db.query(query, [id]);

    return rows.map((author) => AuthorsService.convertCase(author));
  }

  static async delete({ id }: PropsWithId) {
    const query = `DELETE FROM ${tableName}
                    WHERE author_id = $1
                RETURNING author_id, description, fk_user_id`;

    const { rows }: QueryResult<AuthorsRow> = await db.query(query, [id]);
    const author = rows[0];

    return AuthorsService.convertCase(author);
  }

  static convertCase(author: AuthorsRow): Author {
    return {
      id: author.author_id,
      description: author.description,
      userId: author.fk_user_id,
    };
  }
}

export default AuthorsService;
