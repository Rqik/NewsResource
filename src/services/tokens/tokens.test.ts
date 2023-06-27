import prisma from '@/client';

import TokensService from './tokens.service';

jest.mock('@/client');
jest.mock('jsonwebtoken');

describe('TokensService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const mockPayload = { userId: 1, username: 'testuser' };
      const mockAccessToken = 'mockAccessToken';
      const mockRefreshToken = 'mockRefreshToken';

      jest
        .spyOn(TokensService.jwt, 'sign')
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = TokensService.generateTokens(mockPayload);

      expect(TokensService.jwt.sign).toHaveBeenNthCalledWith(
        1,
        mockPayload,
        TokensService.config.jwtAccessSecret,
        { expiresIn: TokensService.config.jwtAccessExpireIn },
      );
      expect(TokensService.jwt.sign).toHaveBeenNthCalledWith(
        2,
        mockPayload,
        TokensService.config.jwtRefreshSecret,
        { expiresIn: TokensService.config.jwtRefreshExpireIn },
      );
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });
  });

  describe('validateAccess', () => {
    it('should validate the access token', () => {
      const mockToken = 'mockAccessToken';
      const mockPayload = { userId: 1, username: 'testuser' };

      jest.spyOn(TokensService.jwt, 'verify').mockReturnValueOnce(mockPayload);

      const result = TokensService.validateAccess(mockToken);

      expect(TokensService.jwt.verify).toHaveBeenCalledWith(
        mockToken,
        TokensService.config.jwtAccessSecret,
      );
      expect(result).toEqual(mockPayload);
    });

    it('should return null if the access token is invalid', () => {
      const mockToken = 'invalidToken';

      jest.spyOn(TokensService.jwt, 'verify').mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const result = TokensService.validateAccess(mockToken);

      expect(TokensService.jwt.verify).toHaveBeenCalledWith(
        mockToken,
        TokensService.config.jwtAccessSecret,
      );
      expect(result).toBeNull();
    });
  });

  describe('validateRefresh', () => {
    it('should validate the refresh token', () => {
      const mockToken = 'mockRefreshToken';
      const mockPayload = { userId: 1, username: 'testuser' };

      jest.spyOn(TokensService.jwt, 'verify').mockReturnValueOnce(mockPayload);

      const result = TokensService.validateRefresh(mockToken);

      expect(TokensService.jwt.verify).toHaveBeenCalledWith(
        mockToken,
        TokensService.config.jwtRefreshSecret,
      );
      expect(result).toEqual(mockPayload);
    });

    it('should return null if the refresh token is invalid', () => {
      const mockToken = 'invalidToken';

      jest.spyOn(TokensService.jwt, 'verify').mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const result = TokensService.validateRefresh(mockToken);

      expect(TokensService.jwt.verify).toHaveBeenCalledWith(
        mockToken,
        TokensService.config.jwtRefreshSecret,
      );
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const mockToken: TokenRow = {
      refresh_token: 'mockRefreshToken',
      fk_user_id: 1,
    };

    beforeEach(() => {
      prisma.token.create.mockResolvedValue(mockToken);
      prisma.token.findFirst.mockResolvedValue(null);
      prisma.token.update.mockResolvedValue(mockToken);
    });

    it('should create a new token if it does not exist for the user', async () => {
      const mockRefreshToken = 'newRefreshToken';
      const mockUserId = 1;

      const result = await TokensService.create({
        refreshToken: mockRefreshToken,
        userId: mockUserId,
      });

      expect(prisma.token.create).toHaveBeenCalledWith({
        data: {
          refresh_token: mockRefreshToken,
          fk_user_id: mockUserId,
        },
      });
      expect(result).toEqual({
        refreshToken: mockToken.refresh_token,
        userId: mockToken.fk_user_id,
      });
    });

    it('should update the existing token if it exists for the user', async () => {
      const mockRefreshToken = 'updatedRefreshToken';
      const mockUserId = 1;

      prisma.token.findFirst.mockResolvedValue(mockToken);

      const result = await TokensService.create({
        refreshToken: mockRefreshToken,
        userId: mockUserId,
      });

      expect(prisma.token.update).toHaveBeenCalledWith({
        where: {
          fk_user_id: mockUserId,
        },
        data: {
          refresh_token: mockRefreshToken,
        },
      });
      expect(result).toEqual({
        refreshToken: mockToken.refresh_token,
        userId: mockToken.fk_user_id,
      });
    });
  });

  describe('getById', () => {
    const mockToken: TokenRow = {
      refresh_token: 'mockRefreshToken',
      fk_user_id: 1,
    };

    beforeEach(() => {
      prisma.token.findFirst.mockResolvedValue(mockToken);
    });

    it('should get a token by user ID', async () => {
      const mockUserId = 1;

      const result = await TokensService.getById({ userId: mockUserId });

      expect(prisma.token.findFirst).toHaveBeenCalledWith({
        where: {
          fk_user_id: mockUserId,
        },
      });
      expect(result).toEqual({
        refreshToken: mockToken.refresh_token,
        userId: mockToken.fk_user_id,
      });
    });

    it('should return null if the token does not exist', async () => {
      const mockUserId = 2;

      const result = await TokensService.getById({ userId: mockUserId });

      expect(prisma.token.findFirst).toHaveBeenCalledWith({
        where: {
          fk_user_id: mockUserId,
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('getOne', () => {
    const mockToken: TokenRow = {
      refresh_token: 'mockRefreshToken',
      fk_user_id: 1,
    };

    beforeEach(() => {
      prisma.token.findUnique.mockResolvedValue(mockToken);
    });

    it('should get a token by refresh token', async () => {
      const mockRefreshToken = 'mockRefreshToken';

      const result = await TokensService.getOne({
        refreshToken: mockRefreshToken,
      });

      expect(prisma.token.findUnique).toHaveBeenCalledWith({
        where: {
          refresh_token: mockRefreshToken,
        },
      });
      expect(result).toEqual({
        refreshToken: mockToken.refresh_token,
        userId: mockToken.fk_user_id,
      });
    });

    it('should return null if the token does not exist', async () => {
      const mockRefreshToken = 'invalidToken';

      const result = await TokensService.getOne({
        refreshToken: mockRefreshToken,
      });

      expect(prisma.token.findUnique).toHaveBeenCalledWith({
        where: {
          refresh_token: mockRefreshToken,
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const mockToken: TokenRow = {
      refresh_token: 'mockRefreshToken',
      fk_user_id: 1,
    };

    beforeEach(() => {
      prisma.token.update.mockResolvedValue(mockToken);
    });

    it('should update the refresh token for a user', async () => {
      const mockRefreshToken = 'updatedRefreshToken';
      const mockUserId = 1;

      const result = await TokensService.update({
        refreshToken: mockRefreshToken,
        userId: mockUserId,
      });

      expect(prisma.token.update).toHaveBeenCalledWith({
        where: {
          fk_user_id: mockUserId,
        },
        data: {
          refresh_token: mockRefreshToken,
        },
      });
      expect(result).toEqual({
        refreshToken: mockToken.refresh_token,
        userId: mockToken.fk_user_id,
      });
    });
  });

  describe('delete', () => {
    const mockToken: TokenRow = {
      refresh_token: 'mockRefreshToken',
      fk_user_id: 1,
    };

    beforeEach(() => {
      prisma.token.delete.mockResolvedValue(mockToken);
    });

    it('should delete a token by refresh token', async () => {
      const mockRefreshToken = 'mockRefreshToken';

      const result = await TokensService.delete({
        refreshToken: mockRefreshToken,
      });

      expect(prisma.token.delete).toHaveBeenCalledWith({
        where: {
          refresh_token: mockRefreshToken,
        },
      });
      expect(result).toEqual({
        refreshToken: mockToken.refresh_token,
        userId: mockToken.fk_user_id,
      });
    });
  });
});
