import jwt from 'jsonwebtoken';
import UserDto from '../dtos/UserDto';
import UsersTokenService from './UsersTokenService';

class TokenService {
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

  static async saveToken(userId: number, refreshToken: string) {
    const tokenData = await UsersTokenService.getOne({ userId });
    console.log('tokenData', tokenData);
    if (tokenData) {
      return tokenData;
    }
    const token = await UsersTokenService.create({ userId, refreshToken });
    return token;
  }

  static async getOne() {
    return '';
  }
}

export default TokenService;
