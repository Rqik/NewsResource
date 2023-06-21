import prisma from '@/client';

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
  constructor(private prismaClient: typeof prisma) {}

  async create({
    description,
    category,
  }: {
    description: string;
    category?: number;
  }) {
    const newCategory = await this.prismaClient.category.create({
      data: {
        description,
        fk_category_id: category,
      },
    });

    return this.convertCase(newCategory);
  }

  async update({
    id,
    description,
    category,
  }: {
    id: number;
    description: string;
    category?: number;
  }) {
    const data = await this.prismaClient.category.update({
      where: {
        category_id: id,
      },
      data: {
        description,
        fk_category_id: category,
      },
    });

    return this.convertCase(data);
  }

  async getAll({ page, perPage }: { page: number; perPage: number }) {
    const [totalCount, data] = await this.prismaClient.$transaction([
      this.prismaClient.category.count(),
      this.prismaClient.category.findMany({
        skip: page * perPage,
        take: perPage,
      }),
    ]);

    const categories = data.map((category) => this.convertCase(category));

    return {
      totalCount,
      count: categories.length,
      categories,
    };
  }

  async getOne({ id }: { id: number }) {
    const data = await this.prismaClient.category.findUnique({
      where: { category_id: id },
    });

    return data ? this.convertCase(data) : data;
  }

  async delete({ id }: { id: number }) {
    // TODO:проверить data !== null
    const data = await this.prismaClient.category.delete({
      where: {
        category_id: id,
      },
    });

    return this.convertCase(data);
  }

  // eslint-disable-next-line class-methods-use-this
  private convertCase(category: CategoriesRow) {
    return {
      id: category.category_id,
      description: category.description,
      fkCategoryId: category.fk_category_id,
    };
  }
}

export { queryCategoriesRecursive };
export default new CategoriesService(prisma);
