import { Comment } from '@prisma/client';

import prisma from '@/client';

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
  constructor(private prismaClient: typeof prisma) {}

  async create({
    userId,
    body,
  }: {
    userId: number;
    body: string;
  }): Promise<CommentConverted> {
    const comment = await this.prismaClient.comment.create({
      data: {
        fk_user_id: userId,
        body,
      },
    });

    return this.convertComment(comment);
  }

  async getComments(
    { commentIds }: { commentIds: number[] },
    { page, perPage }: { page: number; perPage: number },
  ) {
    const [totalCount, data] = await this.prismaClient.$transaction([
      this.prismaClient.comment.count({
        where: {
          comment_id: { in: commentIds },
        },
      }),
      this.prismaClient.comment.findMany({
        where: {
          comment_id: { in: commentIds },
        },
        skip: page * perPage,
        take: perPage,
      }),
    ]);

    const comments = data.map((comment) => this.convertComment(comment));

    return { totalCount, count: data.length, comments };
  }

  async delete({ id }: { id: number }): Promise<CommentConverted> {
    const comment = await this.prismaClient.comment.delete({
      where: {
        comment_id: id,
      },
    });

    return this.convertComment(comment);
  }

  // eslint-disable-next-line class-methods-use-this
  convertComment(comment: CommentRow | Comment): CommentConverted {
    return {
      id: comment.comment_id,
      userId: comment.fk_user_id,
      createdAt: comment.created_at,
      body: comment.body,
    };
  }
}

export type { CommentRow };
export default new CommentsService(prisma);
