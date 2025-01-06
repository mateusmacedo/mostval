import { IMessageStore } from '@mostval/common'
import { InvalidCredentialsError } from '@mostval/iam'
import { TUserCriteria, User, UserAlreadyExistsError, UserNotFoundError, UserProps } from '@mostval/users'
import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from './user.controller'
import { UserService } from './user.service'

describe('UserController', () => {
  let app: TestingModule
  let controller: UserController
  let service: UserService
  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{
        provide: UserService,
        useValue: {
          createUser: jest.fn(),
          findUser: jest.fn(),
          deleteUser: jest.fn(),
          updateUserCredentials: jest.fn(),
        } as unknown as UserService,
      }],
    }).compile()

    controller = app.get<UserController>(UserController)
    service = app.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(service).toBeDefined()
  })

  describe('createUser', () => {
    it('should create a user', async () => {
      const mockedUser = {
        props: {
          id: '1',
          credentials: {
            id: 'john.doe@example.com',
            secret: 'password',
          },
        },
        msgStore: {} as IMessageStore,
        changeCredentials: jest.fn(),
      } as User<UserProps>

      jest.spyOn(service, 'createUser').mockResolvedValue(mockedUser)
      const user = await controller.createUser({ id: '1', credentials: { id: 'john.doe@example.com', secret: 'password' } })
      expect(user).toBeDefined()
    })
    it('should throw an error when user already exists', async () => {
      jest.spyOn(service, 'createUser').mockRejectedValue(new UserAlreadyExistsError('User already exists'))
      await expect(controller.createUser({ id: '1', credentials: { id: 'john.doe@example.com', secret: 'password' } })).rejects.toThrow('User already exists')
    })
    it('should throw an error when user credentials are invalid', async () => {
      jest.spyOn(service, 'createUser').mockRejectedValue(new InvalidCredentialsError('User credentials are invalid'))
      await expect(controller.createUser({ id: '1', credentials: { id: 'john.doe@example.com', secret: 'password' } })).rejects.toThrow('User credentials are invalid')
    })
  })

  describe('findUser', () => {
    it('should find a user', async () => {
      const mockedUser = {
        props: {
          id: '1',
          credentials: {
            id: 'john.doe@example.com',
            secret: 'password',
          },
        },
        msgStore: {} as IMessageStore,
        changeCredentials: jest.fn(),
      } as User<UserProps>
      jest.spyOn(service, 'findUser').mockResolvedValue([mockedUser])
      const criteria: TUserCriteria[] = [
        ['id', '1'],
      ]
      const user = await controller.findUser(criteria)
      expect(user).toBeDefined()
    })
    it('should throw an error when user not found', async () => {
      jest.spyOn(service, 'findUser').mockRejectedValue(new UserNotFoundError('User not found'))
      const criteria: TUserCriteria[] = [
        ['id', '1'],
      ]
      await expect(controller.findUser(criteria)).rejects.toThrow('User not found')
    })
  })

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      jest.spyOn(service, 'deleteUser').mockResolvedValue()
      const criteria: TUserCriteria[] = [
        ['id', '1'],
      ]
      await controller.deleteUser(criteria)
    })
    it('should throw an error when user not found', async () => {
      jest.spyOn(service, 'deleteUser').mockRejectedValue(new UserNotFoundError('User not found'))
      const criteria: TUserCriteria[] = [
        ['id', '1'],
      ]
      await expect(controller.deleteUser(criteria)).rejects.toThrow('User not found')
    })
  })

  describe('changeUserCredentials', () => {
    it('should change a user credentials', async () => {
      const updatedUserCredentials = {
        props: {
          id: '1',
          credentials: {
            id: 'john.doe.updated@example.com',
            secret: 'password_updated',
          },
        },
        msgStore: {} as IMessageStore,
        changeCredentials: jest.fn(),
      } as User<UserProps>
      jest.spyOn(service, 'updateUserCredentials').mockResolvedValue(updatedUserCredentials)

      await controller.updateUserCredentials('1', { id: 'john.doe.updated@example.com', secret: 'password_updated' })
    })
    it('should throw an error when user credentials are invalid', async () => {
      jest.spyOn(service, 'updateUserCredentials').mockRejectedValue(new InvalidCredentialsError('User credentials are invalid'))
      await expect(controller.updateUserCredentials('1', { id: 'john.doe.updated@example.com', secret: 'password_updated' })).rejects.toThrow('User credentials are invalid')
    })
    it('should throw an error when user not found', async () => {
      jest.spyOn(service, 'updateUserCredentials').mockRejectedValue(new UserNotFoundError('User not found'))
      await expect(controller.updateUserCredentials('1', { id: 'john.doe.updated@example.com', secret: 'password_updated' })).rejects.toThrow('User not found')
    })
    it('should throw an error when service throws an error', async () => {
      jest.spyOn(service, 'updateUserCredentials').mockRejectedValue(new Error('Service error'))
      await expect(controller.updateUserCredentials('1', { id: 'john.doe.updated@example.com', secret: 'password_updated' })).rejects.toThrow('Service error')
    })
  })
})
