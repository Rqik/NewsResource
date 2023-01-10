import jwt from 'jsonwebtoken';

const tokenList = [];
class TokenService {
  static generateTokens() {
    const accessToken = jwt.sign({}, process.env.JWT_ACCESS_TOKEN as string, {
      expiresIn: '30m',
    });
    const refreshToken = jwt.sign({}, process.env.JWT_REFRESH_TOKEN as string, {
      expiresIn: '30d',
    });
    return { accessToken, refreshToken };
  }

  static saveToken() {
    const tokenData =await TokenService.
  };

  static await getOne() {
    return ''
  }

}

export default TokenService;
