const puppeteer = require('puppeteer');
const { setupDatabase, insertDataIntoDatabase } = require('./database/databaseSetup');

// Função para executar um script Puppeteer e inserir os dados no banco de dados
async function runPuppeteerScript(scriptFunction) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Execute o script Puppeteer específico
  const data = await scriptFunction(page);

  // Extraia os dados do Puppeteer e insira no banco de dados
  await insertDataIntoDatabase(data);

  await browser.close();
}

// Coordenar as ações com base nos argumentos de linha de comando
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Você deve fornecer um argumento para especificar o script a ser executado ou "setup" para configurar o banco de dados.');
  process.exit(1);
}

const command = args[0];

if (command === 'setup') {
  setupDatabase().then(() => {
    console.log('Banco de dados configurado com sucesso.');
  }).catch((error) => {
    console.error('Erro ao configurar o banco de dados:', error);
  });
} else {
  if (!command.endsWith('.js')) {
    console.error('O argumento deve ser um nome de arquivo válido para um script Puppeteer.');
    process.exit(1);
  }

  // Verifique se o script específico está exportando a função correta
  const scriptFunction = require(`./scripts/${command}`);
  if (typeof scriptFunction !== 'function') {
    console.error('O script não exporta uma função executável.');
    process.exit(1);
  }

  runPuppeteerScript(scriptFunction).then(() => {
    console.log('Script Puppeteer executado com sucesso e os dados foram inseridos no banco de dados.');
  }).catch((error) => {
    console.error('Erro ao executar o script Puppeteer:', error);
  });
}
