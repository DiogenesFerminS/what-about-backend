import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { NotFoundException } from '@nestjs/common';

const mockUser = {
  id: '123456',
  username: 'diogenes',
  email: 'paolofersantella@gmail.com',
};

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findOneById: jest.fn(async (id: string) => {
      return Promise.resolve({ ...mockUser, id });
    }),
    updateProfile: jest.fn(),
    getUsersByTerm: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
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
    const response = await controller.getProfile({
      id: mockUser.id,
      username: mockUser.username,
    });

    expect(mockUsersService.findOneById).toHaveBeenCalledWith(mockUser.id);
    expect(response.data).toEqual(mockUser);
  });

  it('Should call a updateProfile fn and return a updated profile', async () => {
    const mockUpdatedUser = {
      id: '123456',
      name: 'diogenes',
      bio: 'Im software developer',
      location: 'Venezuela',
      file: undefined,
    };

    mockUsersService.updateProfile.mockResolvedValue(mockUpdatedUser);

    const file = undefined;
    const updateProfileDto = {
      name: mockUpdatedUser.name,
      bio: mockUpdatedUser.bio,
      location: mockUpdatedUser.location,
    };
    const userPayload = {
      id: mockUpdatedUser.id,
      username: mockUpdatedUser.name,
    };
    const response = await controller.updateProfile(
      userPayload,
      updateProfileDto,
      file,
    );

    expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
      userPayload.id,
      updateProfileDto,
      file,
    );

    expect(response).toEqual({
      ok: true,
      message: ResponseMessageType.UPDATED,
      data: mockUpdatedUser,
    });
  });

  it('Should call to getUserByTerm with search data', async () => {
    mockUsersService.getUsersByTerm.mockResolvedValue(mockUser);

    const searchDto = {
      limit: 10,
      page: 1,
      term: 'dio',
    };
    const response = await controller.getUsersByTerm(searchDto);

    expect(mockUsersService.getUsersByTerm).toHaveBeenCalledWith(
      searchDto.term,
      {
        limit: searchDto.limit,
        page: searchDto.page,
      },
    );

    expect(response).toEqual({
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: mockUser,
    });
  });

  it('Should call to findOneById and return the user', async () => {
    const response = await controller.getUserById(mockUser.id);

    expect(mockUsersService.findOneById).toHaveBeenCalledWith(mockUser.id);

    expect(response).toEqual({
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: mockUser,
    });
  });

  it('Should throw an error if the user does not exist', async () => {
    const exeption = new NotFoundException('User not found');
    mockUsersService.findOneById.mockRejectedValue(exeption);
    const fakeId = 'FAKEID_1234';

    await expect(controller.getUserById(fakeId)).rejects.toThrow(
      NotFoundException,
    );

    expect(mockUsersService.findOneById).toHaveBeenCalledWith(fakeId);
  });
});
