# Docker Development Environment - Mostval

Ambiente de desenvolvimento Docker equivalente à infraestrutura k3d, otimizado para desenvolvimento local com recursos limitados.

## 🚀 Início Rápido

### 1. Configuração Inicial

```bash
# Clone o repositório
git clone <repository-url>
cd infra/docker

# Copie o arquivo de configuração
cp env.example .env

# Verifique dependências
make deps
```

### 2. Iniciar a Infraestrutura

```bash
# Inicia todos os serviços
make up

# Ou use o script diretamente
./scripts/start.sh all
```

### 3. Verificar Status

```bash
# Verifica status de todos os serviços
make status

# Testa conectividade
make test
```

## 📚 Exemplos de Aplicações

### 🟢 Aplicação Node.js

#### Estrutura do Projeto

```
apps/
└── node-api/
    ├── package.json
    ├── server.js
    ├── Dockerfile
    └── .dockerignore
```

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
```

#### package.json

```json
{
  "name": "node-api",
  "version": "1.0.0",
  "description": "Node.js API for Mostval",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "redis": "^4.6.7",
    "cors": "^2.8.5"
  }
}
```

#### server.js

```javascript
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Conexão com Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cache/:key', async (req, res) => {
  try {
    const value = await redisClient.get(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
```

#### Adicionar ao docker-compose.yml

```yaml
  # Node.js API
  node-api:
    build:
      context: ../../apps/node-api
      dockerfile: Dockerfile
    container_name: mostval-node-api
    restart: unless-stopped
    environment:
      NODE_ENV: development
      DATABASE_URL: postgres://${POSTGRES_USER:-mostval}:${POSTGRES_PASSWORD:-mostval123}@postgresql:5432/${POSTGRES_DB:-mostval_sites}?sslmode=disable
      REDIS_URL: redis://redis:6379
      KEYCLOAK_URL: http://keycloak:8080
      KEYCLOAK_REALM: ${KEYCLOAK_REALM:-mostval}
      RABBITMQ_URL: amqp://${RABBITMQ_USER:-mostval}:${RABBITMQ_PASSWORD:-mostval123}@rabbitmq:5672/${RABBITMQ_VHOST:-mostval_sites}
      PORT: 3000
    ports:
      - "3000:3000"
    volumes:
      - ./logs/node-api:/app/logs
    networks:
      - mostval-network
    depends_on:
      postgresql:
        condition: service_healthy
      redis:
        condition: service_healthy
      keycloak:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```


### 🐹 Aplicação Go

#### Estrutura do Projeto

```
apps/
└── go-api/
    ├── go.mod
    ├── go.sum
    ├── main.go
    ├── Dockerfile
    └── .dockerignore
```

#### Dockerfile

```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
```

#### go.mod

```go
module go-api

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/lib/pq v1.10.9
    github.com/go-redis/redis/v8 v8.11.5
)
```

#### main.go

```go
package main

import (
    "context"
    "database/sql"
    "fmt"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/go-redis/redis/v8"
    _ "github.com/lib/pq"
)

var db *sql.DB
var rdb *redis.Client

func init() {
    var err error

    // Conectar ao PostgreSQL
    db, err = sql.Open("postgres", os.Getenv("DATABASE_URL"))
    if err != nil {
        log.Fatal(err)
    }

    // Conectar ao Redis
    rdb = redis.NewClient(&redis.Options{
        Addr: "redis:6379",
    })
}

func health(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "status":    "ok",
        "timestamp": time.Now().Format(time.RFC3339),
    })
}

func getUsers(c *gin.Context) {
    rows, err := db.Query("SELECT * FROM users LIMIT 10")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    defer rows.Close()

    var users []map[string]interface{}
    for rows.Next() {
        var id int
        var name string
        err := rows.Scan(&id, &name)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        users = append(users, map[string]interface{}{
            "id":   id,
            "name": name,
        })
    }

    c.JSON(http.StatusOK, users)
}

func getCache(c *gin.Context) {
    key := c.Param("key")
    val, err := rdb.Get(context.Background(), key).Result()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "key":   key,
        "value": val,
    })
}

