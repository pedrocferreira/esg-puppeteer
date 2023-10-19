const puppeteer = require('puppeteer');
const mysql = require('mysql');
const dbSetup = require('./databaseSetup');

// Configuração da conexão com o banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'esg'
});
dbSetup.createCompactGlobal();

// Conecta ao banco de dados
db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados');
});

async function scrapeAndInsert(pageNumber) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Abra a URL desejada com base no número da página
    await page.goto(`https://unglobalcompact.org/library/search?page=${pageNumber}&search%5Bcontent_type%5D=12&search%5Bissue_areas%5D%5B%5D=211&search%5Bkeywords%5D=`,{waitUntil: 'networkidle0'});

    // Raspando os dados
    const articles = await page.$$eval('.library-component-content-block', nodes => {
        return nodes.map(node => ({
            title: node.querySelector('h3').innerText,
            description: node.querySelector('.library.description p').innerText,
            imageUrl: node.querySelector('.library-component-content-block-image').style.backgroundImage.slice(5, -2),
            link: node.querySelector('a').getAttribute('href'),
            date: node.querySelector('.library.year').innerText,
            type: node.querySelector('.library-component-content-block-tag').innerText
        }));
    });

    // Feche o navegador
    await browser.close();

    // Inserindo os dados no banco de dados
    articles.forEach(article => {
        const sql = 'INSERT INTO globalcompact (title, description, imageUrl, link, date, type) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [article.title, article.description, article.imageUrl, article.link, article.date, article.type];
        db.query(sql, values, (err, result) => {
            if (err) throw err;
            console.log(`Artigo ${article.title} inserido no banco de dados.`);
        });
    });
}

// Execute a função para todas as páginas de 1 a 22
(async function() {
    for (let i = 1; i <= 22; i++) {
        await scrapeAndInsert(i);
    }
})();
