import { QueryResult } from 'pg';

import db from '../db';
import { ApiError } from '../exceptions/index';
import { PropsWithId } from './types';

type DraftsRow = {
  draft_id: number;
  created_at: Date;
  updated_at: Date;
  fk_user_id: number;
  fk_category_id: number;
  body: string;
  title: string;
  main_img: string;
  other_imgs: string[];
  total_count?: number;
};

type Draft = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  body: string;
  title: string;
  categoryId: number;
  mainImg: string;
  otherImgs: string[];
};

const tableName = 'drafts';

class DraftService {
  static async create({
    userId,
    body,
    title,
    categoryId,
    mainImg,
    otherImgs,
  }: Omit<Draft, 'createdAt' | 'updatedAt' | 'id'>) {
    const query = `INSERT INTO ${tableName} (fk_user_id, body, title, fk_category_id, main_img, other_imgs)
                        VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING draft_id, created_at, updated_at, fk_user_id, body, title, fk_category_id, main_img, other_imgs`;

    const { rows }: QueryResult<DraftsRow> = await db.query(query, [
      Number(userId),
      body,
      title,
      categoryId,
      mainImg,
      otherImgs,
    ]);

    const draft = rows[0];

    return DraftService.convertDraft(draft);
  }

  static async update({
    id,
    userId,
    body,
    title,
    categoryId,
    mainImg,
    otherImgs,
  }: Omit<Draft, 'updatedAt' | 'createdAt'>) {
    const query = `UPDATE ${tableName}
                      SET body = $1,
                          fk_user_id = $2,
                          updated_at = NOW(),
                          title = $3,
                          main_img = $4,
                          other_imgs = $5,
                          fk_category_id = $6
                    WHERE draft_id = $7
                RETURNING draft_id, created_at, updated_at, fk_user_id, body`;

    const { rows }: QueryResult<DraftsRow> = await db.query(query, [
      body,
      userId,
      title,
      mainImg,
      otherImgs,
      categoryId,
      id,
    ]);

    const draft = rows[0];

    return DraftService.convertDraft(draft);
  }

  static async getOne({
    id,
    userId,
  }: {
    id: number;
    userId: number;
  }): Promise<Draft> {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE draft_id = $1 AND fk_user_id = $2`;
    const { rows }: QueryResult<DraftsRow> = await db.query(query, [
      id,
      userId,
    ]);
    const draft = rows[0];

    return DraftService.convertDraft(draft);
  }

  static async getDrafts(
    { dIds, userId }: { dIds: number[]; userId: number },
    { page, perPage }: { page: number; perPage: number },
  ) {
    const query = `SELECT draft_id AS id, created_at AS "createdAt", updated_at as "updatedAt", fk_user_id AS "userId", body,
                          count(*) OVER() AS total_count
                     FROM ${tableName}
                    WHERE draft_id = ANY ($1) AND fk_user_id = $2
                    LIMIT $3
                   OFFSET $4
      `;

    const { rows: drafts, rowCount: count }: QueryResult<DraftsRow> =
      await db.query(query, [dIds, userId, perPage, page * perPage]);

    const totalCount = drafts[0]?.total_count || null;

    return { totalCount, count, drafts };
  }

  static async delete({ id }: { id: number }): Promise<Draft> {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE draft_id = $1
                RETURNING draft_id, created_at, updated_at, fk_user_id, body`;
    const queryPostsTags = `DELETE
                             FROM post_${tableName}
                            WHERE fk_draft_id = $1

    `;
    const selectData: QueryResult<DraftsRow> = await db.query(
      `SELECT * FROM ${tableName}
          WHERE draft_id = $1
      `,
      [id],
    );

    if (selectData.rows.length > 0) {
      await db.query(queryPostsTags, [id]);
      const { rows }: QueryResult<DraftsRow> = await db.query(query, [id]);
      const data = rows[0];

      return DraftService.convertDraft(data);
    }
    // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app

    throw ApiError.BadRequest('Tag not found');
  }

  static convertDraft(draft: DraftsRow): PropsWithId<Draft> {
    console.log(draft);

    return {
      id: draft.draft_id,
      createdAt: draft.created_at,
      updatedAt: draft.updated_at,
      userId: draft.fk_user_id,
      body: draft.body,
      title: draft.title,
      mainImg: draft.main_img,
      otherImgs: draft.other_imgs,
      categoryId: draft.fk_category_id,
    };
  }
}

export default DraftService;
