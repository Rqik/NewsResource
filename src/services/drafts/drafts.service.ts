import { Draft } from '@prisma/client';
import { boundClass } from 'autobind-decorator';

import prisma from '@/client';
import { ApiError } from '@/exceptions';

import { PropsWithId } from '../types';

type DraftsRow = {
  draft_id: number;
  created_at: Date;
  updated_at: Date;
  fk_author_id: number;
  fk_category_id: number;
  body: string;
  title: string;
  main_img: string;
  other_imgs: string[];
  total_count?: number;
};

type DraftConverted = {
  id: number;
  createdAt: Date;
  updatedAt: Date | null;
  authorId: number | null;
  body: string | null;
  title: string | null;
  categoryId: number | null;
  mainImg: string | null;
  otherImgs: string[];
};

@boundClass
class DraftsService {
  constructor(private prismaClient: typeof prisma) {}

  async create({
    authorId,
    body,
    title,
    categoryId,
    mainImg,
    otherImgs,
  }: Omit<DraftConverted, 'createdAt' | 'updatedAt' | 'id'>) {
    const draft = await this.prismaClient.draft.create({
      data: {
        fk_author_id: Number(authorId),
        body,
        title,
        fk_category_id: categoryId,
        main_img: mainImg,
        other_imgs: otherImgs,
      },
    });

    return this.convertDraft(draft);
  }

  async update({
    id,
    authorId,
    body,
    title,
    categoryId,
    mainImg,
    otherImgs,
  }: Omit<DraftConverted, 'updatedAt' | 'createdAt'>) {
    const draft = await this.prismaClient.draft.update({
      where: { draft_id: id },
      data: {
        fk_author_id: Number(authorId),
        body,
        title,
        fk_category_id: categoryId,
        main_img: mainImg,
        other_imgs: otherImgs,
      },
    });

    return this.convertDraft(draft);
  }

  async getOne({ id }: { id: number }): Promise<DraftConverted | null> {
    const draft = await this.prismaClient.draft.findUnique({
      where: { draft_id: id },
    });

    return draft ? this.convertDraft(draft) : draft;
  }

  async getDrafts(
    { dIds, authorId }: { dIds: number[]; authorId: number },
    { page, perPage }: { page: number; perPage: number },
  ) {
    const [totalCount, data] = await this.prismaClient.$transaction([
      this.prismaClient.draft.count({
        where: {
          draft_id: { in: dIds },
          fk_author_id: authorId,
        },
      }),
      this.prismaClient.draft.findMany({
        where: {
          draft_id: { in: dIds },
          fk_author_id: authorId,
        },
        skip: page * perPage,
        take: perPage,
      }),
    ]);

    const drafts = data.map((draft) => this.convertDraft(draft));

    return { totalCount, count: data.length, drafts };
  }

  async delete({ id }: { id: number }): Promise<DraftConverted | ApiError> {
    const selectData = await this.prismaClient.draft.findUnique({
      where: { draft_id: id },
    });

    if (selectData === null) {
      return ApiError.BadRequest('Draft not found');
    }

    await this.prismaClient.postsOnDrafts.deleteMany({
      where: {
        fk_draft_id: id,
      },
    });

    const draft = await this.prismaClient.draft.delete({
      where: {
        draft_id: id,
      },
    });

    return this.convertDraft(draft);
  }

  // eslint-disable-next-line class-methods-use-this
  convertDraft(draft: DraftsRow | Draft): PropsWithId<DraftConverted> {
    return {
      id: draft.draft_id,
      createdAt: draft.created_at,
      updatedAt: draft.updated_at,
      authorId: draft.fk_author_id,
      body: draft.body,
      title: draft.title,
      mainImg: draft.main_img,
      otherImgs: draft.other_imgs,
      categoryId: draft.fk_category_id,
    };
  }
}

export default new DraftsService(prisma);
