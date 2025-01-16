import { IMessageStore } from '@mostval/common'
import { InvalidCredentialsError } from '@mostval/iam'
import { User, USER_FACTORY, USER_REPOSITORY, UserConflictError, UserNotFoundError, UserProps } from '@mostval/users'
import { Test } from '@nestjs/testing'
import { UserController } from './user.controller'
import { UserService } from './user.service'

describe('UserController', () => {
  let controller: UserController
  let service: UserService
  let mockedUser: User<UserProps>

  const userProps = {
    id: '1',
    credentials: {
      id: 'john_doe@example.com',
      secret: 'password'
    }
  }

  const mockedCriteria = { id: '1' }

  const mockedMessageStore: IMessageStore = {
    add: jest.fn(),
    get: jest.fn(),
    remove: jest.fn()
  }

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: USER_FACTORY,
          useValue: { create: jest.fn() }
        },
        {
          provide: USER_REPOSITORY,
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            remove: jest.fn()
          }
        },
        UserService
      ]
    }).compile()

    controller = app.get<UserController>(UserController)
    service = app.get<UserService>(UserService)
    mockedUser = new User(userProps, mockedMessageStore)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(service).toBeDefined()
  })

  describe('createUser', () => {
    it('should create a user', async () => {
      jest.spyOn(service, 'createUser').mockResolvedValue(mockedUser)
      const user = await controller.createUser(userProps)
      expect(user).toBeDefined()
    })

    it('should throw when user exists', async () => {
      jest.spyOn(service, 'createUser').mockRejectedValue(new UserConflictError('User already exists'))
      await expect(controller.createUser(userProps)).rejects.toThrow('User already exists')
    })

    it('should throw on invalid credentials', async () => {
      jest.spyOn(service, 'createUser').mockRejectedValue(new InvalidCredentialsError('Invalid credentials'))
      await expect(controller.createUser(userProps)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('findUser', () => {
    it('should find a user', async () => {
      jest.spyOn(service, 'findUser').mockResolvedValue([mockedUser])
      const user = await controller.findUser(mockedCriteria)
      expect(user).toBeDefined()
    })

    it('should throw when user not found', async () => {
      jest.spyOn(service, 'findUser').mockRejectedValue(new UserNotFoundError('User not found'))
      await expect(controller.findUser(mockedCriteria)).rejects.toThrow('User not found')
    })
  })

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      jest.spyOn(service, 'deleteUser').mockResolvedValue()
      await controller.deleteUser([mockedCriteria])
    })

    it('should throw when user not found', async () => {
      jest.spyOn(service, 'deleteUser').mockRejectedValue(new UserNotFoundError('User not found'))
      await expect(controller.deleteUser([mockedCriteria])).rejects.toThrow('User not found')
    })
  })

  describe('updateUserCredentials', () => {
    const newCredentials = {
      id: 'john.doe.updated@example.com',
      secret: 'password_updated'
    }

    it('should update credentials', async () => {
      jest.spyOn(service, 'updateUserCredentials').mockResolvedValue(mockedUser)
      await controller.updateUserCredentials('1', newCredentials)
    })

    it('should throw on invalid credentials', async () => {
      jest.spyOn(service, 'updateUserCredentials').mockRejectedValue(new InvalidCredentialsError('Invalid credentials'))
      await expect(controller.updateUserCredentials('1', newCredentials)).rejects.toThrow('Invalid credentials')
    })

    it('should throw when user not found', async () => {
      jest.spyOn(service, 'updateUserCredentials').mockRejectedValue(new UserNotFoundError('User not found'))
      await expect(controller.updateUserCredentials('1', newCredentials)).rejects.toThrow('User not found')
    })

    it('should throw on service error', async () => {
      jest.spyOn(service, 'updateUserCredentials').mockRejectedValue(new Error('Service error'))
      await expect(controller.updateUserCredentials('1', newCredentials)).rejects.toThrow('Service error')
    })
  })
})
