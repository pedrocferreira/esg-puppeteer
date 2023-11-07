import csvWriter from 'csv-writer';
import { promises as fsPromises } from 'fs';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function extractPDFLinks(page, url) {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
    return page.evaluate(() => Array.from(document.querySelectorAll('a[href$=".pdf"]'), a => ({ name: a.textContent, link: a.href })));
}

async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const pdfDownloadFolder = join(__dirname, 'pdf-links');

    // Ensure the directory for PDF download exists
    await fsPromises.mkdir(pdfDownloadFolder, { recursive: true });

    await page.goto('https://sseinitiative.org/esg-guidance-database/', { waitUntil: 'networkidle2', timeout: 90000 });
    await page.waitForSelector('#tablepress-9 tbody tr');

    // Extract data from the page
    const stockExchangeDataList = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#tablepress-9 tbody tr'), row => {
            const columns = row.querySelectorAll('td');
            const stockExchangeLink = columns[1].querySelector('a');
            const href = stockExchangeLink ? stockExchangeLink.href : null;
            const name = columns[1].innerText.trim();
            return {
                name,
                link: href
            };
        }).filter(item => item.link);
    });

    // Initialize CSV data array
    const csvData = [];
    for (const { name, link } of stockExchangeDataList) {
        const pdfLinks = await extractPDFLinks(page, link);
        pdfLinks.forEach(pdfLink => {
            csvData.push({ StockExchange: name, PDFLink: pdfLink.link });
        });
    }

    const csvFilePath = join(pdfDownloadFolder, 'pdf-links-sseinitiative.csv');

    try {
        await fsPromises.access(csvFilePath);
        console.log('O arquivo CSV já existe.');
    } catch (error) {
        console.log('O arquivo CSV não existe, será criado.');

        const csvStream = csvWriter.createObjectCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'StockExchange', title: 'Stock Exchange' },
                { id: 'PDFLink', title: 'PDF Link' }
            ]
        });

        await csvStream.writeRecords(csvData);
        console.log(`Os links dos PDFs foram salvos em ${csvFilePath}`);
    }

    await browser.close();
}

main().catch(console.error);
