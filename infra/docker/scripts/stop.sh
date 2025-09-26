#!/usr/bin/bash
set -euo pipefail

# Script para parar a infraestrutura Mostval
# Uso: ./scripts/stop.sh [all|postgresql|redis|keycloak|nginx]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

COMPONENT="${1:-all}"

echo "[stop] Parando infraestrutura Mostval..."

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
        echo "[stop] Parando todos os serviços..."
        run_compose down
        ;;
    "postgresql")
        echo "[stop] Parando PostgreSQL..."
        run_compose stop postgresql
        ;;
    "redis")
        echo "[stop] Parando Redis..."
        run_compose stop redis
        ;;
    "keycloak")
        echo "[stop] Parando Keycloak..."
        run_compose stop keycloak
        ;;
    "nginx")
        echo "[stop] Parando Nginx..."
        run_compose stop nginx
        ;;
    "localstack")
        echo "[stop] Parando LocalStack..."
        run_compose stop localstack
        ;;
    *)
        echo "[error] Componente inválido: ${COMPONENT}"
        echo "Uso: $0 [all|postgresql|redis|keycloak|nginx|localstack]"
        exit 1
        ;;
esac

echo "[ok] Serviços parados com sucesso!"
