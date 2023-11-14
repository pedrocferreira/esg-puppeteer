import { createObjectCsvWriter } from 'csv-writer';
import puppeteer from 'puppeteer';

async function processPage(pageIndex, csvWriter, pdfCsvWriter, browser) {
  const page = await browser.newPage();
  await page.goto(`https://www.greenfinanceplatform.org/financial-measures/browse?page=${pageIndex}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('div.views-row');

  const policies = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div.views-row'));
    return items.map(item => {
      const year = item.querySelector('div.list-date time')?.innerText;
      const titleElement = item.querySelector('div.list-title a');
      const title = titleElement?.innerText;
      const link = titleElement?.getAttribute('href');
      const imageUrl = item.querySelector('div.flag-img img')?.getAttribute('src');
      const institutions = item.querySelector('div.list-meta-info.case-study-organisation')?.innerText;
      const country = item.querySelectorAll('div.list-meta-info.case-study-organisation')[1]?.innerText;
      const description = item.querySelector('div.list-body')?.innerText;

      return {
        year,
        title,
        link: link ? `https://www.greenfinanceplatform.org${link}` : null,
        imageUrl: imageUrl ? `https://www.greenfinanceplatform.org${imageUrl}` : null,
        institutions,
        country,
        description,
      };
    });
  });

  for (const policy of policies) {
    const policyPage = await browser.newPage();
    if (policy.link) {
      await policyPage.goto(policy.link, { waitUntil: 'networkidle0' });
      
      const pdfLinks = await policyPage.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.filter(a => a.href.includes('.pdf')).map(a => a.href);
      });

      policy.pdfLinks = pdfLinks;

      // Escreve cada política individualmente no CSV
      await csvWriter.writeRecords([policy]);

      for (const link of pdfLinks) {
        // Escreve cada link PDF individualmente no CSV
        await pdfCsvWriter.writeRecords([{ title: policy.title, pdfLink: link }]);
      }
    }
    await policyPage.close();
  }

  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  // CSV Writer para todas as políticas
  const csvWriter = createObjectCsvWriter({
    path: './CSV/greenfinanceplatform.csv',
    header: [
      { id: 'year', title: 'YEAR' },
      { id: 'title', title: 'TITLE' },
      { id: 'link', title: 'LINK' },
      { id: 'imageUrl', title: 'IMAGE_URL' },
      { id: 'institutions', title: 'INSTITUTIONS' },
      { id: 'country', title: 'COUNTRY' },
      { id: 'description', title: 'DESCRIPTION' },
    ]
  });

  // CSV Writer para links PDF
  const pdfCsvWriter = createObjectCsvWriter({
    path: './pdf-links/greenfinanceplatform-pdf.csv',
    header: [
      { id: 'title', title: 'TITLE' },
      { id: 'pdfLink', title: 'PDF_LINK' }
    ]
  });

  // Número de páginas a serem processadas simultaneamente
  const CONCURRENT_PAGES = 5;

  for (let pageIndex = 0; pageIndex < 77; pageIndex += CONCURRENT_PAGES) {
    const promises = [];
    for (let i = 0; i < CONCURRENT_PAGES && (pageIndex + i) < 77; i++) {
      promises.push(processPage(pageIndex + i, csvWriter, pdfCsvWriter, browser));
    }
    await Promise.all(promises);
  }

  await browser.close();
})();
