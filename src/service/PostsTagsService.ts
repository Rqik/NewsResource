import { QueryResult } from 'pg';

import db from '../db';
import ApiError from '../exceptions/ApiError';
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
    const { rows }: QueryResult<PostTagRow> = await db.query(query, [id]);

    const tIds = rows.map((el) => el.fk_tag_id);

    const tags = await TagsService.getTags({ tIds });

    return tags;
  }

  static async getPostFilteredTags({
    id,
  }: PropsWithId<{
    filters: TagFilters;
  }>) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1
                    `;

    const values: (number | number[])[] = [];

    const { rows }: QueryResult<PostTagRow> = await db.query(query, [
      id,
      ...values,
    ]);

    const tIds = rows.map((el) => el.fk_tag_id);

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
      const { rows } = await db.query(queryPostsTags, [postId, tagId]);

      return rows[0];
    }

    throw ApiError.BadRequest('Tag not found');
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
    const { rows }: QueryResult<PostTagRow> = await db.query(query, [
      postId,
      tagId,
    ]);

    return rows.length > 0;
  }
}

export default PostsTagsService;
