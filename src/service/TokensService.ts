import jwt from 'jsonwebtoken';
import { QueryResult } from 'pg';

import db from '../db';
import type UserDto from '../dtos/UserDto';

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
    const query = `INSERT INTO ${tableName} (refresh_token, fk_user_id)
                        VALUES ($1, $2)
                     RETURNING refresh_token, fk_user_id
    `;
    const { rows }: QueryResult<TokenRow> = await db.query(query, [
      refreshToken,
      userId,
    ]);

    return TokensService.convertCase(rows[0]);
  }

  static async getById({ userId }: { userId: number }): Promise<Token | null> {
    const query = `SELECT * FROM ${tableName}
                    WHERE fk_user_id = $1
    `;
    const { rows }: QueryResult<TokenRow> = await db.query(query, [userId]);
    if (rows.length === 0) {
      return null;
    }

    return TokensService.convertCase(rows[0]);
  }

  static async getOne({
    refreshToken,
  }: {
    refreshToken: string;
  }): Promise<Token | null> {
    const query = `SELECT * FROM ${tableName}
                    WHERE refresh_token = $1
    `;
    const { rows }: QueryResult<TokenRow> = await db.query(query, [
      refreshToken,
    ]);
    if (rows.length === 0) {
      return null;
    }

    return TokensService.convertCase(rows[0]);
  }

  static async update({
    userId,
    refreshToken,
  }: {
    refreshToken: string;
    userId: number;
  }) {
    const query = `UPDATE ${tableName}
                      SET refresh_token = $1
                    WHERE fk_user_id = $2
                RETURNING refresh_token, fk_user_id`;
    const { rows }: QueryResult<TokenRow> = await db.query(query, [
      refreshToken,
      userId,
    ]);

    return TokensService.convertCase(rows[0]);
  }

  static async delete({ refreshToken }: { refreshToken: string }) {
    const query = `DELETE ${tableName}
                    WHERE refresh_token = $1
                RETURNING refresh_token, fk_user_id`;

    const { rows }: QueryResult<TokenRow> = await db.query(query, [
      refreshToken,
    ]);

    return TokensService.convertCase(rows[0]);
  }

  static convertCase(token: TokenRow): Token {
    return {
      refreshToken: token.refresh_token,
      userId: token.fk_user_id,
    };
  }
}

export default TokensService;
