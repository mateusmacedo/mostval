#!/bin/bash

# Script para configuração do SonarQube no workspace Nx
# Este script ajuda a configurar as variáveis de ambiente necessárias

set -e

echo "🔧 Configurando SonarQube para o workspace Nx..."

# Carregar variáveis do arquivo .env se existir
if [ -f ".env" ]; then
    echo "📁 Carregando variáveis do arquivo .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  Arquivo .env não encontrado"
    echo "   Copie o arquivo de exemplo:"
    echo "   cp docs/env.example .env"
    echo "   e configure as variáveis necessárias"
    echo ""
fi

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$SONAR_HOST_URL" ]; then
    echo "❌ SONAR_HOST_URL não está definida"
    echo "   Defina no arquivo .env:"
    echo "   SONAR_HOST_URL=http://localhost:9000"
    echo "   ou"
    echo "   SONAR_HOST_URL=https://sonarcloud.io"
    exit 1
fi

if [ -z "$SONAR_TOKEN" ]; then
    echo "❌ SONAR_TOKEN não está definida"
    echo "   Defina no arquivo .env:"
    echo "   SONAR_TOKEN=seu_token_aqui"
    exit 1
fi

echo "✅ Variáveis de ambiente configuradas:"
echo "   SONAR_HOST_URL: $SONAR_HOST_URL"
echo "   SONAR_TOKEN: ${SONAR_TOKEN:0:8}..."

# Verificar se o sonar-scanner está instalado
if ! command -v sonar-scanner &> /dev/null; then
    echo "❌ sonar-scanner não encontrado"
    echo "   Instale com: pnpm add -D sonar-scanner"
    exit 1
fi

echo "✅ sonar-scanner encontrado"

# Verificar se os arquivos de configuração existem
CONFIG_FILES=("sonar-project.properties" "sonar-apps.properties" "sonar-libs.properties")

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "❌ $file não encontrado"
        exit 1
    fi
done

echo ""
echo "🎉 Configuração do SonarQube concluída!"
echo ""
echo "📋 Comandos disponíveis:"
echo "   pnpm sonar:scan        - Análise completa do workspace"
echo "   pnpm sonar:scan:apps   - Análise apenas das aplicações (incluindo Go)"
echo "   pnpm sonar:scan:libs   - Análise apenas das bibliotecas (incluindo Go)"
echo ""
echo "💡 Dicas:"
echo "   - Execute 'pnpm test:affected' antes da análise para gerar cobertura"
echo "   - Use '[sonar:apps]' no commit para executar análise apenas de apps"
echo "   - Use '[sonar:libs]' no commit para executar análise apenas de libs"
echo ""
echo "🔧 Configuração:"
echo "   - Variáveis configuradas no arquivo .env"
echo "   - Projetos Go suportados em apps/ e libs/"
echo "   - Configurações separadas para cada tipo de projeto"
