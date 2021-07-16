import { InMemoryDBEntity } from '@nestjs-addons/in-memory-db';

export interface UserDto extends InMemoryDBEntity {
  id: string;
  email: string;
  password: string;
  publicKey?: string;
}

export type PublicUser = Omit<UserDto, 'password'>;
