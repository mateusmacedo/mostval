#!/usr/bin/bash
set -euo pipefail

# Utilities Script for k3d
# Consolidated utility operations: status, generate-passwords, create-secrets
# Usage: ./scripts/07-utils.sh [status|generate-passwords|create-secrets|get-registry-url]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Function to show comprehensive status
show_status() {
    local cluster_name="${CLUSTER_NAME:-dev}"
    local registry_name="${REGISTRY_NAME:-k3d-dev-registry}"
    local registry_port="${REGISTRY_PORT:-5001}"
    local rancher_hostname="${RANCHER_HOSTNAME:-rancher-dev.sslip.io}"
    
    echo "[k3d] Clusters disponíveis:"
    k3d cluster list || true
    echo
    
    echo "[k8s] Nós:"
    kubectl get nodes -o wide || true
    echo
    
    echo "[k8s] Namespaces principais:"
    kubectl get ns | egrep "kube-system|kube-public|default|cattle-system" || true
    echo
    
    echo "[k8s] Pods no cattle-system:"
    kubectl -n cattle-system get pods -o wide || true
    echo
    
    echo "[registry] Registry local:"
    if k3d registry list | grep -q "${registry_name}"; then
        echo "  ✓ Registry '${registry_name}' ativo na porta ${registry_port}"
        echo "  - URL: http://localhost:${registry_port}"
        echo "  - Catalog: curl http://localhost:${registry_port}/v2/_catalog"
    else
        echo "  ✗ Registry '${registry_name}' não encontrado"
    fi
    echo
    
    echo "[k8s] Pods no mostval:"
    kubectl -n mostval get pods -o wide || true
    echo
    
    echo "[info] URLs de acesso:"
    echo "  - Keycloak: https://mostval.local/auth/"
    echo "  - LocalStack: https://mostval.local/aws/"
    echo "  - RabbitMQ: https://mostval.local/rabbitmq/"
    echo "  - Health: https://mostval.local/health"
    echo "  - Dashboard: https://mostval.local/"
    echo "  - Rancher: http://${rancher_hostname}"
}

# Function to generate passwords
generate_passwords() {
    local env_file="${ROOT_DIR}/.env"
    
    echo "[generate] Gerando senhas seguras..."
    
    # Função para gerar senha segura
    generate_password() {
        local length="${1:-32}"
        openssl rand -base64 "${length}" | tr -d "=+/" | cut -c1-"${length}"
    }
    
    # Função para gerar chave de criptografia
    generate_encryption_key() {
        openssl rand -base64 2000 | tr -dc 'A-Z' | fold -w 128 | head -n 1
    }
    
    # Gera senhas se não existirem no .env
    if [[ -f "${env_file}" ]]; then
        source "${env_file}"
    fi
    
    # Gera senha básica do cluster se não existir
    if [[ -z "${CLUSTER_PASSWORD:-}" ]]; then
        CLUSTER_PASSWORD=$(generate_password 20)
        echo "[generate] Senha do cluster gerada: ${CLUSTER_PASSWORD}"
    fi
    
    # Atualiza o arquivo .env
    {
        echo "# Senhas geradas automaticamente - NÃO COMMITAR"
        echo "CLUSTER_PASSWORD=${CLUSTER_PASSWORD}"
        echo ""
        echo "# Configurações do cluster"
        echo "CLUSTER_NAME=${CLUSTER_NAME:-dev}"
        echo "K3S_VERSION=${K3S_VERSION:-v1.29.5-k3s1}"
        echo ""
        echo "# Registry local"
        echo "REGISTRY_NAME=${REGISTRY_NAME:-k3d-dev-registry}"
        echo "REGISTRY_PORT=${REGISTRY_PORT:-5001}"
    } > "${env_file}"
    
    echo "[ok] Senhas geradas e salvas em ${env_file}"
    echo "[warning] IMPORTANTE: Adicione .env ao .gitignore para não commitar senhas!"
}

