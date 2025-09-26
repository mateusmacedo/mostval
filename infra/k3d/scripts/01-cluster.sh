#!/usr/bin/bash
set -euo pipefail

# Cluster Management Script for k3d
# Consolidated cluster operations: create, start, delete
# Usage: ./scripts/01-cluster.sh [create|start|delete|status]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Carrega e exporta variáveis de ambiente se o arquivo .env existir
if [[ -f "${ROOT_DIR}/.env" ]]; then
    set -a  # automatically export all variables
    source "${ROOT_DIR}/.env"
    set +a
fi

# Exporta variáveis padrão se não estiverem definidas
export CLUSTER_NAME="${CLUSTER_NAME:-dev}"
export K3S_VERSION="${K3S_VERSION:-v1.29.5-k3s1}"
export REGISTRY_NAME="${REGISTRY_NAME:-k3d-dev-registry}"
export REGISTRY_PORT="${REGISTRY_PORT:-5001}"

: "${CLUSTER_NAME:=dev}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo "[error] Docker não está rodando. Inicie o Docker primeiro."
        exit 1
    fi
}

# Function to create cluster
create_cluster() {
    echo "[create] Criando cluster k3d '${CLUSTER_NAME}' com registry local..."
    
    # Validações pré-criação
    echo "[validate] Verificando pré-requisitos..."
    
    # Verifica se o cluster já existe
    if k3d cluster list | grep -q "${CLUSTER_NAME}"; then
        echo "[error] Cluster '${CLUSTER_NAME}' já existe. Use 'delete' primeiro."
        exit 1
    fi
    
    # Verifica se as portas estão disponíveis
    if netstat -tuln 2>/dev/null | grep -q ":80 "; then
        echo "[warning] Porta 80 já está em uso. Pode haver conflitos."
    fi
    
    if netstat -tuln 2>/dev/null | grep -q ":443 "; then
        echo "[warning] Porta 443 já está em uso. Pode haver conflitos."
    fi
    
    if netstat -tuln 2>/dev/null | grep -q ":${REGISTRY_PORT} "; then
        echo "[error] Porta ${REGISTRY_PORT} já está em uso. Mude REGISTRY_PORT no .env"
        exit 1
    fi
    
    check_docker
    
    echo "[create] Criando cluster k3d '${CLUSTER_NAME}' com registry local..."
    
    # Usa configuração otimizada
    echo "[info] Usando configuração otimizada"
    k3d cluster create --config <(envsubst < "${ROOT_DIR}/values/cluster.yaml")
    KUBECONFIG=$(k3d kubeconfig write "${CLUSTER_NAME}")
    cp "${KUBECONFIG}" ~/.kube/config
    echo "[info] Kubeconfig em $KUBECONFIG"
    echo "[wait] Aguardando nós prontos..."
    kubectl wait --for=condition=Ready nodes --all --timeout=120s
    
    echo "[ok] Cluster '${CLUSTER_NAME}' criado."
    echo ""
    echo "[info] Registry local disponível em:"
    echo "  - URL: http://localhost:${REGISTRY_PORT}"
    echo "  - Push: docker push localhost:${REGISTRY_PORT}/imagem:tag"
    echo "  - Catalog: curl http://localhost:${REGISTRY_PORT}/v2/_catalog"
    echo ""
    echo "[info] Para usar imagens do registry no cluster:"
    echo "  - kubectl run app --image=localhost:${REGISTRY_PORT}/imagem:tag"
}

