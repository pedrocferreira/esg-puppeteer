import fs from 'fs';
import puppeteer from 'puppeteer';

(async () => {
    // Inicia o navegador
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    });
    // Abre uma nova página
    const page = await browser.newPage();

    // Inicializa um array para guardar os hrefs e textos
    let allLinks = [];

    // Loop para iterar pelas páginas e coletar os links e textos
    for (let i = 1; i <= 16; i++) {
        const url = `https://eur-lex.europa.eu/search.html?SUBDOM_INIT=ALL_ALL&textScope0=ti-te&orText1=nfrd&textScope1=ti-te&lang=en&type=advanced&qid=1700493741622&andText0=csrd&page=${i}`;
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.SearchResult h2 a')).map(link => ({
                href: link.href,
                text: link.textContent.trim()
            }));
        });

        allLinks.push(...links);
    }

    // Array para armazenar os dados dos PDFs
    let allPdfData = [];

    // Loop para visitar cada link coletado
    for (const { href, text } of allLinks) {
        try {
            console.log(`Tentando acessar: ${href}`);
            await page.goto(href, { waitUntil: 'networkidle0' });

            const pdfLinkEN = await page.evaluate(() => {
                const link = document.querySelector('#format_language_table_PDF_EN');
                return link ? link.href : null;
            });

            if (pdfLinkEN) {
                console.log(`Origem: ${href} - PDF link coletado (EN): ${pdfLinkEN}`);
                allPdfData.push({ href: pdfLinkEN, text });
            }

            const pdfLinkFR = await page.evaluate(() => {
                const link = document.querySelector('#format_language_table_PDF_FR');
                return link ? link.href : null;
            });

            if (pdfLinkFR) {
                console.log(`Origem: ${href} - PDF link coletado (FR): ${pdfLinkFR}`);
                allPdfData.push({ href: pdfLinkFR, text });
            }
        } catch (error) {
            console.error(`Erro ao acessar: ${href}`, error);
        }
    }

    // Fecha o navegador
    await browser.close();

    // Converter os dados para formato CSV
    const csvContent = allPdfData.map(({ href, text }) => `"${text}","${href}"`).join('\n');

    // Escrever os dados em um arquivo CSV
    fs.writeFileSync('pdf-links/eur-lex.csv', csvContent);
})();
