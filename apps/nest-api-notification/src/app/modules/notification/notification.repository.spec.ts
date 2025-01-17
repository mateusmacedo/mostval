import { Notification, NotificationStatus } from '@mostval/notification';
import { InMemoryNotificationPersisterRepository } from './notification.repository';
import { Logger } from '@nestjs/common';

describe('InMemoryNotificationPersisterRepository', () => {
  let repository: InMemoryNotificationPersisterRepository;
  let sampleNotification: Notification<string>;
  let logger: Logger;

  beforeEach(() => {
    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as Logger;
    repository = new InMemoryNotificationPersisterRepository(logger);
    sampleNotification = new Notification<string>({
      channels: [],
      content: 'Test notification',
      status: NotificationStatus.CREATED,
    });
  });

  describe('persist', () => {
    it('deve persistir uma nova notificação e retorná-la', async () => {
      jest.spyOn(logger, 'log');
      const result = await repository.persist(sampleNotification);

      expect(result.id).toBeDefined();
      expect(result.version).toBe(sampleNotification.version + 1);
      expect(result.getValue()).toEqual(sampleNotification.getValue());
      expect(await repository.findAll()).toContain(result);
      expect(logger.log).toHaveBeenCalledWith(
        `Notification persisted: ${result.id}`
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar array vazio quando não houver notificações', async () => {
      jest.spyOn(logger, 'log');
      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(logger.log).toHaveBeenCalledWith('Finding all notifications');
      expect(logger.log).toHaveBeenCalledWith('Found 0 notifications');
    });

    it('deve retornar todas as notificações persistidas', async () => {
      jest.spyOn(logger, 'log');
      await repository.persist(sampleNotification);
      const notification2 = new Notification({
        channels: [],
        content: 'Another notification',
        status: NotificationStatus.CREATED,
      });
      await repository.persist(notification2);

      const result = await repository.findAll();
      const expected = [sampleNotification, notification2];

      expect(result).toHaveLength(2);
      expect(logger.log).toHaveBeenCalledWith('Finding all notifications');
      expect(logger.log).toHaveBeenCalledWith('Found 2 notifications');

      for (let i = 0; i < result.length; i++) {
        expect(result[i].id).toEqual(`${i + 1}`);
        expect(result[i].version).toEqual(result[i].version);
        expect(result[i].getValue()).toEqual(expected[i].getValue());
      }
    });
  });

  describe('findById', () => {
    it('deve retornar undefined quando notificação não existir', async () => {
      jest.spyOn(logger, 'log');
      const result = await repository.findById('nonexistent');

      expect(result).toBeUndefined();
    });

    it('deve retornar a notificação quando encontrada', async () => {
      jest.spyOn(logger, 'log');
      await repository.persist(sampleNotification);

      const result = await repository.findById('1');

      expect(result?.getValue().content).toEqual(
        sampleNotification.getValue().content
      );
      expect(result?.getValue().channels).toEqual(
        sampleNotification.getValue().channels
      );
      expect(result?.getValue().status).toEqual(
        sampleNotification.getValue().status
      );
    });
  });

  describe('deleteById', () => {
    it('não deve lançar erro ao tentar deletar notificação inexistente', async () => {
      await expect(repository.deleteById('nonexistent')).resolves.not.toThrow();
    });

    it('deve remover a notificação quando existir', async () => {
      await repository.persist(sampleNotification);

      await repository.deleteById('1');

      const result = await repository.findAll();
      expect(result).not.toContain([sampleNotification]);
    });
  });
});
