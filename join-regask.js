import fs from 'fs';
import Papa from 'papaparse';

const outputPath = 'csv-main/output.csv';
const inputPath = 'csv/regask_data.csv';

async function readCsv(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`O arquivo ${filePath} não existe. Um arquivo vazio será criado.`);
      writeCsv(filePath, []);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return new Promise((resolve) => {
      Papa.parse(data, {
        header: true,
        complete: (results) => resolve(results.data)
      });
    });
  } catch (err) {
    console.error(`Erro ao ler o arquivo CSV: ${err}`);
    throw err;
  }
}

async function writeCsv(filePath, data) {
  try {
    const csv = Papa.unparse(data, { header: true });
    fs.writeFileSync(filePath, csv, 'utf8');
  } catch (err) {
    console.error(`Erro ao escrever o arquivo CSV: ${err}`);
    throw err;
  }
}

async function addDataToCsv() {
  try {
    const dadosDestino = await readCsv(outputPath);
    const dadosOrigem = await readCsv(inputPath);

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

    await writeCsv(outputPath, dadosCombinados);
    console.log('Os dados foram adicionados com sucesso ao arquivo CSV existente!');
  } catch (err) {
    console.error('Ocorreu um erro durante a adição de dados ao CSV:', err);
    throw err;
  }
}

export default addDataToCsv;
