import { boundClass } from 'autobind-decorator';
import jsonwebtoken from 'jsonwebtoken';

import prisma from '@/client';
import config from '@/config';
import type UserDto from '@/dtos/UserDto';

type TokenRow = {
  refresh_token: string;
  fk_user_id: number;
};

type Token = {
  refreshToken: string;
  userId: number;
};
@boundClass
class TokensService {
  constructor(
    private prismaClient: typeof prisma,
    private jwt: typeof jsonwebtoken,
  ) {}

  generateTokens(payload: UserDto) {
    const accessToken = this.jwt.sign(payload, config.jwtAccessSecret, {
      expiresIn: '30m',
    });
    const refreshToken = this.jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  validateAccess(token: string) {
    try {
      const userData = this.jwt.verify(token, config.jwtAccessSecret as string);

      return userData;
    } catch (error) {
      return null;
    }
  }

  validateRefresh(token: string) {
    try {
      const userData = this.jwt.verify(token, config.jwtRefreshSecret);

      return userData;
    } catch (error) {
      return null;
    }
  }

  async create({
    userId,
    refreshToken,
  }: {
    refreshToken: string;
    userId: number;
  }): Promise<Token> {
    const tokenData = await this.getById({ userId });
    // TODO:fix это не работает как надо. если вызвать увидишь ошибку
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      const tkn = await this.update(tokenData);

      return tkn;
    }

    const token = await this.prismaClient.token.create({
      data: {
        refresh_token: refreshToken,
        fk_user_id: userId,
      },
    });

    return this.convertCase(token);
  }

  async getById({ userId }: { userId: number }): Promise<Token | null> {
    const token = await this.prismaClient.token.findFirst({
      where: {
        fk_user_id: userId,
      },
    });

    if (token === null) {
      return null;
    }

    return this.convertCase(token);
  }

  async getOne({
    refreshToken,
  }: {
    refreshToken: string;
  }): Promise<Token | null> {
    const token = await this.prismaClient.token.findUnique({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (token === null) {
      return null;
    }

    return this.convertCase(token);
  }

  async update({
    userId,
    refreshToken,
  }: {
    refreshToken: string;
    userId: number;
  }) {
    const token = await this.prismaClient.token.update({
      where: {
        fk_user_id: userId,
      },
      data: {
        refresh_token: refreshToken,
      },
    });

    return this.convertCase(token);
  }

  async delete({ refreshToken }: { refreshToken: string }) {
    const token = await this.prismaClient.token.delete({
      where: {
        refresh_token: refreshToken,
      },
    });

    return this.convertCase(token);
  }

  // eslint-disable-next-line class-methods-use-this
  convertCase(token: TokenRow): Token {
    return {
      refreshToken: token.refresh_token,
      userId: token.fk_user_id,
    };
  }
}

export default new TokensService(prisma, jsonwebtoken);
