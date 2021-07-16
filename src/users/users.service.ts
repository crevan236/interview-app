import { InMemoryDBService } from '@nestjs-addons/in-memory-db';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SignInBody } from 'src/auth/interfaces/sign-in-body';
import { initialUsers } from './data/db-initial-data';
import { UserDto } from './dto/user-dto';
import { UserNotFoundError } from './users.errors';
import { ulid } from 'ulid';
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly userFacade: InMemoryDBService<UserDto>) {}

  async onModuleInit() {
    for (const user of initialUsers) {
      await this.createUser(user);
    }
  }

  async getAllUsers(): Promise<UserDto[]> {
    return this.userFacade.getAllAsync().toPromise();
  }

  async findOne(id: string): Promise<UserDto> {
    return this.userFacade.getAsync(id).toPromise();
  }

  async findOneByEmail(email: string): Promise<UserDto> {
    const usersFound = await this.userFacade
      .queryAsync((user: UserDto) => user.email === email)
      .toPromise();

    if (!usersFound.length) {
      throw new UserNotFoundError();
    }

    if (usersFound.length > 1) {
      throw new Error('more than one user instance :-?');
    }

    return usersFound[0];
  }

  async updateUserPublicKey(userId: string, publicKey: string): Promise<void> {
    const user = await this.findOne(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return this.userFacade.updateAsync({ ...user, publicKey }).toPromise();
  }

  async validateUserPassword(
    dbPassword: string,
    givenPasword: string,
  ): Promise<boolean> {
    return bcrypt.compare(givenPasword, dbPassword);
  }

  private async createUser(signInData: SignInBody): Promise<UserDto> {
    const { email, password } = signInData;

    const user: UserDto = {
      id: ulid(),
      email,
      password: await bcrypt.hash(password, saltOrRounds),
    };

    return this.userFacade.createAsync(user).toPromise();
  }
}