func main() {
    r := gin.Default()

    r.GET("/health", health)
    r.GET("/api/users", getUsers)
    r.GET("/api/cache/:key", getCache)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("Server starting on port %s", port)
    r.Run(":" + port)
}
```

#### Adicionar ao docker-compose.yml

```yaml
  # Go API
  go-api:
    build:
      context: ../../apps/go-api
      dockerfile: Dockerfile
    container_name: mostval-go-api
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER:-mostval}:${POSTGRES_PASSWORD:-mostval123}@postgresql:5432/${POSTGRES_DB:-mostval_sites}?sslmode=disable
      REDIS_URL: redis://redis:6379
      KEYCLOAK_URL: http://keycloak:8080
      KEYCLOAK_REALM: ${KEYCLOAK_REALM:-mostval}
      RABBITMQ_URL: amqp://${RABBITMQ_USER:-mostval}:${RABBITMQ_PASSWORD:-mostval123}@rabbitmq:5672/${RABBITMQ_VHOST:-mostval_sites}
      PORT: 8080
    ports:
      - "8080:8080"
    volumes:
      - ./logs/go-api:/app/logs
    networks:
      - mostval-network
    depends_on:
      postgresql:
        condition: service_healthy
      redis:
        condition: service_healthy
      keycloak:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```


## 🐰 RabbitMQ - Sistema de Mensageria

### Configuração

#### Variáveis de Ambiente

```bash
# RabbitMQ Configuration
RABBITMQ_USER=mostval
RABBITMQ_PASSWORD=mostval123
RABBITMQ_VHOST=mostval_sites
RABBITMQ_ERLANG_COOKIE=mostval_cookie
RABBITMQ_URL=amqp://mostval:mostval123@rabbitmq:5672/mostval_sites
```

#### Portas

- **5672**: AMQP (protocolo de mensageria)
- **15672**: Management UI (interface web)

### Estrutura de Mensageria

#### Exchanges

- **mostval.notifications**: Exchange para notificações (tipo: topic)
- **mostval.events**: Exchange para eventos de sistema (tipo: topic)

#### Filas

- **notifications.email**: Fila para emails
- **notifications.sms**: Fila para SMS
- **events.audit**: Fila para eventos de auditoria

#### Routing Keys

- **email.***: Mensagens de email
- **sms.***: Mensagens de SMS
- **audit.***: Eventos de auditoria

### Comandos de Gerenciamento

```bash
# Iniciar RabbitMQ
make start-rabbitmq

# Ver logs
make logs-rabbitmq

# Testar conectividade
make test-rabbitmq

# Status
make status
```

### Acesso

#### URLs de Desenvolvimento

- **Management UI**: http://localhost:15672
- **Via Proxy**: http://localhost/rabbitmq/
- **AMQP**: localhost:5672

#### Credenciais

- **Usuário**: mostval
- **Senha**: mostval123
- **VHost**: mostval_sites

### Monitoramento

#### Health Checks

```bash
# Docker
docker exec mostval-rabbitmq rabbitmq-diagnostics ping
```

#### Management API

```bash
# Status geral
curl -u mostval:mostval123 http://localhost:15672/api/overview

# Filas
curl -u mostval:mostval123 http://localhost:15672/api/queues

# Exchanges
curl -u mostval:mostval123 http://localhost:15672/api/exchanges
```

### Padrões de Mensageria

#### Notificações

```typescript
// Enviar email
await sendMessage(channel, 'mostval.notifications', 'email.welcome', {
    type: 'email',
    to: 'user@example.com',
    subject: 'Bem-vindo!',
    body: 'Bem-vindo ao sistema!'
});

// Enviar SMS
await sendMessage(channel, 'mostval.notifications', 'sms.verification', {
    type: 'sms',
    to: '+5511999999999',
    message: 'Seu código: 123456'
});
```

#### Eventos de Auditoria

```typescript
// Evento de login
await sendMessage(channel, 'mostval.events', 'audit.login', {
    type: 'audit',
    action: 'login',
    user: 'user@example.com',
    timestamp: new Date().toISOString(),
    ip: '192.168.1.1'
});
```

### Troubleshooting

#### Problemas Comuns

**Conexão Recusada**

```bash
# Verificar se o serviço está rodando
docker ps | grep rabbitmq

