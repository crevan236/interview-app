import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { InMemoryDBModule } from '@nestjs-addons/in-memory-db';

@Module({
  imports: [InMemoryDBModule.forRoot({})],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
