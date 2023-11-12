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
    path: path.join(csvPath, 'csv/compactGlobal.csv'),
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

        // Verifica se existe algum iframe com o src começando com o domínio especificado
        const iframeSrc = await page.evaluate(() =>
            Array.from(document.querySelectorAll('iframe')).map(iframe => iframe.src).find(src => src.startsWith('https://info.unglobalcompact.org/'))
        );

        // Se existe um iframe com o src desejado
        if (iframeSrc) {
            // Abre o link do iframe
            await page.goto(iframeSrc, { waitUntil: 'networkidle0' });

            try {
                // Tenta selecionar o botão de envio e aguarda por um tempo limitado
                const [submitButton] = await page.$x('/html/body/form/p[9]/input',{ timeout: 5000 });
                //quando o botao é "Access the brief ele x $X é /html/body/form/p[10]/input "
                const hrefs = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
                const pdfHrefs = hrefs.filter(href => href.endsWith('.pdf') || href.includes('-pdf'));
                console.log(pdfHrefs);
                if (submitButton) {
                    await Promise.all([
                        page.waitForNavigation(),
                        submitButton.click(),
                    ]);
                    
                    
                    const hrefs = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
                    const pdfHrefs = hrefs.filter(href => href.endsWith('.pdf') || href.includes('-pdf'));
                    console.log(pdfHrefs);
                    
                
                    // Escreve o primeiro href no CSV
                    if (pdfHrefs.length > 0) {
                        for (const pdfHref of pdfHrefs) {
                            await pdfCsvWriter.writeRecords([{ title: article.title, pdfLink: pdfHref }]);
                        }
                    }
                }
            } catch {
                // Se o botão de envio não estiver presente ou o tempo exceder, coleta os hrefs
                const [submitButton2] = await page.$x('/html/body/form/p[10]/input',{ timeout: 5000 });
                
                if (submitButton2) {
                    await Promise.all([
                        page.waitForNavigation(),
                        submitButton2.click(),
                    ]);
                const hrefs = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
                console.log(hrefs,'catch');
                const pdfHrefs = hrefs.filter(href => href.endsWith('.pdf') || href.includes('-pdf'));
                for (const pdfHref of pdfHrefs) {
                    await pdfCsvWriter.writeRecords([{ title: article.title, pdfLink: pdfHref }]);
                }
             }
                // Aqui você pode processar os hrefs como necessário
            }
        }

        // Continua com a lógica para encontrar o link PDF
        const pdfLinkSelector = 'a[href$=".pdf"]';
        const pdfLinkExist = await page.$(pdfLinkSelector);
        if (pdfLinkExist) {
            await page.waitForSelector(pdfLinkSelector, { visible: true, timeout: 10000 });
            const pdfLink = await page.$eval(pdfLinkSelector, el => el.href);
            await pdfCsvWriter.writeRecords([{ title: article.title, pdfLink }]);
        }

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