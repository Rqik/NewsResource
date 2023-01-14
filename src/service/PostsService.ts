import { QueryResult } from 'pg';

import db from '../db';
import { ApiError } from '../exceptions';
import { queryCategoriesRecursive } from './CategoriesService';
import CommentsService, { CommentRow } from './CommentsService';
import PostsCommentsService from './PostsCommentsService';
import PostsTagsService from './PostsTagsService';
import TagsService, { TagsRow } from './TagsService';
import { PropsWithId } from './types';

const tableName = 'posts';
type PostRow = {
  post_id: number;
  title: string;
  created_at: number;
  fk_author_id: number;
  fk_category_id: number;
  body: string;
  main_img: string;
  other_imgs: string[];
};

type PostRowSimple = PostRow & {
  root_category: string;
  author_id: number;
  author_description: string;
  arr_categories: string[];
  arr_category_id: number[];
  user_id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  login: string;
  admin: boolean;
};

type PostFullRow = PostRowSimple & {
  tags: TagsRow[];
  comments: CommentRow[];
  total_count?: number;
};

type PostProp = {
  title: string;
  authorId: number;
  categoryId: number;
  body: string;
  mainImg: string;
  otherImgs: string[];
  tags: number[];
};

type TagFilters = {
  tags__in: number[];
  tags__all: number[];
  tag: number | null;
};

const filter: Record<string, string> = {
  created_at: 'n.created_at::date = ',
  created_at__lt: 'n.created_at::date < ',
  created_at__gt: 'n.created_at::date > ',
  title: 'n.title LIKE ',
  body: 'n.body LIKE ',
  tag: 'tag_ids = ',
  tags__in: 'tag_ids && ',
  tags__all: 'tag_ids @> ',
  author: 'u.first_name = ',
  category: 'arr_category_id = ',
  categories__in: 'arr_category_id && ',
  categories__all: 'arr_category_id @> ',
};

