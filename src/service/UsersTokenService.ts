import { QueryResult } from 'pg';
import db from '../db';

const tableName = 'users_tokens';

type UsersTokenRow = {
  access_token: string;
  refresh_token: string;
  fk_user_id: number;
};
type UserToken = {
  accessToken: string;
  refreshToken: string;
  userId: number;
};
class UsersTokenService {
  static async create({
    userId,
    refreshToken,
  }: {
    refreshToken: string;
    userId: number;
  }): Promise<UserToken> {
    const query = `INSERT INTO ${tableName} (refresh_token, fk_user_id)
                        VALUES ($1, $2)
                     RETURNING access_token, refresh_token, fk_user_id
    `;
    const result: QueryResult<UsersTokenRow> = await db.query(query, [
      refreshToken,
      userId,
    ]);
    return UsersTokenService.convertCase(result.rows[0]);
  }

  static async getOne({ userId }: { userId: number }): Promise<UserToken> {
    const query = `SELECT * FROM ${tableName}
                    WHERE fk_user_id = $1
    `;
    console.log('result sdfasd', userId);
    const result: QueryResult<UsersTokenRow> = await db.query(query, [userId]);
    console.log('result sdfasd', result);
    return UsersTokenService.convertCase(result.rows[0]);
  }

  static async update({
    userId,
    refreshToken,
  }: {
    refreshToken: string;
    userId: number;
  }) {
    const query = `UPDATE ${tableName}
                      SET access_token = $1,
                          refresh_token = $2
                    WHERE fk_user_id = $3
                RETURNING access_token, refresh_token, fk_user_id`;
    const result: QueryResult<UsersTokenRow> = await db.query(query, [
      refreshToken,
      refreshToken,
      userId,
    ]);
    return UsersTokenService.convertCase(result.rows[0]);
  }

  static convertCase(token: UsersTokenRow): UserToken {
    return {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      userId: token.fk_user_id,
    };
  }
}

export default UsersTokenService;
