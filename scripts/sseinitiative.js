const puppeteer = require('puppeteer');
const mysql = require('mysql');
const { createSseData } = require('./database/databaseSetup');

const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'esg'
});

connection.connect();

(async () => {
    createSseData();

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto('https://sseinitiative.org/regulation');

    const data = await page.$$eval('.cstm-db-rslts-list-item .et_builder_inner_content', elements => {
        return elements.map(element => {
            const imgElement = element.querySelector('img');
            const spanElement = element.querySelector('.country-parent');
            const linkElement = element.querySelector('a');

            return {
                imageUrl: imgElement ? imgElement.src : null,
                imageTitle: imgElement ? imgElement.title : null,
                country: spanElement ? spanElement.innerText : null,
                linkText: linkElement ? linkElement.innerText : null,
                linkUrl: linkElement ? linkElement.href : null
            };
        });
    });

    const allData = [];

    for (let countryData of data) {
        await page.goto(countryData.linkUrl);

        const details = await page.evaluate(() => {
            const titleElement = document.querySelector('#cstm-db-title h1 a');
            const subTitleElement = document.querySelector('.sec-reg-single-name h2');
            const contentElement = document.querySelector('.et-l--post .et_builder_inner_content');

            return {
                title: titleElement ? titleElement.innerText : null,
                subTitle: subTitleElement ? subTitleElement.innerText : null,
                contentText: contentElement ? contentElement.innerText.trim() : null
            };
        });

        Object.assign(countryData, details);

        allData.push(countryData);
    }

    await browser.close();

    // Escrever todos os dados no arquivo CSV na pasta "CSV/"
    const csvWriter = createObjectCsvWriter({
        path: 'csv/sseinitiative.csv', // Caminho para a pasta CSV/
        header: [
            { id: 'imageUrl', title: 'Image URL' },
            { id: 'imageTitle', title: 'Image Title' },
            { id: 'country', title: 'Country' },
            { id: 'linkText', title: 'Link Text' },
            { id: 'linkUrl', title: 'Link URL' },
            { id: 'title', title: 'Title' },
            { id: 'subTitle', title: 'Sub Title' },
            { id: 'contentText', title: 'Content Text' }
        ]
    });

    await csvWriter.writeRecords(allData);

    // Fechar a conexão com o banco de dados após inserir todos os dados
    connection.end();

    console.log("Processo concluído e arquivo CSV gerado na pasta 'CSV/'.");
})();
