#!/usr/bin/bash
set -euo pipefail

# Testing Script for k3d
# Consolidated testing operations: cluster, registry, ingress, connectivity
# Usage: ./scripts/06-test.sh [cluster|registry|ingress|connectivity|all]

# Function to test cluster
test_cluster() {
    echo "[test] Testando conectividade do cluster k3d..."
    
    # Verifica se kubectl consegue conectar
    if ! kubectl cluster-info >/dev/null 2>&1; then
        echo "[error] kubectl não consegue conectar ao cluster"
        echo "[info] Verifique se o cluster está rodando: make status"
        exit 1
    fi
    
    echo "[ok] kubectl conectado ao cluster"
    
    # Testa componentes básicos
    echo "[test] Verificando componentes do cluster..."
    
    # Verifica nodes
    echo "[test] Nodes:"
    kubectl get nodes -o wide
    
    # Verifica pods do sistema
    echo "[test] Pods do sistema:"
    kubectl get pods -n kube-system
    
    # Verifica se o registry local está funcionando
    echo "[test] Verificando registry local..."
    if kubectl get pods -n kube-system | grep -q "local-path-provisioner"; then
        echo "[ok] Local path provisioner está rodando"
    else
        echo "[warning] Local path provisioner não encontrado"
    fi
    
    # Testa criação de um pod simples
    echo "[test] Testando criação de pod..."
    kubectl run test-pod --image=nginx:alpine --restart=Never --rm -i --tty -- /bin/sh -c "echo 'Teste de conectividade OK' && exit 0" || {
        echo "[error] Falha ao criar pod de teste"
        exit 1
    }
    
    echo "[ok] Cluster k3d funcionando corretamente!"
    echo "[info] Para mais informações: kubectl cluster-info"
}

# Function to test registry
test_registry() {
    local registry_name="${REGISTRY_NAME:-k3d-dev-registry}"
    local registry_port="${REGISTRY_PORT:-5001}"
    
    echo "[test] Testando registry local '${registry_name}'..."
    
    # Verifica se o registry existe
    if ! k3d registry list | grep -q "${registry_name}"; then
        echo "[error] Registry '${registry_name}' não encontrado"
        echo "[info] Execute 'make up' primeiro para criar o registry"
        exit 1
    fi
    
    echo "[ok] Registry '${registry_name}' encontrado"
    
    # Testa conectividade HTTP
    echo "[test] Testando conectividade HTTP..."
    if curl -s -f "http://localhost:${registry_port}/v2/" >/dev/null 2>&1; then
        echo "[ok] Registry acessível via HTTP"
    else
        echo "[error] Registry não acessível via HTTP"
        exit 1
    fi
    
    # Testa catalog
    echo "[test] Testando catalog do registry..."
    catalog=$(curl -s "http://localhost:${registry_port}/v2/_catalog" 2>/dev/null || echo "{}")
    if echo "$catalog" | grep -q "repositories"; then
        echo "[ok] Catalog do registry funcionando"
        echo "[info] Repositórios disponíveis:"
        echo "$catalog" | jq -r '.repositories[]' 2>/dev/null || echo "  (nenhum repositório encontrado)"
    else
        echo "[error] Falha ao acessar catalog do registry"
        exit 1
    fi
    
    # Testa push de imagem (opcional)
    echo "[test] Testando push de imagem..."
    if docker pull nginx:alpine >/dev/null 2>&1; then
        echo "[ok] Imagem nginx:alpine baixada"
        
        # Tag para registry local
        docker tag nginx:alpine "localhost:${registry_port}/test-nginx:latest" >/dev/null 2>&1
        
        # Push para registry
        if docker push "localhost:${registry_port}/test-nginx:latest" >/dev/null 2>&1; then
            echo "[ok] Push para registry funcionando"
            
            # Verifica se a imagem foi salva
            if curl -s "http://localhost:${registry_port}/v2/_catalog" | grep -q "test-nginx"; then
                echo "[ok] Imagem salva no registry"
            else
                echo "[warning] Imagem não encontrada no catalog"
            fi
            
            # Limpa a imagem de teste
            docker rmi "localhost:${registry_port}/test-nginx:latest" >/dev/null 2>&1 || true
        else
            echo "[error] Falha no push para registry"
            exit 1
        fi
    else
        echo "[warning] Não foi possível baixar nginx:alpine para teste"
    fi
    
    echo "[ok] Registry local funcionando corretamente!"
    echo "[info] Registry disponível em: http://localhost:${registry_port}"
    echo "[info] Para usar: docker push localhost:${registry_port}/imagem:tag"
}

