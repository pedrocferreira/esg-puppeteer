const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.greenfinanceplatform.org/financial-measures/browse', { waitUntil: 'networkidle0' });

  // Certifique-se de que os elementos necessários estão carregados
  await page.waitForSelector('div.views-row');

  // Extraia as informações da página
  const policies = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div.views-row')); // Seletor para cada item de política
    return items.map(item => {
      const year = item.querySelector('div.list-date time')?.innerText;
      const titleElement = item.querySelector('div.list-title a');
      const title = titleElement?.innerText;
      const link = titleElement?.getAttribute('href');
      const imageUrl = item.querySelector('div.flag-img img')?.getAttribute('src');
      const institutions = item.querySelector('div.list-meta-info.case-study-organisation')?.innerText;
      const country = item.querySelectorAll('div.list-meta-info.case-study-organisation')[1]?.innerText; // Ajuste se necessário
      const description = item.querySelector('div.list-body')?.innerText;

      return {
        year,
        title,
        link: link ? `https://www.greenfinanceplatform.org${link}` : null, // Prepend o domínio base se o link for relativo
        imageUrl: imageUrl ? `https://www.greenfinanceplatform.org${imageUrl}` : null, // Prepend o domínio base se a URL da imagem for relativa
        institutions,
        country,
        description,
      };
    });
  });

  console.log(policies); // Mostra os resultados

  await browser.close();
})();
