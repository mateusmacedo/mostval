#!/usr/bin/bash
set -euo pipefail

# Script para backup da infraestrutura Mostval
# Uso: ./scripts/backup.sh [postgresql|redis|all]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

COMPONENT="${1:-all}"

echo "[backup] Iniciando backup da infraestrutura Mostval..."

# Cria diretório de backup se não existir
mkdir -p "${BACKUP_DIR}"

# Função para backup do PostgreSQL
backup_postgresql() {
    echo "[backup] Fazendo backup do PostgreSQL..."
    
    # Backup do banco principal
    docker exec mostval-postgresql pg_dump -U mostval -d mostval_sites > "${BACKUP_DIR}/postgresql_mostval_sites_${TIMESTAMP}.sql"
    
    # Backup do banco do Keycloak
    docker exec mostval-postgresql pg_dump -U mostval -d keycloak > "${BACKUP_DIR}/postgresql_keycloak_${TIMESTAMP}.sql"
    
    echo "[ok] Backup do PostgreSQL concluído: ${BACKUP_DIR}/postgresql_*_${TIMESTAMP}.sql"
}

# Função para backup do Redis
backup_redis() {
    echo "[backup] Fazendo backup do Redis..."
    
    # Cria snapshot do Redis
    docker exec mostval-redis redis-cli BGSAVE
    
    # Aguarda o backup ser concluído
    sleep 5
    
    # Copia o arquivo de backup
    docker cp mostval-redis:/data/dump.rdb "${BACKUP_DIR}/redis_${TIMESTAMP}.rdb"
    
    echo "[ok] Backup do Redis concluído: ${BACKUP_DIR}/redis_${TIMESTAMP}.rdb"
}

# Função para backup do LocalStack
backup_localstack() {
    echo "[backup] Fazendo backup do LocalStack..."
    
    # Copia dados do LocalStack
    docker cp mostval-localstack:/var/lib/localstack "${BACKUP_DIR}/localstack_${TIMESTAMP}/"
    
    echo "[ok] Backup do LocalStack concluído: ${BACKUP_DIR}/localstack_${TIMESTAMP}/"
}

# Função para backup completo
backup_all() {
    echo "[backup] Fazendo backup completo..."
    
    backup_postgresql
    backup_redis
    backup_localstack
    
    # Backup dos volumes Docker
    echo "[backup] Fazendo backup dos volumes..."
    docker run --rm -v mostval_postgresql_data:/data -v "${BACKUP_DIR}:/backup" alpine tar czf /backup/postgresql_data_${TIMESTAMP}.tar.gz -C /data .
    docker run --rm -v mostval_redis_data:/data -v "${BACKUP_DIR}:/backup" alpine tar czf /backup/redis_data_${TIMESTAMP}.tar.gz -C /data .
    docker run --rm -v mostval_keycloak_data:/data -v "${BACKUP_DIR}:/backup" alpine tar czf /backup/keycloak_data_${TIMESTAMP}.tar.gz -C /data .
    docker run --rm -v mostval_localstack_data:/data -v "${BACKUP_DIR}:/backup" alpine tar czf /backup/localstack_data_${TIMESTAMP}.tar.gz -C /data .
    
    echo "[ok] Backup completo concluído em: ${BACKUP_DIR}"
}

case "${COMPONENT}" in
    "postgresql")
        backup_postgresql
        ;;
    "redis")
        backup_redis
        ;;
    "localstack")
        backup_localstack
        ;;
    "all")
        backup_all
        ;;
    *)
        echo "[error] Componente inválido: ${COMPONENT}"
        echo "Uso: $0 [postgresql|redis|localstack|all]"
        exit 1
        ;;
esac

echo "[ok] Backup concluído com sucesso!"
echo "[info] Arquivos de backup em: ${BACKUP_DIR}"
