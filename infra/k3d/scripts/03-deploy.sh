#!/usr/bin/bash
set -euo pipefail

# Infrastructure Deployment Script for k3d
# Consolidated deployment operations
# Usage: ./scripts/03-deploy.sh [deploy|status|logs]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFESTS_DIR="${ROOT_DIR}/manifests"

# Function to deploy infrastructure
deploy_infrastructure() {
    echo "[deploy] Deploying Mostval infrastructure..."
    
    # Verifica se o cluster está rodando
    if ! kubectl cluster-info >/dev/null 2>&1; then
        echo "[error] kubectl não consegue conectar ao cluster"
        echo "[info] Execute 'make up' primeiro para criar o cluster"
        exit 1
    fi
    
    # Aplica namespace
    echo "[deploy] Creating namespace..."
    kubectl apply -f "${MANIFESTS_DIR}/00-namespace.yaml"
    
    # Aplica Database Services (PostgreSQL + Redis)
    echo "[deploy] Deploying Database Services..."
    kubectl apply -f "${MANIFESTS_DIR}/01-database.yaml"
    
    # Aplica Identity Provider (Keycloak)
    echo "[deploy] Deploying Identity Provider..."
    kubectl apply -f "${MANIFESTS_DIR}/02-identity.yaml"
    
    # Aplica Message Broker (RabbitMQ)
    echo "[deploy] Deploying Message Broker..."
    kubectl apply -f "${MANIFESTS_DIR}/03-messaging.yaml"
    
    # Aplica AWS Emulator (LocalStack)
    echo "[deploy] Deploying AWS Emulator..."
    kubectl apply -f "${MANIFESTS_DIR}/04-aws-emulator.yaml"
    
    # Aplica Ingress Centralizado
    echo "[deploy] Deploying Centralized Ingress..."
    kubectl apply -f "${MANIFESTS_DIR}/05-ingress.yaml"
    
    # Verifica status
    echo "[status] Checking pods..."
    kubectl get pods -n mostval
    
    echo "[ok] Mostval infrastructure deployed!"
    echo "[info] Access URLs:"
    echo "  - Keycloak: https://mostval.local/auth/"
    echo "  - LocalStack: https://mostval.local/aws/"
    echo "  - RabbitMQ: https://mostval.local/rabbitmq/"
    echo "  - Health: https://mostval.local/health"
    echo "  - Dashboard: https://mostval.local/"
}

# Function to show deployment status
show_status() {
    echo "[status] Checking deployment status..."
    
    # Check namespace
    echo "[namespace] Namespace mostval:"
    kubectl get namespace mostval 2>/dev/null || echo "  ✗ Namespace não encontrado"
    echo
    
    # Check pods
    echo "[pods] Pods no namespace mostval:"
    kubectl get pods -n mostval -o wide
    echo
    
    # Check services
    echo "[services] Services no namespace mostval:"
    kubectl get services -n mostval
    echo
    
    # Check ingress
    echo "[ingress] Ingress no namespace mostval:"
    kubectl get ingress -n mostval
    echo
    
    # Check PVCs
    echo "[storage] Persistent Volume Claims:"
    kubectl get pvc -n mostval
    echo
    
    # Check deployments
    echo "[deployments] Deployments no namespace mostval:"
    kubectl get deployments -n mostval
    echo
    
    echo "[info] URLs de acesso:"
    echo "  - Dashboard: https://mostval.local/"
    echo "  - Keycloak: https://mostval.local/auth/"
    echo "  - LocalStack: https://mostval.local/aws/"
    echo "  - RabbitMQ: https://mostval.local/rabbitmq/"
    echo "  - Health: https://mostval.local/health"
}

# Function to show logs
show_logs() {
    local service="${1:-all}"
    
    echo "[logs] Showing logs for service: ${service}"
    
    case "${service}" in
        "all")
            echo "[logs] All services logs:"
            for deployment in postgresql redis keycloak rabbitmq localstack nginx; do
                if kubectl get deployment "${deployment}" -n mostval >/dev/null 2>&1; then
                    echo "[logs] === ${deployment} ==="
                    kubectl logs -f deployment/"${deployment}" -n mostval --tail=50
                    echo
                fi
            done
            ;;
        "postgresql"|"redis"|"keycloak"|"rabbitmq"|"localstack"|"nginx")
            if kubectl get deployment "${service}" -n mostval >/dev/null 2>&1; then
                echo "[logs] Logs for ${service}:"
                kubectl logs -f deployment/"${service}" -n mostval
            else
                echo "[error] Deployment ${service} não encontrado"
                exit 1
            fi
            ;;
        *)
            echo "[error] Serviço inválido: ${service}"
            echo "[usage] $0 logs [all|postgresql|redis|keycloak|rabbitmq|localstack|nginx]"
            exit 1
            ;;
    esac
}

# Function to test connectivity
test_connectivity() {
    echo "[test] Testing infrastructure connectivity..."
    
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

# Main function
main() {
    local action="${1:-deploy}"
    
    case "${action}" in
        "deploy")
            deploy_infrastructure
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "test")
            test_connectivity
            ;;
        *)
            echo "[error] Ação inválida: ${action}"
            echo "[usage] $0 [deploy|status|logs|test] [service]"
            echo "[example] $0 deploy"
            echo "[example] $0 status"
            echo "[example] $0 logs keycloak"
            echo "[example] $0 test"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
