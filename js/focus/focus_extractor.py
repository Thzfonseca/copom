#!/usr/bin/env python3
"""
Extrator e analisador de dados dos relatórios Focus do Banco Central do Brasil.

Este script extrai dados dos relatórios Focus em formato PDF e os converte em um formato
estruturado para análise da evolução das expectativas de mercado.
"""

import os
import re
import json
import glob
from datetime import datetime
from PyPDF2 import PdfReader

# Diretório onde os relatórios Focus estão armazenados
FOCUS_DIR = '/home/ubuntu/focus_reports'

# Arquivo para armazenar os dados extraídos como fallback
FALLBACK_FILE = '/home/ubuntu/copom_dashboard_fix/js/focus/focus_data_fallback.json'

# Variáveis de interesse para extração
VARIAVEIS_INTERESSE = [
    'IPCA',
    'IGP-M',
    'IGP-DI',
    'IPC-Fipe',
    'Taxa de câmbio',
    'Meta Taxa Selic',
    'PIB Total',
    'Produção industrial',
    'Conta corrente',
    'Investimento direto no país',
    'Dívida líquida do setor público',
    'Resultado primário'
]

def extrair_data_relatorio(nome_arquivo):
    """Extrai a data do relatório a partir do nome do arquivo."""
    match = re.search(r'R(\d{8})\.pdf', nome_arquivo)
    if match:
        data_str = match.group(1)
        return datetime.strptime(data_str, '%Y%m%d').strftime('%d/%m/%Y')
    return None

def extrair_dados_pdf(caminho_pdf):
    """Extrai dados de um relatório Focus em PDF."""
    print(f"Extraindo dados de: {caminho_pdf}")
    
    dados = {
        'data_relatorio': extrair_data_relatorio(os.path.basename(caminho_pdf)),
        'variaveis': {}
    }
    
    try:
        reader = PdfReader(caminho_pdf)
        texto_completo = ""
        
        # Extrair todo o texto do PDF
        for pagina in reader.pages:
            texto_completo += pagina.extract_text()
        
        # Processar cada variável de interesse
        for variavel in VARIAVEIS_INTERESSE:
            # Padrões de expressão regular para diferentes formatos de dados
            padroes = [
                # Padrão para IPCA, IGP-M, etc. (variação %)
                rf"{variavel}\s*\(variação %\)[^\n]*\n([^\n]*)",
                # Padrão para Taxa de câmbio (R$/US$)
                rf"{variavel}\s*\(R\$/US\$\)[^\n]*\n([^\n]*)",
                # Padrão para Meta Taxa Selic (% a.a.)
                rf"{variavel}\s*\(% a\.a\.\)[^\n]*\n([^\n]*)",
                # Padrão para PIB Total (% de crescimento)
                rf"{variavel}\s*\(% de crescimento\)[^\n]*\n([^\n]*)",
                # Padrão genérico para outras variáveis
                rf"{variavel}[^\n]*\n([^\n]*)"
            ]
            
            # Tentar cada padrão até encontrar um match
            for padrao in padroes:
                match = re.search(padrao, texto_completo)
                if match:
                    linha_dados = match.group(1).strip()
                    # Extrair valores numéricos da linha
                    valores = re.findall(r'[-+]?\d*\.\d+|\d+', linha_dados)
                    if valores:
                        # Armazenar os valores encontrados
                        dados['variaveis'][variavel] = {
                            'atual': valores[0] if len(valores) > 0 else None,
                            'proximo_ano': valores[1] if len(valores) > 1 else None,
                            'dois_anos': valores[2] if len(valores) > 2 else None,
                            'linha_completa': linha_dados
                        }
                    break
        
        return dados
    
    except Exception as e:
        print(f"Erro ao processar {caminho_pdf}: {str(e)}")
        return dados

