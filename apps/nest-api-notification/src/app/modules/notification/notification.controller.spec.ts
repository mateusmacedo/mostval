import {
  Notification,
  NotificationChannelType,
  NotificationStatus,
  TCreateNewNotificationInput,
} from '@mostval/notification';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { ValueObject } from '@mostval/ddd';
import { NotificationService } from './notification.service';

const mockNotificationService = {
  createAndPersistNotification: jest.fn(),
};

describe('NotificationController', () => {
  let app: TestingModule;
  let service: NotificationService;
  let controller: NotificationController;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = app.get<NotificationService>(NotificationService);
    controller = app.get<NotificationController>(NotificationController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  describe('notify', () => {
    it('should create and persist a notification', async () => {
      const data: TCreateNewNotificationInput<string> = {
        channels: [],
        content: 'Test',
      };
      const address = new ValueObject('test@test.com');
      mockNotificationService.createAndPersistNotification.mockResolvedValue(
        new Notification({
          channels: [
            {
              type: NotificationChannelType.EMAIL,
              address,
            },
          ],
          content: 'Test',
          status: NotificationStatus.CREATED,
        })
      );

      const result = await controller.notify(data);
      expect(result).toEqual({
        channels: [
          {
            type: NotificationChannelType.EMAIL,
            address,
          },
        ],
        content: 'Test',
        status: NotificationStatus.CREATED,
      });
    });
  });
});
