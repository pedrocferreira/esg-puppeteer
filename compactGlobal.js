import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// Ensure that the directory for the output CSV and downloads exists
const __dirname = path.resolve(path.dirname(''));
const downloadPath = path.resolve(__dirname, 'downloads');
const csvPath = path.resolve(__dirname, '');
if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
}
if (!fs.existsSync(csvPath)) {
    fs.mkdirSync(csvPath);
}

// Configure the CSV writer for articles
const articleCsvWriter = createObjectCsvWriter({
    path: path.join(csvPath, 'compactGlobal.csv'),
    header: [
        { id: 'title', title: 'Title' },
        { id: 'description', title: 'Description' },
        { id: 'imageUrl', title: 'ImageUrl' },
        { id: 'link', title: 'Link' },
        { id: 'date', title: 'Date' },
        { id: 'type', title: 'Type' }
    ]
});

// Configure the CSV writer for PDF links
const pdfCsvWriter = createObjectCsvWriter({
    path: path.join(csvPath, 'pdf-links/pdfCompactGlobal.csv'),
    header: [
        { id: 'title', title: 'Title' },
        { id: 'pdfLink', title: 'PDF Link' }
    ]
});

async function setCookies(page) {
    const cookieFilePath = path.resolve(__dirname, 'cookies/cookies.json');
    if (fs.existsSync(cookieFilePath)) {
      const cookiesString = fs.readFileSync(cookieFilePath);
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
    } else {
      console.error('Arquivo de cookies não encontrado.');
    }
  }
async function scrapeAndInsert(pageNumber, browser) {
    const page = await browser.newPage();
    await setCookies(page)
    await page.goto(`https://unglobalcompact.org/library/search?page=${pageNumber}`, { waitUntil: 'networkidle0' });

    const articles = await page.$$eval('.library-component-content-block', nodes => nodes.map(node => ({
        title: node.querySelector('h3')?.innerText,
        description: node.querySelector('.library.description p')?.innerText,
        imageUrl: node.querySelector('.library-component-content-block-image')?.style.backgroundImage.slice(5, -2),
        link: node.querySelector('a')?.getAttribute('href'),
        date: node.querySelector('.library.year')?.innerText,
        type: node.querySelector('.library-component-content-block-tag')?.innerText
    })));

    await articleCsvWriter.writeRecords(articles);

    for (const article of articles) {
        try {
            const fullUrl = new URL(article.link, 'https://unglobalcompact.org').href;
            await page.goto(fullUrl, { waitUntil: 'networkidle0' });
            const pdfLinkSelector = 'a[href$=".pdf"]';
            await page.waitForSelector(pdfLinkSelector, { visible: true, timeout: 10000 });
            const pdfLink = await page.$eval(pdfLinkSelector, el => el.href);
            await pdfCsvWriter.writeRecords([{ title: article.title, pdfLink }]);
        } catch (error) {
            console.error(`Error processing article '${article.title}': ${error}`);
        }
    }

    await page.close();
}

(async () => {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    for (let i = 1; i <= 22; i++) {
        console.log(`Processing page ${i}...`);
        await scrapeAndInsert(i, browser);
    }
    await browser.close();
})();