# Function to test ingress
test_ingress() {
    local domain="mostval.local"
    local namespace="mostval"
    
    echo "[test] Testando Ingress Centralizado..."
    
    # Function to test URL
    test_url() {
        local url="$1"
        local description="$2"
        local expected_status="${3:-200}"
        
        echo -n "  Testando $description... "
        
        if response=$(curl -k -s -w "%{http_code}" -o /dev/null "$url" 2>/dev/null); then
            if [ "$response" = "$expected_status" ]; then
                echo "✓ OK (HTTP $response)"
                return 0
            else
                echo "⚠ HTTP $response (esperado: $expected_status)"
                return 1
            fi
        else
            echo "✗ Falhou"
            return 1
        fi
    }
    
    # Check if domain is in /etc/hosts
    echo "[test] Verificando configuração do /etc/hosts..."
    
    if ! grep -q "$domain" /etc/hosts; then
        echo "[warning] Domínio '$domain' não encontrado no /etc/hosts"
        echo "[info] Adicione esta linha ao seu /etc/hosts:"
        echo "127.0.0.1 $domain"
        echo ""
        echo "[info] Para adicionar automaticamente (requer sudo):"
        echo "echo '127.0.0.1 $domain' | sudo tee -a /etc/hosts"
        echo ""
        echo "[warning] Continuando com testes (pode falhar sem configuração do hosts)..."
        echo ""
    fi
    
    # Test basic connectivity
    echo "[test] Testando conectividade básica..."
    
    # Test health endpoint
    test_url "https://$domain/health" "Health Check" "200"
    
    # Test dashboard
    test_url "https://$domain/" "Dashboard" "200"
    
    # Test service endpoints
    echo "[test] Testando endpoints dos serviços..."
    
    # Test Keycloak
    test_url "https://$domain/auth/health/ready" "Keycloak Health" "200"
    
    # Test LocalStack
    test_url "https://$domain/aws/_localstack/health" "LocalStack Health" "200"
    
    # Test RabbitMQ (may require auth)
    test_url "https://$domain/rabbitmq/api/overview" "RabbitMQ API" "200"
    
    # Test API routes (may not be deployed yet)
    echo "[test] Testando rotas de API (podem não estar implantadas)..."
    
    test_url "https://$domain/api/node/health" "Node.js API" "200" || echo "[info] Node.js API não implantada"
    test_url "https://$domain/api/go/health" "Go API" "200" || echo "[info] Go API não implantada"
    
    # Check ingress status
    echo "[test] Verificando status do ingress..."
    
    if kubectl get ingress centralized-ingress -n "$namespace" >/dev/null 2>&1; then
        echo "[ok] Ingress centralizado encontrado"
        
        # Show ingress details
        echo "[info] Detalhes do ingress:"
        kubectl get ingress centralized-ingress -n "$namespace" -o wide
        
        # Show ingress rules
        echo "[info] Regras do ingress:"
        kubectl describe ingress centralized-ingress -n "$namespace" | grep -A 20 "Rules:"
    else
        echo "[error] Ingress centralizado não encontrado"
        echo "[info] Execute o script de setup primeiro:"
        echo "./scripts/04-ingress.sh setup"
        exit 1
    fi
    
    # Check services
    echo "[test] Verificando serviços..."
    
    services=("keycloak" "localstack" "rabbitmq" "nginx")
    
    for service in "${services[@]}"; do
        if kubectl get service "$service" -n "$namespace" >/dev/null 2>&1; then
            echo "[ok] Serviço $service: Disponível"
        else
            echo "[warning] Serviço $service: Não encontrado"
        fi
    done
    
    # Check pods
    echo "[test] Verificando pods..."
    
    pods=$(kubectl get pods -n "$namespace" --no-headers | wc -l)
    echo "[info] Total de pods no namespace: $pods"
    
    # Show pod status
    kubectl get pods -n "$namespace" | grep -E "(keycloak|localstack|rabbitmq|nginx)"
    
    echo ""
    echo "[ok] Testes concluídos!"
    echo ""
    echo "[info] URLs de acesso:"
    echo "  - Dashboard: https://$domain/"
    echo "  - Keycloak: https://$domain/auth/"
    echo "  - LocalStack: https://$domain/aws/"
    echo "  - RabbitMQ: https://$domain/rabbitmq/"
    echo "  - Health: https://$domain/health"
    echo ""
    echo "[info] Para monitorar logs:"
    echo "  kubectl logs -f deployment/nginx -n $namespace"
    echo "  kubectl logs -f deployment/keycloak -n $namespace"
}

