import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
 // Note que 'lib/sync.js' foi alterado para 'csv-parse/sync'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import path from 'path';


// __dirname não está disponível em módulos ES, então precisamos construí-lo
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  // Lê e faz o parse do arquivo CSV
  const csvFilePath = path.join(__dirname, 'csv/airtable.csv');
  const csvData = readFileSync(csvFilePath, 'utf8');
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });

  // Inicializa o Puppeteer
  const browser = await puppeteer.launch({
    headless: false
  });

  // Loop sobre cada registro
  for (const record of records) {
    const page = await browser.newPage();
    const url = record['URL'];
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Encontra todos os links de PDF
    const pdfLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a'))
        .filter(el => el.href.endsWith('.pdf'))
        .map(el => el.href)
    );

    // Escreve os links em um arquivo
    await writeFile(`${record['Name'].replace(/\s/g, '_')}_pdfLinks.txt`, pdfLinks.join('\n'));

    await page.close();
  }

  await browser.close();
})();
