import { QueryResult } from 'pg';

import db from '../db';
import prisma from '../prisma';
import CommentsService from './CommentsService';
import { PropsWithId } from './types';

const tableName = 'posts_comments';

type PostCommentRow = {
  fk_post_id: number;
  fk_comment_id: number;
};

class PostsCommentsService {
  static async create({
    commentId,
    postId,
  }: {
    commentId: number;
    postId: number;
  }) {
    const connect = await prisma.postsOnComments.create({
      data: {
        fk_comment_id: commentId,
        fk_post_id: postId,
      },
    });

    return connect;
  }

  static async getPostComments(
    { id }: PropsWithId,
    { page, perPage }: { page: number; perPage: number },
  ) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1
    `;
    const { rows }: QueryResult<PostCommentRow> = await db.query(query, [id]);

    const commentIds = rows.map((el) => el.fk_comment_id);

    const comm = await prisma.postsOnComments.findMany({
      where: {
        posts: {
          post_id: Number(id),
        },
      },
    });
    console.log('comm', comm);

    const { totalCount, count, comments } = await CommentsService.getComments(
      { commentIds },
      { page, perPage },
    );

    return { totalCount, count, comments };
  }

  static async delete({
    postId,
    commentId,
  }: {
    postId: number;
    commentId: number;
  }) {
    await prisma.postsOnComments.delete({
      where: {
        fk_comment_id_fk_post_id: {
          fk_comment_id: commentId,
          fk_post_id: postId,
        },
      },
    });
    const comment = await CommentsService.delete({ id: commentId });

    return comment;
  }
}

export default PostsCommentsService;
