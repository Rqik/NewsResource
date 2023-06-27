import { Request, Response } from 'express';

import { TagsService } from '@/services';
import paginator from '@/shared/paginator';

import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import TagDto from './tags.dto';
import TagsController from './TagsController';

describe('TagsController', () => {
  let tagsController: TagsController;
  let tagsService: TagsService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    tagsService = new TagsService();
    tagsController = new TagsController(tagsService);
    mockRequest = {};
    mockResponse = {
      send: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const createResult = { id: 1, title: 'Tag 1' };
      const tagDto = new TagDto({ title: 'Tag 1' });
      tagDto.validate = jest
        .fn()
        .mockReturnValue({ error: null, value: { title: 'Tag 1' } });
      tagsService.create = jest.fn().mockResolvedValue(createResult);
      mockRequest.body = { title: 'Tag 1' };

      await tagsController.create(
        mockRequest as RequestWithBody<{ title: string }>,
        mockResponse as Response,
        nextFunction,
      );

      expect(tagDto.validate).toBeCalled();
      expect(tagsService.create).toBeCalledWith({ title: 'Tag 1' });
      expect(mockResponse.send).toBeCalledWith(createResult);
    });

    it('should call next function with validation error', async () => {
      const validationError = new Error('Validation error');
      const tagDto = new TagDto({ title: 'Tag 1' });
      tagDto.validate = jest
        .fn()
        .mockReturnValue({ error: validationError, value: null });
      mockRequest.body = { title: 'Tag 1' };

      await tagsController.create(
        mockRequest as RequestWithBody<{ title: string }>,
        mockResponse as Response,
        nextFunction,
      );

      expect(tagDto.validate).toBeCalled();
      expect(nextFunction).toBeCalledWith(validationError);
      expect(mockResponse.send).not.toBeCalled();
    });
  });

  describe('update', () => {
    it('should update the specified tag', async () => {
      const updateResult = { id: 1, title: 'Updated Tag' };
      const tagDto = new TagDto({ title: 'Updated Tag' });
      tagDto.validate = jest
        .fn()
        .mockReturnValue({ error: null, value: { title: 'Updated Tag' } });
      tagsService.update = jest.fn().mockResolvedValue(updateResult);
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated Tag' };

      await tagsController.update(
        mockRequest as RequestWithParamsAndBody<
          { id: string },
          { title: string }
        >,
        mockResponse as Response,
        nextFunction,
      );

      expect(tagDto.validate).toBeCalled();
      expect(tagsService.update).toBeCalledWith({
        id: '1',
        title: 'Updated Tag',
      });
      expect(mockResponse.send).toBeCalledWith(updateResult);
    });

    it('should call next function with validation error', async () => {
      const validationError = new Error('Validation error');
      const tagDto = new TagDto({ title: 'Updated Tag' });
      tagDto.validate = jest
        .fn()
        .mockReturnValue({ error: validationError, value: null });
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated Tag' };

      await tagsController.update(
        mockRequest as RequestWithParamsAndBody<
          { id: string },
          { title: string }
        >,
        mockResponse as Response,
        nextFunction,
      );

      expect(tagDto.validate).toBeCalled();
      expect(nextFunction).toBeCalledWith(validationError);
      expect(mockResponse.send).not.toBeCalled();
    });
  });

  describe('getAll', () => {
    it('should get all tags', async () => {
      const getAllResult = {
        totalCount: 2,
        count: 2,
        tags: [
          { id: 1, title: 'Tag 1' },
          { id: 2, title: 'Tag 2' },
        ],
      };
      const { per_page: perPage, page } =
        mockRequest.query as RequestWithQuery<{
          per_page: string;
          page: string;
        }>;
      tagsService.getAll = jest.fn().mockResolvedValue(getAllResult);
      mockRequest.query = { per_page: '10', page: '0' };

      await tagsController.getAll(
        mockRequest as RequestWithQuery<{ per_page: string; page: string }>,
        mockResponse as Response,
      );

      expect(tagsService.getAll).toBeCalledWith({
        page: 0,
        perPage: 10,
      });
      expect(mockResponse.send).toBeCalledWith({
        totalCount: 2,
        count: 2,
        data: [
          { id: 1, title: 'Tag 1' },
          { id: 2, title: 'Tag 2' },
        ],
      });
    });
  });

  describe('getOne', () => {
    it('should get the specified tag', async () => {
      const getOneResult = { id: 1, title: 'Tag 1' };
      tagsService.getOne = jest.fn().mockResolvedValue(getOneResult);
      mockRequest.params = { id: '1' };

      await tagsController.getOne(
        mockRequest as RequestWithParams<{ id: string }>,
        mockResponse as Response,
      );

      expect(tagsService.getOne).toBeCalledWith({ id: '1' });
      expect(mockResponse.send).toBeCalledWith(getOneResult);
    });
  });

  describe('delete', () => {
    it('should delete the specified tag', async () => {
      const deleteResult = { id: 1, title: 'Deleted Tag' };
      tagsService.delete = jest.fn().mockResolvedValue(deleteResult);
      mockRequest.params = { id: '1' };

      await tagsController.delete(
        mockRequest as RequestWithParams<{ id: string }>,
        mockResponse as Response,
      );

      expect(tagsService.delete).toBeCalledWith({ id: '1' });
      expect(mockResponse.send).toBeCalledWith(deleteResult);
    });
  });
});
