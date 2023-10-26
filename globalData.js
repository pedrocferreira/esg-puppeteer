const puppeteer = require('puppeteer');

async function scrapeData() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://airtable.com/appzfiUwVci5GhjlO/shrJethBEwOVaKH5R/tblIbzy1dGWtPjwrO?backgroundColor=blue&viewControls=on', { waitUntil: 'networkidle0' });

    // Timeout para garantir que tudo seja carregado
    await page.waitForTimeout(5000);

    // Raspagem dos cabeçalhos da tabela
    const headers = await page.evaluate(() => {
      const headers = [];
      // Selecione o elemento correto para os cabeçalhos aqui
      document.querySelectorAll('.headerClass').forEach((header) => {
        headers.push(header.innerText.trim());
      });
      return headers;
    });

    console.log(headers);

    // Raspagem dos dados da tabela
    const data = await page.evaluate(() => {
      const scrapedData = [];
      
      // Selecione os elementos corretos para as linhas e células aqui
      const rows = document.querySelectorAll('.tableRow');
      rows.forEach((row) => {
        const rowData = {};
        const cells = row.querySelectorAll('.tableCell');
        
        // Adapte estes de acordo com a estrutura das suas linhas/células.
        rowData.name = cells[0] ? cells[0].innerText : '';
        rowData.type = cells[1] ? cells[1].innerText : '';
        // ... repita para cada campo necessário
        
        scrapedData.push(rowData);
      });

      return scrapedData;
    });

    console.log(data);

    await browser.close();
  } catch (error) {
    console.error("Error: ", error);
  }
}

scrapeData();
