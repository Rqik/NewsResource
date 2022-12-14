import { QueryResult } from 'pg';
import db from '../db';
import type { TagFilters } from './PostsService';
import TagsService from './TagsService';
import { PropsWithId } from './types';

type PostTagRow = {
  fk_tag_id: number;
  fk_post_id: number;
};

const tableName = 'posts_tags';
const returnCols = 'fk_post_id, fk_tag_id';

class PostsTagsService {
  static async create({ postId, tagId }: { postId: number; tagId: number }) {
    const query = `INSERT INTO ${tableName} (fk_post_id, fk_tag_id)
                        VALUES ($1, $2)
                     RETURNING ${returnCols}`;

    await db.query(query, [postId, tagId]);
  }

  static async getPostTags({ id }: PropsWithId) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1
                    `;
    const result: QueryResult<PostTagRow> = await db.query(query, [id]);

    const tIds = result.rows.map((el) => el.fk_tag_id);

    const tags = await TagsService.getTags({ tIds });

    return tags;
  }

  static async getPostFilteredTags({
    id,
    filters,
  }: PropsWithId<{
    filters: TagFilters;
  }>) {
    // console.log('getPostFilteredTags -- ');

    const query = `SELECT *
                     FROM ${tableName}

                    WHERE fk_post_id = $1
                    `;

    const counterFilter = 2;
    const values: (number | number[])[] = [];
    // if (filters.tag !== null) {
    //   query += ` AND fk_tag_id = $${counterFilter}`;
    //   counterFilter += 1;
    //   values.push(filters.tag);
    // }
    // if (filters.tags__in.length > 0) {
    //   query += ` AND fk_tag_id IN $${counterFilter}`;
    //   counterFilter += 1;
    //   values.push(filters.tags__in);
    // }
    // if (filters.tags__all.length > 0) {
    //   query += ` AND fk_tag_id ALL $${counterFilter}`;
    //   counterFilter += 1;
    //   values.push(filters.tags__all);
    // }
    // console.log(query);

    const result: QueryResult<PostTagRow> = await db.query(query, [
      id,
      ...values,
    ]);

    // console.log('dd', result);
    const tIds = result.rows.map((el) => el.fk_tag_id);

    const tags = await TagsService.getTags({ tIds });

    return tags;
  }

  static async delete({ postId, tagId }: { postId: number; tagId: number }) {
    const queryPostsTags = `DELETE
                             FROM post_${tableName}
                            WHERE fk_post_id = $1 AND fk_tag_id = $2
`;
    const isBelongs = await this.checkPostBelongsTags({ postId, tagId });

    if (isBelongs) {
      const result = await db.query(queryPostsTags, [postId, tagId]);
      return result.rows[0];
    }

    throw new Error('Tag not found');
  }

  private static async checkPostBelongsTags({
    postId,
    tagId,
  }: {
    postId: number;
    tagId: number;
  }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1 AND fk_tag_id = $2`;
    const result: QueryResult<PostTagRow> = await db.query(query, [
      postId,
      tagId,
    ]);

    return result.rows.length > 0;
  }
}

export default PostsTagsService;
