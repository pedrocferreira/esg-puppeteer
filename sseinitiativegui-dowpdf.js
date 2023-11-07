import { parse } from 'csv-parse';
import fs from 'fs';
import { createReadStream } from 'fs';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const downloadPDF = async (browser, url, outputPath) => {
  const page = await browser.newPage();

  // Create a new CDP session for setting download behavior
  const client = await page.target().createCDPSession();

  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: outputPath,
  });

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle0' });

    if (response && response.ok()) {
      // The PDF is being downloaded automatically if the response is ok.
    } else {
      console.error(`Failed to download PDF: ${url}`);
    }
  } catch (error) {
    console.error(`Error downloading PDF from ${url}:`, error);
  } finally {
    await client.detach(); // Detach the CDP session
    await page.close();
  }
};

const downloadPDFsFromCSV = async (csvFilePath) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const pdfDownloadFolder = join(__dirname, 'pdf_downloads');

  if (!fs.existsSync(pdfDownloadFolder)) {
    fs.mkdirSync(pdfDownloadFolder, { recursive: true });
  }

  const parser = createReadStream(csvFilePath).pipe(parse({ columns: true }));

  for await (const row of parser) {
    const pdfUrl = row['PDF Link']; // Adjust 'PDFLink' to the actual column name
    if (pdfUrl && pdfUrl.endsWith('.pdf')) {
      const outputPath = join(pdfDownloadFolder, new URL(pdfUrl).pathname.split('/').pop());
      await downloadPDF(browser, pdfUrl, outputPath);
    }
  }

  console.log('All PDFs have been downloaded.');
  await browser.close();
};

const csvFilePath = join(__dirname, 'pdf_links/pdf_links.csv'); // Replace with the actual path to your CSV file
downloadPDFsFromCSV(csvFilePath);
