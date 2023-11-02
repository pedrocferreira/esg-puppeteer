import puppeteer from 'puppeteer';
import robot from 'robotjs';
import fs from 'fs';
import Papa from 'papaparse';
import chalk from 'chalk';

async function clickShortOptionAndExtractLinks() {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
  const page = await browser.newPage();
  const formattedData = [];

  try {
    console.log(chalk.blue('Acessando a página...'));
    await page.goto('https://airtable.com/appzfiUwVci5GhjlO/shrJethBEwOVaKH5R/tblIbzy1dGWtPjwrO', { waitUntil: 'networkidle0' });

    console.log(chalk.blue('Esperando a página carregar...'));
    await page.waitForTimeout(2000);
    await page.bringToFront();
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(chalk.blue('Ajustando o zoom...'));
    for (let i = 0; i < 5; i++) {
      robot.keyTap('-', 'control');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(chalk.blue('Ajustando a altura das linhas...'));
    const dropdownButtonSelector = '[aria-label="Row height"]';
    const dropdownButton = await page.waitForSelector(dropdownButtonSelector, { visible: true });
    await dropdownButton.click();
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const menuItems = document.querySelectorAll('li[role="menuitem"]');
      menuItems.forEach(item => {
        if (item.textContent.includes('Short')) {
          item.click();
        }
      });
    });

    await page.waitForTimeout(2000);

    console.log(chalk.blue('Coletando links...'));
    const links = await page.evaluate(() => {
      const elements = document.querySelectorAll('.dataRow.leftPane.rowExpansionEnabled.rowSelectionEnabled a');
      return Array.from(elements).map(el => el.href);
    });

    console.log(chalk.green(`Total de ${links.length} links coletados.`));

    console.log(chalk.blue('Extraindo dados...'));
    for (const link of links) {
      await page.goto(link, { waitUntil: 'networkidle0' });
      const data = await page.evaluate(() => {
        const results = {};
        const detailView = document.querySelector('.detailView');
        if (detailView) {
          const labelCellPairs = detailView.querySelectorAll('.labelCellPair');
          labelCellPairs.forEach(pair => {
            const label = pair.querySelector('.fieldLabel')?.textContent.trim();
            let value;
            if (label) {
              if (label.includes('# of companies') || label.includes('Description')) {
                value = pair.querySelector('.contentEditableTextbox')?.textContent.trim();
              } else {
                value = pair.querySelector('[data-testid="cell-editor"]')?.textContent.trim();
              }
              value = value.replace(/[\r\n]+/gm, ' ').replace(/,/g,';');
              results[label] = value;
            }
          });
        }
        return results;
      });

      formattedData.push(data);
      await page.waitForTimeout(2000);
    }

    console.log(chalk.blue('Salvando os dados em CSV...'));
    const csv = Papa.unparse(formattedData);
    fs.writeFileSync('csv/airtable.csv', csv);
    console.log(chalk.green('Dados foram salvos em csv/airtable.csv'));
  } catch (error) {
    console.error(chalk.red('Erro durante a execução do script:'), error);
  } finally {
    console.log(chalk.blue('Fechando o navegador...'));
    await browser.close();
  }
}

export default clickShortOptionAndExtractLinks;
