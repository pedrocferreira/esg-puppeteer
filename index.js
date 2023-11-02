import runRagask from './regask.js';
import runAirtable from './airtable.js';
import runJoinAirtable from './join-airtable.js';
import runJoinRegask from './join-regask.js';

async function runAllScripts() {
    try {
        console.log('Iniciando script regask...');
        await runRagask();
        console.log('Script regask concluído.');

        console.log('Iniciando script airtable...');
        await runAirtable();
        console.log('Script airtable concluído.');

        console.log('Iniciando script join-airtable...');
        await runJoinAirtable();
        console.log('Script join-airtable concluído.');

        console.log('Iniciando script join-regask...');
        await runJoinRegask();
        console.log('Script join-regask concluído.');

        console.log('Todos os scripts foram executados com sucesso!');
    } catch (err) {
        console.error('Ocorreu um erro durante a execução dos scripts:', err);
    }
}

runAllScripts();
