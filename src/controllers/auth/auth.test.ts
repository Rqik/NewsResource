import { NextFunction } from 'express';

import ApiError from '@/exceptions/ApiError';
import { UsersService } from '@/services';

import authController from './auth.controller';
import type { IAuth } from './auth.dto';
import AuthDto from './auth.dto';

jest.mock('@/services/UsersService');

describe('authController', () => {
  let mockRequest: any;
  let mockResponse: any;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return validation error if dto is invalid', async () => {
      const dto = new AuthDto({} as IAuth);
      dto.validate = jest
        .fn()
        .mockReturnValue({ error: 'Some error', value: null });
      mockRequest.body = dto;

      await authController.login(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toBeCalledWith(expect.any(ApiError));
    });

    it('should return error if login fails', async () => {
      const dto = new AuthDto({
        login: 'test',
        password: 'test',
      } as IAuth);
      dto.validate = jest.fn().mockReturnValue({ error: null, value: dto });
      mockRequest.body = dto;
      UsersService.login = jest.fn().mockResolvedValue(ApiError.BadRequest(''));

      await authController.login(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toBeCalledWith(expect.any(ApiError));
    });

    it('should return user data and set cookie if login is successful', async () => {
      const dto = new AuthDto({
        password: 'test',
        login: 'test',
      } as IAuth);
      dto.validate = jest.fn().mockReturnValue({ error: null, value: dto });
      mockRequest.body = dto;
      const mockUserData = {
        refreshToken: 'refreshToken',
        otherData: 'otherData',
      };
      UsersService.login = jest.fn().mockResolvedValue(mockUserData);

      await authController.login(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.cookie).toBeCalledWith(
        'refreshToken',
        mockUserData.refreshToken,
        expect.any(Object),
      );
      expect(mockResponse.json).toBeCalledWith(mockUserData);
    });
  });

  describe('logout', () => {
    it('should clear refreshToken cookie and return a response', async () => {
      const mockToken = 'token';
      UsersService.logout = jest.fn().mockResolvedValue(mockToken);
      mockRequest.cookies = { refreshToken: 'refreshToken' };

      await authController.logout(mockRequest, mockResponse);

      expect(mockResponse.clearCookie).toBeCalledWith('refreshToken');
      expect(mockResponse.json).toBeCalledWith(mockToken);
    });
  });

  describe('activate', () => {
    it('should call UsersService.activate with correct link and redirect to clientUrl', async () => {
      const mockLink = 'activationLink';
      mockRequest.params = { link: mockLink };
      UsersService.activate = jest.fn().mockResolvedValue(undefined);

      await authController.activate(mockRequest, mockResponse);

      expect(UsersService.activate).toBeCalledWith(mockLink);
      expect(mockResponse.redirect).toBeCalled();
    });
  });

  describe('refresh', () => {
    it('should return error if refreshToken is invalid', async () => {
      mockRequest.cookies = { refreshToken: 'invalidToken' };
      UsersService.refresh = jest
        .fn()
        .mockResolvedValue(ApiError.UnauthorizeError());

      await authController.refresh(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toBeCalledWith(expect.any(ApiError));
    });

    it('should return user data and set cookie if refreshToken is valid', async () => {
      mockRequest.cookies = { refreshToken: 'validToken' };
      const mockUserData = {
        refreshToken: 'newRefreshToken',
        otherData: 'otherData',
      };
      UsersService.refresh = jest.fn().mockResolvedValue(mockUserData);

      await authController.refresh(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.cookie).toBeCalledWith(
        'refreshToken',
        mockUserData.refreshToken,
        expect.any(Object),
      );
      expect(mockResponse.json).toBeCalledWith(mockUserData);
    });
  });
});
