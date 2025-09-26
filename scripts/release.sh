#!/bin/bash

# Script para facilitar o uso do Nx Release
# Uso: ./scripts/release.sh [comando] [opções]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [comando] [opções]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  dry-run [projeto]     - Simula o release sem fazer alterações"
    echo "  version [projeto]      - Apenas atualiza versões"
    echo "  changelog [projeto]    - Apenas gera changelog"
    echo "  publish [projeto]      - Publica no npm"
    echo "  full [projeto]        - Executa release completo"
    echo "  help                  - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 dry-run                           # Dry run de todos os projetos"
    echo "  $0 dry-run @mostval/node-logger  # Dry run de projeto específico"
    echo "  $0 full @mostval/node-logger    # Release completo de projeto específico"
}

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm não está instalado. Instale com: npm install -g pnpm"
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "nx.json" ]; then
    print_error "Este script deve ser executado na raiz do workspace Nx"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    print_info "Instalando dependências..."
    pnpm install
fi

# Função para verificar se é primeira release
is_first_release() {
    local project="$1"
    if [ -n "$project" ]; then
        # Verifica se existe tag para o projeto
        git tag -l | grep -q "^$project@" || return 0
    else
        # Verifica se existe qualquer tag de release
        git tag -l | grep -q "@" || return 0
    fi
    return 1
}

# Função para verificar se é projeto Go
is_go_project() {
    local project="$1"
    case "$project" in
        "@mostval/go-logger"|"@mostval/go-api")
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Função para executar release de projeto Go
run_go_release() {
    local project="$1"
    local version="$2"

    print_info "Executando release para projeto Go: $project"
    ./scripts/go-release.sh "$project" "$version"
}

# Função unificada para release
run_unified_release() {
    local command="$1"
    local project="$2"
    local extra_args="$3"

    if [ -n "$project" ] && is_go_project "$project"; then
        # Para projetos Go, usar script específico
        case "$command" in
            "--dry-run")
                print_warning "Dry-run para projetos Go não implementado. Use 'full' para release real."
                ;;
            "--version"|"--changelog"|"--publish")
                print_warning "Comando '$command' não suportado para projetos Go. Use 'full' para release completo."
                ;;
            "")
                # Release completo para Go
                local version="1.0.0"
                run_go_release "$project" "$version"
                ;;
        esac
    else
        # Para projetos Node.js, usar Nx Release
        if is_first_release "$project"; then
            extra_args="$extra_args --first-release"
            print_info "Primeira release detectada. Usando --first-release"
        fi

        if [ -n "$project" ]; then
            pnpm dlx nx release $command --projects="$project" $extra_args
        else
            pnpm dlx nx release $command $extra_args
        fi
    fi
}


# Processar argumentos
case "${1:-help}" in
    "dry-run")
        print_info "Executando dry-run do release..."
        run_unified_release "--dry-run" "$2"
        print_success "Dry-run concluído!"
        ;;

    "version")
        print_info "Atualizando versões..."
        run_unified_release "--version" "$2"
        print_success "Versões atualizadas!"
        ;;

    "changelog")
        print_info "Gerando changelog..."
        run_unified_release "--changelog" "$2"
        print_success "Changelog gerado!"
        ;;

    "publish")
        print_info "Publicando..."
        run_unified_release "--publish" "$2"
        print_success "Publicação concluída!"
        ;;

    "full")
        print_warning "Executando release completo..."
        print_info "Isso irá:"
        print_info "  1. Atualizar versões"
        print_info "  2. Gerar changelog"
        print_info "  3. Fazer commit e push"
        print_info "  4. Criar tag"
        if [ -z "$2" ] || ! is_go_project "$2"; then
            print_info "  5. Publicar no npm"
        fi
        echo ""
        read -p "Continuar? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_unified_release "" "$2"
            print_success "Release completo concluído!"
        else
            print_info "Release cancelado."
        fi
        ;;

    "help"|*)
        show_help
        ;;
esac
