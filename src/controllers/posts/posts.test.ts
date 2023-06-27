import { NextFunction, Request, Response } from 'express';

import { PostsService } from '@/services';

import postsController from './posts.controller';
import PostsDto, { IPost } from './posts.dto';

jest.mock('../../services/categories.service');

describe('PostsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('create', () => {
    it('should return validation error if dto is invalid', async () => {
      const dto = new PostsDto({} as IPost);
      dto.validate = jest
        .fn()
        .mockReturnValue({ error: 'Some error', value: null });
      mockRequest.body = dto;

      await postsController.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toBeCalledWith('Some error');
    });

    // ...more tests...
  });

  describe('update', () => {
    it('should return validation error if dto is invalid', async () => {
      const dto = new PostsDto({} as IPost);
      dto.validate = jest
        .fn()
        .mockReturnValue({ error: 'Some error', value: null });
      mockRequest.params = { id: '1' };
      mockRequest.body = dto;

      await postsController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toBeCalledWith('Some error');
    });

    // ...more tests...
  });

  describe('getAll', () => {
    it('should call postsService.getAll with correct params and return result', async () => {
      const mockPostsData = {
        totalCount: 100,
        count: 10,
        posts: [{ id: 1, title: 'Post 1' }],
      };
      mockRequest.query = { page: '1', per_page: '10' };
      PostsService.getAll = jest.fn().mockResolvedValue(mockPostsData);

      await postsController.getAll(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(PostsService.getAll).toBeCalledWith(expect.anything(), {
        page: 1,
        perPage: 10,
      });
      expect(mockResponse.send).toBeCalledWith(
        expect.objectContaining({ data: mockPostsData.posts }),
      );
    });
  });

  describe('getOne', () => {
    it('should call postsService.getOne with correct params and return result', async () => {
      const mockPost = { id: 1, title: 'Post 1' };
      mockRequest.params = { id: '1' };
      PostsService.getOne = jest.fn().mockResolvedValue(mockPost);

      await postsController.getOne(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(PostsService.getOne).toBeCalledWith({ id: '1' });
      expect(mockResponse.send).toBeCalledWith(mockPost);
    });
  });

  describe('delete', () => {
    it('should call postsService.delete with correct params and return result', async () => {
      const mockPost = { id: 1, title: 'Post 1' };
      mockRequest.params = { id: '1' };
      PostsService.delete = jest.fn().mockResolvedValue(mockPost);

      await postsController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(PostsService.delete).toBeCalledWith({ id: '1' });
      expect(mockResponse.send).toBeCalledWith(mockPost);
    });
  });
});
