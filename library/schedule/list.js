"use strict";

import schedule from 'node-schedule';
import moment from 'moment';
import $fn from "../../modules/functions";
// import $fn from '../../modules/functions';

schedule.scheduleJob('* * * * *', async () => {
    try {
        let array = [];
        const sites = await $fn.domain.getDomainCrawler();
        if (!sites) console.log(`NotFound Domain ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        sites.map(item => array.push($fn.crawler.crawler(item)));
        Promise.all(array).then((result) => {
            result.map(async subPromise => {
                if (subPromise._domain && subPromise._domain.id) {
                    await $fn.domain.update({
                        id: subPromise._domain.id,
                        requestAt: moment().format('YYYY-MM-DD HH:mm:ss')
                    });
                    console.log(`Done ${subPromise._domain.isAjax ? 'A' : ''}[${subPromise._domain.name}] with ${subPromise.result.length} ${moment().format('YYYY-MM-DD HH:mm:ss')}`)
                } else {
                    console.log(`Error [${subPromise}] ${moment().format('YYYY-MM-DD HH:mm:ss')}`)
                }

            });

        }).catch((err) => {
            console.log('err crob', err)
        });
    } catch (e) {
        console.log(e, `Error ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    }
});

