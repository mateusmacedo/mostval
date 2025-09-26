SHELL := /usr/bin/bash
.ONESHELL:
.DEFAULT_GOAL := help
.PHONY: help deps up down start stop status logs backup cleanup test

ifneq ("$(wildcard .env)","")
  include .env
  export
endif

help: ## Lista comandos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# Comandos básicos
deps: ## Verifica dependências (docker, docker-compose)
	./scripts/check-deps.sh

up: ## Inicia toda a infraestrutura
	./scripts/start.sh all

down: ## Para toda a infraestrutura
	./scripts/stop.sh all

start: ## Inicia infraestrutura existente
	./scripts/start.sh all

stop: ## Para infraestrutura
	./scripts/stop.sh all

status: ## Mostra status da infraestrutura
	./scripts/status.sh

logs: ## Mostra logs de todos os serviços
	./scripts/logs.sh all

# Comandos específicos por serviço
start-postgresql: ## Inicia apenas PostgreSQL
	./scripts/start.sh postgresql

start-redis: ## Inicia apenas Redis
	./scripts/start.sh redis

start-rabbitmq: ## Inicia apenas RabbitMQ
	./scripts/start.sh rabbitmq

start-keycloak: ## Inicia apenas Keycloak
	./scripts/start.sh keycloak


start-nginx: ## Inicia apenas Nginx
	./scripts/start.sh nginx

start-localstack: ## Inicia apenas LocalStack
	./scripts/start.sh localstack

# Comandos de logs específicos
logs-postgresql: ## Mostra logs do PostgreSQL
	./scripts/logs.sh postgresql

logs-redis: ## Mostra logs do Redis
	./scripts/logs.sh redis

logs-rabbitmq: ## Mostra logs do RabbitMQ
	./scripts/logs.sh rabbitmq

logs-keycloak: ## Mostra logs do Keycloak
	./scripts/logs.sh keycloak


logs-nginx: ## Mostra logs do Nginx
	./scripts/logs.sh nginx

logs-localstack: ## Mostra logs do LocalStack
	./scripts/logs.sh localstack

# Comandos de backup
backup: ## Faz backup de todos os dados
	./scripts/backup.sh all

backup-postgresql: ## Faz backup do PostgreSQL
	./scripts/backup.sh postgresql

backup-redis: ## Faz backup do Redis
	./scripts/backup.sh redis

backup-localstack: ## Faz backup do LocalStack
	./scripts/backup.sh localstack

# Comandos de limpeza
cleanup: ## Limpa containers e redes órfãs
	./scripts/cleanup.sh

cleanup-volumes: ## Limpa volumes (CUIDADO: remove dados)
	./scripts/cleanup.sh --volumes

cleanup-images: ## Remove imagens Docker
	./scripts/cleanup.sh --images

cleanup-all: ## Remove tudo (CUIDADO: remove todos os dados)
	./scripts/cleanup.sh --volumes --images

# Comandos de teste
test: ## Testa conectividade da infraestrutura
	./scripts/test.sh

test-postgresql: ## Testa conexão com PostgreSQL
	./scripts/test.sh postgresql

test-redis: ## Testa conexão com Redis
	./scripts/test.sh redis

test-rabbitmq: ## Testa conexão com RabbitMQ
	./scripts/test.sh rabbitmq

test-keycloak: ## Testa conexão com Keycloak
	./scripts/test.sh keycloak

test-localstack: ## Testa conexão com LocalStack
	./scripts/test.sh localstack


# Comandos de desenvolvimento
dev: ## Inicia ambiente de desenvolvimento
	cp env.example .env
	./scripts/start.sh all
	./scripts/status.sh

dev-logs: ## Segue logs em tempo real
	./scripts/logs.sh all --follow

# Comandos de conveniência
restart: ## Reinicia toda a infraestrutura
	./scripts/stop.sh all
	./scripts/start.sh all


# Comandos de monitoramento
monitor: ## Monitora status em tempo real
	watch -n 5 './scripts/status.sh'

# Comandos de configuração
config: ## Copia arquivo de configuração
	cp env.example .env
	@echo "[info] Arquivo .env criado. Edite conforme necessário."

# Comandos de rede
network: ## Mostra informações de rede
	docker network ls
	docker network inspect mostval-network || true
