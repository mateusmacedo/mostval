#!/bin/bash

# Registry Management Script for k3d
# Consolidated registry operations: test, build, push
# Usage: ./scripts/02-registry.sh [test|build|push] [app-name] [tag]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
REGISTRY_PORT="${REGISTRY_PORT:-5001}"
REGISTRY_NAME="${REGISTRY_NAME:-k3d-dev-registry}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get cluster registry URL
get_cluster_registry_url() {
    # Inside k3d cluster, the registry is accessible via service name
    echo "k3d-${REGISTRY_NAME}:5000"
}

# Function to get host registry URL
get_host_registry_url() {
    # From host machine, registry is accessible via localhost
    echo "localhost:${REGISTRY_PORT}"
}

# Function to check if we're inside a pod/container
is_inside_cluster() {
    # Check if we're inside a Kubernetes pod
    if [ -n "${KUBERNETES_SERVICE_HOST:-}" ]; then
        return 0
    fi
    # Check if we're inside a container with k3d network
    if [ -n "${K3D_NETWORK:-}" ]; then
        return 0
    fi
    return 1
}

# Function to test registry
test_registry() {
    echo -e "${BLUE}[test] Testando registry local '${REGISTRY_NAME}'...${NC}"
    
    # Verifica se o registry existe
    if ! k3d registry list | grep -q "${REGISTRY_NAME}"; then
        echo -e "${RED}[error] Registry '${REGISTRY_NAME}' não encontrado${NC}"
        echo -e "${BLUE}[info] Execute 'make up' primeiro para criar o registry${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}[ok] Registry '${REGISTRY_NAME}' encontrado${NC}"
    
    # Testa conectividade HTTP
    echo -e "${BLUE}[test] Testando conectividade HTTP...${NC}"
    if curl -s -f "http://localhost:${REGISTRY_PORT}/v2/" >/dev/null 2>&1; then
        echo -e "${GREEN}[ok] Registry acessível via HTTP${NC}"
    else
        echo -e "${RED}[error] Registry não acessível via HTTP${NC}"
        exit 1
    fi
    
    # Testa catalog
    echo -e "${BLUE}[test] Testando catalog do registry...${NC}"
    catalog=$(curl -s "http://localhost:${REGISTRY_PORT}/v2/_catalog" 2>/dev/null || echo "{}")
    if echo "$catalog" | grep -q "repositories"; then
        echo -e "${GREEN}[ok] Catalog do registry funcionando${NC}"
        echo -e "${BLUE}[info] Repositórios disponíveis:${NC}"
        echo "$catalog" | jq -r '.repositories[]' 2>/dev/null || echo "  (nenhum repositório encontrado)"
    else
        echo -e "${RED}[error] Falha ao acessar catalog do registry${NC}"
        exit 1
    fi
    
    # Testa push de imagem (opcional)
    echo -e "${BLUE}[test] Testando push de imagem...${NC}"
    if docker pull nginx:alpine >/dev/null 2>&1; then
        echo -e "${GREEN}[ok] Imagem nginx:alpine baixada${NC}"
        
        # Tag para registry local
        docker tag nginx:alpine "localhost:${REGISTRY_PORT}/test-nginx:latest" >/dev/null 2>&1
        
        # Push para registry
        if docker push "localhost:${REGISTRY_PORT}/test-nginx:latest" >/dev/null 2>&1; then
            echo -e "${GREEN}[ok] Push para registry funcionando${NC}"
            
            # Verifica se a imagem foi salva
            if curl -s "http://localhost:${REGISTRY_PORT}/v2/_catalog" | grep -q "test-nginx"; then
                echo -e "${GREEN}[ok] Imagem salva no registry${NC}"
            else
                echo -e "${YELLOW}[warning] Imagem não encontrada no catalog${NC}"
            fi
            
            # Limpa a imagem de teste
            docker rmi "localhost:${REGISTRY_PORT}/test-nginx:latest" >/dev/null 2>&1 || true
        else
            echo -e "${RED}[error] Falha no push para registry${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}[warning] Não foi possível baixar nginx:alpine para teste${NC}"
    fi
    
    echo -e "${GREEN}[ok] Registry local funcionando corretamente!${NC}"
    echo -e "${BLUE}[info] Registry disponível em: http://localhost:${REGISTRY_PORT}${NC}"
    echo -e "${BLUE}[info] Para usar: docker push localhost:${REGISTRY_PORT}/imagem:tag${NC}"
}

