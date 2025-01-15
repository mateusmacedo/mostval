import { IMetadata, InMemoryMessageStore } from '@mostval/common'
import { ChangeUserCredentialsCommand, IUserFactory, IUserRepository, User, USER_FACTORY, USER_REPOSITORY, UserProps } from '@mostval/users'
import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from './user.service'

describe('UserService', () => {
  let app: TestingModule
  let service: UserService
  let userFactory: IUserFactory
  let userRepository: IUserRepository

  const defaultUserProps: UserProps = {
    id: '1',
    credentials: {
      id: 'john.doe@example.com',
      secret: 'password'
    }
  }

  const mockUser = (props: UserProps = defaultUserProps): User<UserProps> => ({
    props,
    msgStore: jest.mocked(new InMemoryMessageStore()),
    changeCredentials: jest.fn()
  } as unknown as User<UserProps>)

  beforeAll(async () => {
    app = await Test.createTestingModule({
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

    userFactory = app.get(USER_FACTORY)
    userRepository = app.get(USER_REPOSITORY)
    service = app.get(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(userFactory).toBeDefined()
    expect(userRepository).toBeDefined()
  })

  describe('createUser', () => {
    it('should create a user', async () => {
      const user = mockUser()
      userFactory.create = jest.fn().mockReturnValue(user)
      userRepository.save = jest.fn().mockReturnValue(user)

      const result = await service.createUser(defaultUserProps)

      expect(result.props).toEqual(defaultUserProps)
    })

    it('should throw an error when factory fails', async () => {
      userFactory.create = jest.fn().mockImplementation(() => {
        throw new Error('User creation failed')
      })

      await expect(service.createUser(defaultUserProps)).rejects.toThrow('User creation failed')
    })

    it('should throw an error when repository fails', async () => {
      userFactory.create = jest.fn().mockReturnValue(mockUser())
      userRepository.save = jest.fn().mockImplementation(() => {
        throw new Error('User saving failed')
      })

      await expect(service.createUser(defaultUserProps)).rejects.toThrow('User saving failed')
    })
  })

  describe('findUser', () => {
    const criteria = [{ id: '1' }]

    it('should find a user', async () => {
      userRepository.find = jest.fn().mockReturnValue([mockUser()])

      const users = await service.findUser(criteria)

      expect(users).toHaveLength(1)
      expect(users[0].props).toEqual(defaultUserProps)
    })

    it('should throw an error when repository fails', async () => {
      userRepository.find = jest.fn().mockImplementation(() => {
        throw new Error('User finding failed')
      })

      await expect(service.findUser(criteria)).rejects.toThrow('User finding failed')
    })
  })

  describe('deleteUser', () => {
    const criteria = [{ id: '1' }]

    it('should delete a user', async () => {
      await service.deleteUser(criteria)
      expect(userRepository.remove).toHaveBeenCalledWith(criteria)
    })

    it('should throw an error when repository fails', async () => {
      userRepository.remove = jest.fn().mockImplementation(() => {
        throw new Error('User deleting failed')
      })

      await expect(service.deleteUser(criteria)).rejects.toThrow('User deleting failed')
    })
  })

  describe('updateUserCredentials', () => {
    const updatedCredentials = {
      id: 'john.doe.updated@example.com',
      secret: 'password_updated'
    }

    const metadata: IMetadata = {
      id: '1',
      schema: 'user',
      type: 'change-credentials',
      timestamp: Date.now()
    }

    const command = new ChangeUserCredentialsCommand(updatedCredentials, metadata)

    it('should update user credentials', async () => {
      const updatedUser = mockUser({
        ...defaultUserProps,
        credentials: updatedCredentials
      })

      userRepository.find = jest.fn().mockReturnValue([mockUser()])
      userRepository.save = jest.fn().mockReturnValue(updatedUser)

      const result = await service.updateUserCredentials(command)

      expect(result.props.credentials).toEqual(updatedCredentials)
    })

    it('should throw an error when user is not found', async () => {
      userRepository.find = jest.fn().mockReturnValue([])

      await expect(service.updateUserCredentials(command)).rejects.toThrow('User not found')
    })
  })
})
