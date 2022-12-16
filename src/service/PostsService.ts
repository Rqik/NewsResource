import e from 'express';
import { QueryResult } from 'pg';

import db from '../db';
import { queryCategoriesRecursive } from './CategoriesService';
import PostsCommentsService from './PostsCommentsService';
import { PropsWithId } from './types';

const tableName = 'posts';
type NewsRow = {
  post_id: number;
  title: string;
  created_at: number;
  fk_author_id: number;
  fk_category_id: number;
  body: string;
  main_img: string;
  other_imgs: string[];
};

type NewsFullRow = NewsRow & {
  root_category: string;
  author_id: number;
  author_description: string;
  arr_categories: string[];
  user_id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  login: string;
  admin: boolean;
};

type NewsProp = {
  title: string;
  authorId: number;
  categoryId: number;
  body: string;
  mainImg: string;
  otherImgs: string[];
};

class PostsService {
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
                     RETURNING post_id, title, created_at, fk_author_id, fk_category_id, body, main_img, other_imgs`;

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
      id: data.post_id,
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
    id: number;
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
                    WHERE post_id = $7
                RETURNING post_id, title, created_at, fk_author_id, fk_category_id, body, main_img, other_imgs`;

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

  static async partialUpdate(body: PropsWithId<Partial<NewsProp>>) {
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
                RETURNING post_id, title, created_at, fk_author_id, fk_category_id, body, main_img, other_imgs`;

    const result: QueryResult<NewsRow> = await db.query(query, [
      ...bodyValues,
      body.id,
    ]);
    const data = result.rows[0];

    return {
      ...data,
      id: data.post_id,
    };
  }

  static async getAll() {
    const result: QueryResult<NewsFullRow> = await db.query(
      `${queryCategoriesRecursive('catR')}
        SELECT n.* , c.category root_category, c.arr_categories, a.author_id, a.description author_description, u.user_id, u.first_name, u.last_name, u.avatar, u.login, u.admin
          FROM ${tableName} n
          JOIN authors a ON a.author_id = n.fk_author_id
          JOIN users u ON u.user_id = a.fk_user_id
          JOIN catR c ON c.id = n.fk_category_id
        `,
    );

    const loadNews = result.rows.map(async (el) => {
      const {
        post_id: nId,
        title,
        created_at: createdAt,
        body,
        main_img: mainImg,
        other_imgs: otherImgs,
        root_category: rootCategory,
        author_id: aId,
        author_description: description,
        arr_categories: categories,
        user_id: uId,
        first_name: firstName,
        last_name: lastName,
        avatar,
        login,
        admin,
      } = el;

      const comments = await PostsCommentsService.getCommentsPost({
        id: nId,
      });

      return {
        id: nId,
        rootCategory,
        categories,
        createdAt,
        title,
        body,
        mainImg,
        otherImgs,
        author: {
          id: aId,
          description,
        },
        user: {
          id: uId,
          firstName,
          lastName,
          avatar,
          login,
          admin,
        },
        comments,
      };
    });

    const post = await Promise.allSettled(loadNews).then((req) =>
      req.map((el) => {
        if (el.status === 'fulfilled') {
          return el.value;
        }
        return el;
      }),
    );

    return post;
  }

  static async getOne({ id }: PropsWithId) {
    const query = `
      ${queryCategoriesRecursive('catR')}
      SELECT n.* , c.category root_category, c.arr_categories, a.author_id, a.description author_description, u.user_id, u.first_name, u.last_name, u.avatar, u.login, u.admin
        FROM ${tableName} n
        JOIN authors a ON a.author_id = n.fk_author_id
        JOIN users u ON u.user_id = a.fk_user_id
        JOIN catR c ON c.id = n.fk_category_id
       WHERE n.post_id = $1
    `;
    const result: QueryResult<NewsFullRow> = await db.query(query, [id]);
    const data = result.rows[0];
    const comments = await PostsCommentsService.getCommentsPost({ id });

    const {
      post_id: nId,
      title,
      created_at: createdAt,
      body,
      main_img: mainImg,
      other_imgs: otherImgs,
      root_category: rootCategory,
      author_id: aId,
      author_description: description,
      arr_categories: categories,
      user_id: uId,
      first_name: firstName,
      last_name: lastName,
      avatar,
      login,
      admin,
      ...prop
    } = data;
    return {
      id: nId,
      rootCategory,
      categories,
      createdAt,
      title,
      body,
      mainImg,
      otherImgs,
      author: {
        id: aId,
        description,
      },
      user: {
        id: uId,
        firstName,
        lastName,
        avatar,
        login,
        admin,
      },
      comments,
    };
  }

  static async delete({ id }: PropsWithId) {
    const query = `DELETE FROM ${tableName}
                    WHERE post_id = $1
                    RETURNING post_id, title, created_at, fk_author_id, fk_category_id, body, main_img, other_imgs`;
    const selectData: QueryResult<NewsRow> = await db.query(
      `SELECT * FROM ${tableName}
          WHERE post_id = $1
      `,
      [id],
    );

    if (selectData.rows.length > 0) {
      const result: QueryResult<NewsRow> = await db.query(query, [id]);
      const data = result.rows[0];
      return {
        ...data,
        id: data.post_id,
      };
    }
    // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app
    throw new Error('News not found');
  }
}

export default PostsService;
