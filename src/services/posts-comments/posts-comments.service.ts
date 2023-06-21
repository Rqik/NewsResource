import { boundClass } from 'autobind-decorator';
import { QueryResult } from 'pg';

import prisma from '@/client';
import db from '@/db';

import { CommentsService } from '../comments';
import { PropsWithId } from '../types';

const tableName = 'posts_comments';

type PostCommentRow = {
  fk_post_id: number;
  fk_comment_id: number;
};

@boundClass
class PostsCommentsService {
  constructor(
    private prismaClient: typeof prisma,
    private commentsService: typeof CommentsService,
  ) {}

  async create({ commentId, postId }: { commentId: number; postId: number }) {
    const connect = await this.prismaClient.postsOnComments.create({
      data: {
        fk_comment_id: commentId,
        fk_post_id: postId,
      },
    });

    return connect;
  }

  async getPostComments(
    { id }: PropsWithId,
    { page, perPage }: { page: number; perPage: number },
  ) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE fk_post_id = $1
    `;
    const { rows }: QueryResult<PostCommentRow> = await db.query(query, [id]);

    const commentIds = rows.map((el) => el.fk_comment_id);

    const comm = await this.prismaClient.postsOnComments.findMany({
      where: {
        posts: {
          post_id: Number(id),
        },
      },
    });

    const { totalCount, count, comments } =
      await this.commentsService.getComments({ commentIds }, { page, perPage });

    return { totalCount, count, comments };
  }

  async delete({ postId, commentId }: { postId: number; commentId: number }) {
    await this.prismaClient.postsOnComments.delete({
      where: {
        fk_comment_id_fk_post_id: {
          fk_comment_id: commentId,
          fk_post_id: postId,
        },
      },
    });
    const comment = await this.commentsService.delete({ id: commentId });

    return comment;
  }
}

export default new PostsCommentsService(prisma, CommentsService);
