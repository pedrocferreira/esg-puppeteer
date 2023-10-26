

---

# Script de Extração e Armazenamento de Dados

Este script automatiza o processo de coleta de dados de uma página da web e os armazena em um banco de dados MySQL.

## Funcionalidades

1. **Navegação Web com Puppeteer**:
   - Utiliza a biblioteca `Puppeteer` para abrir um navegador em modo headless.
   - Navega até a página 'https://regask.com/key-trends-in-esg-regulations-in-2022-and-beyond/'.

2. **Extração de Dados da Tabela**:
   - Identifica e extrai informações de uma tabela na página.
   - Organiza os dados em uma matriz representando as linhas e colunas da tabela.

3. **Conexão com Banco de Dados MySQL**:
   - Estabelece conexão com um banco de dados MySQL local chamado 'esg' usando a biblioteca `mysql2`.

4. **Verificação e Inserção de Dados**:
   - Para cada linha extraída, verifica se os dados já existem na tabela 'regask' do banco de dados.
   - Se os dados não existirem, insere-os na tabela com a data e hora atual.

5. **Finalização**:
   - Após processar e inserir todos os dados, o script encerra a conexão com o banco de dados.
   - Exibe uma mensagem de confirmação indicando que os dados foram inseridos com sucesso.

## Objetivo

O principal objetivo deste script é garantir uma coleta eficiente de dados de uma tabela na página web e armazená-los no banco de dados, evitando duplicações.

---

Anotação:

   Estrutura
   CSV-> pasta onde fica os arquivos CSV gerados
   Scripts-> Pasta onde fica os scritps que fazem raspagem de dados
   Index.js-> arquivo para inciar  os scripts