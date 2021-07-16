import { Injectable } from '@nestjs/common';
import { SignInBody } from './interfaces/sign-in-body';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PublicUser } from '../users/dto/user-dto';
import { InvalidUserPasswordError } from './auth.errors';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signIn(signInData: SignInBody): Promise<string> {
    const { email, id } = await this.usersService.findOneByEmail(
      signInData.email,
    );

    return this.jwtService.sign({ email, sub: id });
  }

  async validateUser(userEmail: string, password: string): Promise<PublicUser> {
    const user = await this.usersService.findOneByEmail(userEmail);

    const isPasswordValid = await this.usersService.validateUserPassword(
      user.password,
      password,
    );

    if (!isPasswordValid) {
      throw new InvalidUserPasswordError();
    }

    const { email, id } = user;

    return {
      email,
      id,
    };
  }
}
