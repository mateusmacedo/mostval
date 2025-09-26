# k3d-dev - Ambiente de Desenvolvimento Kubernetes (Single Node)

Ambiente de desenvolvimento Kubernetes otimizado usando k3d, ideal para desenvolvimento local com recursos limitados.

## 🚀 Início Rápido

### 1. Configuração Inicial

```bash
# Clone o repositório
git clone <repository-url>
cd k3d-dev

# Gere senhas seguras automaticamente
make generate-passwords

# Verifique dependências
make deps
```

### 2. Criar o Ambiente Base

```bash
# Crie o cluster k3d
make up

# Deploy da infraestrutura
make deploy-mostval

# Configure ingress centralizado
make setup-centralized-ingress
```

### 3. Inicializar Cluster Existente

Se você já tem um cluster criado e precisa apenas inicializá-lo:

```bash
# Inicializa cluster existente
make start
```

## 📋 Comandos Disponíveis

### Comandos Básicos

| Comando | Descrição |
|---------|-----------|
| `make help` | Lista todos os comandos disponíveis |
| `make deps` | Verifica dependências (docker, k3d, kubectl) |
| `make up` | Cria o cluster k3d single node e registry local |
| `make down` | Remove cluster e registry |
| `make start` | Inicializa cluster k3d existente |
| `make status` | Mostra status do cluster |
| `make test` | Testa conectividade do cluster |
| `make generate-passwords` | Gera senhas seguras automaticamente |

### Comandos de Infraestrutura

| Comando | Descrição |
|---------|-----------|
| `make deploy-mostval` | Deploy da infraestrutura completa |
| `make setup-centralized-ingress` | Configura ingress centralizado (URL única) |
| `make test-centralized-ingress` | Testa ingress centralizado |
| `make revert-centralized-ingress` | Reverte para ingress individuais |

### Comandos de Teste

| Comando | Descrição |
|---------|-----------|
| `make test` | Testa conectividade do cluster |
| `make test-registry` | Testa o registry local |
| `make test-ingress` | Testa ingress centralizado |
| `make test-all` | Executa todos os testes |

### Comandos de Build e Deploy

| Comando | Descrição |
|---------|-----------|
| `make build-images` | Constrói e faz push das imagens Docker (inteligente) |
| `make deploy-all` | Constrói e implanta todas as aplicações (inteligente) |
| `make smart-build` | Build inteligente com detecção automática de contexto |
| `make smart-deploy` | Deploy inteligente com detecção automática de contexto |

### Comandos de Segurança

| Comando | Descrição |
|---------|-----------|
| `make apply-security` | Aplica políticas de segurança |
| `make allow-app` | Permite ingress de uma nova aplicação |

## 🔧 Configuração

### Variáveis de Ambiente

Copie `env.example` para `.env` e ajuste conforme necessário:

```bash
cp env.example .env
```

Principais variáveis:

- `CLUSTER_NAME`: Nome do cluster (padrão: dev)
- `K3S_VERSION`: Versão do k3s (padrão: v1.29.5-k3s1)
- `REGISTRY_PORT`: Porta do registry local (padrão: 5001)
- `CLUSTER_PASSWORD`: Senha do cluster (gerada automaticamente)

## 🎯 Características

### Vantagens do Ambiente Single Node

- **Baixo uso de recursos**: Otimizado com 16GB RAM
- **Configuração rápida**: Setup em poucos comandos
- **Fácil manutenção**: Menos complexidade, mais estabilidade
- **Ideal para desenvolvimento**: Foco no que realmente importa
- **Otimizado para baixo orçamento**: Configuração especial

### Configuração

- **`cluster.yaml`**: Configuração otimizada (16GB RAM, 1TB SSD)

### Fluxo de Uso Recomendado

```bash
# 1. Configuração inicial
make generate-passwords
make deps

# 2. Criar cluster otimizado 
make up

# 3. Deploy da infraestrutura
make deploy-mostval

# 4. Configurar ingress centralizado
make setup-centralized-ingress

# 5. Testar funcionamento
make test-all
```

### Portas Expostas

- **80/443**: Ingress (Traefik)
- **6445**: API do Kubernetes
- **5001**: Registry local

## 🌐 Ingress Centralizado

### Vantagens

