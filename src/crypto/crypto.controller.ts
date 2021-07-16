import {
  Request,
  Controller,
  Post,
  UseGuards,
  Response,
  Header,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CryptoService } from './crypto.service';
import { UserNotFoundError } from 'src/users/users.errors';

@Controller()
export class CryptoController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cryptoService: CryptoService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/generate-key-pair')
  async generateKeyPair(@Request() request) {
    try {
      const keyPair = await this.cryptoService.generateKeyPair();

      await this.usersService.updateUserPublicKey(
        request.user.id,
        keyPair.pubKey,
      );

      return keyPair;
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return new NotFoundException('User not found');
      }

      return new InternalServerErrorException(
        'Public key could not be updated',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/encrypt')
  @Header('Content-Type', 'text/plain')
  async encrypt(@Request() request, @Response() response) {
    const user = await this.usersService.findOne(request.user.id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (!user.publicKey) {
      throw new BadRequestException('User does not have a public key');
    }

    const fileStream = this.cryptoService.serveFile(user.publicKey);

    return fileStream.pipe(response);
  }
}
