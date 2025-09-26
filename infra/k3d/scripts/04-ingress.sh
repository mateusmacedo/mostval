#!/bin/bash

# Ingress Management Script for k3d
# Consolidated ingress operations: setup, revert, test
# Usage: ./scripts/04-ingress.sh [setup|revert|test]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="mostval.local"
NAMESPACE="mostval"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFESTS_DIR="$(dirname "$SCRIPT_DIR")/manifests"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to setup centralized ingress
setup_centralized_ingress() {
    echo -e "${BLUE}[setup] Configurando Ingress Centralizado para k3d...${NC}"
    
    # Check dependencies
    echo -e "${BLUE}[setup] Verificando dependências...${NC}"
    
    if ! command_exists kubectl; then
        echo -e "${RED}[error] kubectl não encontrado. Instale o kubectl primeiro.${NC}"
        exit 1
    fi
    
    if ! command_exists k3d; then
        echo -e "${RED}[error] k3d não encontrado. Instale o k3d primeiro.${NC}"
        exit 1
    fi
    
    # Check if cluster exists
    if ! k3d cluster list | grep -q "k3d-dev"; then
        echo -e "${RED}[error] Cluster k3d-dev não encontrado. Execute 'make up' primeiro.${NC}"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
        echo -e "${RED}[error] Namespace '$NAMESPACE' não encontrado. Execute 'make up' primeiro.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}[ok] Dependências verificadas${NC}"
    
    # Backup existing ingress resources
    echo -e "${BLUE}[setup] Fazendo backup dos ingress existentes...${NC}"
    
    BACKUP_DIR="./backups/ingress-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    kubectl get ingress -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/ingress-backup.yaml" 2>/dev/null || true
    echo -e "${GREEN}[ok] Backup criado em: $BACKUP_DIR${NC}"
    
    # Remove existing individual ingress resources
    echo -e "${BLUE}[setup] Removendo ingress individuais...${NC}"
    
    kubectl delete ingress keycloak-ingress -n "$NAMESPACE" 2>/dev/null || true
    kubectl delete ingress localstack-ingress -n "$NAMESPACE" 2>/dev/null || true
    kubectl delete ingress rabbitmq-ingress -n "$NAMESPACE" 2>/dev/null || true
    
    echo -e "${GREEN}[ok] Ingress individuais removidos${NC}"
    
    # Apply centralized ingress
    echo -e "${BLUE}[setup] Aplicando ingress centralizado...${NC}"
    
    kubectl apply -f "$MANIFESTS_DIR/05-ingress.yaml"
    
    echo -e "${GREEN}[ok] Ingress centralizado aplicado${NC}"
    
    # Wait for ingress to be ready
    echo -e "${BLUE}[setup] Aguardando ingress ficar pronto...${NC}"
    
    kubectl wait --for=condition=ready ingress/centralized-ingress -n "$NAMESPACE" --timeout=60s || {
        echo -e "${YELLOW}[warning] Timeout aguardando ingress ficar pronto${NC}"
    }
    
    # Check ingress status
    echo -e "${BLUE}[setup] Verificando status do ingress...${NC}"
    
    kubectl get ingress -n "$NAMESPACE"
    
    # Update /etc/hosts if needed
    echo -e "${BLUE}[setup] Verificando configuração do /etc/hosts...${NC}"
    
    if ! grep -q "$DOMAIN" /etc/hosts; then
        echo -e "${YELLOW}[warning] Domínio '$DOMAIN' não encontrado no /etc/hosts${NC}"
        echo -e "${BLUE}[info] Adicione esta linha ao seu /etc/hosts:${NC}"
        echo -e "${GREEN}127.0.0.1 $DOMAIN${NC}"
        echo ""
        echo -e "${BLUE}[info] Para adicionar automaticamente (requer sudo):${NC}"
        echo -e "${YELLOW}echo '127.0.0.1 $DOMAIN' | sudo tee -a /etc/hosts${NC}"
    else
        echo -e "${GREEN}[ok] Domínio '$DOMAIN' já configurado no /etc/hosts${NC}"
    fi
    
    # Test connectivity
    echo -e "${BLUE}[setup] Testando conectividade...${NC}"
    
    # Wait a bit for services to be ready
    sleep 10
    
    # Test health endpoint
    if curl -k -s -f "https://$DOMAIN/health" >/dev/null 2>&1; then
        echo -e "${GREEN}[ok] Health check: OK${NC}"
    else
        echo -e "${YELLOW}[warning] Health check falhou - pode levar alguns minutos para ficar pronto${NC}"
    fi
    
    # Test Keycloak
    if curl -k -s -f "https://$DOMAIN/auth/health/ready" >/dev/null 2>&1; then
        echo -e "${GREEN}[ok] Keycloak: OK${NC}"
    else
        echo -e "${YELLOW}[warning] Keycloak não acessível ainda${NC}"
    fi
    
    # Test LocalStack
    if curl -k -s -f "https://$DOMAIN/aws/_localstack/health" >/dev/null 2>&1; then
        echo -e "${GREEN}[ok] LocalStack: OK${NC}"
    else
        echo -e "${YELLOW}[warning] LocalStack não acessível ainda${NC}"
    fi
    
    # Test RabbitMQ
    if curl -k -s -f "https://$DOMAIN/rabbitmq/api/overview" >/dev/null 2>&1; then
        echo -e "${GREEN}[ok] RabbitMQ: OK${NC}"
    else
        echo -e "${YELLOW}[warning] RabbitMQ não acessível ainda${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}[ok] Configuração do Ingress Centralizado concluída!${NC}"
    echo ""
    echo -e "${BLUE}[info] URLs de acesso:${NC}"
    echo -e "  - ${GREEN}Dashboard:${NC} https://$DOMAIN/"
    echo -e "  - ${GREEN}Keycloak:${NC} https://$DOMAIN/auth/"
    echo -e "  - ${GREEN}LocalStack:${NC} https://$DOMAIN/aws/"
    echo -e "  - ${GREEN}RabbitMQ:${NC} https://$DOMAIN/rabbitmq/"
    echo -e "  - ${GREEN}Health:${NC} https://$DOMAIN/health"
    echo ""
    echo -e "${BLUE}[info] Vantagens desta abordagem:${NC}"
    echo -e "  ✓ ${GREEN}URL única:${NC} Apenas uma entrada no /etc/hosts"
    echo -e "  ✓ ${GREEN}Segurança:${NC} Controle centralizado de acesso"
    echo -e "  ✓ ${GREEN}Simplicidade:${NC} Fácil de lembrar e gerenciar"
    echo -e "  ✓ ${GREEN}Flexibilidade:${NC} Fácil adição de novos serviços"
    echo ""
    echo -e "${BLUE}[info] Para reverter para ingress individuais:${NC}"
    echo -e "  ${YELLOW}kubectl apply -f $BACKUP_DIR/ingress-backup.yaml${NC}"
    echo -e "  ${YELLOW}kubectl delete ingress centralized-ingress -n $NAMESPACE${NC}"
}

