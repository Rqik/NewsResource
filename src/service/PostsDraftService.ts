import { QueryResult } from 'pg';

import db from '../db';
import { ApiError } from '../exceptions/index';
import DraftService from './DraftService';
import PostsService from './PostsService';

type PostDraftRow = {
  fk_draft_id: number;
  fk_post_id: number;
  total_count?: number;
};

const tableName = 'posts_drafts';
const returnCols = 'fk_post_id, fk_draft_id';

class PostsDraftService {
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
    const query = `INSERT INTO ${tableName} (fk_post_id, fk_draft_id)
                        VALUES ($1, $2)
                     RETURNING ${returnCols}`;

    const draft = await DraftService.create({
      body,
      authorId,
      title,
      categoryId,
      mainImg,
      otherImgs,
    });

    await db.query(query, [postId, draft.id]);

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

    const { totalCount, count, drafts } = await DraftService.getDrafts(
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
      const removedDraft = await DraftService.delete({ id: draftId });

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
      const draft = await DraftService.update({
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
    authorId,
  }: {
    postId: number;
    draftId: number;
    authorId: number;
  }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (isBelongs) {
      const draft = await DraftService.getOne({ id: draftId });

      return draft;
    }

    return ApiError.BadRequest('Not found drafts');
  }

  static async publish({
    postId,
    draftId,
    authorId,
  }: {
    postId: number;
    draftId: number;
    authorId: number;
  }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (!isBelongs) {
      return ApiError.BadRequest('Not found drafts');
    }
    const draft = await DraftService.getOne({ id: draftId });

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
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1 AND fk_draft_id = $2`;
    const { rows }: QueryResult<PostDraftRow> = await db.query(query, [
      postId,
      draftId,
    ]);

    return rows.length > 0;
  }
}

export default PostsDraftService;
