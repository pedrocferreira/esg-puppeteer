import fs from 'fs';
import puppeteer from 'puppeteer';

async function scrapePage(page, firstLink, urlBase, urlInicial) {
    await page.goto(urlBase + firstLink, { waitUntil: 'networkidle0' });

    const secondLink = await page.evaluate(() =>
        document.querySelector('p.info a')?.getAttribute('href')
    );

    if (secondLink) {
        await page.goto(urlBase + secondLink, { waitUntil: 'networkidle0' });

        const pdfLink = await page.evaluate(() =>
            document.querySelector('.top-page-jo-button a.doc-download')?.getAttribute('href')
        );

        if (pdfLink) {
            const adjustedLink = urlBase + pdfLink.replace('download/pdf?id=', 'download/file/') + '/JOE';
            return adjustedLink;
        }
    }
    return null;
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const urlBase = 'https://www.legifrance.gouv.fr';
    const urlInicial = 'https://www.legifrance.gouv.fr/search/all?tab_selection=all&searchField=ALL&query=%22responsabilit%C3%A9+soci%C3%A9tale%3A%5D&searchType=ALL&typePagination=DEFAULT&pageSize=2655&page=1&tab_selection=all#all'; // Sua URL inicial aqui
    await page.goto(urlInicial, { waitUntil: 'networkidle0' });

    const firstLinks = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.name-result-item')).map(link => link.getAttribute('href'))
    );

    const pdfLinks = [];
    const maxPages = 5; // Ajuste conforme necessário
    const promises = [];

    for (let i = 0; i < firstLinks.length; i++) {
        const newPage = await browser.newPage();
        const firstLink = firstLinks[i];
        promises.push(scrapePage(newPage, firstLink, urlBase, urlInicial)
            .then(link => {
                if (link) {
                    pdfLinks.push(link);
                }
                return newPage.close();
            }));

        if (promises.length >= maxPages || i === firstLinks.length - 1) {
            await Promise.all(promises);
            promises.length = 0; // Limpa o array de promessas
        }
    }

    await browser.close();
    fs.writeFileSync('pdf-links.txt', pdfLinks.join('\n'));
})();
