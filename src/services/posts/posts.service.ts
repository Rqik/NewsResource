import { boundClass } from 'autobind-decorator';
import { QueryResult } from 'pg';

import dataBase from '@/db';
import { ApiError } from '@/exceptions';

import { queryCategoriesRecursive } from '../categories/categories.service';
import CommentsService, { CommentRow } from '../comments/comments.service';
import { PostsCommentsService } from '../posts-comments';
import { PostsTagsService } from '../posts-tags';
import TagsService, { TagsRow } from '../tags/tags.service';
import { PropsWithId } from '../types';

const tableName = 'posts';

type PostRow = {
  post_id: number;
  title: string;
  created_at: Date;
  updated_at: Date;
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

// TODO: post id
type PostProp = {
  title: string;
  authorId: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  mainImg: string;
  otherImgs: string[];
  tags: number[] | string;
};

type TagFilters = {
  tags__in: number[];
  tags__all: number[];
  tag: number | null;
};

const filter: Record<string, string> = {
  created_at: 'p.created_at::date = ',
  created_at__lt: 'p.created_at::date < ',
  created_at__gt: 'p.created_at::date > ',
  title: 'p.title LIKE ',
  body: 'p.body LIKE ',
  tag: 'tag_ids = ',
  tags__in: 'tag_ids && ',
  tags__all: 'tag_ids @> ',
  author: 'u.first_name = ',
  category: 'fk_category_id = ',
  categories__in: 'arr_category_id && ',
  categories__all: 'arr_category_id @> ',
};

const queryTags = ` COALESCE(jsonb_agg(t) FILTER (WHERE t.tag_id IS NOT NULL), '[]')`;
const queryComments = `COALESCE(jsonb_agg(cm) FILTER (WHERE cm.comment_id IS NOT NULL), '[]')`;

@boundClass
class PostsService {
  constructor(
    private db: typeof dataBase,
    private commentsService: typeof CommentsService,
    private tagsService: typeof TagsService,
    private postsCommentsService: typeof PostsCommentsService,
    private postsTagsService: typeof PostsTagsService,
  ) {}

  async create({
    title,
    authorId,
    categoryId,
    body,
    mainImg,
    otherImgs = [],
    tags = [],
  }: Omit<PostProp, 'createdAt' | 'updatedAt'>) {
    const query = `INSERT INTO ${tableName} (title, fk_author_id, fk_category_id, body, main_img, other_imgs)
                        VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING post_id, title, created_at, fk_author_id, fk_category_id, body, main_img, other_imgs`;

    const { rows }: QueryResult<PostRow> = await this.db.query(query, [
      title,
      authorId,
      categoryId,
      body,
      mainImg,
      otherImgs,
    ]);

    const data = rows[0];
    const { post_id: postId } = data;
    let tagsParse: number[] = [];
    if (typeof tags === 'string') {
      tagsParse = JSON.parse(tags);
    } else {
      tagsParse = tags;
    }
    const setTags = tagsParse.map(async (tagId) =>
      this.postsTagsService.create({ postId, tagId }),
    );

    await Promise.allSettled(setTags);
    // TODO: return value not converted
    console.log('333');

    return {
      ...data,
      id: postId,
      tags: tagsParse,
    };
  }

  async update({
    id,
    title,
    authorId,
    categoryId,
    body,
    mainImg,
    otherImgs = [],
  }: {
    id: number;
    authorId: number | null;
    body: string | null;
    title: string | null;
    categoryId: number | null;
    mainImg: string | null;
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

    const { rows }: QueryResult<PostRow> = await this.db.query(query, [
      title,
      authorId,
      categoryId,
      body,
      mainImg,
      otherImgs,
      id,
    ]);

    const data = rows[0];

    return data;
  }

  async partialUpdate(body: PropsWithId<Partial<PostProp>>) {
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

    const { rows }: QueryResult<PostRow> = await this.db.query(query, [
      ...bodyValues,
      body.id,
    ]);
    const data = rows[0];

    return {
      ...data,
      id: data.post_id,
    };
  }

  async getAll(
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
      sort?: string;
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
    let orderBy = 'p.post_id ASC';
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
            whereStr += `${filter[key]} $${counterFilters} `;
          }

          values.push(value);
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
        } else if (key === 'search') {
          if (whereStr === '') {
            whereStr += 'WHERE ';
          } else {
            whereStr += 'AND ';
          }
          counterFilters += 1;
          whereStr += `p.title LIKE '%' || $${counterFilters} || '%'
                       OR a.description LIKE '%' || $${counterFilters} || '%'
                       OR u.first_name LIKE '%' || $${counterFilters} || '%'
                       OR p.body LIKE '%' || $${counterFilters} || '%'
                       OR p.title LIKE '%' || $${counterFilters} || '%'
                       OR t.title  LIKE '%' || $${counterFilters} || '%'
                       OR EXISTS (
                          SELECT
                            FROM unnest(arr_categories) elem
                           WHERE elem LIKE '%' || $${counterFilters} || '%'
                          )
          `;
          values.push(value);
        } else if (key === 'sort') {
          orderBy = '';
          const reg = /(?<order>\w+):(?<sort>desc|asc)/gim;
          [...value.matchAll(reg)].forEach(({ groups }, i) => {
            let sort = `${groups?.order} ${groups?.sort}` || '';
            if (groups?.order === 'imgs') {
              sort = `array_length(other_imgs, 1) ${groups?.sort}`;
            }
            if (sort !== '') {
              orderBy += i === 0 ? sort : `, ${sort}`;
            }
          });
        }
      });
    }

    const querySelect = `${queryCategoriesRecursive('catR')}
     SELECT * FROM (
        SELECT
          count(*) OVER() AS total_count,
          p.*,
          array_agg(t.tag_id ORDER BY t.tag_id) tag_ids,
          ${queryTags} tags, c.category root_category, c.arr_categories, c.arr_category_id, a.author_id, a.description author_description, u.user_id, u.first_name, u.last_name, u.avatar, u.login, u.admin,
          ${queryComments} comments
          FROM ${tableName} p
            LEFT JOIN authors a ON a.author_id = p.fk_author_id
            LEFT JOIN users u ON u.user_id = a.fk_user_id
            LEFT JOIN catR c ON c.id = p.fk_category_id
            LEFT JOIN posts_tags pt ON pt.fk_post_id = p.post_id
            LEFT JOIN tags t ON t.tag_id = pt.fk_tag_id
            LEFT JOIN posts_comments pc ON pc.fk_post_id = p.post_id
            LEFT JOIN comments cm ON cm.comment_id = pc.fk_comment_id
            ${whereStr}

            GROUP BY p.post_id, a.author_id, u.user_id, root_category, c.arr_categories, c.arr_category_id
          ORDER BY ${orderBy}) as fullData
         ${arrayStr}
         LIMIT $${(counterFilters += 1)}
         OFFSET $${(counterFilters += 1)}
    `;

    const { rows, rowCount: count }: QueryResult<PostFullRow> =
      await this.db.query(querySelect, [...values, perPage, page * perPage]);
    const totalCount = rows[0]?.total_count || null;
    const posts = rows.map((post) => PostsService.convertPosts(post));

    return {
      totalCount,
      posts,
      count,
    };
  }

  async getOne({ id }: PropsWithId) {
    const q2 = `${queryCategoriesRecursive('catR')}
       SELECT p.*,
              array_agg(t.tag_id ORDER BY t.tag_id) tag_ids,
              ${queryTags} tags, c.category root_category, c.arr_categories,
              c.arr_category_id, a.author_id, a.description author_description,
              u.user_id, u.first_name, u.last_name, u.avatar, u.login, u.admin,
              ${queryComments} comments
         FROM ${tableName} p
    LEFT JOIN authors a ON a.author_id = p.fk_author_id
    LEFT JOIN users u ON u.user_id = a.fk_user_id
    LEFT JOIN catR c ON c.id = p.fk_category_id
    LEFT JOIN posts_tags pt ON pt.fk_post_id = p.post_id
    LEFT JOIN tags t ON t.tag_id = pt.fk_tag_id
    LEFT JOIN posts_comments pc ON pc.fk_post_id = p.post_id
    LEFT JOIN comments cm ON cm.comment_id = pc.fk_comment_id
        WHERE p.post_id = $1
     GROUP BY p.post_id, a.author_id, u.user_id, root_category,
              c.arr_categories, c.arr_category_id
    `;
    const { rows }: QueryResult<PostRowSimple> = await this.db.query(q2, [id]);
    const data = rows[0];

    const comments = await this.postsCommentsService.getPostComments(
      { id },
      { perPage: 0, page: 0 },
    );
    const tags = await this.postsTagsService.getPostTags({ id });

    return {
      ...this.convertPosts({ ...data, tags: [], comments: [] }),
      tags,
      comments,
    };
  }

  async delete({ id }: PropsWithId) {
    const query = `DELETE FROM ${tableName}
                    WHERE post_id = $1
                RETURNING post_id, title, created_at, fk_author_id, fk_category_id, body, main_img, other_imgs`;
    const selectData: QueryResult<PostRow> = await this.db.query(
      `SELECT * FROM ${tableName}
        WHERE post_id = $1
      `,
      [id],
    );

    if (selectData.rows.length > 0) {
      const { rows }: QueryResult<PostRow> = await this.db.query(query, [id]);
      const data = rows[0];

      return {
        ...data,
        id: data.post_id,
      };
    }

    return ApiError.BadRequest('Post not found');
  }

  private convertPosts(post: PostFullRow) {
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

    const comments = cm.map((c) => this.commentsService.convertComment(c));
    const tags = ts.map((t) => this.tagsService.convertTag(t));

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
export default new PostsService(
  dataBase,
  CommentsService,
  TagsService,
  PostsCommentsService,
  PostsTagsService,
);
