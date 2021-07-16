import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserNotFoundError } from '../users/users.errors';
import { UsersService } from '../users/users.service';
import { InvalidUserPasswordError } from './auth.errors';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            validateUserPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: () => Promise.resolve('token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should throw UserNotFoundError', async () => {
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockImplementation(async () => {
          throw new UserNotFoundError('an error');
        });
      const body = {
        email: 'aloha@gmail.com',
        password: 'kaboom',
      };

      expect.assertions(2);

      try {
        await service.signIn(body);
      } catch (e) {
        expect(e).toBeInstanceOf(UserNotFoundError);
        expect(e.message).toBe('an error');
      }
    });

    it('should return token from jwt.sign', async () => {
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockImplementation(async () =>
          Promise.resolve({ email: 'abc', id: '124A' } as any),
        );
      const body = {
        email: 'aloha@gmail.com',
        password: 'kaboom',
      };

      const result = await service.signIn(body);

      expect(result).toBe('token');
    });
  });

  describe('validateUser', () => {
    it('should throw UserNotFoundError', async () => {
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockImplementation(async () => {
          throw new UserNotFoundError('an error');
        });
      jest
        .spyOn(usersService, 'validateUserPassword')
        .mockImplementation(() => Promise.resolve(true));
      const body = {
        email: 'aloha@gmail.com',
        password: 'kaboom',
      };

      expect.assertions(2);

      try {
        await service.validateUser(body.email, body.password);
      } catch (e) {
        expect(e).toBeInstanceOf(UserNotFoundError);
        expect(e.message).toBe('an error');
      }
    });

    it('should throw InvalidUserPasswordError', async () => {
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockImplementation(async () =>
          Promise.resolve({ email: 'abc', id: '124A' } as any),
        );
      jest
        .spyOn(usersService, 'validateUserPassword')
        .mockImplementation(() => Promise.resolve(false));
      const body = {
        email: 'aloha@gmail.com',
        password: 'kaboom',
      };

      expect.assertions(1);

      try {
        await service.validateUser(body.email, body.password);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidUserPasswordError);
      }
    });

    it('should return validated user', async () => {
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockImplementation(async () =>
          Promise.resolve({ email: 'abc', id: '124A' } as any),
        );
      jest
        .spyOn(usersService, 'validateUserPassword')
        .mockImplementation(() => Promise.resolve(true));
      const body = {
        email: 'aloha@gmail.com',
        password: 'kaboom',
      };

      const userData = await service.validateUser(body.email, body.password);

      expect(userData).toEqual({ email: 'abc', id: '124A' });
    });
  });
});
