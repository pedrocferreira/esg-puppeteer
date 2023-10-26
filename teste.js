const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

const downloadPDF = async (url, path) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const fileStream = fs.createWriteStream(path);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(resolve);
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
};

const downloadAllPDFs = async (pageUrl) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(pageUrl);

  const pdfUrls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href$=".pdf"]')).map(a => a.href);
  });

  for (let i = 0; i < pdfUrls.length; i++) {
    const pdfUrl = pdfUrls[i];
    const pdfName = pdfUrl.split('/').pop();
    console.log(`Baixando ${pdfName}...`);
    await downloadPDF(pdfUrl, `./csv/pdf/${pdfName}`);
    console.log(`${pdfName} baixado com sucesso!`);
  }

  await browser.close();
};

downloadAllPDFs('https://sseinitiative.org/stock-exchange/asx/')
  .then(() => console.log('Todos os PDFs foram baixados!'))
  .catch((e) => console.error('Ocorreu um erro:', e));
