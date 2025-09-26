#!/usr/bin/bash
set -euo pipefail

# Script para testar conectividade da infraestrutura Mostval
# Uso: ./scripts/test.sh [all|postgresql|redis|keycloak|nginx]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

COMPONENT="${1:-all}"

echo "[test] Testando conectividade da infraestrutura Mostval..."

# Função para testar PostgreSQL
test_postgresql() {
    echo "[test] Testando PostgreSQL..."
    
    if docker exec mostval-postgresql pg_isready -U mostval -d mostval_sites >/dev/null 2>&1; then
        echo "✓ PostgreSQL: Conexão OK"
        
        # Testa criação de tabela
        if docker exec mostval-postgresql psql -U mostval -d mostval_sites -c "SELECT 1;" >/dev/null 2>&1; then
            echo "✓ PostgreSQL: Query OK"
        else
            echo "✗ PostgreSQL: Query falhou"
            return 1
        fi
    else
        echo "✗ PostgreSQL: Conexão falhou"
        return 1
    fi
}

# Função para testar Redis
test_redis() {
    echo "[test] Testando Redis..."
    
    if docker exec mostval-redis redis-cli ping >/dev/null 2>&1; then
        echo "✓ Redis: Conexão OK"
        
        # Testa operações básicas
        if docker exec mostval-redis redis-cli set test_key "test_value" >/dev/null 2>&1; then
            if docker exec mostval-redis redis-cli get test_key | grep -q "test_value"; then
                echo "✓ Redis: Operações OK"
                docker exec mostval-redis redis-cli del test_key >/dev/null 2>&1
            else
                echo "✗ Redis: Operações falharam"
                return 1
            fi
        else
            echo "✗ Redis: Operações falharam"
            return 1
        fi
    else
        echo "✗ Redis: Conexão falhou"
        return 1
    fi
}

# Função para testar RabbitMQ
test_rabbitmq() {
    echo "[test] Testando RabbitMQ..."
    
    if docker exec mostval-rabbitmq rabbitmq-diagnostics ping >/dev/null 2>&1; then
        echo "✓ RabbitMQ: Conexão OK"
        
        # Testa management API através do proxy
        if curl -s -f http://localhost/rabbitmq/api/overview -u mostval:mostval123 >/dev/null 2>&1; then
            echo "✓ RabbitMQ: Management API OK"
        else
            echo "✗ RabbitMQ: Management API falhou"
            return 1
        fi
    else
        echo "✗ RabbitMQ: Conexão falhou"
        return 1
    fi
}

# Função para testar Keycloak
test_keycloak() {
    echo "[test] Testando Keycloak..."
    
    # Testa através do proxy Nginx
    if curl -s -f http://localhost/auth/health/ready >/dev/null 2>&1; then
        echo "✓ Keycloak: Health check OK"
        
        # Testa endpoint principal
        if curl -s -f http://localhost/auth/ >/dev/null 2>&1; then
            echo "✓ Keycloak: Endpoint principal OK"
        else
            echo "✗ Keycloak: Endpoint principal falhou"
            return 1
        fi
    else
        echo "✗ Keycloak: Health check falhou"
        return 1
    fi
}


# Função para testar LocalStack
test_localstack() {
    echo "[test] Testando LocalStack..."
    
    # Testa através do proxy Nginx
    if curl -s -f http://localhost/aws/_localstack/health >/dev/null 2>&1; then
        echo "✓ LocalStack: Health check OK"
        
        # Testa serviços AWS básicos
        if curl -s -f http://localhost/aws/ >/dev/null 2>&1; then
            echo "✓ LocalStack: Endpoint principal OK"
        else
            echo "✗ LocalStack: Endpoint principal falhou"
            return 1
        fi
    else
        echo "✗ LocalStack: Health check falhou"
        return 1
    fi
}

# Função para testar Nginx
test_nginx() {
    echo "[test] Testando Nginx..."
    
    if curl -s -f http://localhost/health >/dev/null 2>&1; then
        echo "✓ Nginx: Health check OK"
        
        
        # Testa proxy para Keycloak
        if curl -s -f http://localhost/auth/ >/dev/null 2>&1; then
            echo "✓ Nginx: Proxy para Keycloak OK"
        else
            echo "✗ Nginx: Proxy para Keycloak falhou"
            return 1
        fi
        
        # Testa proxy para LocalStack
        if curl -s -f http://localhost/aws/ >/dev/null 2>&1; then
            echo "✓ Nginx: Proxy para LocalStack OK"
        else
            echo "✗ Nginx: Proxy para LocalStack falhou"
            return 1
        fi
    else
        echo "✗ Nginx: Health check falhou"
        return 1
    fi
}

# Função para testar tudo
test_all() {
    echo "[test] Testando todos os componentes..."
    
    local failed=0
    
    test_postgresql || failed=1
    test_redis || failed=1
    test_rabbitmq || failed=1
    test_keycloak || failed=1
    test_localstack || failed=1
    test_nginx || failed=1
    
    if [ $failed -eq 0 ]; then
        echo "[ok] Todos os testes passaram!"
        echo ""
        echo "[info] URLs de acesso (através do proxy Nginx):"
        echo "  - Keycloak: http://localhost/auth/"
        echo "  - LocalStack: http://localhost/aws/"
        echo "  - RabbitMQ Management: http://localhost/rabbitmq/"
        echo "  - Nginx (Proxy): http://localhost"
        echo "  - PostgreSQL: Apenas interno (sem acesso externo)"
        echo "  - Redis: Apenas interno (sem acesso externo)"
        echo "  - RabbitMQ: Apenas interno (sem acesso externo)"
    else
        echo "[error] Alguns testes falharam."
        exit 1
    fi
}

case "${COMPONENT}" in
    "all")
        test_all
        ;;
    "postgresql")
        test_postgresql
        ;;
    "redis")
        test_redis
        ;;
    "rabbitmq")
        test_rabbitmq
        ;;
    "keycloak")
        test_keycloak
        ;;
    "nginx")
        test_nginx
        ;;
    "localstack")
        test_localstack
        ;;
    *)
        echo "[error] Componente inválido: ${COMPONENT}"
        echo "Uso: $0 [all|postgresql|redis|rabbitmq|keycloak|nginx|localstack]"
        exit 1
        ;;
esac
