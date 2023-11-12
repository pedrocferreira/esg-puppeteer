import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Caminho para o arquivo de cookies
  const cookiesFilePath = path.resolve('cookies/cookies.json');
  // Carregar cookies
  const cookiesArr = JSON.parse(fs.readFileSync(cookiesFilePath));
  if (cookiesArr.length !== 0) {
    for (let cookie of cookiesArr) {
      await page.setCookie(cookie);
    }
  }

  // Navegar para a página após definir os cookies
  await page.goto('https://info.unglobalcompact.org/l/591891/2023-05-08/57h9s3');

  // Aguarda o carregamento do campo de telefone
  const phoneInputXPath = '/html/body/form/p[5]/input'; // XPath para o campo de telefone
  await page.waitForXPath(phoneInputXPath);

  // Seleciona o campo de telefone e o preenche
  const [phoneInput] = await page.$x(phoneInputXPath); // $x é usado para selecionar elementos com XPath
  if (phoneInput) {
    await phoneInput.type('555198128189852');
  }

  // Aguarda o carregamento do botão de envio
  const submitButtonXPath = '/html/body/form/p[10]/input'; // XPath para o botão de envio
  await page.waitForXPath(submitButtonXPath);

  // Seleciona o botão de envio e clica
  const [submitButton] = await page.$x(submitButtonXPath); // $x é usado para selecionar elementos com XPath
  if (submitButton) {
    await Promise.all([
      page.waitForNavigation(),
      submitButton.click(), // Clica no botão
    ]);
  }

  // Outras ações após o clique podem ser adicionadas aqui, se necessário

  await browser.close();
})();
