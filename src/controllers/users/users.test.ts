import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

import config from '@/config';
import { ApiError } from '@/exceptions';
import { FileService, TokensService, UsersService } from '@/services';
import getAuthorizationToken from '@/shared/get-authorization-token';
import paginator from '@/shared/paginator';

import UserDto, { IUser } from './users.dto';
import UsersController from './UsersController';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let tokensService: TokensService;
  let fileService: FileService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    usersService = new UsersService();
    tokensService = new TokensService();
    fileService = new FileService();
    usersController = new UsersController(
      fileService,
      tokensService,
      usersService,
    );
    mockRequest = {};
    mockResponse = {
      send: jest.fn(),
      cookie: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const registrationResult = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        email: 'johndoe@example.com',
      };
      const userDto = new UserDto({
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      });
      userDto.validate = jest
        .fn()
        .mockReturnValue({ error: null, value: registrationResult });
      usersService.registration = jest
        .fn()
        .mockResolvedValue(registrationResult);
      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      };
      mockRequest.files = {
        avatar: 'avatar.jpg',
      };

      await usersController.create(
        mockRequest as RequestWithBody<IUser>,
        mockResponse as Response,
        nextFunction,
      );

      expect(userDto.validate).toBeCalled();
      expect(usersService.registration).toBeCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      });
      expect(fileService.saveAvatar).toBeCalledWith('avatar.jpg');
      expect(mockResponse.cookie).toBeCalledWith(
        'refreshToken',
        expect.any(String),
        {
          maxAge: expect.any(Number),
          httpOnly: true,
        },
      );
      expect(mockResponse.send).toBeCalledWith({ result: registrationResult });
    });

    it('should call next function with validation error', async () => {
      const validationError = new Error('Validation error');
      const userDto = new UserDto({
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      });
      userDto.validate = jest
        .fn()
        .mockReturnValue({ error: validationError, value: null });
      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      };

      await usersController.create(
        mockRequest as RequestWithBody<IUser>,
        mockResponse as Response,
        nextFunction,
      );

      expect(userDto.validate).toBeCalled();
      expect(nextFunction).toBeCalledWith(validationError);
      expect(mockResponse.send).not.toBeCalled();
    });

    it('should call next function with avatar saving error', async () => {
      const avatarError = new ApiError('Avatar saving error');
      const userDto = new UserDto({
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      });
      userDto.validate = jest
        .fn()
        .mockReturnValue({ error: null, value: userDto });
      usersService.registration = jest.fn().mockResolvedValue(userDto);
      fileService.saveAvatar = jest.fn().mockReturnValue(avatarError);
      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      };
      mockRequest.files = {
        avatar: 'avatar.jpg',
      };

      await usersController.create(
        mockRequest as RequestWithBody<IUser>,
        mockResponse as Response,
        nextFunction,
      );

      expect(userDto.validate).toBeCalled();
      expect(usersService.registration).toBeCalled();
      expect(fileService.saveAvatar).toBeCalled();
      expect(nextFunction).toBeCalledWith(avatarError);
      expect(mockResponse.send).not.toBeCalled();
    });

    it('should call next function with registration error', async () => {
      const registrationError = new ApiError('Registration error');
      const userDto = new UserDto({
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      });
      userDto.validate = jest
        .fn()
        .mockReturnValue({ error: null, value: userDto });
      usersService.registration = jest
        .fn()
        .mockResolvedValue(registrationError);
      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      };
      mockRequest.files = {
        avatar: 'avatar.jpg',
      };

      await usersController.create(
        mockRequest as RequestWithBody<IUser>,
        mockResponse as Response,
        nextFunction,
      );

      expect(userDto.validate).toBeCalled();
      expect(usersService.registration).toBeCalled();
      expect(mockResponse.send).not.toBeCalled();
      expect(nextFunction).toBeCalledWith(registrationError);
    });
  });

  describe('update', () => {
    it('should update the specified user', async () => {
      const updateResult = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        email: 'johndoe@example.com',
      };
      const userDto = new UserDto({
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      });
      userDto.validate = jest
        .fn()
        .mockReturnValue({ error: null, value: updateResult });
      usersService.update = jest.fn().mockResolvedValue(updateResult);
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      };

      await usersController.update(
        mockRequest as RequestWithParamsAndBody<{ id: string }, IUser>,
        mockResponse as Response,
        nextFunction,
      );

      expect(userDto.validate).toBeCalled();
      expect(usersService.update).toBeCalledWith({ ...updateResult, id: '1' });
      expect(mockResponse.send).toBeCalledWith(updateResult);
    });

    it('should call next function with validation error', async () => {
      const validationError = new Error('Validation error');
      const userDto = new UserDto({
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      });
      userDto.validate = jest
        .fn()
        .mockReturnValue({ error: validationError, value: null });
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      };

      await usersController.update(
        mockRequest as RequestWithParamsAndBody<{ id: string }, IUser>,
        mockResponse as Response,
        nextFunction,
      );

      expect(userDto.validate).toBeCalled();
      expect(nextFunction).toBeCalledWith(validationError);
      expect(mockResponse.send).not.toBeCalled();
    });
  });

  describe('partialUpdate', () => {
    it('should partially update the specified user', async () => {
      const partialUpdateResult = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        email: 'johndoe@example.com',
      };
      const userDto = new UserDto({
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'password',
        email: 'johndoe@example.com',
      });
      userDto.validate = jest
        .fn()
        .mockReturnValue({ error: null, value: userDto });
      usersService.partialUpdate = jest
        .fn()
        .mockResolvedValue(partialUpdateResult);
      mockRequest.params = { login: 'johndoe' };
      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
      };

      await usersController.partialUpdate(
        mockRequest as RequestWithParamsAndBody<
          { login: string },
          Partial<IUser>
        >,
        mockResponse as Response,
      );

      expect(userDto.validate).toBeCalled();
      expect(usersService.partialUpdate).toBeCalledWith({
        login: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(mockResponse.send).toBeCalledWith(partialUpdateResult);
    });
  });

  describe('getAll', () => {
    it('should get all users with pagination', async () => {
      const getUsersResult = {
        totalCount: 100,
        users: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            login: 'johndoe',
            email: 'johndoe@example.com',
          },
        ],
        count: 1,
      };
      usersService.getAll = jest.fn().mockResolvedValue(getUsersResult);
      mockRequest.query = { per_page: '20', page: '0' };

      await usersController.getAll(
        mockRequest as RequestWithQuery<{ per_page: string; page: string }>,
        mockResponse as Response,
      );

      expect(usersService.getAll).toBeCalledWith({ page: 0, perPage: 20 });
      expect(paginator).toBeCalledWith({
        totalCount: 100,
        count: 1,
        req: mockRequest,
        route: '/users',
        page: 0,
        perPage: 20,
      });
      expect(mockResponse.send).toBeCalledWith({
        ...paginatorResult,
        data: getUsersResult.users,
      });
    });
  });

  describe('getOne', () => {
    it('should get the specified user', async () => {
      const getUserResult = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        email: 'johndoe@example.com',
      };
      usersService.getOne = jest.fn().mockResolvedValue(getUserResult);
      mockRequest.params = { login: 'johndoe' };

      await usersController.getOne(
        mockRequest as RequestWithParams<{ login: string }>,
        mockResponse as Response,
        nextFunction,
      );

      expect(usersService.getOne).toBeCalledWith({ login: 'johndoe' });
      expect(mockResponse.send).toBeCalledWith(getUserResult);
      expect(nextFunction).not.toBeCalled();
    });

    it('should call next function with error if user is not found', async () => {
      usersService.getOne = jest.fn().mockResolvedValue(null);
      mockRequest.params = { login: 'johndoe' };

      await usersController.getOne(
        mockRequest as RequestWithParams<{ login: string }>,
        mockResponse as Response,
        nextFunction,
      );

      expect(usersService.getOne).toBeCalledWith({ login: 'johndoe' });
      expect(mockResponse.send).not.toBeCalled();
      expect(nextFunction).toBeCalledWith(
        ApiError.BadRequest('User johndoe not found'),
      );
    });
  });

  describe('getCurrentAuth', () => {
    it('should get the current authenticated user', async () => {
      const accessToken = 'accessToken';
      const tokenData: JwtPayload = { id: '1' };
      const getCurrentUserResult = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        email: 'johndoe@example.com',
      };
      getAuthorizationToken = jest.fn().mockReturnValue(accessToken);
      tokensService.validateAccess = jest.fn().mockReturnValue(tokenData);
      usersService.getById = jest.fn().mockResolvedValue(getCurrentUserResult);
      mockRequest.params = { login: 'johndoe' };

      await usersController.getCurrentAuth(
        mockRequest as RequestWithParams<{ login: string }>,
        mockResponse as Response,
        nextFunction,
      );

      expect(getAuthorizationToken).toBeCalledWith(mockRequest);
      expect(tokensService.validateAccess).toBeCalledWith(accessToken);
      expect(usersService.getById).toBeCalledWith({ id: '1' });
      expect(mockResponse.send).toBeCalledWith(getCurrentUserResult);
      expect(nextFunction).not.toBeCalled();
    });

    it('should call next function with error if access token is invalid', async () => {
      const accessToken = 'invalidAccessToken';
      getAuthorizationToken = jest.fn().mockReturnValue(accessToken);
      tokensService.validateAccess = jest.fn().mockReturnValue(null);

      await usersController.getCurrentAuth(
        mockRequest as RequestWithParams<{ login: string }>,
        mockResponse as Response,
        nextFunction,
      );

      expect(getAuthorizationToken).toBeCalledWith(mockRequest);
      expect(tokensService.validateAccess).toBeCalledWith(accessToken);
      expect(mockResponse.send).not.toBeCalled();
      expect(nextFunction).toBeCalledWith(
        ApiError.BadRequest('Invalid Authorization token'),
      );
    });

    it('should call next function with error if user is not found', async () => {
      const accessToken = 'accessToken';
      const tokenData: JwtPayload = { id: '1' };
      getAuthorizationToken = jest.fn().mockReturnValue(accessToken);
      tokensService.validateAccess = jest.fn().mockReturnValue(tokenData);
      usersService.getById = jest.fn().mockResolvedValue(null);

      await usersController.getCurrentAuth(
        mockRequest as RequestWithParams<{ login: string }>,
        mockResponse as Response,
        nextFunction,
      );

      expect(getAuthorizationToken).toBeCalledWith(mockRequest);
      expect(tokensService.validateAccess).toBeCalledWith(accessToken);
      expect(usersService.getById).toBeCalledWith({ id: '1' });
      expect(mockResponse.send).not.toBeCalled();
      expect(nextFunction).toBeCalledWith(
        ApiError.BadRequest('User 1 not found'),
      );
    });
  });

  describe('delete', () => {
    it('should delete the specified user', async () => {
      const deleteUserResult = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        email: 'johndoe@example.com',
      };
      usersService.delete = jest.fn().mockResolvedValue(deleteUserResult);
      mockRequest.params = { id: '1' };

      await usersController.delete(
        mockRequest as RequestWithParams<{ id: string }>,
        mockResponse as Response,
      );

      expect(usersService.delete).toBeCalledWith({ id: '1' });
      expect(mockResponse.send).toBeCalledWith(deleteUserResult);
    });
  });
});