# Function to test connectivity
test_connectivity() {
    echo "[test] Testando conectividade geral da infraestrutura..."
    
    # Test basic cluster connectivity
    if ! kubectl cluster-info >/dev/null 2>&1; then
        echo "[error] Cluster não está acessível"
        exit 1
    fi
    
    echo "[ok] Cluster acessível"
    
    # Test namespace
    if ! kubectl get namespace mostval >/dev/null 2>&1; then
        echo "[error] Namespace mostval não encontrado"
        exit 1
    fi
    
    echo "[ok] Namespace mostval encontrado"
    
    # Test pods readiness
    echo "[test] Checking pods readiness..."
    for deployment in postgresql redis keycloak rabbitmq localstack nginx; do
        if kubectl get deployment "${deployment}" -n mostval >/dev/null 2>&1; then
            if kubectl get pods -n mostval -l app.kubernetes.io/name="${deployment}" | grep -q "Running"; then
                echo "[ok] ${deployment}: Running"
            else
                echo "[warning] ${deployment}: Not ready"
            fi
        fi
    done
    
    # Test ingress
    echo "[test] Testing ingress..."
    if kubectl get ingress centralized-ingress -n mostval >/dev/null 2>&1; then
        echo "[ok] Ingress centralizado encontrado"
    else
        echo "[warning] Ingress centralizado não encontrado"
    fi
    
    echo "[ok] Infrastructure connectivity test completed"
}

# Function to run all tests
run_all_tests() {
    echo "[test] Executando todos os testes..."
    echo ""
    
    echo "=== Teste 1: Cluster ==="
    test_cluster
    echo ""
    
    echo "=== Teste 2: Registry ==="
    test_registry
    echo ""
    
    echo "=== Teste 3: Ingress ==="
    test_ingress
    echo ""
    
    echo "=== Teste 4: Connectivity ==="
    test_connectivity
    echo ""
    
    echo "[ok] Todos os testes concluídos!"
}

# Main function
main() {
    local test_type="${1:-all}"
    
    case "${test_type}" in
        "cluster")
            test_cluster
            ;;
        "registry")
            test_registry
            ;;
        "ingress")
            test_ingress
            ;;
        "connectivity")
            test_connectivity
            ;;
        "all")
            run_all_tests
            ;;
        *)
            echo "[error] Tipo de teste inválido: ${test_type}"
            echo "[usage] $0 [cluster|registry|ingress|connectivity|all]"
            echo "[example] $0 cluster"
            echo "[example] $0 registry"
            echo "[example] $0 ingress"
            echo "[example] $0 connectivity"
            echo "[example] $0 all"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
