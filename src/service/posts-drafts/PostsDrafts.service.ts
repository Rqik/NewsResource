import { QueryResult } from 'pg';

import db from '../../db';
import { ApiError } from '../../exceptions';
import prisma from '../../client';
import DraftsService from '../drafts/Drafts.service';
import PostsService from '../posts/Posts.service';

type PostDraftRow = {
  fk_draft_id: number;
  fk_post_id: number;
  total_count?: number;
};

const tableName = 'posts_drafts';
const returnCols = 'fk_post_id, fk_draft_id';

class PostsDraftsService {
  static async create({
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
    const draft = await DraftsService.create({
      body,
      authorId,
      title,
      categoryId,
      mainImg,
      otherImgs,
    });

    await prisma.postsOnDrafts.create({
      data: {
        fk_draft_id: draft.id,
        fk_post_id: postId,
      },
    });

    return draft;
  }

  static async getDraftsPost(
    { postId, authorId }: { postId: number; authorId: number },
    { page, perPage }: { page: number; perPage: number },
  ) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1
`;
    const { rows }: QueryResult<PostDraftRow> = await db.query(query, [postId]);

    const dIds = rows.map((el) => el.fk_draft_id);

    const { totalCount, count, drafts } = await DraftsService.getDrafts(
      { dIds, authorId },
      { page, perPage },
    );

    return { totalCount, count, drafts };
  }

  static async delete({
    postId,
    draftId,
  }: {
    postId: number;
    draftId: number;
  }) {
    const queryPostTags = `DELETE
                             FROM post_${tableName}
                            WHERE fk_post_id = $1 AND fk_draft_id = $2
`;
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (isBelongs) {
      await db.query(queryPostTags, [postId, draftId]);
      const removedDraft = await DraftsService.delete({ id: draftId });

      return removedDraft;
    }

    return ApiError.BadRequest('Tag not found');
  }

  static async update({
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
      const draft = await DraftsService.update({
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

  static async getOne({
    postId,
    draftId,
  }: {
    postId: number;
    draftId: number;
    authorId: number;
  }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (isBelongs) {
      const draft = await DraftsService.getOne({ id: draftId });

      return draft;
    }

    return ApiError.BadRequest('Not found drafts');
  }

  static async publish({
    postId,
    draftId,
  }: {
    postId: number;
    draftId: number;
  }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (!isBelongs) {
      return ApiError.BadRequest('Not found drafts');
    }
    const draft = await DraftsService.getOne({ id: draftId });

    if (draft === null) {
      return ApiError.BadRequest('Not found drafts');
    }

    await PostsService.update({ ...draft, id: postId });

    return draft;
  }

  private static async checkPostBelongsDraft({
    postId,
    draftId,
  }: {
    postId: number;
    draftId: number;
  }) {
    const data = await prisma.postsOnDrafts.findMany({
      where: {
        fk_draft_id: draftId,
        fk_post_id: postId,
      },
    });

    return data.length > 0;
  }
}

export default PostsDraftsService;
