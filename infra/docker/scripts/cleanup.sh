#!/usr/bin/bash
set -euo pipefail

# Script para limpar a infraestrutura Mostval
# Uso: ./scripts/cleanup.sh [--volumes] [--images]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

VOLUMES="${1:-}"
IMAGES="${2:-}"

echo "[cleanup] Limpando infraestrutura Mostval..."

# Função para executar docker-compose
run_compose() {
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

# Para todos os serviços
echo "[cleanup] Parando todos os serviços..."
run_compose down

# Remove volumes se solicitado
if [[ "$VOLUMES" == "--volumes" ]]; then
    echo "[cleanup] Removendo volumes..."
    run_compose down -v
    echo "[cleanup] Volumes removidos."
fi

# Remove imagens se solicitado
if [[ "$IMAGES" == "--images" ]]; then
    echo "[cleanup] Removendo imagens..."
    docker rmi $(docker images "mostval*" -q) 2>/dev/null || true
    echo "[cleanup] Imagens removidas."
fi

# Remove containers órfãos
echo "[cleanup] Removendo containers órfãos..."
docker container prune -f

# Remove redes órfãs
echo "[cleanup] Removendo redes órfãs..."
docker network prune -f

echo "[ok] Limpeza concluída!"
echo "[info] Para remover volumes: $0 --volumes"
echo "[info] Para remover imagens: $0 --images"
echo "[info] Para remover tudo: $0 --volumes --images"

