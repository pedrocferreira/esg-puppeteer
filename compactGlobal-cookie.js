import fs from 'fs';
import puppeteer from 'puppeteer';
import readline from 'readline';

// Criar a interface readline para interagir com o console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://unglobalcompact.org/library/6102');

  // A função é pausada aqui até que o usuário digite algo no console e pressione enter
  await new Promise(resolve => rl.question('Após preencher e enviar o formulário, pressione Enter no console.', ans => {
    rl.close();
    resolve();
  }));

  const cookies = await page.cookies();
  fs.writeFileSync('cookies/cookies.json', JSON.stringify(cookies, null, 2), 'utf-8');

  await browser.close();
})();
