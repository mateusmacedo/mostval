#!/bin/bash

# Script para versionamento de projetos Go
# Integra com o sistema de release do Nx

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Função para obter versão atual do package.json
get_current_version() {
    local project_path="$1"
    local package_json="$project_path/package.json"
    
    if [ -f "$package_json" ]; then
        # Extrai versão do package.json
        grep '"version"' "$package_json" | sed 's/.*"version": *"\([^"]*\)".*/\1/' || echo "0.0.0"
    else
        echo "0.0.0"
    fi
}

# Função para atualizar versão no package.json
update_package_version() {
    local project_path="$1"
    local new_version="$2"
    local package_json="$project_path/package.json"
    
    if [ -f "$package_json" ]; then
        # Atualiza a versão no package.json
        sed -i "s/\"version\": *\"[^\"]*\"/\"version\": \"$new_version\"/" "$package_json"
        print_info "Versão atualizada para $new_version em $package_json"
    fi
}

# Função para gerar changelog para projeto Go
generate_go_changelog() {
    local project_path="$1"
    local version="$2"
    local changelog_file="$project_path/CHANGELOG.md"
    
    # Cria changelog se não existir
    if [ ! -f "$changelog_file" ]; then
        cat > "$changelog_file" << EOF
# Changelog

All notable changes to this project will be documented in this file.

EOF
    fi
    
    # Gera entrada do changelog
    local project_name=$(basename "$project_path")
    local date=$(date +%Y-%m-%d)
    
    # Insere nova versão no topo do changelog
    local temp_file=$(mktemp)
    cat > "$temp_file" << EOF
## $version ($date)

### 🚀 Features
- Initial release

### ❤️ Thank You
- Mateus Macedo Dos Anjos @mmanjos-mazzatech

EOF
    
    # Adiciona conteúdo existente
    if [ -f "$changelog_file" ]; then
        tail -n +2 "$changelog_file" >> "$temp_file"
    fi
    
    mv "$temp_file" "$changelog_file"
    print_info "Changelog gerado para $project_name v$version"
}

# Função para criar tag para projeto Go
create_go_tag() {
    local project_name="$1"
    local version="$2"
    local tag_name="${project_name}@${version}"
    
    git tag -a "$tag_name" -m "Release $project_name v$version"
    print_info "Tag criada: $tag_name"
}

# Função principal
main() {
    local project_name="$1"
    local version="$2"
    local project_path=""
    
    # Determina o caminho do projeto
    case "$project_name" in
        "@mostval/go-logger")
            project_path="libs/go-logger"
            ;;
        "@mostval/go-api")
            project_path="apps/go-api"
            ;;
        *)
            print_error "Projeto Go não reconhecido: $project_name"
            exit 1
            ;;
    esac
    
    if [ ! -d "$project_path" ]; then
        print_error "Diretório do projeto não encontrado: $project_path"
        exit 1
    fi
    
    print_info "Processando release do projeto Go: $project_name v$version"
    
    # Atualiza versão no package.json
    update_package_version "$project_path" "$version"
    
    # Gera changelog
    generate_go_changelog "$project_path" "$version"
    
    # Cria tag
    create_go_tag "$project_name" "$version"
    
    print_success "Release do projeto Go $project_name v$version concluído!"
}

# Verifica argumentos
if [ $# -ne 2 ]; then
    print_error "Uso: $0 <project-name> <version>"
    print_info "Exemplo: $0 @mostval/go-logger 1.0.0"
    exit 1
fi

main "$1" "$2"
