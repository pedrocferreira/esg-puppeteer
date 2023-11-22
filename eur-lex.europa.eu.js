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

    // Inicializa um array para guardar todos os hrefs
    let allHrefs = [];

    // Loop para iterar pelas páginas de 1 a 16 e coletar os links
    for (let i = 1; i <= 16; i++) {
        // URL da página
        const url = `https://eur-lex.europa.eu/search.html?SUBDOM_INIT=ALL_ALL&textScope0=ti-te&orText1=nfrd&textScope1=ti-te&lang=en&type=advanced&qid=1700493741622&andText0=csrd&page=${i}`;
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Extrai os hrefs
        const hrefs = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('.SearchResult h2 a'));
            return links.map(link => link.href);
        });

        allHrefs.push(...hrefs);
    }

    // Array para armazenar os links PDF de cada página
    let allPdfLinks = [];

    // Loop para visitar cada link coletado
    for (const href of allHrefs) {
        try {
            console.log(`Tentando acessar: ${href}`);
            await page.goto(href, { waitUntil: 'networkidle0' });

            const pdfLinkEN = await page.evaluate(() => {
                const link = document.querySelector('#format_language_table_PDF_EN');
                return link ? link.href : null;
            });

            if (pdfLinkEN) {
                console.log(`Origem: ${href} - PDF link coletado (EN): ${pdfLinkEN}`);
                allPdfLinks.push(pdfLinkEN);
            }

            const pdfLinkFR = await page.evaluate(() => {
                const link = document.querySelector('#format_language_table_PDF_FR');
                return link ? link.href : null;
            });

            if (pdfLinkFR) {
                console.log(`Origem: ${href} - PDF link coletado (FR): ${pdfLinkFR}`);
                allPdfLinks.push(pdfLinkFR);
            }
        } catch (error) {
            console.error(`Erro ao acessar: ${href}`, error);
        }
    }

    // Fecha o navegador
    await browser.close();

    // Converter os links para formato CSV
    const csvContent = allPdfLinks.map(link => `"${link}"`).join('\n');

    // Escrever os dados em um arquivo CSV
    fs.writeFileSync('pdf-links/eur-lex.csv', csvContent);
})();
