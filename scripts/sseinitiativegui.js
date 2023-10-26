const puppeteer = require('puppeteer');
const { createObjectCsvWriter } = require('csv-writer');

// Função para extrair os dados da página da bolsa de valores
async function extractStockExchangeData(href, page) {
    await page.goto(href);

    const stockExchangeData = await page.evaluate(() => {
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

        return {
            Name: data["Name"],
            Country: data["Country"],
            "Number of listed companies": data["Number of listed companies"],
            "Domestic market capitalization": data["Domestic market capitalization"],
            "SSE Partner Exchange": data["SSE Partner Exchange"],
            "Has annual sustainability report": data["Has annual sustainability report"],
            "ESG reporting required as a listing rule": data["ESG reporting required as a listing rule"],
            "Has written guidance on ESG reporting": data["Has written guidance on ESG reporting"],
            "Offers ESG related training": data["Offers ESG related training"],
            "Market covered by sustainability-related index": data["Market covered by sustainability-related index"],
            "Has sustainability bond listing segment": data["Has sustainability bond listing segment"],
            "Has SME listing platform": data["Has SME listing platform"],
            "Women on boards mandatory minimum rule": data["Women on boards mandatory minimum rule"],
            "Additional information": data["Additional information"],
            "Organizational model of stock exchange": data["Organizational model of stock exchange"],
            "Regulatory bodies": data["Regulatory bodies"],
            "Regulatory model": data["Regulatory model"],
            "About the stock exchange": data["About the stock exchange"],
        };
    });

    return stockExchangeData;
}

(async () => {
    // Inicie o navegador
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Navegue até a página
    await page.goto('https://sseinitiative.org/esg-guidance-database/');
    
    // Aguarde a tabela ser carregada
    await page.waitForSelector('#tablepress-9 tbody tr');
    
    // Defina a função mapTextToBoolean no escopo global da página
    await page.evaluate(() => {
        window.mapTextToBoolean = function(text) {
            return text === '⬤' ? true : false;
        };
    });
    
    // Extraia os dados da primeira página e retorne-os junto com o link da Bolsa de Valores
    const data = await page.evaluate(() => {
        const rows = document.querySelectorAll('#tablepress-9 tbody tr');
        return Array.from(rows, row => {
            const columns = row.querySelectorAll('td');
            const stockExchangeLink = columns[1].querySelector('a'); // Obtenha o elemento <a> dentro da segunda coluna
            const href = stockExchangeLink ? stockExchangeLink.getAttribute('href') : ''; // Obtenha o atributo href ou defina como uma string vazia se não houver link

            return {
                Market: columns[0].innerText,
                StockExchange: columns[1].innerText,
                StockExchangeLink: href, // Adicione o link como uma nova propriedade
                Year: columns[2].innerText,
                ESGGuidance: columns[3].innerText,
                GRI: window.mapTextToBoolean(columns[4].innerText),
                SASB: window.mapTextToBoolean(columns[5].innerText),
                TCFD: window.mapTextToBoolean(columns[6].innerText),
                IIRC: window.mapTextToBoolean(columns[7].innerText),
                CDSB: window.mapTextToBoolean(columns[8].innerText),
                CDP: window.mapTextToBoolean(columns[9].innerText),
            };
        });
    });

    // Extraia os dados da segunda página com base no atributo href
    for (let i = 0; i < data.length; i++) {
        const stockExchangeData = data[i];
        const href = stockExchangeData.StockExchangeLink;
        
        if (href && href !== 'N/A') {
            const stockExchangeInfo = await extractStockExchangeData(href, page);
            
            // Adicione as propriedades da segunda página aos dados da primeira página
            Object.assign(stockExchangeData, stockExchangeInfo);
        }
    }

    // Escreva os dados em um arquivo CSV
    const csvWriter = createObjectCsvWriter({
        path: 'csv/sseinitiativegui.csv',
        header: Object.keys(data[0]).map(key => ({ id: key, title: key })),
    });

    await csvWriter.writeRecords(data);

    // Feche o navegador
    await browser.close();
})();
