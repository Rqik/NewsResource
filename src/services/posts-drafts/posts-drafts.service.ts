import { boundClass } from 'autobind-decorator';
import { QueryResult } from 'pg';

import prisma from '@/client';
import db from '@/db';
import { ApiError } from '@/exceptions';

import { DraftsService } from '../drafts';
import { PostsService } from '../posts';

type PostDraftRow = {
  fk_draft_id: number;
  fk_post_id: number;
  total_count?: number;
};

const tableName = 'posts_drafts';
const returnCols = 'fk_post_id, fk_draft_id';

@boundClass
class PostsDraftsService {
  constructor(
    private prismaClient: typeof prisma,
    private draftsService: typeof DraftsService,
    private postsService: typeof PostsService,
  ) {}

  async create({
    postId,
    authorId,
    body,
    title,
    categoryId,
    mainImg,
    otherImgs = [],
  }: {
    postId: number;
    authorId: number;
    body: string;
    title: string;
    categoryId: number;
    mainImg: string;
    otherImgs: string[];
  }) {
    const draft = await this.draftsService.create({
      body,
      authorId,
      title,
      categoryId,
      mainImg,
      otherImgs,
    });

    await this.prismaClient.postsOnDrafts.create({
      data: {
        fk_draft_id: draft.id,
        fk_post_id: postId,
      },
    });

    return draft;
  }

  async getDraftsPost(
    { postId, authorId }: { postId: number; authorId: number },
    { page, perPage }: { page: number; perPage: number },
  ) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1
`;
    const { rows }: QueryResult<PostDraftRow> = await db.query(query, [postId]);

    const dIds = rows.map((el) => el.fk_draft_id);

    const { totalCount, count, drafts } = await this.draftsService.getDrafts(
      { dIds, authorId },
      { page, perPage },
    );

    return { totalCount, count, drafts };
  }

  async delete({ postId, draftId }: { postId: number; draftId: number }) {
    const queryPostTags = `DELETE
                             FROM post_${tableName}
                            WHERE fk_post_id = $1 AND fk_draft_id = $2
`;
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (isBelongs) {
      await db.query(queryPostTags, [postId, draftId]);
      const removedDraft = await this.draftsService.delete({ id: draftId });

      return removedDraft;
    }

    return ApiError.BadRequest('Tag not found');
  }

  async update({
    postId,
    draftId,
    body,
    authorId,
    title,
    categoryId,
    mainImg,
    otherImgs = [],
  }: {
    postId: number;
    draftId: number;
    authorId: number;
    body: string;
    title: string;
    categoryId: number;
    mainImg: string;
    otherImgs: string[];
  }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (isBelongs) {
      const draft = await this.draftsService.update({
        id: draftId,
        body,
        authorId,
        title,
        categoryId,
        mainImg,
        otherImgs,
      });

      return draft;
    }

    return ApiError.BadRequest('Not found drafts');
  }

  async getOne({
    postId,
    draftId,
  }: {
    postId: number;
    draftId: number;
    authorId: number;
  }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (isBelongs) {
      const draft = await this.draftsService.getOne({ id: draftId });

      return draft;
    }

    return ApiError.BadRequest('Not found drafts');
  }

  async publish({ postId, draftId }: { postId: number; draftId: number }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (!isBelongs) {
      return ApiError.BadRequest('Not found drafts');
    }
    const draft = await this.draftsService.getOne({ id: draftId });

    if (draft === null) {
      return ApiError.BadRequest('Not found drafts');
    }

    await this.postsService.update({ ...draft, id: postId });

    return draft;
  }

  private async checkPostBelongsDraft({
    postId,
    draftId,
  }: {
    postId: number;
    draftId: number;
  }) {
    const data = await this.prismaClient.postsOnDrafts.findMany({
      where: {
        fk_draft_id: draftId,
        fk_post_id: postId,
      },
    });

    return data.length > 0;
  }
}

export default new PostsDraftsService(prisma, DraftsService, PostsService);
