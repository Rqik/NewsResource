import type { Author } from '@prisma/client';

import prisma from '@/client';
import { ApiError } from '@/exceptions';

import { PropsWithId } from '../types';

type AuthorsRow = {
  author_id: number;
  fk_user_id: number;
  description: string | null;
  total_count?: number;
};

type AuthorConverted = {
  id: number;
  userId: number;
  description: string | null;
};

type AuthorProp = { description: string; userId: number };
class AuthorsService {
  constructor(private prismaClient: typeof prisma) {}

  async create({ description, userId }: AuthorProp) {
    const author = await this.prismaClient.author.create({
      data: {
        description,
        fk_user_id: userId,
      },
    });

    return AuthorsService.convertCase(author);
  }

  async update({ id, description, userId }: PropsWithId<AuthorProp>) {
    const author = await this.prismaClient.author.update({
      where: {
        author_id: Number(id),
      },
      data: {
        description,
        fk_user_id: userId,
      },
    });

    return AuthorsService.convertCase(author);
  }

  async getAll({ page, perPage }: { page: number; perPage: number }) {
    const [totalCount, data] = await this.prismaClient.$transaction([
      this.prismaClient.author.count(),
      this.prismaClient.author.findMany({
        skip: page * perPage,
        take: perPage,
      }),
    ]);
    const authors = data.map((author) => AuthorsService.convertCase(author));

    return { authors, count: data.length, totalCount };
  }

  async getOne({ id }: PropsWithId) {
    const author = await this.prismaClient.author.findUnique({
      where: {
        author_id: Number(id),
      },
    });

    if (author === null) {
      return ApiError.BadRequest('Not found Author');
    }

    return AuthorsService.convertCase(author);
  }

  async getByUserId({ id }: PropsWithId) {
    try {
      const author = await this.prismaClient.author.findFirst({
        where: {
          fk_user_id: Number(id),
        },
      });

      if (author === null) {
        return ApiError.BadRequest('Not found Author');
      }

      return AuthorsService.convertCase(author);
    } catch {
      return null;
    }
  }

  async deleteUserAuthors({ id }: PropsWithId) {
    const author = await this.prismaClient.author.delete({
      where: {
        fk_user_id: Number(id),
      },
    });

    return AuthorsService.convertCase(author);
  }

  async delete({ id }: PropsWithId) {
    const author = await this.prismaClient.author.delete({
      where: {
        author_id: Number(id),
      },
    });

    return AuthorsService.convertCase(author);
  }

  convertCase(author: AuthorsRow | Author): AuthorConverted {
    return {
      id: author.author_id,
      description: author.description,
      userId: author.fk_user_id,
    };
  }
}

export default new AuthorsService(prisma);
