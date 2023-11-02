import fs from 'fs';
import Papa from 'papaparse';

async function readCsv(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return new Promise((resolve) => {
    Papa.parse(data, {
      header: true,
      complete: (results) => resolve(results.data)
    });
  });
}

async function writeCsv(filePath, data) {
  const csv = Papa.unparse(data, { header: true });
  fs.writeFileSync(filePath, csv, 'utf8');
}

async function addDataToCsv() {
  const dadosDestino = await readCsv('csv-main/output.csv');
  const dadosOrigem = await readCsv('csv/regask_data.csv');

  const dadosMapeados = dadosOrigem.map(item => {
    return {
      Title: item.Regulation,
      Region: item.Country_or_Region,
      Country: item.Country_or_Region,
      Institution: item.Institution,
      Description: item.Description,
      Date: item.Date,
      // Adicione aqui outros campos necessários, deixando-os vazios ou preenchendo conforme necessário
    };
  });

  const dadosCombinados = [...dadosDestino, ...dadosMapeados];

  await writeCsv('csv-main/output.csv', dadosCombinados);
  console.log('Os dados foram adicionados com sucesso ao arquivo CSV existente!');
}

addDataToCsv().catch(err => console.error('Ocorreu um erro:', err));

export default addDataToCsv;