import { NextFunction, Request, Response } from 'express';

import { PostsCommentsService } from '@/services';

import postsCommentsController from './posts-comments.controller';
import PostsCommentsDto, { IPostsComments } from './posts-comments.dto';

jest.mock('../../services/categories.service');

describe('PostsCommentsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      query: {},
    };
    mockResponse = {
      send: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('create', () => {
    it('should return validation error if dto is invalid', async () => {
      const dto = new PostsCommentsDto({} as IPostsComments);
      dto.validate = jest
        .fn()
        .mockReturnValue({ error: 'Some error', value: null });
      mockRequest.body = dto;
      mockRequest.params = { id: '1' };

      await postsCommentsController.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toBeCalledWith('Some error');
    });

    // ...more tests...
  });

  describe('getCommentsPost', () => {
    it('should call postsCommentsService.getPostComments with correct params and return result', async () => {
      const mockCommentsData = {
        totalCount: 100,
        count: 10,
        comments: [{ id: 1, content: 'Comment 1' }],
      };
      mockRequest.query = { page: '1', per_page: '10' };
      mockRequest.params = { id: '1' };
      PostsCommentsService.getPostComments = jest
        .fn()
        .mockResolvedValue(mockCommentsData);

      await postsCommentsController.getCommentsPost(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(PostsCommentsService.getPostComments).toBeCalledWith(
        { id: '1' },
        { page: 1, perPage: 10 },
      );
      expect(mockResponse.send).toBeCalledWith(
        expect.objectContaining({ comments: mockCommentsData.comments }),
      );
    });

    // ...more tests...
  });

  describe('delete', () => {
    it('should call postsCommentsService.delete with correct params and return result', async () => {
      const mockComment = { id: 1, content: 'Comment 1' };
      mockRequest.params = { id: '1', cid: '1' };
      PostsCommentsService.delete = jest.fn().mockResolvedValue(mockComment);

      await postsCommentsController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(PostsCommentsService.delete).toBeCalledWith({
        postId: 1,
        commentId: 1,
      });
      expect(mockResponse.send).toBeCalledWith(mockComment);
    });

    // ...more tests...
  });
});
