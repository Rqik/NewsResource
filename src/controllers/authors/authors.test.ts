import { NextFunction, Response } from 'express';

import { AuthorsService } from '@/services';

import authorsController from './authors.controller';
import type { IAuthor } from './authors.dto';
import AuthorsDto from './authors.dto';

jest.mock('@/services/AuthorsService');

describe('authorsController', () => {
  let mockRequest: any;
  let mockResponse: any;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return validation error if dto is invalid', async () => {
      const dto = new AuthorsDto({} as IAuthor);
      dto.validate = jest
        .fn()
        .mockReturnValue({ error: 'Some error', value: null });
      mockRequest.body = dto;

      await authorsController.create(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toBeCalledWith('Some error');
    });

    it('should call authorsService.create with correct params and return result', async () => {
      const dto = new AuthorsDto({
        userId: 2,
        description: 'John is an author',
      } as IAuthor);
      dto.validate = jest.fn().mockReturnValue({ error: null, value: dto });
      mockRequest.body = dto;
      const mockAuthor = {
        id: '1',
        name: 'John',
        biography: 'John is an author',
      };
      AuthorsService.create = jest.fn().mockResolvedValue(mockAuthor);

      await authorsController.create(mockRequest, mockResponse, nextFunction);

      expect(AuthorsService.create).toBeCalledWith(dto);
      expect(mockResponse.send).toBeCalledWith(mockAuthor);
    });
  });

  describe('update', () => {
    it('should return validation error if dto is invalid', async () => {
      const dto = new AuthorsDto({} as IAuthor);
      dto.validate = jest
        .fn()
        .mockReturnValue({ error: 'Some error', value: null });
      mockRequest.params = { id: '1' };
      mockRequest.body = dto;

      await authorsController.update(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toBeCalledWith('Some error');
    });

    it('should call authorsService.update with correct params and return result', async () => {
      const dto = new AuthorsDto({
        userId: 2,
        description: 'John is an author',
      } as IAuthor);
      dto.validate = jest.fn().mockReturnValue({ error: null, value: dto });
      mockRequest.params = { id: '1' };
      mockRequest.body = dto;
      const mockAuthor = {
        id: '1',
        name: 'John Updated',
        biography: 'John is an author',
      };
      AuthorsService.update = jest.fn().mockResolvedValue(mockAuthor);

      await authorsController.update(mockRequest, mockResponse, nextFunction);

      expect(AuthorsService.update).toBeCalledWith({ ...dto, id: '1' });
      expect(mockResponse.send).toBeCalledWith(mockAuthor);
    });
  });

  describe('getAll', () => {
    it('should call authorsService.getAll with correct params and return result', async () => {
      const mockAuthorsData = {
        totalCount: 100,
        count: 10,
        authors: [{ id: '1', name: 'John', biography: 'John is an author' }],
      };
      mockRequest.query = { page: '1', per_page: '10' };
      AuthorsService.getAll = jest.fn().mockResolvedValue(mockAuthorsData);

      await authorsController.getAll(mockRequest, mockResponse);

      expect(AuthorsService.getAll).toBeCalledWith({ page: 1, perPage: 10 });
      expect(mockResponse.send).toBeCalledWith(
        expect.objectContaining({ data: mockAuthorsData.authors }),
      );
    });
  });

  describe('getOne', () => {
    it('should call authorsService.getOne with correct params and return result', async () => {
      const mockAuthor = {
        id: '1',
        name: 'John',
        biography: 'John is an author',
      };
      mockRequest.params = { id: '1' };
      AuthorsService.getOne = jest.fn().mockResolvedValue(mockAuthor);

      await authorsController.getOne(mockRequest, mockResponse);

      expect(AuthorsService.getOne).toBeCalledWith({ id: '1' });
      expect(mockResponse.send).toBeCalledWith(mockAuthor);
    });
  });

  describe('delete', () => {
    it('should call authorsService.delete with correct params and return result', async () => {
      const mockResult = { deleted: true };
      mockRequest.params = { id: '1' };
      AuthorsService.delete = jest.fn().mockResolvedValue(mockResult);

      await authorsController.delete(mockRequest, mockResponse);

      expect(AuthorsService.delete).toBeCalledWith({ id: '1' });
      expect(mockResponse.send).toBeCalledWith(mockResult);
    });
  });
});