# Function to build and tag image
build_and_tag() {
    local app_name="$1"
    local tag="${2:-latest}"
    local context_dir="$3"
    
    echo -e "${BLUE}[build] Construindo imagem ${app_name}:${tag}...${NC}"
    
    # Build the image
    if ! docker build -t "${app_name}:${tag}" "${context_dir}"; then
        echo -e "${RED}[error] Falha ao construir imagem ${app_name}:${tag}${NC}"
        return 1
    fi
    
    echo -e "${GREEN}[ok] Imagem ${app_name}:${tag} construída com sucesso${NC}"
    
    # Determine registry URL based on context
    local registry_url
    if is_inside_cluster; then
        registry_url=$(get_cluster_registry_url)
        echo -e "${BLUE}[info] Executando dentro do cluster, usando registry: ${registry_url}${NC}"
    else
        registry_url=$(get_host_registry_url)
        echo -e "${BLUE}[info] Executando no host, usando registry: ${registry_url}${NC}"
    fi
    
    # Tag for registry
    local registry_image="${registry_url}/${app_name}:${tag}"
    echo -e "${BLUE}[tag] Marcando imagem como ${registry_image}...${NC}"
    
    if ! docker tag "${app_name}:${tag}" "${registry_image}"; then
        echo -e "${RED}[error] Falha ao marcar imagem${NC}"
        return 1
    fi
    
    echo -e "${GREEN}[ok] Imagem marcada como ${registry_image}${NC}"
    
    # Push to registry
    echo -e "${BLUE}[push] Enviando imagem para registry...${NC}"
    
    if ! docker push "${registry_image}"; then
        echo -e "${RED}[error] Falha ao enviar imagem para registry${NC}"
        return 1
    fi
    
    echo -e "${GREEN}[ok] Imagem enviada para registry com sucesso${NC}"
    
    # Return the registry image name for use in manifests
    echo "${registry_image}"
}

# Function to update deployment manifests
update_manifest() {
    local app_name="$1"
    local registry_image="$2"
    local manifest_file="$3"
    
    echo -e "${BLUE}[update] Atualizando manifest ${manifest_file}...${NC}"
    
    # Create backup
    cp "${manifest_file}" "${manifest_file}.backup"
    
    # Update image in manifest
    if command_exists sed; then
        sed -i "s|image: .*${app_name}.*|image: ${registry_image}|g" "${manifest_file}"
    else
        # Fallback for systems without sed
        python3 -c "
import re
with open('${manifest_file}', 'r') as f:
    content = f.read()
content = re.sub(r'image: .*${app_name}.*', 'image: ${registry_image}', content)
with open('${manifest_file}', 'w') as f:
    f.write(content)
"
    fi
    
    echo -e "${GREEN}[ok] Manifest atualizado com imagem: ${registry_image}${NC}"
}

# Function to deploy to cluster
deploy_to_cluster() {
    local app_name="$1"
    local manifest_file="$2"
    local namespace="${3:-mostval}"
    
    echo -e "${BLUE}[deploy] Implantando ${app_name} no cluster...${NC}"
    
    if ! kubectl apply -f "${manifest_file}" -n "${namespace}"; then
        echo -e "${RED}[error] Falha ao implantar ${app_name}${NC}"
        return 1
    fi
    
    echo -e "${GREEN}[ok] ${app_name} implantado com sucesso${NC}"
    
    # Wait for deployment to be ready
    echo -e "${BLUE}[wait] Aguardando ${app_name} ficar pronto...${NC}"
    if kubectl wait --for=condition=available deployment/"${app_name}" -n "${namespace}" --timeout=300s; then
        echo -e "${GREEN}[ok] ${app_name} está pronto${NC}"
    else
        echo -e "${YELLOW}[warning] Timeout aguardando ${app_name} ficar pronto${NC}"
    fi
}

