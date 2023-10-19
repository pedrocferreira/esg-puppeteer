const puppeteer = require('puppeteer');
const mysql = require('mysql');
const { createSseData } = require('./databaseSetup'); // Importar a função para criar a tabela

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'esg'
});

connection.connect();

(async () => {
    // Criar a tabela sse_data se ela não existir
    createSseData();

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto('https://sseinitiative.org/regulation/');

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

        // Inserir os dados no banco de dados
        const sql = 'INSERT INTO sse_data (imageUrl, imageTitle, country, linkText, linkUrl, title, subTitle, contentText) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(sql, [countryData.imageUrl, countryData.imageTitle, countryData.country, countryData.linkText, countryData.linkUrl, countryData.title, countryData.subTitle, countryData.contentText], (error, results, fields) => {
            if (error) throw error;
            console.log('Dados inseridos com o ID:', results.insertId);
        });
    }

    await browser.close();

    // Fechar a conexão com o banco de dados após inserir todos os dados
    connection.end();

    console.log("Processo concluído!");
})();
