const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://regask.com/key-trends-in-esg-regulations-in-2022-and-beyond/');

    const data = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tbody tr');
        return Array.from(rows, row => {
            const columns = row.querySelectorAll('td, th');
            return Array.from(columns, column => column.innerText.trim());
        });
    });

    await browser.close();

    // Configurações de conexão ao banco de dados
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'esg'
    });

    // Ignorar o cabeçalho (primeira linha) e inserir os dados na tabela MySQL
    for (let i = 1; i < data.length; i++) {
        const item = data[i];

        // Verificar se o registro já existe
        const [rows] = await connection.execute(
            'SELECT * FROM regask WHERE Country_or_Region = ? AND Regulation = ? AND Institution = ? AND Description = ?',
            [item[0], item[1], item[2], item[3]]
        );

        // Se não existir, inserir no banco de dados
        if (rows.length === 0) {
            await connection.execute(
                'INSERT INTO regask (Country_or_Region, Regulation, Institution, Description, date) VALUES (?, ?, ?, ?, ?)',
                [
                    item[0] || null,
                    item[1] || null,
                    item[2] || null,
                    item[3] || null,
                    new Date().toISOString().slice(0, 19).replace('T', ' ')  // Formato YYYY-MM-DD HH:MM:SS
                ]
            );
        }
    }

    // Consulta para obter os dados inseridos no banco de dados
    const [results] = await connection.execute('SELECT * FROM regask');

    // Salvar os dados em um arquivo CSV
    const csvWriter = createObjectCsvWriter({
        path: 'csv/regask_data.csv',
        header: [
            { id: 'Country_or_Region', title: 'Country_or_Region' },
            { id: 'Regulation', title: 'Regulation' },
            { id: 'Institution', title: 'Institution' },
            { id: 'Description', title: 'Description' },
            { id: 'date', title: 'Date' }
        ]
    });

    await csvWriter.writeRecords(results);

    console.log('Dados inseridos no banco de dados e arquivo CSV gerado com sucesso!');

    // Fechar a conexão com o banco de dados
    await connection.end();
})();
