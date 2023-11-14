import csv from 'csv-parser';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const results = [];

async function processCSV(file) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (data) => {
        // Normalização dos dados
        const normalizedData = {
          Title: data.Name || data.Title || data["Stock Exchange"] || data["TITLE"],
          PDFLink: data.URL || data["PDF Link"] || data["PDF_LINK"]
        };
        results.push(normalizedData);
      })
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
      { id: 'Title', title: 'Title' },
      { id: 'PDFLink', title: 'PDF Link' }
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
