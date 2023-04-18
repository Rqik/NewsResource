import prisma from '../../client';

type CategoriesRow = {
  category_id: number;
  description: string;
  fk_category_id: number | null;
  total_count?: number;
};

const queryCategoriesRecursive = (nameTemplate = 'catR') => `
  WITH RECURSIVE ${nameTemplate}(id, category, arr_categories, arr_category_id) as (
          SELECT category_id, description, array[description::varchar], array[category_id]
            FROM categories
           WHERE fk_category_id IS NUll

           UNION

          SELECT category_id, description, description || arr_categories, category_id || arr_category_id
            FROM categories
            JOIN ${nameTemplate} ON categories.fk_category_id = ${nameTemplate}.id
  )
`;

class CategoriesService {
  static async create({
    description,
    category,
  }: {
    description: string;
    category?: number;
  }) {
    const newCategory = await prisma.category.create({
      data: {
        description,
        fk_category_id: category,
      },
    });

    return CategoriesService.convertCategory(newCategory);
  }

  static async update({
    id,
    description,
    category,
  }: {
    id: number;
    description: string;
    category?: number;
  }) {
    const data = await prisma.category.update({
      where: {
        category_id: id,
      },
      data: {
        description,
        fk_category_id: category,
      },
    });

    return CategoriesService.convertCategory(data);
  }

  static async getAll({ page, perPage }: { page: number; perPage: number }) {
    const [totalCount, data] = await prisma.$transaction([
      prisma.category.count(),
      prisma.category.findMany({
        skip: page * perPage,
        take: perPage,
      }),
    ]);

    const categories = data.map((category) =>
      CategoriesService.convertCategory(category),
    );

    return {
      totalCount,
      count: categories.length,
      categories,
    };
  }

  static async getOne({ id }: { id: number }) {
    const data = await prisma.category.findUnique({
      where: { category_id: id },
    });

    return data ? CategoriesService.convertCategory(data) : data;
  }

  static async delete({ id }: { id: number }) {
    // TODO:проверить data !== null
    const data = await prisma.category.delete({
      where: {
        category_id: id,
      },
    });

    return CategoriesService.convertCategory(data);
  }

  private static convertCategory(category: CategoriesRow) {
    return {
      id: category.category_id,
      description: category.description,
      fkCategoryId: category.fk_category_id,
    };
  }
}

export { queryCategoriesRecursive };
export default CategoriesService;
