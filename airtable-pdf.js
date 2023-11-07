import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
// Importando módulos necessários
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

// Obter o caminho do diretório atual de onde o script está sendo executado
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o arquivo CSV
const csvFilePath = path.join(__dirname, 'csv/airtable.csv');
const outputCsvFilePath = path.join(__dirname, 'pdf-links/pdf-links-airtable.csv');

// Função para iniciar o Puppeteer e extrair os links dos PDFs
async function extractPDFLinks(url) {
  const browser = await puppeteer.launch({
    headless: false // Mude para true para não abrir o navegador
  });
  const page = await browser.newPage();

  // Vá para a URL e espere até que o carregamento da rede esteja ocioso, indicando que a página carregou.
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Aguarde até que todos os elementos DOM estejam renderizados.
  await page.waitForSelector('a[href$=".pdf"]');

  // Extraia os links
  const pdfLinks = await page.$$eval('a[href$=".pdf"]', links => links.map(a => a.href));

  await browser.close();
  return pdfLinks;
}

// Função para processar o arquivo CSV
async function processCSV(csvFilePath) {
  const records = [];
  const parser = createReadStream(csvFilePath).pipe(parse({ columns: true }));

  for await (const record of parser) {
    records.push(record);
  }

  const csvStream = createWriteStream(outputCsvFilePath);
  const stringifier = stringify({ header: true });
  stringifier.pipe(csvStream);

  for (const record of records) {
    const cleanedURL = cleanURL(record['URL']); // Limpe o URL antes de processar
    console.log(`Processing: ${cleanedURL}`);
    try {
      const pdfLinks = await extractPDFLinks(cleanedURL);
      for (const pdfLink of pdfLinks) {
        stringifier.write({ 'Name': record['Name'], 'URL': pdfLink });
      }
    } catch (error) {
      console.error(`Error processing ${cleanedURL}: ${error}`);
    }
  }

  stringifier.end();
}

// Função para limpar o URL removendo texto indesejado
function cleanURL(url) {
  // Substitua "@ {name}" ou qualquer outra sujeira que você tenha no final dos seus URLs
  return url.replace(/@\s*{name}/, '').trim();
}

// Processa o arquivo CSV e gera um novo arquivo CSV com os links dos PDFs
processCSV(csvFilePath).then(() => console.log('Arquivo CSV com links dos PDFs foi criado.')).catch(console.error);
export { processCSV, extractPDFLinks, cleanURL };