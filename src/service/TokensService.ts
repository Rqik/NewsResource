import jwt from 'jsonwebtoken';

import type UserDto from '../dtos/UserDto';
import prisma from '../prisma';

const tableName = 'tokens';

type TokenRow = {
  refresh_token: string;
  fk_user_id: number;
};

type Token = {
  refreshToken: string;
  userId: number;
};

class TokensService {
  static generateTokens(payload: UserDto) {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET as string,
      {
        expiresIn: '30m',
      },
    );
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: '30d',
      },
    );

    return { accessToken, refreshToken };
  }

  static validateAccess(token: string) {
    try {
      const userData = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string,
      );

      return userData;
    } catch (error) {
      return null;
    }
  }

  static validateRefresh(token: string) {
    try {
      const userData = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET as string,
      );

      return userData;
    } catch (error) {
      return null;
    }
  }

  static async create({
    userId,
    refreshToken,
  }: {
    refreshToken: string;
    userId: number;
  }): Promise<Token> {
    const tokenData = await TokensService.getById({ userId });
    // TODO:fix это не работает как надо. если вызвать увидишь ошибку
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      const tkn = await TokensService.update(tokenData);

      return tkn;
    }

    const token = await prisma.token.create({
      data: {
        refresh_token: refreshToken,
        fk_user_id: userId,
      },
    });

    return TokensService.convertCase(token);
  }

  static async getById({ userId }: { userId: number }): Promise<Token | null> {
    const token = await prisma.token.findFirst({
      where: {
        fk_user_id: userId,
      },
    });

    if (token === null) {
      return null;
    }

    return TokensService.convertCase(token);
  }

  static async getOne({
    refreshToken,
  }: {
    refreshToken: string;
  }): Promise<Token | null> {
    const token = await prisma.token.findUnique({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (token === null) {
      return null;
    }

    return TokensService.convertCase(token);
  }

  static async update({
    userId,
    refreshToken,
  }: {
    refreshToken: string;
    userId: number;
  }) {
    const token = await prisma.token.update({
      where: {
        fk_user_id: userId,
      },
      data: {
        refresh_token: refreshToken,
      },
    });

    return TokensService.convertCase(token);
  }

  static async delete({ refreshToken }: { refreshToken: string }) {
    const token = await prisma.token.delete({
      where: {
        refresh_token: refreshToken,
      },
    });

    return TokensService.convertCase(token);
  }

  static convertCase(token: TokenRow): Token {
    return {
      refreshToken: token.refresh_token,
      userId: token.fk_user_id,
    };
  }
}

export default TokensService;
