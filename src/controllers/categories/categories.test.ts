import { NextFunction, Request, Response } from 'express';
import { mocked } from 'ts-jest/utils';

import { CategoriesService } from '@/services';

import categoriesController from './categories.controller';
import CategoriesDto, { ICategory } from './categories.dto';

jest.mock('../../services/categories.service');

describe('CategoriesController', () => {
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
      const dto = new CategoriesDto({} as ICategory);
      dto.validate = jest
        .fn()
        .mockReturnValue({ error: 'Some error', value: null });
      mockRequest.body = dto;

      await categoriesController.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toBeCalledWith('Some error');
    });

    it('should call categoriesService.create with correct params and return result', async () => {
      const dto = new CategoriesDto({
        category: 1,
        description: 'test',
      });
      dto.validate = jest.fn().mockReturnValue({ error: null, value: dto });
      mockRequest.body = dto;
      const mockCategory = { id: 1, name: 'Category 1' };
      CategoriesService.create = jest.fn().mockResolvedValue(mockCategory);

      await categoriesController.create(
        mockRequest,
        mockResponse,
        nextFunction,
      );

      expect(CategoriesService.create).toBeCalledWith(dto);
      expect(mockResponse.send).toBeCalledWith(mockCategory);
    });
  });

  describe('update', () => {
    it('should return validation error if dto is invalid', async () => {
      const dto = new CategoriesDto({} as ICategory);
      dto.validate = jest
        .fn()
        .mockReturnValue({ error: 'Some error', value: null });
      mockRequest.params = { id: '1' };
      mockRequest.body = dto;

      await categoriesController.update(
        mockRequest,
        mockResponse,
        nextFunction,
      );

      expect(nextFunction).toBeCalledWith('Some error');
    });

    it('should call categoriesService.update with correct params and return result', async () => {
      const dto = new CategoriesDto({
        category: 1,
        description: 'Updated Category',
      });
      dto.validate = jest.fn().mockReturnValue({ error: null, value: dto });
      mockRequest.params = { id: '1' };
      mockRequest.body = dto;
      const mockCategory = { id: 1, name: 'Updated Category' };
      CategoriesService.update = jest.fn().mockResolvedValue(mockCategory);

      await categoriesController.update(
        mockRequest,
        mockResponse,
        nextFunction,
      );

      expect(CategoriesService.update).toBeCalledWith({
        ...dto,
        id: Number('1'),
      });
      expect(mockResponse.send).toBeCalledWith(mockCategory);
    });
  });

  describe('getAll', () => {
    it('should call categoriesService.getAll with correct params and return result', async () => {
      const mockCategoriesData = {
        totalCount: 100,
        count: 10,
        categories: [{ id: 1, name: 'Category 1' }],
      };
      mockRequest.query = { page: '1', per_page: '10' };
      CategoriesService.getAll = jest
        .fn()
        .mockResolvedValue(mockCategoriesData);

      await categoriesController.getAll(mockRequest, mockResponse);

      expect(CategoriesService.getAll).toBeCalledWith({ page: 1, perPage: 10 });
      expect(mockResponse.send).toBeCalledWith(
        expect.objectContaining({ data: mockCategoriesData.categories }),
      );
    });
  });

  describe('getOne', () => {
    it('should call categoriesService.getOne with correct params and return result', async () => {
      const mockCategory = { id: 1, name: 'Category 1' };
      mockRequest.params = { id: '1' };
      CategoriesService.getOne = jest.fn().mockResolvedValue(mockCategory);

      await categoriesController.getOne(mockRequest, mockResponse);

      expect(CategoriesService.getOne).toBeCalledWith({ id: Number('1') });
      expect(mockResponse.send).toBeCalledWith(mockCategory);
    });
  });

  describe('delete', () => {
    it('should call categoriesService.delete with correct params and return result', async () => {
      const mockCategory = { id: 1, name: 'Category 1' };
      mockRequest.params = { id: '1' };
      CategoriesService.delete = jest.fn().mockResolvedValue(mockCategory);

      await categoriesController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(CategoriesService.delete).toBeCalledWith({ id: Number('1') });
      expect(mockResponse.send).toBeCalledWith(mockCategory);
    });
  });
});
