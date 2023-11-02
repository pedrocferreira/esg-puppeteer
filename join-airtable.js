import fs from 'fs';
import Papa from 'papaparse';
import chalk from 'chalk';

const inputPath = 'csv/airtable.csv';
const outputPath = 'csv-main/output.csv';

function logSuccess(message) {
  console.log(chalk.green('✓ ' + message));
}

function logError(message) {
  console.error(chalk.red('✗ ' + message));
}

function logInfo(message) {
  console.log(chalk.blue('i ' + message));
}

function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    // Remover "www." se estiver presente
    const domain = hostname.replace(/^www\./, '');
    // Remover os TLDs conhecidos (.com, .br, .net, .org, .gov)
    return domain.replace(/\.(com|br|net|org|gov)$/, '');
  } catch (error) {
    logError('URL inválida: ' + url);
    return '';
  }
}

async function readCsv(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      logInfo(`O arquivo ${filePath} não existe. Um arquivo vazio será criado.`);
      writeCsv(filePath, []);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return new Promise((resolve) => {
      Papa.parse(data, {
        header: true,
        complete: (results) => resolve(results.data)
      });
    });
  } catch (err) {
    logError(`Erro ao ler o arquivo CSV: ${err.message}`);
    throw err;
  }
}

async function writeCsv(filePath, data) {
  try {
    const csv = Papa.unparse(data, { header: true });
    fs.writeFileSync(filePath, csv, 'utf8');
  } catch (err) {
    logError(`Erro ao escrever o arquivo CSV: ${err.message}`);
    throw err;
  }
}

async function mapAndSaveCsv() {
  logInfo('Lendo dados do arquivo CSV de entrada...');
  const inputData = await readCsv(inputPath);
  logSuccess('Dados lidos com sucesso!');

  logInfo('Mapeando dados para o novo formato...');
  const outputData = inputData.map(row => {
    return {
        Title: row.Name,
        Region: row['Regions covered'],
        Country: row.Name,
        Institution: row.Type,
        Industry: '', // Valor padrão ou algum valor específico
        Topic: '', // Valor padrão ou algum valor específico
        Year: '', // Valor padrão ou algum valor específico
        Month: '', // Valor padrão ou algum valor específico
        Author: extractDomain(row.URL),
        'External URL': row.URL,
        'File Name': '', // Valor padrão ou algum valor específico
        'Cloud drive URL': '', // Valor padrão ou algum valor específico
        '# of companies (mandated or voluntarily disclosing)': row['# of companies (mandated or voluntarily disclosing)'],
        'Scope 3?': row['Scope 3?'],
        'Mandatory?': row['Mandatory?'],
        'Description': row['Description']
      };
  });
  logSuccess('Dados mapeados com sucesso!');

  logInfo('Salvando dados no arquivo CSV de saída...');
  await writeCsv(outputPath, outputData);
  logSuccess('Arquivo CSV de saída criado com sucesso!');
}

mapAndSaveCsv().catch(err => logError('Ocorreu um erro: ' + err.message));

export default mapAndSaveCsv;