# Function to build and push application
build_and_push() {
    local app_name="${1:-}"
    local tag="${2:-latest}"
    
    if [ -z "${app_name}" ]; then
        echo -e "${RED}[error] Nome da aplicação é obrigatório${NC}"
        echo -e "${BLUE}[usage] $0 build <app-name> [tag]${NC}"
        echo -e "${BLUE}[example] $0 build node-api v1.0.0${NC}"
        exit 1
    fi
    
    # Check dependencies
    if ! command_exists docker; then
        echo -e "${RED}[error] Docker não encontrado${NC}"
        exit 1
    fi
    
    if ! command_exists kubectl; then
        echo -e "${RED}[error] kubectl não encontrado${NC}"
        exit 1
    fi
    
    # Check if k3d cluster is running
    if ! kubectl cluster-info >/dev/null 2>&1; then
        echo -e "${RED}[error] Cluster k3d não está rodando${NC}"
        echo -e "${BLUE}[info] Execute 'make up' primeiro${NC}"
        exit 1
    fi
    
    # Check if registry is accessible
    local registry_url
    if is_inside_cluster; then
        registry_url=$(get_cluster_registry_url)
    else
        registry_url=$(get_host_registry_url)
    fi
    
    echo -e "${BLUE}[check] Verificando registry ${registry_url}...${NC}"
    if ! curl -s -f "http://${registry_url}/v2/" >/dev/null 2>&1; then
        echo -e "${RED}[error] Registry não está acessível em ${registry_url}${NC}"
        echo -e "${BLUE}[info] Execute 'make up' primeiro para criar o registry${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}[ok] Registry acessível em ${registry_url}${NC}"
    
    # Find app directory
    local app_dir="${PROJECT_ROOT}/apps/${app_name}"
    if [ ! -d "${app_dir}" ]; then
        echo -e "${RED}[error] Diretório da aplicação não encontrado: ${app_dir}${NC}"
        exit 1
    fi
    
    # Find Dockerfile
    local dockerfile="${app_dir}/Dockerfile"
    if [ ! -f "${dockerfile}" ]; then
        echo -e "${RED}[error] Dockerfile não encontrado: ${dockerfile}${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}[info] Encontrado Dockerfile em: ${dockerfile}${NC}"
    
    # Build and push
    local registry_image
    registry_image=$(build_and_tag "${app_name}" "${tag}" "${app_dir}")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}[error] Falha no build/push${NC}"
        exit 1
    fi
    
    # Find and update manifests
    local manifest_dir="${PROJECT_ROOT}/infra/k3d/manifests"
    local manifest_file="${manifest_dir}/${app_name}.yaml"
    
    if [ -f "${manifest_file}" ]; then
        update_manifest "${app_name}" "${registry_image}" "${manifest_file}"
        deploy_to_cluster "${app_name}" "${manifest_file}"
    else
        echo -e "${YELLOW}[warning] Manifest não encontrado: ${manifest_file}${NC}"
        echo -e "${BLUE}[info] Imagem construída e enviada: ${registry_image}${NC}"
        echo -e "${BLUE}[info] Crie o manifest manualmente ou use kubectl run${NC}"
    fi
    
    echo -e "${GREEN}[ok] Processo concluído com sucesso!${NC}"
    echo -e "${BLUE}[info] Imagem: ${registry_image}${NC}"
    echo -e "${BLUE}[info] Para verificar: kubectl get pods -n mostval${NC}"
}

# Main function
main() {
    local action="${1:-test}"
    
    case "${action}" in
        "test")
            test_registry
            ;;
        "build")
            build_and_push "$2" "$3"
            ;;
        *)
            echo -e "${RED}[error] Ação inválida: ${action}${NC}"
            echo -e "${BLUE}[usage] $0 [test|build] [app-name] [tag]${NC}"
            echo -e "${BLUE}[example] $0 test${NC}"
            echo -e "${BLUE}[example] $0 build node-api v1.0.0${NC}"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
