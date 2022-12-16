import { QueryResult } from 'pg';
import db from '../db';
import DraftService from './DraftService';

type NewsDraftRow = {
  fk_draft_id: number;
  fk_post_id: number;
};

const tableName = 'post_drafts';
const returnCols = 'fk_post_id, fk_draft_id';

class PostsDraftService {
  static async create({
    postId,
    userId,
    body,
  }: {
    postId: number;
    userId: number;
    body: string;
  }) {
    const query = `INSERT INTO ${tableName} (fk_post_id, fk_draft_id)
                        VALUES ($1, $2)
                     RETURNING ${returnCols}`;

    const draft = await DraftService.create({
      body,
      userId,
    });

    await db.query(query, [postId, draft.id]);

    return draft;
  }

  static async getDraftsPost({ postId }: { postId: number }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1`;
    const result: QueryResult<NewsDraftRow> = await db.query(query, [postId]);

    const dIds = result.rows.map((el) => el.fk_draft_id);

    const drafts = await DraftService.getDrafts({ dIds });

    return drafts;
  }

  static async delete({
    postId,
    draftId,
  }: {
    postId: number;
    draftId: number;
  }) {
    const queryNewsTags = `DELETE
                             FROM post_${tableName}
                            WHERE fk_post_id = $1 AND fk_draft_id = $2
`;
    const isBelongs = await this.checkNewsBelongsDraft({ postId, draftId });

    if (isBelongs) {
      await db.query(queryNewsTags, [postId, draftId]);
      const removedDraft = await DraftService.delete({ id: draftId });

      return removedDraft;
    }

    throw new Error('Tag not found');
  }

  static async update({
    postId,
    draftId,
    body,
    userId,
  }: {
    postId: number;
    draftId: number;
    userId: number;
    body: string;
  }) {
    const isBelongs = await this.checkNewsBelongsDraft({ postId, draftId });

    if (isBelongs) {
      const draft = await DraftService.update({ id: draftId, body, userId });

      return draft;
    }
    throw new Error('Not found drafts');
  }

  static async getOne({
    postId,
    draftId,
  }: {
    postId: number;
    draftId: number;
  }) {
    const isBelongs = await this.checkNewsBelongsDraft({ postId, draftId });

    if (isBelongs) {
      const draft = await DraftService.getOne({ id: draftId });
      return draft;
    }
    throw new Error('Not found drafts');
  }

  private static async checkNewsBelongsDraft({
    postId,
    draftId,
  }: {
    postId: number;
    draftId: number;
  }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1 AND fk_draft_id = $2`;
    const result: QueryResult<NewsDraftRow> = await db.query(query, [
      postId,
      draftId,
    ]);

    return result.rows.length > 0;
  }
}

export default PostsDraftService;
