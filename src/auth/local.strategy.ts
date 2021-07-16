import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PublicUser } from '../users/dto/user-dto';

const usernameField = 'email';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField });
  }

  async validate(username: string, password: string): Promise<PublicUser> {
    try {
      return await this.authService.validateUser(username, password);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
