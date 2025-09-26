#!/usr/bin/bash
set -euo pipefail

# Script para visualizar logs da infraestrutura Mostval
# Uso: ./scripts/logs.sh [all|postgresql|redis|keycloak|nginx] [--follow]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

COMPONENT="${1:-all}"
FOLLOW="${2:-}"

echo "[logs] Visualizando logs da infraestrutura Mostval..."

# Função para executar docker-compose
run_compose() {
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

# Função para mostrar logs
show_logs() {
    local service="$1"
    local follow="$2"
    
    if [[ "$follow" == "--follow" ]]; then
        echo "[logs] Seguindo logs do ${service} (Ctrl+C para sair)..."
        run_compose logs -f "$service"
    else
        echo "[logs] Últimos logs do ${service}:"
        run_compose logs --tail=50 "$service"
    fi
}

case "${COMPONENT}" in
    "all")
        if [[ "$FOLLOW" == "--follow" ]]; then
            echo "[logs] Seguindo logs de todos os serviços (Ctrl+C para sair)..."
            run_compose logs -f
        else
            echo "[logs] Últimos logs de todos os serviços:"
            run_compose logs --tail=20
        fi
        ;;
    "postgresql")
        show_logs "postgresql" "$FOLLOW"
        ;;
    "redis")
        show_logs "redis" "$FOLLOW"
        ;;
    "rabbitmq")
        show_logs "rabbitmq" "$FOLLOW"
        ;;
    "keycloak")
        show_logs "keycloak" "$FOLLOW"
        ;;
    "nginx")
        show_logs "nginx" "$FOLLOW"
        ;;
    "localstack")
        show_logs "localstack" "$FOLLOW"
        ;;
    *)
        echo "[error] Componente inválido: ${COMPONENT}"
        echo "Uso: $0 [all|postgresql|redis|rabbitmq|keycloak|nginx|localstack] [--follow]"
        exit 1
        ;;
esac
