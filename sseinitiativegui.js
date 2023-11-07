import { createObjectCsvWriter } from 'csv-writer';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const downloadPDF = async (page, url, outputPath) => {
  const pdfBuffer = await page.evaluate(async (url) => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return Array.from(new Uint8Array(buffer));
  }, url);

  await fs.writeFile(outputPath, new Uint8Array(pdfBuffer));
  console.log(`PDF downloaded and saved to: ${outputPath}`);
};

async function extractStockExchangeData(page, stockExchangeData, pdfDownloadFolder) {
  try {
    await page.goto(stockExchangeData.StockExchangeLink, { waitUntil: 'networkidle2', timeout: 90000 });
    await page.waitForTimeout(1000);
    console.log('Accessing: ', stockExchangeData.StockExchangeLink);

    const additionalData = await page.evaluate(() => {
      const data = {};
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach((row) => {
        const keyElement = row.querySelector('td:nth-child(1) b');
        const valueElement = row.querySelector('td:nth-child(2)');
        if (keyElement && valueElement) {
          const key = keyElement.innerText.trim();
          const value = valueElement.innerText.trim();
          data[key] = value;
        }
      });
      return data;
    });

    const pdfLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href$=".pdf"]')).map((a) => a.href);
    });

    stockExchangeData = { ...stockExchangeData, ...additionalData, pdfs: [] };

    for (const pdfUrl of pdfLinks) {
      const pdfName = `${stockExchangeData.StockExchange.replace(/\W+/g, '_')}.pdf`;
      const outputPath = join(pdfDownloadFolder, pdfName);
      const savedPath = await downloadPDF(page, pdfUrl, outputPath);
      stockExchangeData.pdfs.push(savedPath);
    }
  } catch (error) {
    console.error('Error extracting stock exchange data:', error);
  }

  return stockExchangeData;
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const pdfDownloadFolder = join(__dirname, 'pdf');
  try {
    await fs.access(pdfDownloadFolder);
  } catch {
    await fs.mkdir(pdfDownloadFolder, { recursive: true });
  }

  await page.goto('https://sseinitiative.org/esg-guidance-database/', { waitUntil: 'networkidle2', timeout: 90000 });
  await page.waitForTimeout(5000); 
  await page.waitForSelector('#tablepress-9 tbody tr');

  const data = await page.evaluate(() => {
    const rows = document.querySelectorAll('#tablepress-9 tbody tr');
    return Array.from(rows, row => {
      const columns = row.querySelectorAll('td');
      const stockExchangeLink = columns[1].querySelector('a');
      const href = stockExchangeLink ? stockExchangeLink.href : '';

      return {
        Market: columns[0].innerText,
        StockExchange: columns[1].innerText,
        StockExchangeLink: href,
        Year: columns[2].innerText,
        ESGGuidance: columns[3].innerText,
        GRI: columns[4].innerText,
        SASB: columns[5].innerText,
        TCFD: columns[6].innerText,
        IIRC: columns[7].innerText,
        CDSB: columns[8].innerText,
        CDP: columns[9].innerText,
      };
    });
  });

  const stockExchangeDataList = [];

  for (const stockExchangeData of data) {
    if (stockExchangeData.StockExchangeLink && stockExchangeData.StockExchangeLink !== 'N/A') {
      const enrichedData = await extractStockExchangeData(page, stockExchangeData, pdfDownloadFolder);
      stockExchangeDataList.push(enrichedData);
    } else {
      stockExchangeDataList.push(stockExchangeData);
    }
  }

  const headers = [
    ...Object.keys(stockExchangeDataList[0]).filter((key) => key !== 'pdfs').map((key) => ({ id: key, title: key })),
    ...Array.from({ length: Math.max(...stockExchangeDataList.map((data) => data.pdfs.length)) }, (_, i) => ({ id: `PdfPath_${i + 1}`, title: `PdfPath_${i + 1}` })),
  ];

  const csvWriter = createObjectCsvWriter({
    path: join(__dirname, 'csv/stock_exchange_data.csv'),
    header: headers
  });

  const records = stockExchangeDataList.map((data) => {
    const record = { ...data };
    delete record.pdfs;
    data.pdfs.forEach((pdfPath, index) => {
      record[`PdfPath_${index + 1}`] = pdfPath;
    });
    return record;
  });

  await csvWriter.writeRecords(records);
  console.log('CSV file written successfully.');

  await browser.close();
})();