#### ✅ **Antes (Ingress Individuais)**
```bash
# Múltiplas entradas no /etc/hosts
127.0.0.1 auth.mostval.local
127.0.0.1 aws.mostval.local
127.0.0.1 rabbitmq.mostval.local
```

#### ✅ **Depois (Ingress Centralizado)**
```bash
# Apenas uma entrada no /etc/hosts
127.0.0.1 mostval.local
```

### URLs de Acesso

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Dashboard** | https://mostval.local/ | Página inicial com links para todos os serviços |
| **Keycloak** | https://mostval.local/auth/ | Autenticação e autorização |
| **LocalStack** | https://mostval.local/aws/ | AWS Emulator |
| **RabbitMQ** | https://mostval.local/rabbitmq/ | Sistema de mensageria |
| **Health** | https://mostval.local/health | Verificação de saúde |
| **Node.js API** | https://mostval.local/api/node/ | API Node.js (quando implantada) |
| **Go API** | https://mostval.local/api/go/ | API Go (quando implantada) |

### Configuração do Ingress

```bash
# Aplicar o ingress centralizado
make setup-centralized-ingress

# Configurar /etc/hosts
echo '127.0.0.1 mostval.local' | sudo tee -a /etc/hosts

# Testar configuração
make test-centralized-ingress
```

## 🚀 Scripts Inteligentes

### Problema Resolvido

#### **Antes (Scripts Legados)**
```bash
# Problema: localhost hardcoded
REGISTRY_URL="localhost:5001"  # ❌ Falha no cluster
docker push localhost:5001/app:latest  # ❌ Não funciona no cluster
```

#### **Depois (Scripts Inteligentes)**
```bash
# Solução: Detecção automática de contexto
REGISTRY_URL=$(./scripts/07-utils.sh get-registry-url)  # ✅ Funciona em qualquer contexto
docker push $REGISTRY_URL/app:latest  # ✅ Funciona sempre
```

### Scripts Consolidados

| Script | Descrição | Comandos |
|--------|-----------|----------|
| `01-cluster.sh` | Gerenciamento do cluster | create, start, delete, status |
| `02-registry.sh` | Registry + build/push inteligente | test, build |
| `03-deploy.sh` | Deploy da infraestrutura | deploy, status, logs, test |
| `04-ingress.sh` | Ingress centralizado | setup, revert, test |
| `05-security.sh` | Segurança e políticas | apply, allow-app, status |
| `06-test.sh` | Testes consolidados | cluster, registry, ingress, connectivity, all |
| `07-utils.sh` | Utilitários diversos | status, generate-passwords, create-secrets, get-registry-url |
| `08-deps.sh` | Dependências e configuração | check, install, configure, info |

### Detecção de Contexto

```bash
# Verifica se está rodando dentro de um pod Kubernetes
if [ -n "${KUBERNETES_SERVICE_HOST}" ]; then
    # Contexto: Cluster Kubernetes
    REGISTRY_URL="k3d-dev-registry:5000"
else
    # Contexto: Host local
    REGISTRY_URL="localhost:5001"
fi
```

## 🔒 Segurança

### Senhas Geradas Automaticamente

O comando `make generate-passwords` gera automaticamente:

- Senha do cluster k3d

### Políticas de Segurança

- **NetworkPolicies básicas**: Aplicadas automaticamente
- **PodSecurityStandards**: Configurados pelo k3s
- **Isolamento de rede**: Implementado via k3d

### Configuração Segura

- Nunca commite o arquivo `.env` (está no `.gitignore`)
- Use secrets do Kubernetes para dados sensíveis
- Configure RBAC conforme necessário para seu projeto

## 🛠️ Desenvolvimento

### Registry Local

O registry local está disponível em `localhost:5001`:

```bash
# Tag uma imagem
docker tag minha-imagem:latest localhost:5001/minha-imagem:latest

# Push para o registry
docker push localhost:5001/minha-imagem:latest

# Pull no cluster
kubectl run test --image=localhost:5001/minha-imagem:latest
```

### Build e Deploy Inteligente

```bash
# Build de aplicação específica
./scripts/02-registry.sh build node-api
./scripts/02-registry.sh build go-api

# Deploy da infraestrutura
./scripts/03-deploy.sh deploy

# Testes completos
./scripts/06-test.sh all
```

## ☁️ LocalStack (AWS Emulator)

