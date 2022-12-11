import { Request, Response } from 'express';
import { QueryResult } from 'pg';

import db from '../db';
import HttpStatuses from '../shared/HttpStatuses';
import { queryCategoriesRecursive } from './CategoriesController';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

const tableName = 'news';
type NewsRow = {
  news_id: number;
  title: string;
  create_at: number;
  fk_author_id: number;
  fk_category_id: number;
  tags: string[];
  body: string;
  main_img: string;
  other_imgs: string[];
  comments: string[];
  fk_draft_id: number;
};

class NewsController {
  static async create(
    req: RequestWithBody<{
      title: string;
      authorId: number;
      categoryId: number;
      tags: string[];
      body: string;
      mainImg: string;
      otherImgs: string[];
    }>,
    res: Response,
  ) {
    const query = `INSERT INTO ${tableName} (title, fk_author_id, fk_category_id, tags, body, main_img, other_imgs)
                      VALUES ($1, $2, $3, $4, $5, $6, $7)
                      RETURNING news_id, title, create_at, fk_author_id, fk_category_id, tags, body, main_img, other_imgs, comments, fk_draft_id`;
    try {
      const {
        title,
        authorId,
        categoryId,
        tags = [],
        body,
        mainImg,
        otherImgs = [],
      } = req.body;
      const result: QueryResult<NewsRow> = await db.query(query, [
        title,
        authorId,
        categoryId,
        tags,
        body,
        mainImg,
        otherImgs,
      ]);
      const data = result.rows[0];

      res.send({
        ...data,
        id: data.news_id,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        title: string;
        authorId: number;
        categoryId: number;
        tags: string[];
        body: string;
        mainImg: string;
        otherImgs: string[];
      }
    >,
    res: Response,
  ) {
    const query = `UPDATE ${tableName}
                    SET
                      title = $1,
                      fk_author_id = $2,
                      fk_category_id = $3,
                      tags = $4,
                      body = $5,
                      main_img = $6,
                      other_imgs = $7
                    WHERE news_id = $8
                    RETURNING news_id, title, create_at, fk_author_id, fk_category_id, tags, body, main_img, other_imgs, comments, fk_draft_id`;

    try {
      const { id } = req.params;
      const {
        title,
        authorId,
        categoryId,
        tags = [],
        body,
        mainImg,
        otherImgs = [],
      } = req.body;
      const result: QueryResult<NewsRow> = await db.query(query, [
        title,
        authorId,
        categoryId,
        tags,
        body,
        mainImg,
        otherImgs,
        id,
      ]);

      const data = result.rows[0];

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async partialUpdate(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        firstName: string;
        lastName: string;
        avatar: string;
        login: string;
        password: string;
      }
    >,
    res: Response,
  ) {
    const bodyProps = Object.keys(req.body);
    const bodyValues = Object.values(req.body);
    const snakeReg = /([a-z0–9])([A-Z])/g;
    const setParams = bodyProps.map(
      (el, i) => `${el.replace(snakeReg, '$1_$2').toLowerCase()} = $${i + 1}`,
    );

    const query = `UPDATE ${tableName}
                      SET ${setParams.join(', \n')}
                      WHERE user_id = $${setParams.length + 1}
                      RETURNING news_id, title, create_at, fk_author_id, fk_category_id, tags, body, main_img, other_imgs, comments, fk_draft_id`;

    try {
      const { id } = req.params;
      const result: QueryResult<NewsRow> = await db.query(query, [
        ...bodyValues,
        id,
      ]);
      const data = result.rows[0];

      res.send({
        ...data,
        id: data.news_id,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const result: QueryResult<NewsRow> = await db.query(
        `
        ${queryCategoriesRecursive('catR')}
        SELECT * FROM ${tableName} n
          JOIN authors a ON a.author_id = n.fk_author_id
          JOIN users u ON u.user_id = a.fk_user_id
          JOIN catR c ON c.id = n.fk_category_id

        `,
      );

      res.send(result.rows);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const query = `
      ${queryCategoriesRecursive('catR')}
      SELECT n.* , c.category root_category, c.arr_categories, a.description author_description, u.first_name, u.last_name, u.avatar, u.login, u.admin
      FROM ${tableName} n
      JOIN authors a ON a.author_id = n.fk_author_id
      JOIN users u ON u.user_id = a.fk_user_id
      JOIN catR c ON c.id = n.fk_category_id
      WHERE n.news_id = $1
    `;
    try {
      const { id } = req.params;
      const result: QueryResult<NewsRow> = await db.query(query, [id]);

      res.send(result.rows);
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const query = `DELETE FROM ${tableName}
                    WHERE news_id = $1
                    RETURNING news_id, title, create_at, fk_author_id, fk_category_id, tags, body, main_img, other_imgs, comments, fk_draft_id`;
    try {
      const { id } = req.params;
      const selectData: QueryResult<NewsRow> = await db.query(
        `SELECT * FROM ${tableName}
          WHERE news_id = $1
      `,
        [id],
      );

      if (selectData.rows.length > 0) {
        const result: QueryResult<NewsRow> = await db.query(query, [id]);
        const data = result.rows[0];
        res.send({
          ...data,
          id: data.news_id,
        });
      } else {
        // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app
        res.status(HttpStatuses.NOT_FOUND);
        throw new Error('News not found');
      }
    } catch (e) {
      res.send(e);
    }
  }
}

export default NewsController;
