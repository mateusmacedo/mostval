#!/usr/bin/bash
set -euo pipefail

# Dependencies and Configuration Script for k3d
# Consolidated dependency management and installation
# Usage: ./scripts/08-deps.sh [check|install|configure]

# Function to check dependencies
check_dependencies() {
    echo "[check] Verificando dependências..."
    
    # Adiciona caminhos comuns ao PATH para encontrar ferramentas
    export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
    
    check_dependency() {
        local cmd="$1"
        if command -v "$cmd" >/dev/null 2>&1; then
            echo "✓ $cmd: $(command -v "$cmd")"
            return 0
        else
            echo "✗ $cmd: não encontrado"
            return 1
        fi
    }
    
    failed=0
    for dep in docker k3d kubectl helm; do
        check_dependency "$dep" || failed=1
    done
    
    if [ $failed -eq 1 ]; then
        echo ""
        echo "[error] Algumas dependências estão faltando."
        echo "Para instalar as dependências faltantes:"
        echo ""
        echo "# helm (se não estiver funcionando)"
        echo "curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | sudo bash"
        echo ""
        echo "# k3d (se não estiver funcionando)"
        echo "curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | sudo bash"
        echo ""
        echo "# kubectl (se não estiver funcionando)"
        echo "curl -LO https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        echo "sudo chmod +x kubectl"
        echo "sudo mv kubectl /usr/bin/"
        exit 1
    fi
    
    echo "[ok] Todas as dependências foram encontradas."
}

# Function to install dependencies
install_dependencies() {
    echo "[install] Instalando dependências..."
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        echo "[error] Não execute este script como root"
        echo "[info] Execute como usuário normal e use sudo quando necessário"
        exit 1
    fi
    
    # Check if curl is available
    if ! command -v curl >/dev/null 2>&1; then
        echo "[error] curl não encontrado. Instale o curl primeiro."
        exit 1
    fi
    
    # Install kubectl
    echo "[install] Instalando kubectl..."
    if ! command -v kubectl >/dev/null 2>&1; then
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        chmod +x kubectl
        sudo mv kubectl /usr/local/bin/
        echo "[ok] kubectl instalado"
    else
        echo "[ok] kubectl já está instalado"
    fi
    
    # Install k3d
    echo "[install] Instalando k3d..."
    if ! command -v k3d >/dev/null 2>&1; then
        curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
        echo "[ok] k3d instalado"
    else
        echo "[ok] k3d já está instalado"
    fi
    
    # Install helm
    echo "[install] Instalando helm..."
    if ! command -v helm >/dev/null 2>&1; then
        curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
        echo "[ok] helm instalado"
    else
        echo "[ok] helm já está instalado"
    fi
    
    # Check Docker
    echo "[install] Verificando Docker..."
    if ! command -v docker >/dev/null 2>&1; then
        echo "[error] Docker não encontrado"
        echo "[info] Instale o Docker primeiro:"
        echo "  - Ubuntu/Debian: sudo apt-get install docker.io"
        echo "  - CentOS/RHEL: sudo yum install docker"
        echo "  - Ou siga: https://docs.docker.com/get-docker/"
        exit 1
    else
        echo "[ok] Docker encontrado"
    fi
    
    # Check if user is in docker group
    if ! groups | grep -q docker; then
        echo "[warning] Usuário não está no grupo docker"
        echo "[info] Execute: sudo usermod -aG docker $USER"
        echo "[info] Depois faça logout e login novamente"
    else
        echo "[ok] Usuário está no grupo docker"
    fi
    
    echo "[ok] Instalação de dependências concluída!"
}

# Function to configure environment
configure_environment() {
    echo "[configure] Configurando ambiente..."
    
    # Create .env file if it doesn't exist
    local env_file="${ROOT_DIR}/.env"
    if [ ! -f "${env_file}" ]; then
        echo "[configure] Criando arquivo .env..."
        cat > "${env_file}" <<EOF
# Configurações do cluster
CLUSTER_NAME=dev
K3S_VERSION=v1.29.5-k3s1

# Registry local
REGISTRY_NAME=k3d-dev-registry
REGISTRY_PORT=5001

# Senhas (geradas automaticamente)
CLUSTER_PASSWORD=
EOF
        echo "[ok] Arquivo .env criado"
    else
        echo "[ok] Arquivo .env já existe"
    fi
    
    # Create .gitignore if it doesn't exist
    local gitignore_file="${ROOT_DIR}/.gitignore"
    if [ ! -f "${gitignore_file}" ]; then
        echo "[configure] Criando arquivo .gitignore..."
        cat > "${gitignore_file}" <<EOF
# Environment files
.env
.env.local
.env.*.local

# Backup files
backups/
*.backup

# Logs
*.log
logs/

# Temporary files
tmp/
temp/
EOF
        echo "[ok] Arquivo .gitignore criado"
    else
        echo "[ok] Arquivo .gitignore já existe"
    fi
    
    # Check if Docker is running
    echo "[configure] Verificando Docker..."
    if ! docker info >/dev/null 2>&1; then
        echo "[error] Docker não está rodando"
        echo "[info] Inicie o Docker primeiro"
        exit 1
    else
        echo "[ok] Docker está rodando"
    fi
    
    # Check if user can run docker without sudo
    if ! docker ps >/dev/null 2>&1; then
        echo "[warning] Usuário não pode executar docker sem sudo"
        echo "[info] Execute: sudo usermod -aG docker $USER"
        echo "[info] Depois faça logout e login novamente"
    else
        echo "[ok] Usuário pode executar docker sem sudo"
    fi
    
    echo "[ok] Configuração do ambiente concluída!"
}

# Function to show system information
show_system_info() {
    echo "[info] Informações do sistema:"
    echo "  - OS: $(uname -s)"
    echo "  - Architecture: $(uname -m)"
    echo "  - Kernel: $(uname -r)"
    echo "  - User: $(whoami)"
    echo "  - Home: $HOME"
    echo "  - Shell: $SHELL"
    echo ""
    
    echo "[info] Versões das ferramentas:"
    for tool in docker k3d kubectl helm; do
        if command -v "$tool" >/dev/null 2>&1; then
            echo "  - $tool: $($tool version --short 2>/dev/null || $tool --version 2>/dev/null | head -1)"
        else
            echo "  - $tool: não instalado"
        fi
    done
    echo ""
    
    echo "[info] Grupos do usuário:"
    groups
    echo ""
    
    echo "[info] Variáveis de ambiente relevantes:"
    env | grep -E "(DOCKER|KUBE|K3D|REGISTRY)" | sort
}

# Function to show help
show_help() {
    echo "Gerenciamento de Dependências para k3d - Mostval"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  check                 - Verifica se todas as dependências estão instaladas"
    echo "  install               - Instala dependências faltantes"
    echo "  configure             - Configura o ambiente de desenvolvimento"
    echo "  info                  - Mostra informações do sistema"
    echo "  help                  - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 check"
    echo "  $0 install"
    echo "  $0 configure"
    echo "  $0 info"
}

# Main function
main() {
    local action="${1:-help}"
    
    case "${action}" in
        "check")
            check_dependencies
            ;;
        "install")
            install_dependencies
            ;;
        "configure")
            configure_environment
            ;;
        "info")
            show_system_info
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
