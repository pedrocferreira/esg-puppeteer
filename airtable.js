const puppeteer = require('puppeteer');

async function scrapeData() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 }); 
    await page.goto('https://www.climatiq.io/blog/database-your-esg-standards-frameworks-and-regulation-overview', { waitUntil: 'networkidle0' });

    // Função de scroll automático
    await autoScroll(page);

    // Esperar por um elemento específico
    await page.waitForSelector('.dataRow');

    // Raspagem dos cabeçalhos da tabela
    const headers = await page.evaluate(() => {
      const headers = [];
      document.querySelectorAll('.contentWrapper').forEach((header) => {
        headers.push(header.innerText.trim());
      });
      return headers;
    });

    console.log(headers);

    // Raspagem dos dados da tabela
    const data = await page.evaluate(() => {
      const scrapedData = [];
      const rows = document.querySelectorAll('.dataRow');
      rows.forEach(row => {
        const rowData = {};
        const cells = row.querySelectorAll('.cell.primary.read');

        rowData.name = cells[0] ? cells[0].innerText.trim() : null;
        rowData.regionsCovered = cells[1] ? cells[1].innerText.trim() : null;
        rowData.type = cells[2] ? cells[2].innerText.trim() : null;
        rowData.numberOfCompanies = cells[3] ? cells[3].innerText.trim() : null;
        rowData.scope3 = cells[4] ? cells[4].innerText.trim() : null;
        rowData.mandatory = cells[5] ? cells[5].innerText.trim() : null;
        rowData.url = cells[6] ? cells[6].innerText.trim() : null;
        rowData.description = cells[7] ? cells[7].innerText.trim() : null;

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

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

scrapeData();
