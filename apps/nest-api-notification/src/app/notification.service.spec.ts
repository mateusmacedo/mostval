import {
  CreateNewNotification,
  CreateNewNotificationSymbol,
  PersistNotification,
  PersistNotificationSymbol,
  TCreateNewNotificationInput,
} from '@mostval/notification';
import { Test } from '@nestjs/testing';
import { NotificationService } from './notification.service';

const mockPersistNotification = {
  execute: jest.fn(),
};

const mockCreateNewNotification = {
  execute: jest.fn(),
};

describe('NotificationService', () => {
  let createNewNotification: CreateNewNotification;
  let persistNotification: PersistNotification;
  let service: NotificationService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        {
          provide: CreateNewNotificationSymbol,
          useValue: mockCreateNewNotification,
        },
        {
          provide: PersistNotificationSymbol,
          useValue: mockPersistNotification,
        },
        NotificationService,
      ],
    }).compile();

    createNewNotification = app.get<CreateNewNotification>(
      CreateNewNotificationSymbol
    );
    persistNotification = app.get<PersistNotification>(
      PersistNotificationSymbol
    );
    service = app.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(createNewNotification).toBeDefined();
    expect(persistNotification).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should create and persist a notification', async () => {
      const data: TCreateNewNotificationInput<string> = {
        channels: [],
        content: 'Notification API',
      };
      mockCreateNewNotification.execute.mockResolvedValue({
        message: 'Notification API',
      });
      mockPersistNotification.execute.mockResolvedValue({
        message: 'Notification API',
      });
      const result = await service.createAndPersistNotification(data);
      expect(result).toEqual({
        message: 'Notification API',
      });
    });

    it('should throw an error if the builder throws an error', () => {
      mockCreateNewNotification.execute.mockImplementation(() => {
        throw new Error('Error');
      });
      const data: TCreateNewNotificationInput<string> = {
        channels: [],
        content: 'Notification API',
      };
      expect(service.createAndPersistNotification(data)).rejects.toThrow(
        'Error'
      );
    });

    it('should throw an error if the persist notification throws an error', () => {
      mockPersistNotification.execute.mockImplementation(() => {
        throw new Error('Error');
      });
      const data: TCreateNewNotificationInput<string> = {
        channels: [],
        content: 'Notification API',
      };
      expect(service.createAndPersistNotification(data)).rejects.toThrow(
        'Error'
      );
    });
  });
});
