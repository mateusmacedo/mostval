import { AbstractError, ErrorCode, InternalError } from '@mostval/common';
import { NotificationError } from './error';

describe('NotificationError', () => {
  it('deve criar um erro com apenas mensagem', () => {
    const error = new NotificationError('Erro de notificação');

    expect(error).toBeInstanceOf(NotificationError);
    expect(error.message).toBe('Erro de notificação');
    expect(error.code).toBe(ErrorCode.PROCESSING);
    expect(error.previousError).toBeUndefined();
  });

  it('deve criar um erro com mensagem e código personalizado', () => {
    const customCode = 1234;
    const error = new NotificationError('Erro de notificação', customCode);

    expect(error.message).toBe('Erro de notificação');
    expect(error.code).toBe(ErrorCode.PROCESSING);
    expect(error.previousError).toBeUndefined();
  });

  it('deve criar um erro com erro anterior', () => {
    const previousError = new InternalError('Erro anterior');
    const error = new NotificationError(
      'Erro de notificação',
      undefined,
      previousError
    );

    expect(error.message).toBe('Erro de notificação');
    expect(error.code).toBe(ErrorCode.PROCESSING);
    expect(error.previousError).toBe(previousError);
  });

  it('deve criar um erro com todos os parâmetros', () => {
    const customCode = 1234;
    const previousError = new InternalError('Erro anterior');
    const error = new NotificationError(
      'Erro de notificação',
      customCode,
      previousError
    );
    expect(error.message).toBe('Erro de notificação');
    expect(error.code).toBe(ErrorCode.PROCESSING);
    expect(error.previousError).toBe(previousError);
  });

  it('deve ter o código de erro padrão correto', () => {
    expect(NotificationError.code).toBe(ErrorCode.PROCESSING);
  });
});
