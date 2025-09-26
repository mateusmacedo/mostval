SHELL := /usr/bin/bash
.ONESHELL:
.DEFAULT_GOAL := help
.PHONY: help deps up down start status test generate-passwords

ifneq ("$(wildcard .env)","")
  include .env
  export
endif

help: ## Lista comandos
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# Comandos básicos
deps: ## Verifica dependências (docker, k3d, kubectl, helm)
	./scripts/08-deps.sh check

up: ## Cria o cluster k3d (80/443 expostas) e registry local
	./scripts/01-cluster.sh create

down: ## Remove cluster e registry
	./scripts/01-cluster.sh delete

start: ## Inicializa cluster k3d existente
	./scripts/01-cluster.sh start

status: ## Mostra status do cluster
	./scripts/01-cluster.sh status

# Comandos de aplicações
build-images: ## Constrói e faz push das imagens Docker (inteligente)
	./scripts/02-registry.sh build

deploy-all: ## Constrói e implanta todas as aplicações (inteligente)
	./scripts/02-registry.sh build

# Comandos específicos
smart-build: ## Build inteligente com detecção automática de contexto
	./scripts/02-registry.sh build

smart-deploy: ## Deploy inteligente com detecção automática de contexto
	./scripts/02-registry.sh build

# Comandos específicos do Mostval
deploy-mostval: ## Deploy Mostval infrastructure (PostgreSQL, Redis, Keycloak, LocalStack)
	./scripts/03-deploy.sh deploy

# Comandos de Ingress Centralizado
setup-centralized-ingress: ## Configura ingress centralizado (URL única)
	./scripts/04-ingress.sh setup

test-centralized-ingress: ## Testa ingress centralizado
	./scripts/04-ingress.sh test

revert-centralized-ingress: ## Reverte para ingress individuais
	./scripts/04-ingress.sh revert

# Comandos de conveniência
test: ## Testa conectividade do cluster
	./scripts/06-test.sh cluster

test-registry: ## Testa o registry local
	./scripts/06-test.sh registry

test-ingress: ## Testa ingress centralizado
	./scripts/06-test.sh ingress

test-all: ## Executa todos os testes
	./scripts/06-test.sh all

# Comandos de utilitários
generate-passwords: ## Gera senhas seguras automaticamente
	./scripts/07-utils.sh generate-passwords

get-registry-url: ## Obtém URL do registry baseada no contexto
	./scripts/07-utils.sh get-registry-url

# Comandos de segurança
apply-security: ## Aplica políticas de segurança
	./scripts/05-security.sh apply

allow-app: ## Permite ingress de uma nova aplicação
	./scripts/05-security.sh allow-app