### Acesso

- **URL**: https://mostval.local/aws/
- **Namespace**: `mostval`
- **Serviços**: S3, SQS, DynamoDB, Lambda, IAM, STS, CloudFormation, API Gateway, Route53, Secrets Manager, SSM

### Configuração

```bash
# Variáveis de ambiente para aplicações
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export LOCALSTACK_ENDPOINT=https://mostval.local/aws/
```

### Verificar Status

```bash
# Verificar se o LocalStack está rodando
kubectl get pods -n mostval -l app=localstack

# Verificar logs
kubectl logs -f deployment/localstack -n mostval

# Testar conectividade
curl -k https://mostval.local/aws/_localstack/health
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
RABBITMQ_URL=amqp://mostval:mostval123@rabbitmq.mostval.svc.cluster.local:5672/mostval_sites
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

### Acesso

#### URLs de Desenvolvimento

- **Management UI**: https://mostval.local/rabbitmq/
- **AMQP**: rabbitmq.mostval.svc.cluster.local:5672

#### Credenciais

- **Usuário**: mostval
- **Senha**: mostval123
- **VHost**: mostval_sites

## 🔍 Troubleshooting

### Cluster não inicia

```bash
# Verifique se o Docker está rodando
docker info

# Verifique portas em uso
netstat -tuln | grep -E ":(80|443|5001|6445) "

# Limpe e recrie
make down
make up
```

### Cluster com problemas

```bash
# Verifique se o cluster está rodando
make status

# Teste conectividade
make test

# Verifique pods do sistema
kubectl get pods -n kube-system

# Verifique logs de pods com problemas
kubectl logs -n kube-system <nome-do-pod>
```

### Problemas de Conectividade

```bash
# Verifique se o kubeconfig está correto
kubectl config current-context

# Verifique se o cluster está acessível
kubectl cluster-info

# Recrie o cluster se necessário
make down
make up
```

### Problemas de Ingress

```bash
# Verificar /etc/hosts
grep mostval.local /etc/hosts

# Adicionar se não existir
echo '127.0.0.1 mostval.local' | sudo tee -a /etc/hosts

# Verificar status do ingress
kubectl get ingress -n mostval

# Verificar logs do Traefik
kubectl logs -f deployment/traefik -n kube-system
```

### Problemas de Registry

```bash
# Verificar se o registry está rodando
kubectl get pods -n kube-system | grep registry

# Verificar conectividade
kubectl exec -it deployment/nginx -n mostval -- curl http://k3d-dev-registry:5000/v2/

# Verificar URL do registry
./scripts/07-utils.sh get-registry-url
```

## 📁 Estrutura do Projeto

```text
k3d-dev/
├── values/
│   └── cluster.yaml                    # Configuração otimizada
├── manifests/
│   ├── 00-namespace.yaml              # Namespace
│   ├── 01-database.yaml               # PostgreSQL + Redis
│   ├── 02-identity.yaml               # Keycloak
│   ├── 03-messaging.yaml              # RabbitMQ
│   ├── 04-aws-emulator.yaml           # LocalStack
│   └── 05-ingress.yaml                # Ingress centralizado
├── scripts/
│   ├── 01-cluster.sh                  # Gerenciamento do cluster
│   ├── 02-registry.sh                 # Registry + build/push
│   ├── 03-deploy.sh                   # Deploy da infraestrutura
│   ├── 04-ingress.sh                  # Ingress centralizado
│   ├── 05-security.sh                 # Segurança e políticas
│   ├── 06-test.sh                     # Testes consolidados
│   ├── 07-utils.sh                    # Utilitários diversos
│   └── 08-deps.sh                     # Dependências e configuração
├── env.example                         # Exemplo de variáveis de ambiente
├── .gitignore                          # Arquivos ignorados
├── Makefile                            # Comandos principais
└── README.md                           # Este arquivo
```

## 💰 Otimizações para Recursos Limitados

Este ambiente k3d está otimizado para desenvolvimento com recursos limitados:

- **Configuração otimizada** para 16GB RAM
- **Single node** para simplicidade
- **Registry local** para desenvolvimento rápido
- **Ingress centralizado** para acesso unificado
- **Scripts inteligentes** para detecção automática de contexto

## 📄 Licença

Este projeto está sob a licença MIT.