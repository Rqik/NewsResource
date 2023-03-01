import { QueryResult } from 'pg';
import db from '../db';
import { ApiError } from '../exceptions/index';
import DraftService from './DraftService';

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
    userId,
    body,
    title,
    categoryId,
    mainImg,
    otherImgs = [],
  }: {
    postId: number;
    userId: number;
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
      userId,
      title,
      categoryId,
      mainImg,
      otherImgs,
    });

    await db.query(query, [postId, draft.id]);

    return draft;
  }

  static async getDraftsPost(
    { postId, userId }: { postId: number; userId: number },
    { page, perPage }: { page: number; perPage: number },
  ) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1
`;
    const { rows }: QueryResult<PostDraftRow> = await db.query(query, [postId]);

    const dIds = rows.map((el) => el.fk_draft_id);

    const { totalCount, count, drafts } = await DraftService.getDrafts(
      { dIds, userId },
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

    throw ApiError.BadRequest('Tag not found');
  }

  static async update({
    postId,
    draftId,
    body,
    userId,
    title,
    categoryId,
    mainImg,
    otherImgs = [],
  }: {
    postId: number;
    draftId: number;
    userId: number;
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
        userId,
        title,
        categoryId,
        mainImg,
        otherImgs,
      });

      return draft;
    }
    throw ApiError.BadRequest('Not found drafts');
  }

  static async getOne({
    postId,
    draftId,
    userId,
  }: {
    postId: number;
    draftId: number;
    userId: number;
  }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (isBelongs) {
      const draft = await DraftService.getOne({ id: draftId, userId });

      return draft;
    }
    throw ApiError.BadRequest('Not found drafts');
  }

  static async publish({
    postId,
    draftId,
    userId,
  }: {
    postId: number;
    draftId: number;
    userId: number;
  }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (isBelongs) {
      const draft = await DraftService.getOne({ id: draftId, userId });
      console.log(draft);

      return draft;
    }
    throw ApiError.BadRequest('Not found drafts');
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
