import { type } from 'os';
import { QueryResult } from 'pg';
import db from '../db';
import { PropsWithId } from './types';

const tableName = 'tags';
type TagsRow = {
  tag_id: number;
  title: string;
};
type TagsProp = {
  title: string;
};
class TagsService {
  static async create({ title }: TagsProp) {
    const query = `INSERT INTO ${tableName} (title)
                        VALUES ($1)
                     RETURNING tag_id, title`;
    const result: QueryResult<TagsRow> = await db.query(query, [title]);
    const tag = result.rows[0];

    return TagsService.convertTag(tag);
  }

  static async update({ id, title }: PropsWithId<TagsProp>) {
    const query = `UPDATE ${tableName}
                      SET title = $1
                    WHERE tag_id = $2
                RETURNING tag_id, title`;
    const result: QueryResult<TagsRow> = await db.query(query, [title, id]);
    const tag = result.rows[0];

    return TagsService.convertTag(tag);
  }

  static async getAll() {
    const result: QueryResult<TagsRow> = await db.query(
      `SELECT *
         FROM ${tableName}`,
    );

    return result.rows.map((tag) => TagsService.convertTag(tag));
  }

  static async getTags({ tIds }: { tIds: number[] }) {
    const query = `SELECT tag_id id, title
                     FROM ${tableName}
                    WHERE tag_id = ANY ($1)`;
    const tags: QueryResult<TagsRow> = await db.query(query, [tIds]);

    return tags.rows.map((tag) => TagsService.convertTag(tag));
  }

  static async getOne({ id }: PropsWithId) {
    const query = `SELECT tag_id id, title
                     FROM ${tableName}
                    WHERE tag_id = $1`;
    const result: QueryResult<TagsRow> = await db.query(query, [id]);
    const tag = result.rows[0];

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
      const result: QueryResult<TagsRow> = await db.query(query, [id]);
      const tag = result.rows[0];

      return TagsService.convertTag(tag);
    }
    // TODO:fix ???? ???? ???????????????? (???????????? ?????? ?????????? next) ???????????????? ??????-???? ?????????????? ?? ?????????????? use ?? ?????????????????? app

    throw new Error('Tag not found');
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
