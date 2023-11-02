import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';
import chalk from 'chalk';

async function scrapeData() {
  console.log(chalk.blue('Iniciando o navegador...'));
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log(chalk.blue('Acessando a página...'));
  await page.goto('https://regask.com/key-trends-in-esg-regulations-in-2022-and-beyond/');

  console.log(chalk.blue('Extraindo os dados...'));
  const data = await page.evaluate(() => {
    const rows = document.querySelectorAll('table tbody tr');
    return Array.from(rows, row => {
      const columns = row.querySelectorAll('td, th');
      return Array.from(columns, column => column.innerText.trim());
    });
  });

  await browser.close();
  console.log(chalk.green('Dados extraídos com sucesso!'));
  return data;
}

async function saveToCsv(data) {
  console.log(chalk.blue('Salvando os dados em um arquivo CSV...'));
  const csvWriter = createObjectCsvWriter({
    path: 'csv/regask_data.csv',
    header: [
      { id: 'Country_or_Region', title: 'Country_or_Region' },
      { id: 'Regulation', title: 'Regulation' },
      { id: 'Institution', title: 'Institution' },
      { id: 'Description', title: 'Description' },
      { id: 'date', title: 'Date' }
    ]
  });

  const records = data.slice(1).map(row => ({
    Country_or_Region: row[0] || null,
    Regulation: row[1] || null,
    Institution: row[2] || null,
    Description: row[3] || null,
    date: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }));

  await csvWriter.writeRecords(records);
  console.log(chalk.green('Dados salvos no arquivo CSV com sucesso!'));
}

async function main() {
  try {
    const data = await scrapeData();
    await saveToCsv(data);
    console.log(chalk.green('Processo concluído com sucesso!'));
  } catch (err) {
    console.error(chalk.red('Ocorreu um erro:'), err);
  }
}

export default main;