# Function to create secrets
create_secrets() {
    local component="${1:-all}"
    
    echo "[secrets] Criando secrets do Kubernetes para componente: ${component}..."
    
    # Verifica se o cluster está rodando
    if ! kubectl cluster-info >/dev/null 2>&1; then
        echo "[error] kubectl não consegue conectar ao cluster. Verifique o kubeconfig."
        exit 1
    fi
    
    case "${component}" in
        "all")
            echo "[secrets] Criando todos os secrets disponíveis..."
            echo "[info] Nenhum secret específico configurado para este ambiente básico."
            ;;
        *)
            echo "[error] Componente inválido: ${component}"
            echo "Uso: $0 create-secrets [all]"
            exit 1
            ;;
    esac
    
    echo "[ok] Secrets criados com sucesso!"
}

# Function to get registry URL
get_registry_url() {
    local registry_port="${REGISTRY_PORT:-5001}"
    local registry_name="${REGISTRY_NAME:-k3d-dev-registry}"
    
    # Colors for output
    BLUE='\033[0;34m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    NC='\033[0m' # No Color
    
    # Function to detect execution context
    detect_context() {
        # Check if we're inside a Kubernetes pod
        if [ -n "${KUBERNETES_SERVICE_HOST:-}" ]; then
            echo "cluster"
            return 0
        fi
        
        # Check if we're inside a k3d container
        if [ -n "${K3D_NETWORK:-}" ]; then
            echo "cluster"
            return 0
        fi
        
        # Check if we're in a Docker container with k3d network
        if [ -f "/proc/1/cgroup" ] && grep -q "k3d" /proc/1/cgroup 2>/dev/null; then
            echo "cluster"
            return 0
        fi
        
        # Check if localhost:5001 is accessible (host context)
        if curl -s -f "http://localhost:${registry_port}/v2/" >/dev/null 2>&1; then
            echo "host"
            return 0
        fi
        
        # Default to host context
        echo "host"
    }
    
    # Function to get registry URL based on context
    get_registry_url() {
        local context
        context=$(detect_context)
        
        case "${context}" in
            "cluster")
                echo "k3d-${registry_name}:5000"
                ;;
            "host")
                echo "localhost:${registry_port}"
                ;;
            *)
                echo "localhost:${registry_port}"
                ;;
        esac
    }
    
    # Function to get registry URL for Docker commands
    get_docker_registry_url() {
        local context
        context=$(detect_context)
        
        case "${context}" in
            "cluster")
                # Inside cluster, use service name
                echo "k3d-${registry_name}:5000"
                ;;
            "host")
                # On host, use localhost
                echo "localhost:${registry_port}"
                ;;
            *)
                echo "localhost:${registry_port}"
                ;;
        esac
    }
    
    # Function to get registry URL for Kubernetes manifests
    get_k8s_registry_url() {
        local context
        context=$(detect_context)
        
        case "${context}" in
            "cluster")
                # Inside cluster, use service name
                echo "k3d-${registry_name}:5000"
                ;;
            "host")
                # On host, use localhost (for kubectl apply)
                echo "localhost:${registry_port}"
                ;;
            *)
                echo "localhost:${registry_port}"
                ;;
        esac
    }
    
    # Main execution
    local context
    context=$(detect_context)
    
    echo -e "${BLUE}[info] Contexto detectado: ${context}${NC}"
    
    case "${1:-}" in
        "docker")
            echo "$(get_docker_registry_url)"
            ;;
        "k8s")
            echo "$(get_k8s_registry_url)"
            ;;
        "context")
            echo "${context}"
            ;;
        *)
            echo "$(get_registry_url)"
            ;;
    esac
}

# Function to show help
show_help() {
    echo "Utilitários para k3d - Mostval"
    echo ""
    echo "Uso: $0 [comando] [argumentos...]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  status                 - Mostra status completo do cluster"
    echo "  generate-passwords     - Gera senhas seguras para o ambiente"
    echo "  create-secrets         - Cria secrets do Kubernetes"
    echo "  get-registry-url       - Obtém URL do registry baseada no contexto"
    echo "  help                   - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 status"
    echo "  $0 generate-passwords"
    echo "  $0 create-secrets all"
    echo "  $0 get-registry-url"
    echo "  $0 get-registry-url docker"
    echo "  $0 get-registry-url k8s"
    echo "  $0 get-registry-url context"
}

# Main function
main() {
    local action="${1:-help}"
    
    case "${action}" in
        "status")
            show_status
            ;;
        "generate-passwords")
            generate_passwords
            ;;
        "create-secrets")
            create_secrets "$2"
            ;;
        "get-registry-url")
            get_registry_url "$2"
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            echo "[error] Comando inválido: ${action}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
