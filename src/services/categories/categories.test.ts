import prisma from '@/client';

import CategoriesService, {
  CategoriesRow,
  queryCategoriesRecursive,
} from './categories.service';

jest.mock('@/client');

describe('CategoriesService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockCategoryRow: CategoriesRow = {
    category_id: 1,
    description: 'Category description',
    fk_category_id: null,
  };

  const mockCategoryConverted = {
    id: 1,
    description: 'Category description',
    fkCategoryId: null,
  };

  describe('create', () => {
    it('should create a new category', async () => {
      prisma.category.create.mockResolvedValue(mockCategoryRow);

      const result = await CategoriesService.create({
        description: 'Category description',
        category: null,
      });

      expect(prisma.category.create).toBeCalledWith({
        data: {
          description: 'Category description',
          fk_category_id: null,
        },
      });
      expect(result).toEqual(mockCategoryConverted);
    });
  });

  describe('update', () => {
    it('should update an existing category', async () => {
      prisma.category.update.mockResolvedValue(mockCategoryRow);

      const result = await CategoriesService.update({
        id: 1,
        description: 'Category description',
        category: null,
      });

      expect(prisma.category.update).toBeCalledWith({
        where: {
          category_id: 1,
        },
        data: {
          description: 'Category description',
          fk_category_id: null,
        },
      });
      expect(result).toEqual(mockCategoryConverted);
    });
  });

  describe('getAll', () => {
    it('should get all categories with pagination', async () => {
      const mockCategoriesRows: CategoriesRow[] = [
        {
          category_id: 1,
          description: 'Category description 1',
          fk_category_id: null,
        },
        {
          category_id: 2,
          description: 'Category description 2',
          fk_category_id: null,
        },
      ];

      prisma.$transaction.mockResolvedValue([2, mockCategoriesRows]);
      prisma.category.count.mockResolvedValue(2);

      const result = await CategoriesService.getAll({ page: 0, perPage: 10 });

      expect(prisma.$transaction).toBeCalledWith([
        prisma.category.count(),
        prisma.category.findMany({
          skip: 0,
          take: 10,
        }),
      ]);
      expect(prisma.category.count).toBeCalled();
      expect(result).toEqual({
        totalCount: 2,
        count: 2,
        categories: [mockCategoryConverted, mockCategoryConverted],
      });
    });
  });

  describe('getOne', () => {
    it('should get the specified category', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategoryRow);

      const result = await CategoriesService.getOne({ id: 1 });

      expect(prisma.category.findUnique).toBeCalledWith({
        where: {
          category_id: 1,
        },
      });
      expect(result).toEqual(mockCategoryConverted);
    });

    it('should return null if category is not found', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      const result = await CategoriesService.getOne({ id: 1 });

      expect(prisma.category.findUnique).toBeCalledWith({
        where: {
          category_id: 1,
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete the specified category', async () => {
      prisma.category.delete.mockResolvedValue(mockCategoryRow);

      const result = await CategoriesService.delete({ id: 1 });

      expect(prisma.category.delete).toBeCalledWith({
        where: {
          category_id: 1,
        },
      });
      expect(result).toEqual(mockCategoryConverted);
    });
  });
});

describe('queryCategoriesRecursive', () => {
  it('should generate the recursive CTE query', () => {
    const query = queryCategoriesRecursive();

    expect(query).toContain('WITH RECURSIVE');
    expect(query).toContain('categories');
  });
});
