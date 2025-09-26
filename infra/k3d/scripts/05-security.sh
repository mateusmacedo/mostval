#!/usr/bin/bash
set -euo pipefail

# Security Management Script for k3d
# Consolidated security operations: policies, network, app ingress
# Usage: ./scripts/05-security.sh [apply|allow-app|status]

# Function to apply security policies
apply_security_policies() {
    local component="${1:-all}"
    local policy_type="${2:-restrictive}"
    
    echo "[security] Aplicando políticas de segurança para componente: ${component} (${policy_type})..."
    
    # Verifica se o cluster está rodando
    if ! kubectl cluster-info >/dev/null 2>&1; then
        echo "[error] kubectl não consegue conectar ao cluster. Verifique o kubeconfig."
        exit 1
    fi
    
    # Configura labels básicos dos namespaces
    echo "[security] Configurando labels dos namespaces..."
    kubectl label namespace kube-system name=kube-system --overwrite
    
    case "${component}" in
        "all")
            echo "[security] Aplicando políticas de segurança básicas..."
            echo "[info] Aplicando NetworkPolicies básicas para o cluster..."
            
            # Aplica políticas básicas de rede
            kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
EOF
            ;;
        *)
            echo "[error] Componente inválido: ${component}"
            echo "Uso: $0 apply [all] [restrictive|permissive]"
            exit 1
            ;;
    esac
    
    echo "[ok] Políticas de segurança aplicadas!"
    echo "[info] Para verificar NetworkPolicies: kubectl get networkpolicies --all-namespaces"
}

# Function to allow app ingress
allow_app_ingress() {
    local namespace="${1:-}"
    local app_name="${2:-}"
    local port="${3:-8080}"
    
    if [[ -z "${namespace}" || -z "${app_name}" ]]; then
        echo "Uso: $0 allow-app <namespace> <app-name> [port]"
        echo "Exemplo: $0 allow-app meu-namespace minha-app 8080"
        exit 1
    fi
    
    echo "[network] Criando NetworkPolicy para ${app_name} no namespace ${namespace}..."
    
    # Cria namespace se não existir
    kubectl create namespace "${namespace}" --dry-run=client -o yaml | kubectl apply -f -
    
    # Aplica label no namespace
    kubectl label namespace "${namespace}" name="${namespace}" --overwrite
    
    # Cria NetworkPolicy
    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-${app_name}-ingress
  namespace: ${namespace}
spec:
  podSelector:
    matchLabels:
      app: ${app_name}
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    - namespaceSelector:
        matchLabels:
          name: ${namespace}
    ports:
    - protocol: TCP
      port: ${port}
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-${app_name}-external
  namespace: ${namespace}
spec:
  podSelector:
    matchLabels:
      app: ${app_name}
  policyTypes:
  - Ingress
  ingress:
  - from: []  # Permite acesso externo
    ports:
    - protocol: TCP
      port: ${port}
EOF
    
    echo "[ok] NetworkPolicy criada para ${app_name}!"
    echo "[info] Para verificar: kubectl get networkpolicies -n ${namespace}"
}

# Function to show security status
show_security_status() {
    echo "[security] Verificando status das políticas de segurança..."
    
    # Check NetworkPolicies
    echo "[network] NetworkPolicies:"
    kubectl get networkpolicies --all-namespaces
    echo
    
    # Check namespaces with labels
    echo "[namespace] Namespaces com labels de segurança:"
    kubectl get namespaces --show-labels | grep -E "(name=|security=)"
    echo
    
    # Check security contexts
    echo "[security] Security contexts dos pods:"
    kubectl get pods --all-namespaces -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.securityContext}{"\n"}{end}' | head -10
    echo
    
    # Check RBAC
    echo "[rbac] Roles e RoleBindings:"
    kubectl get roles,rolebindings --all-namespaces
    echo
    
    echo "[info] Para mais detalhes:"
    echo "  - kubectl get networkpolicies --all-namespaces -o wide"
    echo "  - kubectl describe networkpolicy <name> -n <namespace>"
    echo "  - kubectl get roles,rolebindings --all-namespaces"
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

# Main function
main() {
    local action="${1:-status}"
    
    case "${action}" in
        "apply")
            apply_security_policies "$2" "$3"
            ;;
        "allow-app")
            allow_app_ingress "$2" "$3" "$4"
            ;;
        "status")
            show_security_status
            ;;
        "create-secrets")
            create_secrets "$2"
            ;;
        "generate-passwords")
            generate_passwords
            ;;
        *)
            echo "[error] Ação inválida: ${action}"
            echo "[usage] $0 [apply|allow-app|status|create-secrets|generate-passwords] [args...]"
            echo "[example] $0 apply all restrictive"
            echo "[example] $0 allow-app meu-namespace minha-app 8080"
            echo "[example] $0 status"
            echo "[example] $0 create-secrets all"
            echo "[example] $0 generate-passwords"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
