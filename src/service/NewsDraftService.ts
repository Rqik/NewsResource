import { QueryResult } from 'pg';
import db from '../db';
import DraftService from './DraftService';

type NewsDraftRow = {
  fk_draft_id: number;
  fk_news_id: number;
};

const tableName = 'news_drafts';
const returnCols = 'fk_news_id, fk_draft_id';

class NewsDraftService {
  static async create({
    newsId,
    userId,
    body,
  }: {
    newsId: number;
    userId: number;
    body: string;
  }) {
    const query = `INSERT INTO ${tableName} (fk_news_id, fk_draft_id)
                        VALUES ($1, $2)
                     RETURNING ${returnCols}`;

    const draft = await DraftService.create({
      body,
      userId,
    });

    await db.query(query, [newsId, draft.id]);

    return draft;
  }

  static async getDraftsPost({ newsId }: { newsId: number }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_news_id = $1`;
    const result: QueryResult<NewsDraftRow> = await db.query(query, [newsId]);

    const dIds = result.rows.map((el) => el.fk_draft_id);

    const drafts = await DraftService.getDrafts({ dIds });

    return drafts;
  }

  static async delete({
    newsId,
    draftId,
  }: {
    newsId: number;
    draftId: number;
  }) {
    const queryNewsTags = `DELETE
                             FROM news_${tableName}
                            WHERE fk_news_id = $1 AND fk_draft_id = $2
`;
    const isBelongs = await this.checkNewsBelongsDraft({ newsId, draftId });

    if (isBelongs) {
      await db.query(queryNewsTags, [newsId, draftId]);
      const removedDraft = await DraftService.delete({ id: draftId });

      return removedDraft;
    }

    throw new Error('Tag not found');
  }

  static async update({
    newsId,
    draftId,
    body,
    userId,
  }: {
    newsId: number;
    draftId: number;
    userId: number;
    body: string;
  }) {
    const isBelongs = await this.checkNewsBelongsDraft({ newsId, draftId });

    if (isBelongs) {
      const draft = await DraftService.update({ id: draftId, body, userId });

      return draft;
    }
    throw new Error('Not found drafts');
  }

  static async getOne({
    newsId,
    draftId,
  }: {
    newsId: number;
    draftId: number;
  }) {
    const isBelongs = await this.checkNewsBelongsDraft({ newsId, draftId });

    if (isBelongs) {
      const draft = await DraftService.getOne({ id: draftId });
      return draft;
    }
    throw new Error('Not found drafts');
  }

  private static async checkNewsBelongsDraft({
    newsId,
    draftId,
  }: {
    newsId: number;
    draftId: number;
  }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_news_id = $1 AND fk_draft_id = $2`;
    const result: QueryResult<NewsDraftRow> = await db.query(query, [
      newsId,
      draftId,
    ]);

    return result.rows.length > 0;
  }
}

export default NewsDraftService;
