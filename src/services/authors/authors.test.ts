import prisma from '@/client';
import { ApiError } from '@/exceptions';

import AuthorsService, {
  AuthorConverted,
  AuthorProp,
  AuthorsRow,
} from './authors.service';

jest.mock('@/client');

describe('AuthorsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockAuthorRow: AuthorsRow = {
    author_id: 1,
    fk_user_id: 1,
    description: 'Author description',
  };

  const mockAuthorConverted: AuthorConverted = {
    id: 1,
    userId: 1,
    description: 'Author description',
  };

  const mockAuthorProp: AuthorProp = {
    description: 'Author description',
    userId: 1,
  };

  describe('create', () => {
    it('should create a new author', async () => {
      prisma.author.create.mockResolvedValue(mockAuthorRow);

      const result = await AuthorsService.create(mockAuthorProp);

      expect(prisma.author.create).toBeCalledWith({
        data: {
          description: 'Author description',
          fk_user_id: 1,
        },
      });
      expect(result).toEqual(mockAuthorConverted);
    });
  });

  describe('update', () => {
    it('should update an existing author', async () => {
      prisma.author.update.mockResolvedValue(mockAuthorRow);

      const result = await AuthorsService.update({ id: 1, ...mockAuthorProp });

      expect(prisma.author.update).toBeCalledWith({
        where: {
          author_id: 1,
        },
        data: {
          description: 'Author description',
          fk_user_id: 1,
        },
      });
      expect(result).toEqual(mockAuthorConverted);
    });
  });

  describe('getAll', () => {
    it('should get all authors with pagination', async () => {
      const mockAuthorsRows: AuthorsRow[] = [
        {
          author_id: 1,
          fk_user_id: 1,
          description: 'Author description 1',
        },
        {
          author_id: 2,
          fk_user_id: 2,
          description: 'Author description 2',
        },
      ];

      prisma.$transaction.mockResolvedValue([2, mockAuthorsRows]);
      prisma.author.count.mockResolvedValue(2);

      const result = await AuthorsService.getAll({ page: 0, perPage: 10 });

      expect(prisma.$transaction).toBeCalledWith([
        prisma.author.count(),
        prisma.author.findMany({
          skip: 0,
          take: 10,
        }),
      ]);
      expect(prisma.author.count).toBeCalled();
      expect(result).toEqual({
        authors: [mockAuthorConverted, mockAuthorConverted],
        count: 2,
        totalCount: 2,
      });
    });
  });

  describe('getOne', () => {
    it('should get the specified author', async () => {
      prisma.author.findUnique.mockResolvedValue(mockAuthorRow);

      const result = await AuthorsService.getOne({ id: 1 });

      expect(prisma.author.findUnique).toBeCalledWith({
        where: {
          author_id: 1,
        },
      });
      expect(result).toEqual(mockAuthorConverted);
    });

    it('should return ApiError if author is not found', async () => {
      prisma.author.findUnique.mockResolvedValue(null);

      await expect(AuthorsService.getOne({ id: 1 })).rejects.toEqual(
        ApiError.BadRequest('Not found Author'),
      );

      expect(prisma.author.findUnique).toBeCalledWith({
        where: {
          author_id: 1,
        },
      });
    });
  });

  describe('getByUserId', () => {
    it('should get the author by user ID', async () => {
      prisma.author.findFirst.mockResolvedValue(mockAuthorRow);

      const result = await AuthorsService.getByUserId({ id: 1 });

      expect(prisma.author.findFirst).toBeCalledWith({
        where: {
          fk_user_id: 1,
        },
      });
      expect(result).toEqual(mockAuthorConverted);
    });

    it('should return ApiError if author is not found', async () => {
      prisma.author.findFirst.mockResolvedValue(null);

      const result = await AuthorsService.getByUserId({ id: 1 });

      expect(prisma.author.findFirst).toBeCalledWith({
        where: {
          fk_user_id: 1,
        },
      });
      expect(result).toEqual(ApiError.BadRequest('Not found Author'));
    });
  });

  describe('deleteUserAuthors', () => {
    it('should delete the authors associated with the user', async () => {
      prisma.author.delete.mockResolvedValue(mockAuthorRow);

      const result = await AuthorsService.deleteUserAuthors({ id: 1 });

      expect(prisma.author.delete).toBeCalledWith({
        where: {
          fk_user_id: 1,
        },
      });
      expect(result).toEqual(mockAuthorConverted);
    });
  });

  describe('delete', () => {
    it('should delete the specified author', async () => {
      prisma.author.delete.mockResolvedValue(mockAuthorRow);

      const result = await AuthorsService.delete({ id: 1 });

      expect(prisma.author.delete).toBeCalledWith({
        where: {
          author_id: 1,
        },
      });
      expect(result).toEqual(mockAuthorConverted);
    });
  });
});
