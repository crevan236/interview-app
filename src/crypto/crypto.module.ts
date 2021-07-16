import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [CryptoController],
  providers: [CryptoService],
})
export class CryptoModule {}