def processar_todos_relatorios():
    """Processa todos os relatórios Focus disponíveis no diretório."""
    arquivos_pdf = glob.glob(os.path.join(FOCUS_DIR, 'R*.pdf'))
    arquivos_pdf.sort(reverse=True)  # Ordenar do mais recente para o mais antigo
    
    # Limitar aos 10 relatórios mais recentes
    arquivos_pdf = arquivos_pdf[:10]
    
    todos_dados = []
    for arquivo in arquivos_pdf:
        dados = extrair_dados_pdf(arquivo)
        if dados['data_relatorio']:
            todos_dados.append(dados)
    
    return todos_dados

def analisar_evolucao_expectativas(dados_relatorios):
    """Analisa a evolução das expectativas ao longo do tempo."""
    evolucao = {}
    
    # Inicializar estrutura para cada variável
    for variavel in VARIAVEIS_INTERESSE:
        evolucao[variavel] = {
            'datas': [],
            'valores_atual': [],
            'valores_proximo_ano': [],
            'valores_dois_anos': [],
            'tendencia': None,
            'variacao_percentual': None
        }
    
    # Preencher dados de evolução
    for relatorio in dados_relatorios:
        data = relatorio['data_relatorio']
        
        for variavel, dados in relatorio['variaveis'].items():
            if variavel in evolucao:
                evolucao[variavel]['datas'].append(data)
                
                # Converter valores para float quando possível
                try:
                    valor_atual = float(dados['atual']) if dados['atual'] else None
                    evolucao[variavel]['valores_atual'].append(valor_atual)
                except (ValueError, TypeError):
                    evolucao[variavel]['valores_atual'].append(None)
                
                try:
                    valor_proximo = float(dados['proximo_ano']) if dados['proximo_ano'] else None
                    evolucao[variavel]['valores_proximo_ano'].append(valor_proximo)
                except (ValueError, TypeError):
                    evolucao[variavel]['valores_proximo_ano'].append(None)
                
                try:
                    valor_dois_anos = float(dados['dois_anos']) if dados['dois_anos'] else None
                    evolucao[variavel]['valores_dois_anos'].append(valor_dois_anos)
                except (ValueError, TypeError):
                    evolucao[variavel]['valores_dois_anos'].append(None)
    
    # Calcular tendências e variações
    for variavel, dados in evolucao.items():
        valores = dados['valores_atual']
        valores_filtrados = [v for v in valores if v is not None]
        
        if len(valores_filtrados) >= 2:
            primeiro = valores_filtrados[-1]  # Valor mais antigo
            ultimo = valores_filtrados[0]     # Valor mais recente
            
            # Determinar tendência
            if ultimo > primeiro:
                dados['tendencia'] = 'alta'
            elif ultimo < primeiro:
                dados['tendencia'] = 'baixa'
            else:
                dados['tendencia'] = 'estável'
            
            # Calcular variação percentual
            if primeiro != 0:
                dados['variacao_percentual'] = ((ultimo - primeiro) / abs(primeiro)) * 100
            else:
                dados['variacao_percentual'] = 0
    
    return evolucao

def salvar_dados_fallback(dados, evolucao):
    """Salva os dados extraídos e analisados como fallback."""
    resultado = {
        'ultima_atualizacao': datetime.now().strftime('%d/%m/%Y %H:%M:%S'),
        'relatorios': dados,
        'evolucao': evolucao
    }
    
    # Garantir que o diretório existe
    os.makedirs(os.path.dirname(FALLBACK_FILE), exist_ok=True)
    
    with open(FALLBACK_FILE, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    
    print(f"Dados de fallback salvos em: {FALLBACK_FILE}")

def main():
    """Função principal."""
    print("Iniciando processamento dos relatórios Focus...")
    
    # Processar todos os relatórios
    dados_relatorios = processar_todos_relatorios()
    print(f"Processados {len(dados_relatorios)} relatórios.")
    
    # Analisar evolução das expectativas
    evolucao = analisar_evolucao_expectativas(dados_relatorios)
    print("Análise de evolução concluída.")
    
    # Salvar dados para fallback
    salvar_dados_fallback(dados_relatorios, evolucao)
    
    print("Processamento concluído com sucesso!")

if __name__ == "__main__":
    main()
