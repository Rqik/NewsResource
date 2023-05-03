import { QueryResult } from 'pg';

import db from '../../db';
import ApiError from '../../exceptions/ApiError';
import prisma from '../../client';
import type { TagFilters } from '../posts/Posts.service';
import TagsService from '../tags/Tags.service';
import { PropsWithId } from '../types';

type PostTagRow = {
  fk_tag_id: number;
  fk_post_id: number;
};

const tableName = 'posts_tags';
const returnCols = 'fk_post_id, fk_tag_id';

class PostsTagsService {
  static async create({ postId, tagId }: { postId: number; tagId: number }) {
    await prisma.postsOnTags.create({
      data: {
        fk_post_id: postId,
        fk_tag_id: tagId,
      },
    });
  }

  static async getPostTags({ id }: PropsWithId) {
    const rows = await prisma.postsOnTags.findMany({
      where: {
        fk_post_id: Number(id),
      },
    });

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
    const isBelongs = await this.checkPostBelongsTags({ postId, tagId });

    if (isBelongs) {
      const data = await prisma.postsOnTags.delete({
        where: {
          fk_post_id_fk_tag_id: {
            fk_post_id: postId,
            fk_tag_id: tagId,
          },
        },
      });

      return data;
    }

    return ApiError.BadRequest('Tag not found');
  }

  private static async checkPostBelongsTags({
    postId,
    tagId,
  }: {
    postId: number;
    tagId: number;
  }) {
    const data = await prisma.postsOnTags.findMany({
      where: {
        fk_post_id: postId,
        fk_tag_id: tagId,
      },
    });

    return data.length > 0;
  }
}

export default PostsTagsService;