# Function to start cluster
start_cluster() {
    echo "[start] Inicializando cluster k3d '${CLUSTER_NAME}'..."
    
    check_docker
    
    # Verifica se o cluster existe
    if ! k3d cluster list | grep -q "${CLUSTER_NAME}"; then
        echo "[error] Cluster '${CLUSTER_NAME}' não existe."
        echo "[info] Execute 'create' para criar o cluster primeiro."
        exit 1
    fi
    
    # Verifica se o cluster já está rodando
    if k3d cluster list | grep -q "${CLUSTER_NAME}.*running"; then
        echo "[info] Cluster '${CLUSTER_NAME}' já está rodando."
        
        # Configura kubeconfig
        KUBECONFIG=$(k3d kubeconfig write "${CLUSTER_NAME}")
        cp "${KUBECONFIG}" ~/.kube/config
        echo "[info] Kubeconfig configurado em ~/.kube/config"
        
        # Testa conectividade
        if kubectl cluster-info >/dev/null 2>&1; then
            echo "[ok] Cluster '${CLUSTER_NAME}' está funcionando corretamente!"
            echo ""
            echo "[info] Registry local disponível em:"
            echo "  - URL: http://localhost:${REGISTRY_PORT}"
            echo "  - Push: docker push localhost:${REGISTRY_PORT}/imagem:tag"
            echo "  - Catalog: curl http://localhost:${REGISTRY_PORT}/v2/_catalog"
            echo ""
            echo "[info] Para verificar status: make status"
            echo "[info] Para testar conectividade: make test"
        else
            echo "[error] Cluster existe mas não está respondendo."
            echo "[info] Tente reiniciar o cluster: delete && create"
            exit 1
        fi
    else
        echo "[start] Iniciando cluster '${CLUSTER_NAME}'..."
        
        # Inicia o cluster
        k3d cluster start "${CLUSTER_NAME}"
        
        # Configura kubeconfig
        KUBECONFIG=$(k3d kubeconfig write "${CLUSTER_NAME}")
        cp "${KUBECONFIG}" ~/.kube/config
        echo "[info] Kubeconfig configurado em ~/.kube/config"
        
        # Aguarda nós ficarem prontos
        echo "[wait] Aguardando nós ficarem prontos..."
        kubectl wait --for=condition=Ready nodes --all --timeout=120s
        
        # Testa conectividade
        if kubectl cluster-info >/dev/null 2>&1; then
            echo "[ok] Cluster '${CLUSTER_NAME}' iniciado com sucesso!"
            echo ""
            echo "[info] Registry local disponível em:"
            echo "  - URL: http://localhost:${REGISTRY_PORT}"
            echo "  - Push: docker push localhost:${REGISTRY_PORT}/imagem:tag"
            echo "  - Catalog: curl http://localhost:${REGISTRY_PORT}/v2/_catalog"
            echo ""
            echo "[info] Para verificar status: make status"
            echo "[info] Para testar conectividade: make test"
        else
            echo "[error] Falha ao conectar ao cluster após inicialização."
            echo "[info] Verifique os logs: kubectl get pods -n kube-system"
            exit 1
        fi
    fi
    
    # Verifica se o registry local está funcionando
    echo "[check] Verificando registry local..."
    if curl -s -f "http://localhost:${REGISTRY_PORT}/v2/" >/dev/null 2>&1; then
        echo "[ok] Registry local funcionando em http://localhost:${REGISTRY_PORT}"
    else
        echo "[warning] Registry local não está acessível em http://localhost:${REGISTRY_PORT}"
        echo "[info] O registry pode estar sendo inicializado. Aguarde alguns segundos."
    fi
    
    echo "[ok] Cluster inicializado com sucesso!"
}

# Function to delete cluster
delete_cluster() {
    echo "[delete] Removendo cluster '${CLUSTER_NAME}'..."
    k3d cluster delete "${CLUSTER_NAME}" || true
    
    echo "[delete] Removendo registry '${REGISTRY_NAME}' (se existir)..."
    if k3d registry list | grep -q "${REGISTRY_NAME}"; then
        k3d registry delete "${REGISTRY_NAME}"
        echo "[delete] Registry '${REGISTRY_NAME}' removido."
    else
        echo "[delete] Registry '${REGISTRY_NAME}' não encontrado, pulando..."
    fi
    
    echo "[delete] Removendo volumes persistentes..."
    # Remove volumes do servidor e agentes se existirem
    # Primeiro, tenta remover volumes específicos conhecidos
    for volume in "${CLUSTER_NAME}-server" "${CLUSTER_NAME}-agent-0"; do
        if docker volume ls -q | grep -q "^${volume}$"; then
            docker volume rm "${volume}" || true
            echo "[delete] Volume '${volume}' removido."
        else
            echo "[delete] Volume '${volume}' não encontrado, pulando..."
        fi
    done
    
    # Remove volume do agente único
    echo "[delete] Verificando volume do agente..."
    agent_volume="${CLUSTER_NAME}-agent-0"
    if docker volume ls -q | grep -q "^${agent_volume}$"; then
        docker volume rm "${agent_volume}" || true
        echo "[delete] Volume '${agent_volume}' removido."
    else
        echo "[delete] Volume '${agent_volume}' não encontrado, pulando..."
    fi
    
    echo "[ok] Ambiente removido."
}

# Function to show cluster status
show_status() {
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
    if k3d registry list | grep -q "${REGISTRY_NAME}"; then
        echo "  ✓ Registry '${REGISTRY_NAME}' ativo na porta ${REGISTRY_PORT}"
        echo "  - URL: http://localhost:${REGISTRY_PORT}"
        echo "  - Catalog: curl http://localhost:${REGISTRY_PORT}/v2/_catalog"
    else
        echo "  ✗ Registry '${REGISTRY_NAME}' não encontrado"
    fi
    echo
    
    echo "[k8s] Pods no mostval:"
    kubectl -n mostval get pods -o wide || true
    echo
    
    echo "[info] URLs de acesso:"
    echo "  - Keycloak: https://auth.mostval.local"
    echo "  - LocalStack: https://aws.mostval.local"
    echo "  - Rancher: http://rancher-dev.sslip.io"
}

# Main function
main() {
    local action="${1:-status}"
    
    case "${action}" in
        "create")
            create_cluster
            ;;
        "start")
            start_cluster
            ;;
        "delete")
            delete_cluster
            ;;
        "status")
            show_status
            ;;
        *)
            echo "[error] Ação inválida: ${action}"
            echo "[usage] $0 [create|start|delete|status]"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