# Verificar logs
docker logs mostval-rabbitmq
```

**Problemas de Autenticação**

```bash
# Verificar credenciais
curl -u mostval:mostval123 http://localhost:15672/api/overview

# Verificar vhost
curl -u mostval:mostval123 http://localhost:15672/api/vhosts
```

**Problemas de Performance**

```bash
# Verificar uso de memória
docker exec mostval-rabbitmq rabbitmq-diagnostics memory

# Verificar filas
curl -u mostval:mostval123 http://localhost:15672/api/queues
```

### Backup e Restore

#### Backup

```bash
# Backup das definições
curl -u mostval:mostval123 http://localhost:15672/api/definitions > rabbitmq-definitions.json

# Backup dos dados (Docker)
docker cp mostval-rabbitmq:/var/lib/rabbitmq ./backup/rabbitmq-data
```

#### Restore

```bash
# Restore das definições
curl -u mostval:mostval123 -H "content-type:application/json" -X POST http://localhost:15672/api/definitions -d @rabbitmq-definitions.json
```

## 📋 Comandos Disponíveis

### Comandos Básicos

| Comando | Descrição |
|---------|-----------|
| `make help` | Lista todos os comandos disponíveis |
| `make deps` | Verifica dependências (docker, docker-compose) |
| `make up` | Inicia toda a infraestrutura |
| `make down` | Para toda a infraestrutura |
| `make restart` | Reinicia toda a infraestrutura |
| `make status` | Mostra status da infraestrutura |
| `make logs` | Mostra logs de todos os serviços |
| `make test` | Testa conectividade da infraestrutura |

### Comandos por Serviço

| Comando | Descrição |
|---------|-----------|
| `make start-postgresql` | Inicia apenas PostgreSQL |
| `make start-redis` | Inicia apenas Redis |
| `make start-keycloak` | Inicia apenas Keycloak |
| `make start-localstack` | Inicia apenas LocalStack |
| `make start-rabbitmq` | Inicia apenas RabbitMQ |
| `make start-nginx` | Inicia apenas Nginx |

### Comandos de Logs

| Comando | Descrição |
|---------|-----------|
| `make logs-postgresql` | Mostra logs do PostgreSQL |
| `make logs-redis` | Mostra logs do Redis |
| `make logs-keycloak` | Mostra logs do Keycloak |
| `make logs-localstack` | Mostra logs do LocalStack |
| `make logs-rabbitmq` | Mostra logs do RabbitMQ |
| `make logs-nginx` | Mostra logs do Nginx |

### Comandos de Teste

| Comando | Descrição |
|---------|-----------|
| `make test-postgresql` | Testa conexão com PostgreSQL |
| `make test-redis` | Testa conexão com Redis |
| `make test-keycloak` | Testa conexão com Keycloak |
| `make test-localstack` | Testa conexão com LocalStack |
| `make test-rabbitmq` | Testa conexão com RabbitMQ |

### Comandos de Backup

| Comando | Descrição |
|---------|-----------|
| `make backup` | Faz backup de todos os dados |
| `make backup-postgresql` | Faz backup do PostgreSQL |
| `make backup-redis` | Faz backup do Redis |
| `make backup-localstack` | Faz backup do LocalStack |
| `make backup-rabbitmq` | Faz backup do RabbitMQ |

### Comandos de Limpeza

| Comando | Descrição |
|---------|-----------|
| `make cleanup` | Limpa containers e redes órfãs |
| `make cleanup-volumes` | Limpa volumes (CUIDADO: remove dados) |
| `make cleanup-images` | Remove imagens Docker |
| `make cleanup-all` | Remove tudo (CUIDADO: remove todos os dados) |

## 🔧 Configuração

### Variáveis de Ambiente

O arquivo `.env` contém as configurações principais:

```bash
# Configurações do PostgreSQL
POSTGRES_DB=mostval_sites
POSTGRES_USER=mostval
POSTGRES_PASSWORD=mostval123
POSTGRES_MULTIPLE_DATABASES=mostval_sites,keycloak

# Configurações do Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin123
KEYCLOAK_REALM=mostval

