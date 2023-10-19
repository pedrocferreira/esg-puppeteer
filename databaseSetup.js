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
        console.log('Tabela artigos criada ou já existente.');
    });
}

module.exports = {
    createCompactGlobal
};
