import { QueryResult } from 'pg';

import db from '../db';
import { queryCategoriesRecursive } from './CategoriesService';
import { PropsWithId } from './types';

const tableName = 'news';
type NewsRow = {
  news_id: number;
  title: string;
  create_at: number;
  fk_author_id: number;
  fk_category_id: number;
  body: string;
  main_img: string;
  other_imgs: string[];
  comments: string[];
  fk_draft_id: number;
};

type NewsProp = {
  title: string;
  authorId: number;
  categoryId: number;
  body: string;
  mainImg: string;
  otherImgs: string[];
};

class NewsService {
  static async create({
    title,
    authorId,
    categoryId,
    body,
    mainImg,
    otherImgs = [],
  }: NewsProp) {
    const query = `INSERT INTO ${tableName} (title, fk_author_id, fk_category_id, body, main_img, other_imgs)
                        VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING news_id, title, create_at, fk_author_id, fk_category_id, body, main_img, other_imgs, comments, fk_draft_id`;

    const result: QueryResult<NewsRow> = await db.query(query, [
      title,
      authorId,
      categoryId,
      body,
      mainImg,
      otherImgs,
    ]);
    const data = result.rows[0];

    return {
      ...data,
      id: data.news_id,
    };
  }

  static async update({
    id,
    title,
    authorId,
    categoryId,
    body,
    mainImg,
    otherImgs = [],
  }: {
    id: string;
    title: string;
    authorId: number;
    categoryId: number;
    body: string;
    mainImg: string;
    otherImgs: string[];
  }) {
    const query = `UPDATE ${tableName}
                      SET title = $1,
                          fk_author_id = $2,
                          fk_category_id = $3,
                          body = $4,
                          main_img = $5,
                          other_imgs = $6
                    WHERE news_id = $7
                RETURNING news_id, title, create_at, fk_author_id, fk_category_id, body, main_img, other_imgs, comments, fk_draft_id`;

    const result: QueryResult<NewsRow> = await db.query(query, [
      title,
      authorId,
      categoryId,
      body,
      mainImg,
      otherImgs,
      id,
    ]);

    const data = result.rows[0];

    return result;
  }

  static async partialUpdate(body: PropsWithId<NewsProp>) {
    const bodyProps = Object.keys(body);
    const bodyValues = Object.values(body);
    const snakeReg = /([a-z0–9])([A-Z])/g;
    const setParams = bodyProps.map(
      (el, i) =>
        el !== 'id' &&
        `${el.replace(snakeReg, '$1_$2').toLowerCase()} = $${i + 1}`,
    );

    const query = `UPDATE ${tableName}
                      SET ${setParams.join(', \n')}
                    WHERE user_id = $${setParams.length + 1}
                RETURNING news_id, title, create_at, fk_author_id, fk_category_id, body, main_img, other_imgs, comments, fk_draft_id`;

    const result: QueryResult<NewsRow> = await db.query(query, [
      ...bodyValues,
      body.id,
    ]);
    const data = result.rows[0];

    return {
      ...data,
      id: data.news_id,
    };
  }

  static async getAll() {
    const result: QueryResult<NewsRow> = await db.query(
      `
        ${queryCategoriesRecursive('catR')}
          SELECT *
            FROM ${tableName} n
            JOIN authors a ON a.author_id = n.fk_author_id
            JOIN users u ON u.user_id = a.fk_user_id
            JOIN catR c ON c.id = n.fk_category_id
        `,
    );

    return result.rows;
  }

  static async getOne({ id }: PropsWithId) {
    const query = `
      ${queryCategoriesRecursive('catR')}
      SELECT n.* , c.category root_category, c.arr_categories, a.description author_description, u.first_name, u.last_name, u.avatar, u.login, u.admin
        FROM ${tableName} n
        JOIN authors a ON a.author_id = n.fk_author_id
        JOIN users u ON u.user_id = a.fk_user_id
        JOIN catR c ON c.id = n.fk_category_id
       WHERE n.news_id = $1
    `;

    const result: QueryResult<NewsRow> = await db.query(query, [id]);

    return result.rows;
  }

  static async delete({ id }: PropsWithId) {
    const query = `DELETE FROM ${tableName}
                    WHERE news_id = $1
                    RETURNING news_id, title, create_at, fk_author_id, fk_category_id, body, main_img, other_imgs, comments, fk_draft_id`;
    const selectData: QueryResult<NewsRow> = await db.query(
      `SELECT * FROM ${tableName}
          WHERE news_id = $1
      `,
      [id],
    );

    if (selectData.rows.length > 0) {
      const result: QueryResult<NewsRow> = await db.query(query, [id]);
      const data = result.rows[0];
      return {
        ...data,
        id: data.news_id,
      };
    }
    // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app
    throw new Error('News not found');
  }
}

export default NewsService;
