import {
  IDestroyable,
  ILogger,
  IPostCreationOption,
  IPreCreationOption,
} from '../Instance-factory';

/*
  ========== EXEMPLO DE USO ==========
*/

import {
  BasicFactory,
  RegistrationScope,
  SimpleDIContainer,
} from '../Instance-factory';

// 1) Logger simples via console
class ConsoleLogger implements ILogger {
  error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error);
  }
  warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }
  info(message: string): void {
    console.info(`[INFO] ${message}`);
  }
  debug(message: string): void {
    console.debug(`[DEBUG] ${message}`);
  }
}

// 2) Serviço base
abstract class BaseService {
  constructor(public name: string) {}
}

// 3) Classe de serviço concreta que implementa IDestroyable
class MyService extends BaseService implements IDestroyable {
  doSomething() {
    console.log(`Olá, ${this.name}! Fazendo algo...`);
  }

  onDestroy(): void {
    console.log(`Liberando recursos do MyService (${this.name})...`);
  }
}

// 4) Hooks de pré/pós-criação
class ValidateNamePreCreate implements IPreCreationOption<typeof MyService> {
  preCreate(args?: [string]) {
    const serviceName = args?.[0];
    if (!serviceName) {
      throw new Error('Nome do serviço não pode ser vazio!');
    }
    console.log(`✔ Pré-criação validada: ${serviceName}`);
  }
}

class LoggingPostCreate implements IPostCreationOption<MyService> {
  postCreate(instance: MyService) {
    console.log(`✔ Instância de MyService criada: nome='${instance.name}'`);
  }
}

// 5) Exemplo de tokens
const MY_SERVICE_TOKEN = Symbol('MY_SERVICE_TOKEN');
const PRE_HOOK_TOKEN = Symbol('PRE_HOOK_TOKEN');
const POST_HOOK_TOKEN = Symbol('POST_HOOK_TOKEN');

// 6) Criação do contêiner e registro
const logger = new ConsoleLogger();
const container = new SimpleDIContainer(logger);

// Registra MyService com escopo Singleton
container.register(MY_SERVICE_TOKEN, MyService, RegistrationScope.Singleton);

// Registra hooks
container.register(PRE_HOOK_TOKEN, new ValidateNamePreCreate());
container.register(POST_HOOK_TOKEN, new LoggingPostCreate());

// 7) Cria a fábrica e utiliza
const factory = new BasicFactory(container, logger);

// Cria instância do MyService com hooks
const myServiceInstance = factory.create(
  MyService,
  ['ServiçoPrincipal'],
  [PRE_HOOK_TOKEN, POST_HOOK_TOKEN]
);

(myServiceInstance as MyService).doSomething();

// 8) Exemplo de destruição
console.log('Chamando destroy para MY_SERVICE_TOKEN...');
container.destroy(MY_SERVICE_TOKEN);
