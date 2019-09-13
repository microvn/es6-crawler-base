import _ from 'lodash';
import $fn from '../functions';
import configs from '../../config';
import * as helpers from "../helper/helper";


/**
 * API GET ARTICLE
 * @route GET /api/article
 * @group Article - Operations about Article
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const get = async (req, res, next) => {


    try {
        const filters = $fn.helpers.parseParams(req);
        let result = [];
        let dataCount = await $fn.error.count({...filters.where});
        result = await $fn.error.get({
            where: {...filters.where},
            page: filters.page,
            limit: filters.limit,
            sort: filters.sort,
            include: true,
            fields: ['id',
                'url',
                'type',
                'retries',
                'createdAt',
                'updatedAt',
                'siteId',
                'domainId',
                'reason'
            ],
        });
        $fn.response.success(res, {total: dataCount, data: result, limit: filters.limit});
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API GET ARTICLE
 * @route GET /api/article
 * @group Article - Operations about Article
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const retry = async (req, res, next) => {


    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        let errors = await $fn.error.getErrorsByListId(_data.id);
        errors.forEach(async (item) => {
            item.data = JSON.parse(item.data);
            item.domain.error = item.id;
            let article = await $fn.article.getLinkByUrl(helpers.getFinalUrl(item.data._item.url));
            if (article) {
                await $fn.crawler.deleteError(item.id).catch((e) => console.log('Error Remove Log'))
            }
            let requestDetail = $fn.crawler.requestDetail(item.domain, item.data._item);
            let updateError = $fn.crawler.updateError({id: item.id, retries: item.retries + 1});
            Promise.all([requestDetail, updateError]).then(() => console.log('Retries Done'));
        });

        $fn.response.success(res, errors.length);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API GET ARTICLE
 * @route GET /api/article
 * @group Article - Operations about Article
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const retryAll = async (req, res, next) => {


    try {
        let errors = await $fn.crawler.getErrors();
        errors.forEach(async (item) => {
            item.data = JSON.parse(item.data);
            item.domain.error = item.id;
            let article = await $fn.article.getLinkByUrl(helpers.getFinalUrl(item.data._item.url));
            if (article) {
                await $fn.crawler.deleteError(item.id).catch((e) => console.log('Error Remove Log'))
            }
            let requestDetail = $fn.crawler.requestDetail(item.domain, item.data._item);
            let updateError = $fn.crawler.updateError({id: item.id, retries: item.retries + 1});
            Promise.all([requestDetail, updateError]).then(() => console.log('Retries Done'));
        });

        $fn.response.success(res, errors.length);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};
