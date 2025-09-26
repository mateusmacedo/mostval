#!/usr/bin/bash
set -euo pipefail

# Script para verificar status da infraestrutura Mostval
# Uso: ./scripts/status.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[status] Verificando status da infraestrutura Mostval..."

# Função para executar docker-compose
run_compose() {
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

# Verifica se o Docker está rodando
if ! docker info >/dev/null 2>&1; then
    echo "[error] Docker não está rodando."
    exit 1
fi

echo "[status] Status dos serviços:"
run_compose ps

echo ""
echo "[status] Status de saúde dos serviços:"

# Verifica PostgreSQL
if run_compose ps postgresql | grep -q "Up"; then
    echo "✓ PostgreSQL: Rodando"
    if docker exec mostval-postgresql pg_isready -U mostval -d mostval_sites >/dev/null 2>&1; then
        echo "  ✓ Conexão com banco: OK"
    else
        echo "  ✗ Conexão com banco: Falha"
    fi
else
    echo "✗ PostgreSQL: Parado"
fi

# Verifica Redis
if run_compose ps redis | grep -q "Up"; then
    echo "✓ Redis: Rodando"
    if docker exec mostval-redis redis-cli ping >/dev/null 2>&1; then
        echo "  ✓ Conexão Redis: OK"
    else
        echo "  ✗ Conexão Redis: Falha"
    fi
else
    echo "✗ Redis: Parado"
fi

# Verifica RabbitMQ
if run_compose ps rabbitmq | grep -q "Up"; then
    echo "✓ RabbitMQ: Rodando"
    if docker exec mostval-rabbitmq rabbitmq-diagnostics ping >/dev/null 2>&1; then
        echo "  ✓ Conexão RabbitMQ: OK"
    else
        echo "  ✗ Conexão RabbitMQ: Falha"
    fi
else
    echo "✗ RabbitMQ: Parado"
fi

# Verifica Keycloak
if run_compose ps keycloak | grep -q "Up"; then
    echo "✓ Keycloak: Rodando"
    if curl -s -f http://localhost:8080/health/ready >/dev/null 2>&1; then
        echo "  ✓ Health check: OK"
    else
        echo "  ✗ Health check: Falha"
    fi
else
    echo "✗ Keycloak: Parado"
fi


# Verifica LocalStack
if run_compose ps localstack | grep -q "Up"; then
    echo "✓ LocalStack: Rodando"
    if curl -s -f http://localhost:4566/_localstack/health >/dev/null 2>&1; then
        echo "  ✓ Health check: OK"
    else
        echo "  ✗ Health check: Falha"
    fi
else
    echo "✗ LocalStack: Parado"
fi

# Verifica Nginx
if run_compose ps nginx | grep -q "Up"; then
    echo "✓ Nginx: Rodando"
    if curl -s -f http://localhost/health >/dev/null 2>&1; then
        echo "  ✓ Health check: OK"
    else
        echo "  ✗ Health check: Falha"
    fi
else
    echo "✗ Nginx: Parado"
fi

echo ""
echo "[info] URLs de acesso (através do proxy Nginx):"
echo "  - Keycloak: http://localhost/auth/"
echo "  - LocalStack: http://localhost/aws/"
echo "  - RabbitMQ Management: http://localhost/rabbitmq/"
echo "  - Nginx (Proxy): http://localhost"
echo "  - PostgreSQL: Apenas interno (sem acesso externo)"
echo "  - Redis: Apenas interno (sem acesso externo)"
echo "  - RabbitMQ: Apenas interno (sem acesso externo)"
