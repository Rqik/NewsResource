interface UserDto {
  email: string;

  id: number;

  isActivated: boolean;

  isAdmin: boolean;
}
class UserDto implements UserDto {
  email: string;

  id: number;

  isActivated: boolean;

  isAdmin: boolean;

  constructor(model: UserDto) {
    this.email = model.email;
    this.id = model.id;
    this.isActivated = model.isActivated;
    this.isAdmin = model.isAdmin;
  }
}

export default UserDto;
