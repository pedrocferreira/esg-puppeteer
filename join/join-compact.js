import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const results = [];

async function processCSV(file) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(`CSV processado: ${file}`);
        resolve();
      })
      .on('error', reject);
  });
}

async function processAllCSVs(directory) {
  try {
    const files = await readdir(directory);
    const csvFiles = files.filter(file => path.extname(file) === '.csv');
    for (const file of csvFiles) {
      await processCSV(`${directory}/${file}`);
    }
  } catch (error) {
    console.error('Erro ao processar arquivos CSV:', error);
  }
}

async function writeUnifiedTable() {
  const csvWriter = createCsvWriter({
    path: 'tabela_unificada.csv',
    header: [
      { id: 'title', title: 'TITLE' },
      { id: 'nome', title: 'NOME' },
      { id: 'pdfLink', title: 'PDF_LINK' }
      // Inclua outros cabeçalhos conforme necessário
    ]
  });

  try {
    await csvWriter.writeRecords(results);
    console.log('Tabela unificada escrita com sucesso.');
  } catch (error) {
    console.error('Erro ao escrever tabela unificada:', error);
  }
}

async function main() {
  await processAllCSVs('../pdf-links');
  await writeUnifiedTable();
}

main();
