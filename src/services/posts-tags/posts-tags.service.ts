import { boundClass } from 'autobind-decorator';
import { QueryResult } from 'pg';

import prisma from '@/client';
import db from '@/db';
import { ApiError } from '@/exceptions';

import type { TagFilters } from '../posts/posts.service';
import { TagsService } from '../tags';
import { PropsWithId } from '../types';

type PostTagRow = {
  fk_tag_id: number;
  fk_post_id: number;
};

const tableName = 'posts_tags';
const returnCols = 'fk_post_id, fk_tag_id';

@boundClass
class PostsTagsService {
  constructor(
    private prismaClient: typeof prisma,
    private tagsService: typeof TagsService,
  ) {}

  async create({ postId, tagId }: { postId: number; tagId: number }) {
    await this.prismaClient.postsOnTags.create({
      data: {
        fk_post_id: postId,
        fk_tag_id: tagId,
      },
    });
  }

  async getPostTags({ id }: PropsWithId) {
    const rows = await this.prismaClient.postsOnTags.findMany({
      where: {
        fk_post_id: Number(id),
      },
    });

    const tIds = rows.map((el) => el.fk_tag_id);

    const tags = await this.tagsService.getTags({ tIds });

    return tags;
  }

  async getPostFilteredTags({
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

    const tags = await this.tagsService.getTags({ tIds });

    return tags;
  }

  async delete({ postId, tagId }: { postId: number; tagId: number }) {
    const isBelongs = await this.checkPostBelongsTags({ postId, tagId });

    if (isBelongs) {
      const data = await this.prismaClient.postsOnTags.delete({
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

  private async checkPostBelongsTags({
    postId,
    tagId,
  }: {
    postId: number;
    tagId: number;
  }) {
    const data = await this.prismaClient.postsOnTags.findMany({
      where: {
        fk_post_id: postId,
        fk_tag_id: tagId,
      },
    });

    return data.length > 0;
  }
}

export default new PostsTagsService(prisma, TagsService);
