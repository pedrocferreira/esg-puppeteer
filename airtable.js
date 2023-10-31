const puppeteer = require('puppeteer');
const robot = require('robotjs');

async function clickShortOption() {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
  const page = await browser.newPage();

  await page.goto('https://airtable.com/appzfiUwVci5GhjlO/shrJethBEwOVaKH5R/tblIbzy1dGWtPjwrO', { waitUntil: 'networkidle0' });

  // Aguarde para garantir que a página tenha sido carregada
  await page.waitForTimeout(2000);

  // Certifique-se de que o navegador está em foco
  await page.bringToFront();

  // Aguarde para garantir que o navegador esteja em foco
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Reduzir o zoom para 50% (Ctrl -) cinco vezes
  for (let i = 0; i < 5; i++) {
    robot.keyTap('-', 'control');
    await new Promise(resolve => setTimeout(resolve, 500)); // Aguarde 500ms entre cada iteração
  }

  // Seletor para o botão que abre a lista desdobrável
  const dropdownButtonSelector = '[aria-label="Row height"]';

  // Esperar pelo botão estar visível e clicável
  const dropdownButton = await page.waitForSelector(dropdownButtonSelector, { visible: true });
  await dropdownButton.click();

  // Aguarde um momento para a lista desdobrável ser exibida
  await page.waitForTimeout(500);

  // Encontre e clique na opção "Short"
  await page.evaluate(() => {
    const menuItems = document.querySelectorAll('li[role="menuitem"]');
    menuItems.forEach(item => {
      if (item.textContent.includes('Short')) {
        item.click();
      }
    });
  });

  // Aguarde para ver os resultados
  await page.waitForTimeout(5000);

  // Feche o navegador
  //await browser.close();
}

clickShortOption();
