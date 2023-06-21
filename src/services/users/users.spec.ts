import { randomUUID } from 'crypto';
import UsersService from './users.service';

describe('Users service', () => {
  const password = 'secret_pass_232';

  const userDummy = {
    firstName: 'Игорь',
    lastName: 'джабраилов',
    avatar: null,
    login: randomUUID(),
    password,
    email: 'tabasaranec96@mail.ru',
  };

  test('Create user', async () => {
    const user = await UsersService.registration(userDummy);

    expect(user).toMatchObject({
      firstName: 'Игорь',
      lastName: 'джабраилов',
      email: 'tabasaranec96@mail.ru',
      isActivated: false,
    });
    expect(user).not.toMatchObject({ password });
    expect(user).toHaveProperty('accessToken');
    expect(user).toHaveProperty('refreshToken');
  });

  test('Get user by id', async () => {
    const id = 1;
    const user = await UsersService.getById({ id });
    if (user !== null) {
      expect(user).toMatchObject({
        id: 1,
        firstName: 'Игорь',
        lastName: 'джабраилов',
        email: 'tabasaranec96@mail.ru',
        isActivated: false,
      });
      expect(user.id).toEqual(id);
      expect(user).not.toMatchObject({ password });
    } else {
      expect(user).toBeNull();
    }
    const user2 = await UsersService.getById({ id: 0 });
    expect(user2).toBeNull();
  });

  test('Get user by login', async () => {
    const login = 'test_login';
    const user = await UsersService.getOne({ login: 'admin000212212020220' });
    expect(user).toBeNull();

    const user2 = await UsersService.getOne({ login });
    expect(user2?.login).toEqual(login);
  });
});
