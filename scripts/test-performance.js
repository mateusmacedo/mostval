#!/usr/bin/env node

/**
 * Script para análise de performance dos testes Jest
 * Monitora tempo de execução, cobertura e métricas de performance
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

class TestPerformanceAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      projects: [],
      summary: {
        totalProjects: 0,
        totalTime: 0,
        totalCoverage: 0,
        averageTime: 0,
        slowestProject: null,
        fastestProject: null,
      },
    };
  }

  async analyzeProject(projectName) {
    console.log(`🔍 Analisando projeto: ${projectName}`);
    
    const startTime = Date.now();
    
    try {
      // Executar testes com métricas
      const testCommand = `nx test ${projectName} --coverage --verbose`;
      const output = execSync(testCommand, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Extrair métricas do output
      const coverageMatch = output.match(/All files\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)/);
      const coverage = coverageMatch ? {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4]),
      } : null;

      const projectResult = {
        name: projectName,
        duration,
        coverage,
        status: 'success',
        output: output.split('\n').slice(-10).join('\n'), // Últimas 10 linhas
      };

      this.results.projects.push(projectResult);
      
      console.log(`✅ ${projectName}: ${duration}ms, Coverage: ${coverage?.lines || 'N/A'}%`);
      
      return projectResult;
    } catch (error) {
      console.error(`❌ Erro ao testar ${projectName}:`, error.message);
      
      const projectResult = {
        name: projectName,
        duration: Date.now() - startTime,
        coverage: null,
        status: 'error',
        error: error.message,
      };

      this.results.projects.push(projectResult);
      return projectResult;
    }
  }

  calculateSummary() {
    const successfulProjects = this.results.projects.filter(p => p.status === 'success');
    
    this.results.summary = {
      totalProjects: this.results.projects.length,
      successfulProjects: successfulProjects.length,
      failedProjects: this.results.projects.length - successfulProjects.length,
      totalTime: successfulProjects.reduce((sum, p) => sum + p.duration, 0),
      averageTime: successfulProjects.length > 0 
        ? successfulProjects.reduce((sum, p) => sum + p.duration, 0) / successfulProjects.length 
        : 0,
      averageCoverage: successfulProjects.length > 0
        ? successfulProjects.reduce((sum, p) => sum + (p.coverage?.lines || 0), 0) / successfulProjects.length
        : 0,
      slowestProject: successfulProjects.reduce((slowest, current) => 
        current.duration > (slowest?.duration || 0) ? current : slowest, null
      ),
      fastestProject: successfulProjects.reduce((fastest, current) => 
        current.duration < (fastest?.duration || Infinity) ? current : fastest, null
      ),
    };
  }

  generateReport() {
    this.calculateSummary();
    
    const report = {
      ...this.results,
      recommendations: this.generateRecommendations(),
    };

    // Salvar relatório
    const reportPath = path.join(process.cwd(), 'test-performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Relatório de Performance dos Testes');
    console.log('=====================================');
    console.log(`Total de projetos: ${report.summary.totalProjects}`);
    console.log(`Projetos bem-sucedidos: ${report.summary.successfulProjects}`);
    console.log(`Projetos com falha: ${report.summary.failedProjects}`);
    console.log(`Tempo total: ${report.summary.totalTime}ms`);
    console.log(`Tempo médio: ${Math.round(report.summary.averageTime)}ms`);
    console.log(`Cobertura média: ${Math.round(report.summary.averageCoverage)}%`);
    
    if (report.summary.slowestProject) {
      console.log(`\n🐌 Projeto mais lento: ${report.summary.slowestProject.name} (${report.summary.slowestProject.duration}ms)`);
    }
    
    if (report.summary.fastestProject) {
      console.log(`\n⚡ Projeto mais rápido: ${report.summary.fastestProject.name} (${report.summary.fastestProject.duration}ms)`);
    }

    console.log(`\n📄 Relatório salvo em: ${reportPath}`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.summary.averageTime > 30000) {
      recommendations.push({
        type: 'performance',
        message: 'Tempo médio de execução alto. Considere otimizar testes ou usar parallelização.',
        priority: 'high',
      });
    }
    
    if (this.results.summary.averageCoverage < 80) {
      recommendations.push({
        type: 'coverage',
        message: 'Cobertura de testes abaixo de 80%. Considere adicionar mais testes.',
        priority: 'medium',
      });
    }
    
    if (this.results.summary.failedProjects > 0) {
      recommendations.push({
        type: 'reliability',
        message: `${this.results.summary.failedProjects} projeto(s) falharam. Verifique a estabilidade dos testes.`,
        priority: 'high',
      });
    }

    return recommendations;
  }
}

// Executar análise se chamado diretamente
if (require.main === module) {
  const analyzer = new TestPerformanceAnalyzer();
  
  // Obter lista de projetos do Nx
  try {
    const projectsOutput = execSync('nx show projects', { encoding: 'utf8' });
    const projects = projectsOutput.trim().split('\n').filter(p => p.trim());
    
    console.log(`🚀 Iniciando análise de performance para ${projects.length} projetos...\n`);
    
    // Analisar cada projeto
    Promise.all(projects.map(project => analyzer.analyzeProject(project)))
      .then(() => {
        analyzer.generateReport();
      })
      .catch(error => {
        console.error('❌ Erro durante análise:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('❌ Erro ao obter lista de projetos:', error.message);
    process.exit(1);
  }
}

module.exports = TestPerformanceAnalyzer;
