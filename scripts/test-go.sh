#!/bin/bash

# Script para executar testes Go com coverage
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Executando testes Go com coverage...${NC}"

# Criar diretório de coverage se não existir
mkdir -p coverage/go

# Executar testes com coverage
echo -e "${YELLOW}📊 Gerando coverage...${NC}"
cd apps/go-api && GOWORK=off go test -v -coverprofile=../../coverage/go/coverage.out -covermode=atomic ./...

# Gerar relatório HTML de coverage
echo -e "${YELLOW}📈 Gerando relatório HTML...${NC}"
cd ../../ && go tool cover -html=coverage/go/coverage.out -o coverage/go/coverage.html

# Gerar relatório de coverage em texto
echo -e "${YELLOW}📋 Gerando relatório de texto...${NC}"
go tool cover -func=coverage/go/coverage.out > coverage/go/coverage.txt

# Gerar relatório JUnit XML
echo -e "${YELLOW}📄 Gerando relatório JUnit...${NC}"
cd apps/go-api && GOWORK=off go test -v ./... 2>&1 | $HOME/go/bin/go-junit-report > ../../coverage/go/junit.xml

# Mostrar resumo do coverage
echo -e "${GREEN}✅ Coverage gerado com sucesso!${NC}"
echo -e "${YELLOW}📁 Arquivos gerados:${NC}"
echo "  - coverage/go/coverage.html (relatório visual)"
echo "  - coverage/go/coverage.txt (relatório texto)"
echo "  - coverage/go/coverage.out (dados brutos)"
echo "  - coverage/go/junit.xml (relatório JUnit)"

# Mostrar resumo do coverage
echo -e "${YELLOW}📊 Resumo do Coverage:${NC}"
cd ../../ && go tool cover -func=coverage/go/coverage.out | tail -1