# Function to revert centralized ingress
revert_centralized_ingress() {
    echo -e "${BLUE}[revert] Revertendo para Ingress Individuais...${NC}"
    
    # Check if centralized ingress exists
    if ! kubectl get ingress centralized-ingress -n "$NAMESPACE" >/dev/null 2>&1; then
        echo -e "${YELLOW}[warning] Ingress centralizado não encontrado. Nada para reverter.${NC}"
        exit 0
    fi
    
    # Remove centralized ingress
    echo -e "${BLUE}[revert] Removendo ingress centralizado...${NC}"
    
    kubectl delete ingress centralized-ingress -n "$NAMESPACE"
    kubectl delete service nginx -n "$NAMESPACE" 2>/dev/null || true
    kubectl delete deployment nginx -n "$NAMESPACE" 2>/dev/null || true
    kubectl delete configmap nginx-config -n "$NAMESPACE" 2>/dev/null || true
    kubectl delete configmap nginx-html -n "$NAMESPACE" 2>/dev/null || true
    
    echo -e "${GREEN}[ok] Ingress centralizado removido${NC}"
    
    # Restore individual ingress resources
    echo -e "${BLUE}[revert] Restaurando ingress individuais...${NC}"
    
    # Find the most recent backup
    BACKUP_DIR=$(find ./backups -name "ingress-*" -type d | sort | tail -1)
    
    if [ -n "$BACKUP_DIR" ] && [ -f "$BACKUP_DIR/ingress-backup.yaml" ]; then
        echo -e "${BLUE}[revert] Restaurando do backup: $BACKUP_DIR${NC}"
        kubectl apply -f "$BACKUP_DIR/ingress-backup.yaml"
        echo -e "${GREEN}[ok] Ingress individuais restaurados do backup${NC}"
    else
        echo -e "${YELLOW}[warning] Backup não encontrado. Aplicando ingress individuais padrão...${NC}"
        
        # Apply individual ingress manifests
        kubectl apply -f "$MANIFESTS_DIR/02-identity.yaml"
        kubectl apply -f "$MANIFESTS_DIR/04-aws-emulator.yaml"
        kubectl apply -f "$MANIFESTS_DIR/03-messaging.yaml"
        
        echo -e "${GREEN}[ok] Ingress individuais aplicados${NC}"
    fi
    
    # Wait for ingress to be ready
    echo -e "${BLUE}[revert] Aguardando ingress individuais ficarem prontos...${NC}"
    
    sleep 5
    
    # Check ingress status
    echo -e "${BLUE}[revert] Verificando status dos ingress...${NC}"
    
    kubectl get ingress -n "$NAMESPACE"
    
    echo ""
    echo -e "${GREEN}[ok] Reversão concluída!${NC}"
    echo ""
    echo -e "${BLUE}[info] URLs de acesso individuais:${NC}"
    echo -e "  - ${GREEN}Keycloak:${NC} https://auth.mostval.local"
    echo -e "  - ${GREEN}LocalStack:${NC} https://aws.mostval.local"
    echo -e "  - ${GREEN}RabbitMQ:${NC} https://rabbitmq.mostval.local"
    echo ""
    echo -e "${BLUE}[info] Lembre-se de atualizar o /etc/hosts com os domínios individuais:${NC}"
    echo -e "  ${YELLOW}127.0.0.1 auth.mostval.local${NC}"
    echo -e "  ${YELLOW}127.0.0.1 aws.mostval.local${NC}"
    echo -e "  ${YELLOW}127.0.0.1 rabbitmq.mostval.local${NC}"
}

