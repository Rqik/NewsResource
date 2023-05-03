import { QueryResult } from 'pg';

import db from '../../db';
import { ApiError } from '../../exceptions/index';
import prisma from '../../client';
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

class TagsService {
  static async create({ title }: TagsProp) {
    const tag = await prisma.tag.create({
      data: {
        title,
      },
    });

    return TagsService.convertTag(tag);
  }

  static async update({ id, title }: PropsWithId<TagsProp>) {
    const tag = await prisma.tag.update({
      where: {
        tag_id: Number(id),
      },
      data: {
        title,
      },
    });

    return TagsService.convertTag(tag);
  }

  static async getAll({ page, perPage }: { page: number; perPage: number }) {
    const [totalCount, data] = await prisma.$transaction([
      prisma.tag.count(),
      prisma.tag.findMany({
        skip: page * perPage,
        take: perPage,
      }),
    ]);

    const tags = data.map((tag) => TagsService.convertTag(tag));

    return {
      totalCount,
      count: data.length,
      tags,
    };
  }

  static async getTags({ tIds }: { tIds: number[] }) {
    const tags = await prisma.tag.findMany({
      where: {
        tag_id: { in: tIds },
      },
    });

    return tags.map((tag) => TagsService.convertTag(tag));
  }

  static async getOne({ id }: PropsWithId) {
    const tag = await prisma.tag.findUnique({
      where: {
        tag_id: Number(id),
      },
    });
    if (tag === null) {
      return ApiError.BadRequest(`Tag by ${id} not found`);
    }

    return TagsService.convertTag(tag);
  }

  static async delete({ id }: PropsWithId) {
    const tag = await prisma.tag.delete({
      where: {
        tag_id: Number(id),
      },
    });

    return TagsService.convertTag(tag);
  }

  static convertTag(tag: TagsRow): PropsWithId<TagsProp> {
    return {
      id: tag.tag_id,
      title: tag.title,
    };
  }
}
export type { TagsRow };
export default TagsService;
