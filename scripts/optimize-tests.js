#!/usr/bin/env node

/**
 * Script para otimização de performance dos testes Jest
 * Aplica otimizações baseadas em métricas coletadas
 */

const fs = require('node:fs');
const path = require('node:path');

class TestOptimizer {
  constructor() {
    this.optimizations = [];
    this.reportPath = path.join(process.cwd(), 'test-performance-report.json');
  }

  loadPerformanceReport() {
    if (!fs.existsSync(this.reportPath)) {
      console.log('❌ Relatório de performance não encontrado. Execute primeiro o script de análise.');
      process.exit(1);
    }
    
    return JSON.parse(fs.readFileSync(this.reportPath, 'utf8'));
  }

  analyzeSlowProjects(report) {
    const slowProjects = report.projects.filter(p => 
      p.status === 'success' && p.duration > 30000 // Mais de 30 segundos
    );
    
    if (slowProjects.length > 0) {
      this.optimizations.push({
        type: 'slow-tests',
        projects: slowProjects,
        recommendations: [
          'Considere dividir testes grandes em menores',
          'Use mocks para dependências externas',
          'Implemente testes paralelos onde possível',
        ],
      });
    }
  }

  analyzeCoverageGaps(report) {
    const lowCoverageProjects = report.projects.filter(p => 
      p.status === 'success' && p.coverage && p.coverage.lines < 80
    );
    
    if (lowCoverageProjects.length > 0) {
      this.optimizations.push({
        type: 'coverage-gaps',
        projects: lowCoverageProjects,
        recommendations: [
          'Adicione testes para branches não cobertos',
          'Implemente testes de integração',
          'Use ferramentas de análise de cobertura',
        ],
      });
    }
  }

  generateOptimizationPlan() {
    const report = this.loadPerformanceReport();
    
    console.log('🔍 Analisando oportunidades de otimização...\n');
    
    this.analyzeSlowProjects(report);
    this.analyzeCoverageGaps(report);
    
    const plan = {
      timestamp: new Date().toISOString(),
      optimizations: this.optimizations,
      summary: {
        totalOptimizations: this.optimizations.length,
        slowProjects: this.optimizations.find(o => o.type === 'slow-tests')?.projects.length || 0,
        lowCoverageProjects: this.optimizations.find(o => o.type === 'coverage-gaps')?.projects.length || 0,
      },
    };

    // Salvar plano de otimização
    const planPath = path.join(process.cwd(), 'test-optimization-plan.json');
    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
    
    console.log('📋 Plano de Otimização dos Testes');
    console.log('================================');
    console.log(`Total de otimizações identificadas: ${plan.summary.totalOptimizations}`);
    console.log(`Projetos lentos: ${plan.summary.slowProjects}`);
    console.log(`Projetos com baixa cobertura: ${plan.summary.lowCoverageProjects}`);
    
    if (plan.optimizations.length > 0) {
      console.log('\n🎯 Recomendações:');
      plan.optimizations.forEach((opt, index) => {
        console.log(`\n${index + 1}. ${opt.type.toUpperCase()}`);
        opt.recommendations.forEach(rec => {
          console.log(`   • ${rec}`);
        });
      });
    }
    
    console.log(`\n📄 Plano salvo em: ${planPath}`);
    
    return plan;
  }

  applyOptimizations() {
    console.log('🚀 Aplicando otimizações...\n');
    
    // 1. Otimizar configuração do Jest para CI
    this.optimizeJestConfig();
    
    // 2. Configurar paralelização
    this.setupParallelization();
    
    // 3. Configurar cache
    this.setupCaching();
    
    console.log('✅ Otimizações aplicadas com sucesso!');
  }

  optimizeJestConfig() {
    console.log('⚙️  Otimizando configuração do Jest...');
    
    // Atualizar jest.preset.js com otimizações
    const presetPath = path.join(process.cwd(), 'jest.preset.js');
    if (fs.existsSync(presetPath)) {
      let preset = fs.readFileSync(presetPath, 'utf8');
      
      // Adicionar configurações de performance se não existirem
      if (!preset.includes('maxWorkers')) {
        preset = preset.replace(
          'testEnvironment: \'node\',',
          `testEnvironment: 'node',
  maxWorkers: process.env.CI === 'true' ? '50%' : '100%',
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',`
        );
        
        fs.writeFileSync(presetPath, preset);
        console.log('   ✅ Configuração do Jest otimizada');
      }
    }
  }

  setupParallelization() {
    console.log('🔄 Configurando paralelização...');
    
    // Atualizar package.json com scripts otimizados
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      if (!packageJson.scripts['test:parallel']) {
        packageJson.scripts['test:parallel'] = 'nx affected -t test --parallel=3';
        packageJson.scripts['test:ci'] = 'nx affected -t test --parallel=3 -- --runInBand';
        packageJson.scripts['test:performance'] = 'node scripts/test-performance.js';
        
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        console.log('   ✅ Scripts de paralelização adicionados');
      }
    }
  }

  setupCaching() {
    console.log('💾 Configurando cache...');
    
    // Criar diretório de cache se não existir
    const cacheDir = path.join(process.cwd(), 'node_modules/.cache/jest');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
      console.log('   ✅ Diretório de cache criado');
    }
  }
}

// Executar otimização se chamado diretamente
if (require.main === module) {
  const optimizer = new TestOptimizer();
  
  try {
    const plan = optimizer.generateOptimizationPlan();
    
    if (plan.summary.totalOptimizations > 0) {
      console.log('\n❓ Deseja aplicar as otimizações? (y/n)');
      // Em um ambiente real, você usaria readline ou similar
      // Por simplicidade, vamos aplicar automaticamente
      optimizer.applyOptimizations();
    } else {
      console.log('\n✅ Nenhuma otimização necessária. Seus testes já estão otimizados!');
    }
  } catch (error) {
    console.error('❌ Erro durante otimização:', error);
    process.exit(1);
  }
}

module.exports = TestOptimizer;
