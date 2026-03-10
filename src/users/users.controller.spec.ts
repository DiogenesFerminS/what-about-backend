import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findOneById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Should be return the user profile', async () => {
    const mockUser = {
      id: '123456',
      username: 'diogenes',
      email: 'paolofersantella@gmail.com',
    };

    mockUsersService.findOneById.mockResolvedValue(mockUser);

    const profile = await controller.getProfile({
      id: mockUser.id,
      username: mockUser.username,
    });

    expect(mockUsersService.findOneById).toHaveBeenCalledWith(mockUser.id);
    expect(profile.data).toEqual(mockUser);
  });
});
