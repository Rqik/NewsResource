import { QueryResult } from 'pg';
import db from '../db';
import { PropsWithId } from './types';

const tableName = 'tags';
type TagsRow = { tag_id: number; title: string };
type TagsProp = {
  title: string;
};
class TagsService {
  static async create({ title }: TagsProp) {
    const query = `INSERT INTO ${tableName} (title)
                        VALUES ($1)
                     RETURNING tag_id, title`;
    const result: QueryResult<TagsRow> = await db.query(query, [title]);
    const data = result.rows[0];

    return {
      id: data.tag_id,
      title: data.title,
    };
  }

  static async update({ id, title }: PropsWithId<TagsProp>) {
    const query = `UPDATE ${tableName}
                      SET title = $1
                    WHERE tag_id = $2
                RETURNING tag_id, title`;
    const result: QueryResult<TagsRow> = await db.query(query, [title, id]);
    const data = result.rows[0];

    return {
      id: data.tag_id,
      title: data.title,
    };
  }

  static async getAll() {
    const result: QueryResult<TagsRow> = await db.query(
      `SELECT *
           FROM ${tableName}`,
    );

    return result.rows;
  }

  static async getOne({ id }: PropsWithId) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE tag_id = $1`;
    const result: QueryResult<TagsRow> = await db.query(query, [id]);
    const data = result.rows[0];

    return {
      id: data.tag_id,
      title: data.title,
    };
  }

  static async delete({ id }: PropsWithId) {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE tag_id = $1
                RETURNING tag_id, title`;
    const queryNewsTags = `DELETE
                             FROM post_${tableName}
                            WHERE fk_tag_id = $1

    `;
    const selectData: QueryResult<TagsRow> = await db.query(
      `SELECT * FROM ${tableName}
          WHERE tag_id = $1
      `,
      [id],
    );

    if (selectData.rows.length > 0) {
      await db.query(queryNewsTags, [id]);
      const result: QueryResult<TagsRow> = await db.query(query, [id]);
      const data = result.rows[0];

      return {
        id: data.tag_id,
        title: data.title,
      };
    }
    // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app

    throw new Error('Tag not found');
  }
}

export default TagsService;