# Configurações do RabbitMQ
RABBITMQ_USER=mostval
RABBITMQ_PASSWORD=mostval123
RABBITMQ_VHOST=mostval_sites
RABBITMQ_ERLANG_COOKIE=mostval_cookie

# Configurações da aplicação
DATABASE_URL=postgres://mostval:mostval123@postgresql:5432/mostval_sites?sslmode=disable
REDIS_URL=redis://redis:6379
KEYCLOAK_URL=http://keycloak:8080
RABBITMQ_URL=amqp://mostval:mostval123@rabbitmq:5672/mostval_sites

# Configurações do LocalStack
AWS_DEFAULT_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
LOCALSTACK_ENDPOINT=http://localstack:4566
```

### Portas Expostas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| **Nginx** | 80, 443 | Proxy reverso (único acesso externo) |
| **PostgreSQL** | 5432 | Banco de dados (apenas interno) |
| **Redis** | 6379 | Cache e sessões (apenas interno) |
| **RabbitMQ** | 5672 | AMQP (mensageria, apenas interno) |
| **RabbitMQ Management** | 15672 | Interface web (apenas interno) |
| **Keycloak** | 8080 | Autenticação (apenas interno) |
| **LocalStack** | 4566 | AWS Emulator (apenas interno) |

## 🎯 Características

### Vantagens do Ambiente Docker

- **Baixo uso de recursos**: Otimizado para desenvolvimento local
- **Configuração rápida**: Setup em poucos comandos
- **Fácil manutenção**: Menos complexidade que Kubernetes
- **Ideal para desenvolvimento**: Foco no que realmente importa
- **Equivalente ao k3d**: Mesma funcionalidade, menor overhead
- **Segurança aprimorada**: Acesso centralizado via proxy Nginx
- **Isolamento de serviços**: Serviços internos não expostos externamente

### 🔒 Segurança e Isolamento

**Acesso Centralizado:**
- Apenas o Nginx (porta 80/443) é exposto externamente
- Todos os outros serviços são acessíveis apenas internamente
- Proxy reverso controla todo o tráfego de entrada

**Serviços Isolados:**
- **PostgreSQL**: Apenas para aplicações internas
- **Redis**: Apenas para aplicações internas
- **RabbitMQ**: Apenas para aplicações internas
- **Keycloak**: Acessível via proxy em `/auth/`
- **LocalStack**: Acessível via proxy em `/aws/`

**Benefícios de Segurança:**
- Redução da superfície de ataque
- Controle centralizado de acesso
- Logs centralizados no Nginx
- Facilita implementação de autenticação/autorização

### Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Keycloak      │    │   LocalStack    │
│   (Proxy)       │◄───┤   (Auth)         │    │   (AWS Emulator) │
│   Port: 80      │    │   Port: 8080    │    │   Port: 4566    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │     Redis       │
                    │   Port: 5432    │    │   Port: 6379    │
                    └─────────────────┘    └─────────────────┘
```

## 🌐 Acesso aos Serviços

### URLs de Desenvolvimento

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Nginx (Proxy)** | http://localhost | Proxy reverso principal |
| **Keycloak** | http://localhost/auth/ | Autenticação e autorização |
| **LocalStack** | http://localhost/aws/ | AWS Emulator |
| **RabbitMQ Management** | http://localhost/rabbitmq/ | Interface web do RabbitMQ |
| **PostgreSQL** | Apenas interno | Banco de dados (sem acesso externo) |
| **Redis** | Apenas interno | Cache e sessões (sem acesso externo) |
| **RabbitMQ** | Apenas interno | AMQP (mensageria, sem acesso externo) |

### Acesso via Proxy

**Todos os serviços são acessíveis APENAS através do proxy Nginx:**

- **Keycloak**: http://localhost/auth/
- **LocalStack**: http://localhost/aws/
- **RabbitMQ Management**: http://localhost/rabbitmq/

**Serviços internos (sem acesso externo):**
- **PostgreSQL**: Apenas para aplicações internas
- **Redis**: Apenas para aplicações internas  
- **RabbitMQ AMQP**: Apenas para aplicações internas

### Configuração de DNS Local (Opcional)

Para usar domínios locais, adicione ao `/etc/hosts`:

