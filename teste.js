import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('https://info.unglobalcompact.org/l/591891/2022-07-13/4s7dr2'); // Substitua com a URL apropriada

    await page.evaluate(() => {
        return fetch("https://info.unglobalcompact.org/l/591891/2022-07-13/4s7dr2", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                // Adicione outros cabeçalhos necessários aqui
            },
            body: "591891_219802pi_591891_219802=Pedro&591891_219805pi_591891_219805=Ferreira&591891_219808pi_591891_219808=pedroocferreira%40gmail.com&591891_219811pi_591891_219811=51981281898444&591891_219814pi_591891_219814=2342098&591891_219823pi_591891_219823=R&591891_219832pi_591891_219832%5B%5D=2342671&pi_extra_field=&_utf8=%E2%98%83&hiddenDependentFields="
        });
    });
    ``
    

    
})();
