import { Notification, NotificationStatus } from '@mostval/notification';
import { InMemoryNotificationPersisterRepository } from './notification.repository';

describe('InMemoryNotificationPersisterRepository', () => {
  let repository: InMemoryNotificationPersisterRepository;
  let sampleNotification: Notification<string>;

  beforeEach(() => {
    repository = new InMemoryNotificationPersisterRepository();
    sampleNotification = new Notification<string>({
      channels: [],
      content: 'Test notification',
      status: NotificationStatus.CREATED,
    });
  });

  describe('persist', () => {
    it('deve persistir uma nova notificação e retorná-la', async () => {
      const result = await repository.persist(sampleNotification);

      expect(result.id).toBeDefined();
      expect(result.version).toBe(sampleNotification.version + 1);
      expect(result.getValue()).toEqual(sampleNotification.getValue());
      expect(await repository.findAll()).toContain(result);
    });
  });

  describe('findAll', () => {
    it('deve retornar array vazio quando não houver notificações', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('deve retornar todas as notificações persistidas', async () => {
      await repository.persist(sampleNotification);
      const notification2 = new Notification({
        channels: [],
        content: 'Another notification',
        status: NotificationStatus.CREATED,
      });
      await repository.persist(notification2);

      const result = await repository.findAll();
      expect(result).toHaveLength(2);
      const expected = [
        { ...sampleNotification, id: '1', version: 1 },
        { ...notification2, id: '2', version: 1 },
      ];
      expect(result).toEqual(expected);
    });
  });

  describe('findById', () => {
    it('deve retornar undefined quando notificação não existir', async () => {
      const result = await repository.findById('nonexistent');

      expect(result).toBeUndefined();
    });

    it('deve retornar a notificação quando encontrada', async () => {
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