const queryTags = ` COALESCE(jsonb_agg(t) FILTER (WHERE t.tag_id IS NOT NULL), '[]')`;
const queryComments = `COALESCE(jsonb_agg(cm) FILTER (WHERE cm.comment_id IS NOT NULL), '[]')`;
class PostsService {
  static async create({
    title,
    authorId,
    categoryId,
    body,
    mainImg,
    otherImgs = [],
    tags = [],
  }: PostProp) {
    const query = `INSERT INTO ${tableName} (title, fk_author_id, fk_category_id, body, main_img, other_imgs)
                        VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING post_id, title, created_at, fk_author_id, fk_category_id, body, main_img, other_imgs`;

    const result: QueryResult<PostRow> = await db.query(query, [
      title,
      authorId,
      categoryId,
      body,
      mainImg,
      otherImgs,
    ]);
    const data = result.rows[0];
    const { post_id: postId } = data;
    const setTags = tags.map(async (tagId) =>
      PostsTagsService.create({ postId, tagId }),
    );

    await Promise.allSettled(setTags);

    return {
      ...data,
      id: postId,
      tags,
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

    const result: QueryResult<PostRow> = await db.query(query, [
      title,
      authorId,
      categoryId,
      body,
      mainImg,
      otherImgs,
      id,
    ]);

    const data = result.rows[0];

    return data;
  }

  static async partialUpdate(body: PropsWithId<Partial<PostProp>>) {
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

    const result: QueryResult<PostRow> = await db.query(query, [
      ...bodyValues,
      body.id,
    ]);
    const data = result.rows[0];

    return {
      ...data,
      id: data.post_id,
    };
  }

  static async getAll(
    query: {
      created_at?: string;
      created_at__lt?: string;
      created_at__gt?: string;
      category?: string;
      title?: string;
      body?: string;
      categories__in?: string;
      categories__all?: string;
      tag?: string;
      tags__in?: string;
      tags__all?: string;
    },
    pagination: { page: number; perPage: number },
  ) {
    const { perPage = 10, page = 0 } = pagination;

    let counterFilters = 0;
    const whereKeys = [
      'created_at__lt',
      'created_at',
      'created_at__gt',
      'category',
      'title',
      'body',
    ];
    const findStr = ['title', 'body'];
    const convertArray = [
      'categories__in',
      'categories__all',
      'tag',
      'tags__in',
      'tags__all',
    ];
    let whereStr = '';
    let arrayStr = '';

    const values: (string | number | string[] | number[])[] = [];

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (whereKeys.includes(key)) {
          if (whereStr === '') {
            whereStr += 'WHERE ';
          } else {
            whereStr += 'AND ';
          }
          counterFilters += 1;

          if (findStr.includes(key)) {
            whereStr += `${filter[key]}  '%' || $${counterFilters} || '%'`;
          } else {
            values.push(value);
            whereStr += `${filter[key]} $${counterFilters} `;
          }
        } else if (convertArray.includes(key)) {
          counterFilters += 1;

          const val: number[] | number = JSON.parse(value);
          if (arrayStr === '') {
            arrayStr += 'WHERE ';
          } else {
            arrayStr += ' AND ';
          }

          if (typeof val === 'number') {
            arrayStr += `${filter[key]}  ARRAY[$${counterFilters}::int]`;

            values.push(val);
          } else {
            arrayStr += `${filter[key]}  ARRAY[$${counterFilters}::int[]]`;
            values.push(val.sort((a, b) => a - b));
          }
        }
      });
    }

    const querySelect = `${queryCategoriesRecursive('catR')}
     SELECT * FROM (
        SELECT
          count(*) OVER() AS total_count,
          n.*,
          array_agg(t.tag_id ORDER BY t.tag_id) tag_ids,
          ${queryTags} tags, c.category root_category, c.arr_categories, c.arr_category_id, a.author_id, a.description author_description, u.user_id, u.first_name, u.last_name, u.avatar, u.login, u.admin,
          ${queryComments} comments
          FROM ${tableName} n
            LEFT JOIN authors a ON a.author_id = n.fk_author_id
            LEFT JOIN users u ON u.user_id = a.fk_user_id
            LEFT JOIN catR c ON c.id = n.fk_category_id
            LEFT JOIN posts_tags pt ON pt.fk_post_id = n.post_id
            LEFT JOIN tags t ON t.tag_id = pt.fk_tag_id
            LEFT JOIN posts_comments pc ON pc.fk_post_id = n.post_id
            LEFT JOIN comments cm ON cm.comment_id = pc.fk_comment_id
            ${whereStr}

            GROUP BY n.post_id, a.author_id, u.user_id, root_category, c.arr_categories, c.arr_category_id
          ORDER BY n.post_id) as fullData
         ${arrayStr}
         LIMIT $${(counterFilters += 1)}
         OFFSET $${(counterFilters += 1)}
    `;

    const postsSQL: QueryResult<PostFullRow> = await db.query(querySelect, [
      ...values,
      perPage,
      page * perPage,
    ]);
    const totalCount = postsSQL.rows[0]?.total_count || null;
    const posts = postsSQL.rows.map((post) => PostsService.convertPosts(post));

    return {
      totalCount,
      posts,
      count: postsSQL.rowCount,
    };
  }

  static async getOne({ id }: PropsWithId) {
    const query = `
      ${queryCategoriesRecursive('catR')}
      SELECT n.* , c.category root_category, c.arr_categories, c.arr_category_id, a.author_id, a.description author_description, u.user_id, u.first_name, u.last_name, u.avatar, u.login, u.admin
        FROM ${tableName} n
        JOIN authors a ON a.author_id = n.fk_author_id
        JOIN users u ON u.user_id = a.fk_user_id
        JOIN catR c ON c.id = n.fk_category_id
       WHERE n.post_id = $1
    `;
    const result: QueryResult<PostRowSimple> = await db.query(query, [id]);
    const data = result.rows[0];
    const comments = await PostsCommentsService.getPostComments(
      { id },
      { perPage: 0, page: 0 },
    );
    const tags = await PostsTagsService.getPostTags({ id });

    return {
      ...PostsService.convertPosts({ ...data, tags: [], comments: [] }),
      tags,
      comments,
    };
  }

  static async delete({ id }: PropsWithId) {
    const query = `DELETE FROM ${tableName}
                    WHERE post_id = $1
                RETURNING post_id, title, created_at, fk_author_id, fk_category_id, body, main_img, other_imgs`;
    const selectData: QueryResult<PostRow> = await db.query(
      `SELECT * FROM ${tableName}
        WHERE post_id = $1
      `,
      [id],
    );

    if (selectData.rows.length > 0) {
      const result: QueryResult<PostRow> = await db.query(query, [id]);
      const data = result.rows[0];
      return {
        ...data,
        id: data.post_id,
      };
    }

    // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app
    throw ApiError.BadRequest('Post not found');
  }

  private static convertPosts(post: PostFullRow) {
    const {
      post_id: id,
      title,
      created_at: createdAt,
      body,
      main_img: mainImg,
      other_imgs: otherImgs,
      root_category: rootCategory,
      author_id: authorId,
      author_description: description,
      arr_categories: categories,
      user_id: uId,
      first_name: firstName,
      last_name: lastName,
      avatar,
      login,
      admin,
      tags: ts,
      comments: cm,
      arr_category_id: categoryIds,
      fk_category_id: rootCategoryId,
    } = post;

    const comments = cm.map((c) => CommentsService.convertComment(c));
    const tags = ts.map((t) => TagsService.convertTag(t));

    return {
      id,
      rootCategory: {
        id: rootCategoryId,
        description: rootCategory,
      },
      categories,
      createdAt,
      title,
      body,
      mainImg,
      otherImgs,
      author: {
        id: authorId,
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
      tags,
      categoryIds,
    };
  }
}

export type { TagFilters };
export default PostsService;
