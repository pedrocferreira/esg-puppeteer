import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';

async function processPage(pageUrl, browser, csvWriter) {
    const page = await browser.newPage();
    console.log(`Processando página: ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('div.views-row');

    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('div.views-row div.list-title a'))
                    .map(a => a.href);
    });

    for (const link of links) {
        await processPolicyPage(link, browser, csvWriter);
    }

    await page.close();
}

async function processPolicyPage(policyUrl, browser, csvWriter) {
    const page = await browser.newPage();
    
    try {
        await page.goto(policyUrl, { waitUntil: 'networkidle0' });
        await page.waitForSelector('div.file-download-link.online-link', { timeout: 5000 });

        const title = await page.evaluate(() => {
            const titleElement = document.querySelector('span.field.field--name-title.field--type-string.field--label-hidden');
            return titleElement ? titleElement.innerText : null;
        });

        const readOnlineLink = await page.evaluate(() => {
            const anchor = document.querySelector('div.file-download-link.online-link a');
            return anchor ? anchor.href : null;
        });

        if (readOnlineLink && !readOnlineLink.includes('.pdf')) {
            await processReadOnlineLink(readOnlineLink, browser, title, csvWriter);
        }
    } catch (error) {
        console.log(`Não foi possível encontrar o seletor na página ${policyUrl}:`, error.message);
    } finally {
        await page.close();
    }
}

async function processReadOnlineLink(readOnlineLink, browser, title, csvWriter) {
    if (/\.pdf/i.test(readOnlineLink)) {
        console.log('Link potencial para PDF identificado:', readOnlineLink);
        return;
    }

    const page = await browser.newPage();

    try {
        await page.goto(readOnlineLink, { waitUntil: 'networkidle0' });

        const pdfLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                        .filter(a => /\.pdf/i.test(a.href))
                        .map(a => a.href);
        });

        for (const pdfLink of pdfLinks) {
            console.log('PDF encontrado:', pdfLink);
            await csvWriter.writeRecords([{ title, pdfLink }]);
        }
    } catch (error) {
        console.log(`Erro ao acessar ${readOnlineLink}:`, error.message);
    } finally {
        await page.close();
    }
}   

    (async () => {
        const browser = await puppeteer.launch({ headless: false });
        const csvWriter = createObjectCsvWriter({
            path: 'pdf-links/greenfinance-site-pdf.csv',
            header: [
                { id: 'title', title: 'TITLE' },
                { id: 'pdfLink', title: 'PDF_LINK' }
            ]
        });
    
        const totalPages = 77;
        const CONCURRENT_PAGES = 5; // Número de páginas a processar simultaneamente
    
        for (let pageIndex = 0; pageIndex < totalPages; pageIndex += CONCURRENT_PAGES) {
            const promises = [];
            for (let i = 0; i < CONCURRENT_PAGES && (pageIndex + i) < totalPages; i++) {
                const pageUrl = `https://www.greenfinanceplatform.org/financial-measures/browse?page=${pageIndex + i}`;
                promises.push(processPage(pageUrl, browser, csvWriter));
            }
            await Promise.all(promises);
        }
    
        await browser.close();
    })();