import runAirtable from './airtable.js';
import pdfAirtabel from './pdf-airtabel.js';
import sseinitiativePDF from './sseinitiativegui-pdf.js';
// Certifique-se de que o topo do seu arquivo index.js tenha o seguinte:
import sseinitiativegui from './sseinitiativegui.js';

// Agora, a execução de cada script de forma assíncrona:
(async () => {
  await runAirtable();
  console.log('runAirtable concluído');
  
  await sseinitiativegui();
  console.log('sseinitiativegui concluído');
  
  await sseinitiativePDF();
  console.log('sseinitiativePDF concluído');
  
  await pdfAirtabel();
  console.log('pdfAirtabel concluído');
})();
