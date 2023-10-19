const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'esg'
});

function createCompactGlobal() {
    const sql = `
        CREATE TABLE IF NOT EXISTS globalcompact (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            imageUrl TEXT,
            link TEXT UNIQUE,
            date VARCHAR(255),
            type VARCHAR(255)   
        )
    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('Tabela globalcompact criada ou já existente.');
    });
}
function createSseData() {
    const sql = `
        CREATE TABLE IF NOT EXISTS sse_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            imageUrl TEXT,
            imageTitle VARCHAR(255),
            country VARCHAR(255),
            linkText VARCHAR(255),
            linkUrl TEXT,
            title VARCHAR(255),
            subTitle VARCHAR(255),
            contentText TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('Tabela sse_data criada ou já existente.');
    });
}




module.exports = {
    createCompactGlobal,
    createSseData
};
