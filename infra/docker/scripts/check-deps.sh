#!/usr/bin/bash
set -euo pipefail

# Script para verificar dependências do Docker
# Uso: ./scripts/check-deps.sh

echo "[check] Verificando dependências do Docker..."

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

# Verifica Docker
if ! docker info >/dev/null 2>&1; then
    echo "✗ Docker: não está rodando"
    failed=1
else
    echo "✓ Docker: $(docker --version)"
fi

# Verifica Docker Compose
if command -v docker-compose >/dev/null 2>&1; then
    echo "✓ docker-compose: $(docker-compose --version)"
elif docker compose version >/dev/null 2>&1; then
    echo "✓ docker compose: $(docker compose version)"
else
    echo "✗ docker-compose: não encontrado"
    failed=1
fi

# Verifica curl (para health checks)
check_dependency "curl" || failed=1

# Verifica jq (para parsing JSON)
check_dependency "jq" || echo "[warning] jq não encontrado (opcional para parsing JSON)"

if [ $failed -eq 1 ]; then
    echo ""
    echo "[error] Algumas dependências estão faltando."
    echo "Para instalar as dependências faltantes:"
    echo ""
    echo "# Docker (Ubuntu/Debian)"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "sudo sh get-docker.sh"
    echo "sudo usermod -aG docker \$USER"
    echo ""
    echo "# Docker Compose (se não estiver funcionando)"
    echo "sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "sudo chmod +x /usr/local/bin/docker-compose"
    echo ""
    echo "# curl (Ubuntu/Debian)"
    echo "sudo apt-get update && sudo apt-get install -y curl"
    echo ""
    echo "# jq (Ubuntu/Debian)"
    echo "sudo apt-get install -y jq"
    exit 1
fi

echo "[ok] Todas as dependências foram encontradas."

