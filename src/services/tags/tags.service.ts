import { boundClass } from 'autobind-decorator';

import prisma from '@/client';
import { ApiError } from '@/exceptions';

import { PropsWithId } from '../types';

const tableName = 'tags';
type TagsRow = {
  tag_id: number;
  title: string | null;
  total_count?: number;
};
type TagsProp = {
  title: string | null;
};

@boundClass
class TagsService {
  constructor(private prismaClient: typeof prisma) {}

  async create({ title }: TagsProp) {
    const tag = await this.prismaClient.tag.create({
      data: {
        title,
      },
    });

    return this.convertTag(tag);
  }

  async update({ id, title }: PropsWithId<TagsProp>) {
    const tag = await this.prismaClient.tag.update({
      where: {
        tag_id: Number(id),
      },
      data: {
        title,
      },
    });

    return this.convertTag(tag);
  }

  async getAll({ page, perPage }: { page: number; perPage: number }) {
    const [totalCount, data] = await this.prismaClient.$transaction([
      this.prismaClient.tag.count(),
      this.prismaClient.tag.findMany({
        skip: page * perPage,
        take: perPage,
      }),
    ]);

    const tags = data.map((tag) => this.convertTag(tag));

    return {
      totalCount,
      count: data.length,
      tags,
    };
  }

  async getTags({ tIds }: { tIds: number[] }) {
    const tags = await this.prismaClient.tag.findMany({
      where: {
        tag_id: { in: tIds },
      },
    });

    return tags.map((tag) => this.convertTag(tag));
  }

  async getOne({ id }: PropsWithId) {
    const tag = await this.prismaClient.tag.findUnique({
      where: {
        tag_id: Number(id),
      },
    });
    if (tag === null) {
      return ApiError.BadRequest(`Tag by ${id} not found`);
    }

    return this.convertTag(tag);
  }

  async delete({ id }: PropsWithId) {
    const tag = await this.prismaClient.tag.delete({
      where: {
        tag_id: Number(id),
      },
    });

    return this.convertTag(tag);
  }

  // eslint-disable-next-line class-methods-use-this
  convertTag(tag: TagsRow): PropsWithId<TagsProp> {
    return {
      id: tag.tag_id,
      title: tag.title,
    };
  }
}
export type { TagsRow };
export default new TagsService(prisma);
