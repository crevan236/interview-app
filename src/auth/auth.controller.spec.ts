import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserNotFoundError } from '../users/users.errors';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInBody } from './interfaces/sign-in-body';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should return an JWT token', async () => {
      jest
        .spyOn(authService, 'signIn')
        .mockImplementation(async () => Promise.resolve('example_token'));
      const body: SignInBody = {
        email: 'aloha@gmail.com',
        password: 'kaboom',
      };

      const result = await controller.signIn(body);

      expect(result).toEqual({
        authToken: 'example_token',
      });
    });

    it('should throw NotFoundException on user not found', async () => {
      jest.spyOn(authService, 'signIn').mockImplementation(async () => {
        throw new UserNotFoundError();
      });
      const body: SignInBody = {
        email: 'aloha@gmail.com',
        password: 'kaboom',
      };

      expect.assertions(1);

      try {
        await controller.signIn(body);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw InternalServerErrorException on user not found', async () => {
      jest.spyOn(authService, 'signIn').mockImplementation(async () => {
        throw new Error();
      });
      const body: SignInBody = {
        email: 'aloha@gmail.com',
        password: 'kaboom',
      };

      expect.assertions(1);

      try {
        await controller.signIn(body);
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
