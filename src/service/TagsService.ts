import { QueryResult } from 'pg';

import db from '../db';
import { ApiError } from '../exceptions';
import { PropsWithId } from './types';

const tableName = 'tags';
type TagsRow = {
  tag_id: number;
  title: string;
  total_count?: number;
};
type TagsProp = {
  title: string;
};
class TagsService {
  static async create({ title }: TagsProp) {
    const query = `INSERT INTO ${tableName} (title)
                        VALUES ($1)
                     RETURNING tag_id, title`;
    const { rows }: QueryResult<TagsRow> = await db.query(query, [title]);
    const tag = rows[0];

    return TagsService.convertTag(tag);
  }

  static async update({ id, title }: PropsWithId<TagsProp>) {
    const query = `UPDATE ${tableName}
                      SET title = $1
                    WHERE tag_id = $2
                RETURNING tag_id, title`;
    const { rows }: QueryResult<TagsRow> = await db.query(query, [title, id]);
    const tag = rows[0];

    return TagsService.convertTag(tag);
  }

  static async getAll({ page, perPage }: { page: number; perPage: number }) {
    const query = `SELECT *,
                          count(*) OVER() AS total_count
                     FROM ${tableName}
                    LIMIT $1
                   OFFSET $2
`;
    const { rows, rowCount: count }: QueryResult<TagsRow> = await db.query(
      query,
      [perPage, page * perPage],
    );
    const totalCount = rows[0].total_count || null;
    const tags = rows.map((tag) => TagsService.convertTag(tag));

    return {
      totalCount,
      count,
      tags,
    };
  }

  static async getTags({ tIds }: { tIds: number[] }) {
    const query = `SELECT tag_id id, title
                     FROM ${tableName}
                    WHERE tag_id = ANY ($1)`;
    const { rows }: QueryResult<TagsRow> = await db.query(query, [tIds]);

    return rows.map((tag) => TagsService.convertTag(tag));
  }

  static async getOne({ id }: PropsWithId) {
    const query = `SELECT tag_id, title
                     FROM ${tableName}
                    WHERE tag_id = $1`;
    const { rows }: QueryResult<TagsRow> = await db.query(query, [id]);
    const tag = rows[0];

    return TagsService.convertTag(tag);
  }

  static async delete({ id }: PropsWithId) {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE tag_id = $1
                RETURNING tag_id, title`;

    const selectData: QueryResult<TagsRow> = await db.query(
      `SELECT tag_id id, title
         FROM ${tableName}
        WHERE tag_id = $1`,
      [id],
    );

    if (selectData.rows.length > 0) {
      const { rows }: QueryResult<TagsRow> = await db.query(query, [id]);
      const tag = rows[0];

      return TagsService.convertTag(tag);
    }
    // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app

    throw ApiError.BadRequest('Tag not found');
  }

  static convertTag(tag: TagsRow): PropsWithId<TagsProp> {
    return {
      id: tag.tag_id,
      title: tag.title,
    };
  }
}
export type { TagsRow };
export default TagsService;
