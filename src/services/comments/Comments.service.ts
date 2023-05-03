import { Comment } from '@prisma/client';

import prisma from '../../client';

type CommentRow = {
  comment_id: number;
  created_at: Date;
  fk_user_id: number;
  body: string;
  total_count?: number;
};

type CommentConverted = {
  id: number;
  createdAt: Date;
  userId: number;
  body: string;
};

class CommentsService {
  static async create({
    userId,
    body,
  }: {
    userId: number;
    body: string;
  }): Promise<CommentConverted> {
    const comment = await prisma.comment.create({
      data: {
        fk_user_id: userId,
        body,
      },
    });

    return CommentsService.convertComment(comment);
  }

  static async getComments(
    { commentIds }: { commentIds: number[] },
    { page, perPage }: { page: number; perPage: number },
  ) {
    const [totalCount, data] = await prisma.$transaction([
      prisma.comment.count({
        where: {
          comment_id: { in: commentIds },
        },
      }),
      prisma.comment.findMany({
        where: {
          comment_id: { in: commentIds },
        },
        skip: page * perPage,
        take: perPage,
      }),
    ]);

    const comments = data.map((comment) =>
      CommentsService.convertComment(comment),
    );

    return { totalCount, count: data.length, comments };
  }

  static async delete({ id }: { id: number }): Promise<CommentConverted> {
    const comment = await prisma.comment.delete({
      where: {
        comment_id: id,
      },
    });

    return CommentsService.convertComment(comment);
  }

  static convertComment(comment: CommentRow | Comment): CommentConverted {
    return {
      id: comment.comment_id,
      userId: comment.fk_user_id,
      createdAt: comment.created_at,
      body: comment.body,
    };
  }
}

export type { CommentRow };
export default CommentsService;
