import { IMetadata, InMemoryMessageStore } from '@mostval/common'
import { ChangeUserCredentialsCommand, IUserFactory, IUserRepository, User, USER_FACTORY, USER_REPOSITORY, UserProps } from '@mostval/users'
import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from './user.service'

describe('UserService', () => {
  let app: TestingModule
  let service: UserService
  let userFactory: IUserFactory
  let userRepository: IUserRepository

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_FACTORY,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: USER_REPOSITORY,
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile()

    service = app.get<UserService>(UserService)
    userFactory = app.get<IUserFactory>(USER_FACTORY)
    userRepository = app.get<IUserRepository>(USER_REPOSITORY)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(userFactory).toBeDefined()
    expect(userRepository).toBeDefined()
  })

  describe('createUser', () => {
    it('should create a user', async () => {
      const userPayload: UserProps = {
        id: '1',
        credentials: {
          id: 'john.doe@example.com',
          secret: 'password',
        },
      }
      userFactory.create = jest.fn().mockReturnValue({
        props: userPayload,
      } as User<UserProps>)
      userRepository.save = jest.fn().mockReturnValue({
        props: userPayload,
      } as User<UserProps>)

      const savedUser = await service.createUser(userPayload)

      expect(savedUser).toBeDefined()
      expect(savedUser.props.id).toEqual(userPayload.id)
      expect(savedUser.props.credentials.id).toEqual(userPayload.credentials.id)
      expect(savedUser.props.credentials.secret).toEqual(userPayload.credentials.secret)
    })
    it('should throw an error when factory fails', async () => {
      const userPayload: UserProps = {
        id: '1',
        credentials: {
          id: 'john.doe@example.com',
          secret: 'password',
        },
      }
      userFactory.create = jest.fn().mockImplementation(() => {
        throw new Error('User creation failed')
      })

      await expect(service.createUser(userPayload)).rejects.toThrow('User creation failed')
    })
    it('should throw an error when repository fails', async () => {
      const userPayload: UserProps = {
        id: '1',
        credentials: {
          id: 'john.doe@example.com',
          secret: 'password',
        },
      }
      userFactory.create = jest.fn().mockReturnValue({
        props: userPayload,
      } as User<UserProps>)
      userRepository.save = jest.fn().mockImplementation(() => {
        throw new Error('User saving failed')
      })

      await expect(service.createUser(userPayload)).rejects.toThrow('User saving failed')
    })
  })

  describe('findUser', () => {
    it('should find a user', async () => {
      const userPayload: UserProps = {
        id: '1',
        credentials: {
          id: 'john.doe@example.com',
          secret: 'password',
        },
      }
      userRepository.find = jest.fn().mockReturnValue([{
        props: userPayload,
      } as User<UserProps>])

      const users = await service.findUser([['id', '1']])
      expect(users).toBeDefined()
      expect(users.length).toEqual(1)
    })
    it('should throw an error when repository fails', async () => {
      userRepository.find = jest.fn().mockImplementation(() => {
        throw new Error('User finding failed')
      })

      await expect(service.findUser([['id', '1']])).rejects.toThrow('User finding failed')
    })
  })

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const repoSpy = jest.spyOn(userRepository, 'remove')
      await service.deleteUser([['id', '1']])
      expect(repoSpy).toHaveBeenCalledWith([['id', '1']])
    })

    it('should throw an error when repository fails', async () => {
      userRepository.remove = jest.fn().mockImplementation(() => {
        throw new Error('User deleting failed')
      })

      await expect(service.deleteUser([['id', '1']])).rejects.toThrow('User deleting failed')
    })
  })

  describe('updateUserCredentials', () => {
    it('should update a user credentials', async () => {
      const from = {
        props: {
          id: '1',
          credentials: {
            id: 'john.doe@example.com',
            secret: 'password',
          },
        },
        msgStore: jest.mocked(new InMemoryMessageStore()),
        changeCredentials: jest.fn()
      } as User<UserProps>
      userRepository.find = jest.fn().mockReturnValue([from])

      const to = {
        props: {
          id: '1',
          credentials: {
            id: 'john.doe.updated@example.com',
            secret: 'password_updated',
          },
        },
        msgStore: jest.mocked(new InMemoryMessageStore()),
        changeCredentials: jest.fn(),
      } as User<UserProps>
      userRepository.save = jest.fn().mockReturnValue(to)


      const metadata: IMetadata = {
        id: '1',
        schema: 'user',
        type: 'change-credentials',
        timestamp: Date.now(),
      }
      const command = new ChangeUserCredentialsCommand(to.props.credentials, metadata)

      const result = await service.updateUserCredentials(command)

      expect(result).toBeDefined()
      expect(result.props.credentials.id).toEqual(to.props.credentials.id)
      expect(result.props.credentials.secret).toEqual(to.props.credentials.secret)
    })
    it('should throw an error when user is not found', async () => {
      userRepository.find = jest.fn().mockReturnValue([])
      const to = {
        props: {
          id: '1',
          credentials: {
            id: 'john.doe.updated@example.com',
            secret: 'password_updated',
          },
        },
      } as User<UserProps>

      const metadata: IMetadata = {
        id: '1',
        schema: 'user',
        type: 'change-credentials',
        timestamp: Date.now(),
      }
      const command = new ChangeUserCredentialsCommand(to.props.credentials, metadata)

      await expect(service.updateUserCredentials(command)).rejects.toThrow('User not found')
    })
  })
})
