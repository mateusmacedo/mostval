import { INotificationBuilder } from '../domain/builder';
import { Notification, NotificationStatus } from '../domain/notification';
import { INotificationPersisterRepository } from '../domain/repository';
import { CreateNewNotification, PersistNotification } from './usecases';

describe('notification usecases', () => {
  describe('CreateNewNotification', () => {
    it('should create a notification successfully', async () => {
      const builder = {
        withContent: jest.fn().mockReturnThis(),
        withStatus: jest.fn().mockReturnThis(),
        withChannels: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(
          new Notification({
            content: 'Test',
            status: NotificationStatus.CREATED,
            channels: [],
          })
        ),
      };
      const useCase = new CreateNewNotification(builder);
      const result = await useCase.execute({
        content: 'Test',
        status: NotificationStatus.CREATED,
        channels: [],
      });
      expect(result).toBeInstanceOf(Notification);
      expect(builder.build).toHaveBeenCalled();
    });

    it('should throw an error if the builder throws an error', () => {
      const builder = {
        withContent: jest.fn().mockReturnThis(),
        withStatus: jest.fn().mockReturnThis(),
        withChannels: jest.fn().mockReturnThis(),
        build: jest.fn().mockImplementation(() => {
          throw new Error('Test');
        }),
      } as unknown as INotificationBuilder<unknown>;
      const useCase = new CreateNewNotification(builder);
      expect(useCase.execute({ content: 'Test' })).rejects.toThrow('Test');
    });
  });

  describe('PersistNotification', () => {
    it('should persist notification data successfully', async () => {
      const repository: INotificationPersisterRepository = {
        persist: jest.fn().mockResolvedValue(
          new Notification({
            content: 'Test',
            status: NotificationStatus.CREATED,
            channels: [],
          })
        ),
      };
      const useCase = new PersistNotification(repository);
      const notification = new Notification({
        content: 'Test',
        status: NotificationStatus.CREATED,
        channels: [],
      });
      const result = await useCase.execute(notification);
      expect(result).toBeInstanceOf(Notification);
      expect(repository.persist).toHaveBeenCalledWith(notification);
    });

    it('should throw an error if the repository throws an error', () => {
      const repository: INotificationPersisterRepository = {
        persist: jest.fn().mockRejectedValue(new Error('Test')),
      };
      const useCase = new PersistNotification(repository);
      expect(
        useCase.execute(
          new Notification({
            content: 'Test',
            status: NotificationStatus.CREATED,
            channels: [],
          })
        )
      ).rejects.toThrow('Test');
    });
  });
});
