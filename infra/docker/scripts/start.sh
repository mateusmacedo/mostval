#!/usr/bin/bash
set -euo pipefail

# Script para iniciar a infraestrutura Mostval com Docker Compose
# Uso: ./scripts/start.sh [all|postgresql|redis|keycloak|nginx]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Carrega variáveis de ambiente
if [[ -f "${ROOT_DIR}/.env" ]]; then
    set -a
    source "${ROOT_DIR}/.env"
    set +a
fi

COMPONENT="${1:-all}"

echo "[start] Iniciando infraestrutura Mostval..."

# Verifica se o Docker está rodando
if ! docker info >/dev/null 2>&1; then
    echo "[error] Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Verifica se o Docker Compose está disponível
if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
    echo "[error] Docker Compose não está disponível."
    exit 1
fi

# Função para executar docker-compose
run_compose() {
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

case "${COMPONENT}" in
    "all")
        echo "[start] Iniciando todos os serviços..."
        run_compose up -d
        ;;
    "postgresql")
        echo "[start] Iniciando PostgreSQL..."
        run_compose up -d postgresql
        ;;
    "redis")
        echo "[start] Iniciando Redis..."
        run_compose up -d redis
        ;;
    "rabbitmq")
        echo "[start] Iniciando RabbitMQ..."
        run_compose up -d rabbitmq
        ;;
    "keycloak")
        echo "[start] Iniciando Keycloak..."
        run_compose up -d keycloak
        ;;
    "nginx")
        echo "[start] Iniciando Nginx..."
        run_compose up -d nginx
        ;;
    "localstack")
        echo "[start] Iniciando LocalStack..."
        run_compose up -d localstack
        ;;
    *)
        echo "[error] Componente inválido: ${COMPONENT}"
        echo "Uso: $0 [all|postgresql|redis|rabbitmq|keycloak|nginx|localstack]"
        exit 1
        ;;
esac

echo "[ok] Serviços iniciados com sucesso!"
echo "[info] Para verificar status: ./scripts/status.sh"
echo "[info] Para ver logs: ./scripts/logs.sh"
