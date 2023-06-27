import prisma from '@/client';

import DraftsService, { DraftConverted, DraftsRow } from './drafts.service';

jest.mock('@/client');

describe('DraftsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockDraftRow: DraftsRow = {
    draft_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    fk_author_id: 1,
    fk_category_id: 1,
    body: 'Draft body',
    title: 'Draft title',
    main_img: 'draft_main_img.jpg',
    other_imgs: ['draft_img1.jpg', 'draft_img2.jpg'],
  };

  const mockDraftConverted: DraftConverted = {
    id: 1,
    createdAt: mockDraftRow.created_at,
    updatedAt: mockDraftRow.updated_at,
    authorId: mockDraftRow.fk_author_id,
    body: mockDraftRow.body,
    title: mockDraftRow.title,
    mainImg: mockDraftRow.main_img,
    otherImgs: mockDraftRow.other_imgs,
    categoryId: mockDraftRow.fk_category_id,
  };

  describe('create', () => {
    it('should create a new draft', async () => {
      prisma.draft.create.mockResolvedValue(mockDraftRow);

      const result = await DraftsService.create({
        authorId: 1,
        body: 'Draft body',
        title: 'Draft title',
        categoryId: 1,
        mainImg: 'draft_main_img.jpg',
        otherImgs: ['draft_img1.jpg', 'draft_img2.jpg'],
      });

      expect(prisma.draft.create).toBeCalledWith({
        data: {
          fk_author_id: 1,
          body: 'Draft body',
          title: 'Draft title',
          fk_category_id: 1,
          main_img: 'draft_main_img.jpg',
          other_imgs: ['draft_img1.jpg', 'draft_img2.jpg'],
        },
      });
      expect(result).toEqual(mockDraftConverted);
    });
  });

  describe('update', () => {
    it('should update an existing draft', async () => {
      prisma.draft.update.mockResolvedValue(mockDraftRow);

      const result = await DraftsService.update({
        id: 1,
        authorId: 1,
        body: 'Draft body',
        title: 'Draft title',
        categoryId: 1,
        mainImg: 'draft_main_img.jpg',
        otherImgs: ['draft_img1.jpg', 'draft_img2.jpg'],
      });

      expect(prisma.draft.update).toBeCalledWith({
        where: { draft_id: 1 },
        data: {
          fk_author_id: 1,
          body: 'Draft body',
          title: 'Draft title',
          fk_category_id: 1,
          main_img: 'draft_main_img.jpg',
          other_imgs: ['draft_img1.jpg', 'draft_img2.jpg'],
        },
      });
      expect(result).toEqual(mockDraftConverted);
    });
  });

  describe('getOne', () => {
    it('should get the specified draft', async () => {
      prisma.draft.findUnique.mockResolvedValue(mockDraftRow);

      const result = await DraftsService.getOne({ id: 1 });

      expect(prisma.draft.findUnique).toBeCalledWith({
        where: { draft_id: 1 },
      });
      expect(result).toEqual(mockDraftConverted);
    });

    it('should return null if draft is not found', async () => {
      prisma.draft.findUnique.mockResolvedValue(null);

      const result = await DraftsService.getOne({ id: 1 });

      expect(prisma.draft.findUnique).toBeCalledWith({
        where: { draft_id: 1 },
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete the specified draft', async () => {
      prisma.draft.findUnique.mockResolvedValue(mockDraftRow);
      prisma.postsOnDrafts.deleteMany.mockResolvedValue({});
      prisma.draft.delete.mockResolvedValue(mockDraftRow);

      const result = await DraftsService.delete({ id: 1 });

      expect(prisma.draft.findUnique).toBeCalledWith({
        where: { draft_id: 1 },
      });
      expect(prisma.postsOnDrafts.deleteMany).toBeCalledWith({
        where: { fk_draft_id: 1 },
      });
      expect(prisma.draft.delete).toBeCalledWith({
        where: { draft_id: 1 },
      });
      expect(result).toEqual(mockDraftConverted);
    });

    it('should return ApiError if draft is not found', async () => {
      prisma.draft.findUnique.mockResolvedValue(null);

      const result = await DraftsService.delete({ id: 1 });

      expect(prisma.draft.findUnique).toBeCalledWith({
        where: { draft_id: 1 },
      });
      expect(result).toBeInstanceOf(ApiError);
      expect(result?.message).toBe('Draft not found');
    });
  });
});
