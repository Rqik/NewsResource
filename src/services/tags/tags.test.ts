import prisma from '@/client';

import TagsService, { TagsRow } from './tags.service';

jest.mock('@/client');

describe('TagsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockTag: TagsRow = {
      tag_id: 1,
      title: 'Test Tag',
    };

    beforeEach(() => {
      prisma.tag.create.mockResolvedValue(mockTag);
    });

    it('should create a tag', async () => {
      const mockTitle = 'Test Tag';

      const result = await TagsService.create({ title: mockTitle });

      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: {
          title: mockTitle,
        },
      });
      expect(result).toEqual({
        id: mockTag.tag_id,
        title: mockTag.title,
      });
    });
  });

  describe('update', () => {
    const mockTag: TagsRow = {
      tag_id: 1,
      title: 'Updated Tag',
    };

    beforeEach(() => {
      prisma.tag.update.mockResolvedValue(mockTag);
    });

    it('should update a tag', async () => {
      const mockId = 1;
      const mockTitle = 'Updated Tag';

      const result = await TagsService.update({ id: mockId, title: mockTitle });

      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: {
          tag_id: mockId,
        },
        data: {
          title: mockTitle,
        },
      });
      expect(result).toEqual({
        id: mockTag.tag_id,
        title: mockTag.title,
      });
    });
  });

  describe('getAll', () => {
    const mockTags: TagsRow[] = [
      { tag_id: 1, title: 'Tag 1' },
      { tag_id: 2, title: 'Tag 2' },
    ];

    beforeEach(() => {
      prisma.tag.count.mockResolvedValue(mockTags.length);
      prisma.tag.findMany.mockResolvedValue(mockTags);
    });

    it('should get all tags', async () => {
      const mockPage = 0;
      const mockPerPage = 10;

      const result = await TagsService.getAll({
        page: mockPage,
        perPage: mockPerPage,
      });

      expect(prisma.tag.count).toHaveBeenCalled();
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        skip: mockPage * mockPerPage,
        take: mockPerPage,
      });
      expect(result).toEqual({
        totalCount: mockTags.length,
        count: mockTags.length,
        tags: mockTags.map((tag) => ({ id: tag.tag_id, title: tag.title })),
      });
    });
  });

  describe('getOne', () => {
    const mockTag: TagsRow = {
      tag_id: 1,
      title: 'Test Tag',
    };

    beforeEach(() => {
      prisma.tag.findUnique.mockResolvedValue(mockTag);
    });

    it('should get a tag by ID', async () => {
      const mockId = 1;

      const result = await TagsService.getOne({ id: mockId });

      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: {
          tag_id: mockId,
        },
      });
      expect(result).toEqual({
        id: mockTag.tag_id,
        title: mockTag.title,
      });
    });

    it('should return null if tag not found', async () => {
      const mockId = 2;

      prisma.tag.findUnique.mockResolvedValue(null);

      const result = await TagsService.getOne({ id: mockId });

      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: {
          tag_id: mockId,
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    const mockTag: TagsRow = {
      tag_id: 1,
      title: 'Deleted Tag',
    };

    beforeEach(() => {
      prisma.tag.delete.mockResolvedValue(mockTag);
    });

    it('should delete a tag', async () => {
      const mockId = 1;

      const result = await TagsService.delete({ id: mockId });

      expect(prisma.tag.delete).toHaveBeenCalledWith({
        where: {
          tag_id: mockId,
        },
      });
      expect(result).toEqual({
        id: mockTag.tag_id,
        title: mockTag.title,
      });
    });
  });
});