# Function to test centralized ingress
test_centralized_ingress() {
    echo -e "${BLUE}[test] Testando Ingress Centralizado...${NC}"
    
    # Function to test URL
    test_url() {
        local url="$1"
        local description="$2"
        local expected_status="${3:-200}"
        
        echo -n "  Testando $description... "
        
        if response=$(curl -k -s -w "%{http_code}" -o /dev/null "$url" 2>/dev/null); then
            if [ "$response" = "$expected_status" ]; then
                echo -e "${GREEN}✓ OK (HTTP $response)${NC}"
                return 0
            else
                echo -e "${YELLOW}⚠ HTTP $response (esperado: $expected_status)${NC}"
                return 1
            fi
        else
            echo -e "${RED}✗ Falhou${NC}"
            return 1
        fi
    }
    
    # Check if domain is in /etc/hosts
    echo -e "${BLUE}[test] Verificando configuração do /etc/hosts...${NC}"
    
    if ! grep -q "$DOMAIN" /etc/hosts; then
        echo -e "${YELLOW}[warning] Domínio '$DOMAIN' não encontrado no /etc/hosts${NC}"
        echo -e "${BLUE}[info] Adicione esta linha ao seu /etc/hosts:${NC}"
        echo -e "${GREEN}127.0.0.1 $DOMAIN${NC}"
        echo ""
        echo -e "${BLUE}[info] Para adicionar automaticamente (requer sudo):${NC}"
        echo -e "${YELLOW}echo '127.0.0.1 $DOMAIN' | sudo tee -a /etc/hosts${NC}"
        echo ""
        echo -e "${YELLOW}[warning] Continuando com testes (pode falhar sem configuração do hosts)...${NC}"
        echo ""
    fi
    
    # Test basic connectivity
    echo -e "${BLUE}[test] Testando conectividade básica...${NC}"
    
    # Test health endpoint
    test_url "https://$DOMAIN/health" "Health Check" "200"
    
    # Test dashboard
    test_url "https://$DOMAIN/" "Dashboard" "200"
    
    # Test service endpoints
    echo -e "${BLUE}[test] Testando endpoints dos serviços...${NC}"
    
    # Test Keycloak
    test_url "https://$DOMAIN/auth/health/ready" "Keycloak Health" "200"
    
    # Test LocalStack
    test_url "https://$DOMAIN/aws/_localstack/health" "LocalStack Health" "200"
    
    # Test RabbitMQ (may require auth)
    test_url "https://$DOMAIN/rabbitmq/api/overview" "RabbitMQ API" "200"
    
    # Test API routes (may not be deployed yet)
    echo -e "${BLUE}[test] Testando rotas de API (podem não estar implantadas)...${NC}"
    
    test_url "https://$DOMAIN/api/node/health" "Node.js API" "200" || echo -e "${YELLOW}[info] Node.js API não implantada${NC}"
    test_url "https://$DOMAIN/api/go/health" "Go API" "200" || echo -e "${YELLOW}[info] Go API não implantada${NC}"
    
    # Check ingress status
    echo -e "${BLUE}[test] Verificando status do ingress...${NC}"
    
    if kubectl get ingress centralized-ingress -n "$NAMESPACE" >/dev/null 2>&1; then
        echo -e "${GREEN}[ok] Ingress centralizado encontrado${NC}"
        
        # Show ingress details
        echo -e "${BLUE}[info] Detalhes do ingress:${NC}"
        kubectl get ingress centralized-ingress -n "$NAMESPACE" -o wide
        
        # Show ingress rules
        echo -e "${BLUE}[info] Regras do ingress:${NC}"
        kubectl describe ingress centralized-ingress -n "$NAMESPACE" | grep -A 20 "Rules:"
    else
        echo -e "${RED}[error] Ingress centralizado não encontrado${NC}"
        echo -e "${BLUE}[info] Execute o script de setup primeiro:${NC}"
        echo -e "${YELLOW}./scripts/04-ingress.sh setup${NC}"
        exit 1
    fi
    
    # Check services
    echo -e "${BLUE}[test] Verificando serviços...${NC}"
    
    services=("keycloak" "localstack" "rabbitmq" "nginx")
    
    for service in "${services[@]}"; do
        if kubectl get service "$service" -n "$NAMESPACE" >/dev/null 2>&1; then
            echo -e "${GREEN}[ok] Serviço $service: Disponível${NC}"
        else
            echo -e "${YELLOW}[warning] Serviço $service: Não encontrado${NC}"
        fi
    done
    
    # Check pods
    echo -e "${BLUE}[test] Verificando pods...${NC}"
    
    pods=$(kubectl get pods -n "$NAMESPACE" --no-headers | wc -l)
    echo -e "${BLUE}[info] Total de pods no namespace: $pods${NC}"
    
    # Show pod status
    kubectl get pods -n "$NAMESPACE" | grep -E "(keycloak|localstack|rabbitmq|nginx)"
    
    echo ""
    echo -e "${GREEN}[ok] Testes concluídos!${NC}"
    echo ""
    echo -e "${BLUE}[info] URLs de acesso:${NC}"
    echo -e "  - ${GREEN}Dashboard:${NC} https://$DOMAIN/"
    echo -e "  - ${GREEN}Keycloak:${NC} https://$DOMAIN/auth/"
    echo -e "  - ${GREEN}LocalStack:${NC} https://$DOMAIN/aws/"
    echo -e "  - ${GREEN}RabbitMQ:${NC} https://$DOMAIN/rabbitmq/"
    echo -e "  - ${GREEN}Health:${NC} https://$DOMAIN/health"
    echo ""
    echo -e "${BLUE}[info] Para monitorar logs:${NC}"
    echo -e "  ${YELLOW}kubectl logs -f deployment/nginx -n $NAMESPACE${NC}"
    echo -e "  ${YELLOW}kubectl logs -f deployment/keycloak -n $NAMESPACE${NC}"
}

# Main function
main() {
    local action="${1:-test}"
    
    case "${action}" in
        "setup")
            setup_centralized_ingress
            ;;
        "revert")
            revert_centralized_ingress
            ;;
        "test")
            test_centralized_ingress
            ;;
        *)
            echo -e "${RED}[error] Ação inválida: ${action}${NC}"
            echo -e "${BLUE}[usage] $0 [setup|revert|test]${NC}"
            echo -e "${BLUE}[example] $0 setup${NC}"
            echo -e "${BLUE}[example] $0 revert${NC}"
            echo -e "${BLUE}[example] $0 test${NC}"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