```
127.0.0.1 api.mostval.local
127.0.0.1 auth.mostval.local
127.0.0.1 rabbitmq.mostval.local
```

## 🛠️ Desenvolvimento

### Fluxo de Desenvolvimento

1. **Desenvolvimento**: Faça alterações no código
2. **Rebuild**: `make restart` (reinicia toda a infraestrutura)
3. **Teste**: Acesse as URLs de desenvolvimento
4. **Monitoramento**: Use `make logs` para verificar logs

### Scripts Disponíveis

Todos os scripts estão em `scripts/`:

- `start.sh` - Inicia serviços
- `stop.sh` - Para serviços
- `status.sh` - Verifica status
- `logs.sh` - Visualiza logs
- `test.sh` - Testa conectividade
- `backup.sh` - Faz backup
- `cleanup.sh` - Limpa ambiente

### Exemplos de Uso

```bash
# Iniciar apenas PostgreSQL
./scripts/start.sh postgresql

# Ver logs do Keycloak em tempo real
./scripts/logs.sh keycloak --follow

# Testar conectividade
./scripts/test.sh all

# Fazer backup
./scripts/backup.sh all
```

## 🔍 Troubleshooting

### Problemas Comuns

#### Docker não está rodando

```bash
# Verifica se Docker está rodando
docker info

# Inicia Docker (Ubuntu/Debian)
sudo systemctl start docker
sudo systemctl enable docker
```

#### Portas em uso

```bash
# Verifica portas em uso
netstat -tuln | grep -E ":(80|8080|8081|5432|6379) "

# Para serviços que estão usando as portas
sudo lsof -i :80
sudo lsof -i :8080
```

#### Problemas de conectividade

```bash
# Verifica status dos containers
make status

# Verifica logs de erro
make logs

# Testa conectividade (via proxy)
make test

# Testa acesso direto aos serviços (apenas internos)
docker exec mostval-postgresql pg_isready
docker exec mostval-redis redis-cli ping
docker exec mostval-rabbitmq rabbitmq-diagnostics ping
```

#### Problemas de acesso via proxy

```bash
# Verifica se o Nginx está funcionando
curl http://localhost/health

# Testa acesso aos serviços via proxy
curl http://localhost/auth/health/ready  # Keycloak
curl http://localhost/aws/_localstack/health  # LocalStack
curl http://localhost/rabbitmq/api/overview  # RabbitMQ Management

# Verifica configuração do Nginx
docker exec mostval-nginx nginx -t
```

#### Problemas de permissão

```bash
# Adiciona usuário ao grupo docker
sudo usermod -aG docker $USER

# Reinicia sessão
newgrp docker
```

### Limpeza Completa

```bash
# Para tudo e remove volumes
make cleanup-all

# Remove imagens não utilizadas
docker image prune -a

# Remove volumes não utilizados
docker volume prune
```

## 📊 Monitoramento

### Verificar Status

```bash
# Status geral
make status

# Logs em tempo real
make logs --follow

# Monitoramento contínuo
make monitor
```

### Health Checks

Todos os serviços incluem health checks:

- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`
- **Keycloak**: `curl /health/ready`
- **LocalStack**: `curl /_localstack/health`
- **Go API**: `curl /health`
- **Nginx**: `curl /health`

## ☁️ LocalStack (AWS Emulator)

O LocalStack é um emulador local da AWS que permite desenvolver e testar aplicações que usam serviços AWS sem custos ou dependências externas.

### Serviços Disponíveis

- **S3**: Armazenamento de objetos
- **SQS**: Filas de mensagens
- **DynamoDB**: Banco de dados NoSQL
- **Lambda**: Funções serverless
- **IAM**: Gerenciamento de identidades
- **STS**: Tokens de segurança
- **CloudFormation**: Infraestrutura como código
- **API Gateway**: APIs REST
- **Route53**: DNS
- **Secrets Manager**: Gerenciamento de segredos
- **SSM**: Gerenciamento de sistemas

### Configuração

```bash
# Variáveis de ambiente
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export LOCALSTACK_ENDPOINT=http://localhost:4566
```

### Exemplos de Uso

Consulte a pasta `examples/` para exemplos práticos em TypeScript e Go:

```bash
# Exemplos TypeScript
cd examples
npm install
npm run s3
npm run sqs

