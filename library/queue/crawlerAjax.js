import configs from '../../config/index';
import * as CrawlerFunctions from '../../modules/crawler/functions';
import Bull from 'bull';

module.exports = () => {
    console.log('CrawlerQueueAjax Listen Successfully');
    const NotifyQueue = new Bull('CrawlerQueueAjax', {redis: configs.queue});
    NotifyQueue.process(async (job, done) => {
        if (job.data) {
            await CrawlerFunctions.requestDetail(job.data.site, job.data.item);
            done();
        }
    });
};
