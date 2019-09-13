'use strict';

import configs from '../../config';
import puppeteer from "puppeteer";


const init = async () => {
    if (configs.isQueue !== 'true') return false;
    console.log('Puppeteer started',configs.env);
    let _options = {
        executablePath: process.env.CHROME_BIN || null,
        args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
    };
    if (configs.env !== "production") _options = {headless: false, devtools: true};
    console.log(_options);
    console.log(process.env.CHROME_BIN);

    return puppeteer.launch(_options);
};


const browser = init();
module.exports = browser;
