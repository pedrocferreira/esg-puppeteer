const puppeteer = require('puppeteer');

async function scrapeTableData(url) {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto(url);

  // Espera até que a tabela esteja visível
  await page.waitForSelector('_ngcontent-ctl-c108');

  // Função para rolar até o fim da página
  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  // Rola até o fim da página para carregar todos os dados
  await autoScroll(page);

  // Coleta os dados da tabela
  const dados = await page.evaluate(() => {
    const rows = document.querySelectorAll('seletor-das-linhas-da-tabela');
    return Array.from(rows).map(row => {
      // Substitua 'seletor-das-celulas' pelo seletor correto para as células da tabela
      const cells = row.querySelectorAll('seletor-das-celulas');
      return Array.from(cells).map(cell => cell.innerText);
    });
  });

  await browser.close();
  return dados;
}

scrapeTableData('https://app.powerbi.com/view?r=eyJrIjoiNGY2Yzk1OGYtMWU5MC00MGFhLWJkYzMtZDQ3NzZlZGQ0MzVlIiwidCI6ImZiYzI1NzBkLWE5OGYtNDFmMS1hOGFkLTEyYjEzMWJkOTNlOCIsImMiOjh9').then(dados => {
  console.log(dados);
});
