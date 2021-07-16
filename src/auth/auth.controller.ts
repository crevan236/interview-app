import {
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserNotFoundError } from '../users/users.errors';
import { AuthService } from './auth.service';
import { SignInBody } from './interfaces/sign-in-body';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  async signIn(@Body() signInDto: SignInBody) {
    try {
      return {
        authToken: await this.authService.signIn(signInDto),
      };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException('User not found');
      }

      throw new InternalServerErrorException(error.message);
    }
  }
}
