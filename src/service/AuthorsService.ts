import { Author } from '@prisma/client';

import { ApiError } from '../exceptions/index';
import prisma from '../prisma';
import { PropsWithId } from './types';

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
  static async create({ description, userId }: AuthorProp) {
    const author = await prisma.author.create({
      data: {
        description,
        fk_user_id: userId,
      },
    });

    return AuthorsService.convertCase(author);
  }

  static async update({ id, description, userId }: PropsWithId<AuthorProp>) {
    const author = await prisma.author.update({
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

  static async getAll({ page, perPage }: { page: number; perPage: number }) {
    const [totalCount, data] = await prisma.$transaction([
      prisma.author.count(),
      prisma.author.findMany({
        skip: page * perPage,
        take: perPage,
      }),
    ]);
    const authors = data.map((author) => AuthorsService.convertCase(author));

    return { authors, count: data.length, totalCount };
  }

  static async getOne({ id }: PropsWithId) {
    const author = await prisma.author.findUnique({
      where: {
        author_id: Number(id),
      },
    });

    if (author === null) {
      return ApiError.BadRequest('Not found Author');
    }

    return AuthorsService.convertCase(author);
  }

  static async getByUserId({ id }: PropsWithId) {
    try {
      const author = await prisma.author.findFirst({
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

  static async deleteUserAuthors({ id }: PropsWithId) {
    const author = await prisma.author.delete({
      where: {
        fk_user_id: Number(id),
      },
    });

    return AuthorsService.convertCase(author);
  }

  static async delete({ id }: PropsWithId) {
    const author = await prisma.author.delete({
      where: {
        author_id: Number(id),
      },
    });

    return AuthorsService.convertCase(author);
  }

  static convertCase(author: AuthorsRow | Author): AuthorConverted {
    return {
      id: author.author_id,
      description: author.description,
      userId: author.fk_user_id,
    };
  }
}

export default AuthorsService;