# Exemplos Go
go mod tidy
go run localstack-s3-example.go
go run localstack-sqs-example.go
go run localstack-dynamodb-example.go
```

### Acesso via Proxy

O LocalStack está disponível APENAS via proxy do Nginx:

```bash
# Acesso via proxy (único método)
curl http://localhost/aws/_localstack/health

# Acesso direto (NÃO DISPONÍVEL - porta não mapeada)
# curl http://localhost:4566/_localstack/health
```

### Persistência

Os dados do LocalStack são persistidos no volume `localstack_data` e podem ser restaurados após reinicializações.

## 🔄 Backup e Restore

### Backup

```bash
# Backup completo
make backup

# Backup específico
make backup-postgresql
make backup-redis
```

### Restore

```bash
# Restore PostgreSQL
docker exec -i mostval-postgresql psql -U mostval -d mostval_sites < backups/postgresql_mostval_sites_YYYYMMDD_HHMMSS.sql

# Restore Redis
docker cp backups/redis_YYYYMMDD_HHMMSS.rdb mostval-redis:/data/dump.rdb
docker restart mostval-redis
```

## 📁 Estrutura do Projeto

```text
infra/docker/
├── docker-compose.yml           # Configuração principal
├── env.example                  # Exemplo de variáveis
├── .env                         # Variáveis de ambiente (não commitar)
├── .gitignore                   # Arquivos ignorados
├── Makefile                     # Comandos principais
├── README.md                    # Este arquivo
├── config/
│   ├── nginx.conf              # Configuração do Nginx
│   └── redis.conf              # Configuração do Redis
├── scripts/
│   ├── start.sh                # Inicia serviços
│   ├── stop.sh                 # Para serviços
│   ├── status.sh               # Status dos serviços
│   ├── logs.sh                 # Visualiza logs
│   ├── test.sh                 # Testa conectividade
│   ├── backup.sh               # Faz backup
│   ├── cleanup.sh              # Limpa ambiente
│   ├── check-deps.sh           # Verifica dependências
│   └── init-multiple-databases.sh  # Script de inicialização do PostgreSQL
└── backups/                     # Diretório de backups (criado automaticamente)
```

## 💰 Comparação com k3d

| Aspecto | Docker Compose | k3d |
|---------|----------------|-----|
| **Recursos** | Menor uso de RAM/CPU | Maior uso de recursos |
| **Complexidade** | Simples | Mais complexo |
| **Setup** | Rápido | Mais lento |
| **Kubernetes** | Não | Sim |
| **Desenvolvimento** | Ideal | Mais overhead |
| **Produção** | Não recomendado | Recomendado |

## 🔧 Configuração do Nginx

Para expor suas aplicações via proxy, adicione ao `config/nginx.conf`:

```nginx
# Upstreams para suas aplicações
upstream node_api {
    server node-api:3000;
}

upstream go_api {
    server go-api:8080;
}

# No server block, adicione:
location /api/node/ {
    proxy_pass http://node_api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /api/go/ {
    proxy_pass http://go_api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 🚀 Comandos de Deploy

```bash
# Iniciar todas as aplicações
make up

# Iniciar aplicação específica
make start-node-api
make start-go-api

# Ver logs
make logs-node-api
make logs-go-api

# Testar conectividade
make test-node-api
make test-go-api
```

## 📊 URLs de Acesso

- **Nginx Proxy**: http://localhost (único ponto de acesso)
  - **Keycloak**: http://localhost/auth/
  - **LocalStack**: http://localhost/aws/
  - **RabbitMQ Management**: http://localhost/rabbitmq/
  - **Node.js API**: http://localhost/api/node/ (quando adicionado)
  - **Go API**: http://localhost/api/go/ (quando adicionado)

**Serviços internos (sem acesso externo):**
- **PostgreSQL**: Apenas para aplicações internas
- **Redis**: Apenas para aplicações internas
- **RabbitMQ AMQP**: Apenas para aplicações internas

## 📄 Licença

Este projeto está sob a licença MIT.
