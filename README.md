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

## Sites de Captura de Dados

A lista a seguir contém os sites que estão sendo usados para capturar dados:

| Nome | Descrição | Link | Check |
| --- | --- | --- | --- |
| Pacto Global da ONU | Biblioteca com várias documentações incluindo políticas | [Link](https://unglobalcompact.org/library/search?search%5Bissue_areas%5D%5B%5D=211&search%5Bkeywords%5D=&search%5Bcontent_type%5D=12) | OK |
| Moody's | Exemplo de provedor que normaliza através de ferramentas | [Link](https://www.moodys.com/web/en/us/capabilities/esg.html) | no |
| Bolsa de Valores SSE (ONU) | Mapeamento de regulamentação e aplicação por país | [Link](https://sseinitiative.org/esg-guidance-database/) | Fazendo |
| Regulamentações da Bolsa de Valores SSE (ONU) | Descrições de várias regulamentações | [Link](https://sseinitiative.org/regulation/) | OK |
| Plataforma de Finanças Verdes | 780 políticas | [Link](https://www.greenfinanceplatform.org/financial-measures/browse/country/france-284) |  |
| Global Data | 631 regulamentações | [Link](https://www.globaldata.com/esg/regulations/) |  |
| Climatiq | Eles mencionam 4000 regulamentações, mas coletaram 30 | [Link](https://www.climatiq.io/blog/database-your-esg-standards-frameworks-and-regulation-overview) |  |
| Airtable | - | [Link](https://airtable.com/appzfiUwVci5GhjlO/shrJethBEwOVaKH5R/tblIbzy1dGWtPjwrO?backgroundColor=blue&viewControls=on) |  |
| Dados Climatiq | - | [Link](https://www.climatiq.io/data) |  |
| ESG Clarity | Site com vários artigos, incluindo um sobre regulamentações | [Link](https://esgclarity.com/esg-regulations-around-the-world/) |  |
| White Case | Uma análise de três principais desenvolvimentos regulatórios na UE e EUA - propostas de Diretivas da UE sobre Diligência e Relatórios de Sustentabilidade Corporativa e Regras de Divulgação de Mudanças Climáticas da SEC dos EUA | [Link](https://www.whitecase.com/insight-alert/global-esg-regulatory-framework-toughens) |  |
| Regulation Ask | Principais tendências em regulamentações ESG em 2022 e além | [Link](https://regask.com/key-trends-in-esg-regulations-in-2022-and-beyond/) | OK |
| WBC FSD | Consórcio de sustentabilidade | [Link](https://regask.com/key-trends-in-esg-regulations-in-2022-and-beyond/) |  |
| PRI | Base de dados com 868 regulamentações (links para) | [Link](https://www.unpri.org/policy/regulation-database) |  |

## Objetivo

O principal objetivo deste script é garantir uma coleta eficiente de dados de uma tabela na página web e armazená-los no banco de dados, evitando duplicações.

---
<<<<<<< HEAD

Anotação:

   Estrutura
   CSV-> pasta onde fica os arquivos CSV gerados
   Scripts-> Pasta onde fica os scritps que fazem raspagem de dados
   Index.js-> arquivo para inciar  os scripts
=======
>>>>>>> c61d1e54b7384acede1b24b7e8bf6c459a6f8983
