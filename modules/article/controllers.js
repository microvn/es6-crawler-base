import _ from 'lodash';
import $fn from '../functions';
import configs from '../../config';


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
        let dataCount = await $fn.article.count({...filters.where});
        result = await $fn.article.get({
            where: {...filters.where},
            page: filters.page,
            limit: filters.limit,
            sort: filters.sort,
            include: true,
            fields: ['id',
                'title',
                'text',
                'slug',
                'time',
                'thumbnail',
                'createdAt',
                'updatedAt',
                'status',
                'siteId',
                'isPositive'
            ],
        });
        $fn.response.success(res, {total: dataCount, data: result, limit: filters.limit});
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API EXPORT DATA ARTICLE
 * @route GET /api/article/export
 * @group Article - Operations about Article
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const exportData = async (req, res, next) => {
    try {
        let _filter = req.body.where;
        if (req.body.isSearch) {
            let _data = _.pick(req.body, ['must', 'mustNot', 'should', 'page', 'limit', 'date', 'siteId']);
            let result = await $fn.article.search({
                must: _data.must,
                mustNot: _data.mustNot,
                should: _data.should,
                page: _data.page,
                limit: _data.limit,
                siteId: _data.siteId,
                date: _data.date
            });
            let listId = result.result.map(o => o.id);
            _filter = {id: {$in: listId}};
        }
        const type = req.body.type === 'csv' ? 'csv' : 'xml';
        const isMini = !!req.body.isMini;
        let fields = [
            'id',
            'slug',
            'title',
            'time',
            'content',
            'text',
            'thumbnail',
            'createdAt'
        ];
        if(isMini) fields = [
            'id',
            'title',
            'time',
            'content',
            'text'];
        let result = await $fn.article.getAll({
            where: {..._filter},
            sort: req.body.sort,
            include: false,
            fields: fields,
        });
        if (result.length < 1) return $fn.response.notFound(res, configs.text.common.notFoundArticle);
        let path = $fn.helpers.exportToFile(_filter, result, type);
        $fn.response.success(res, {
            url: `${path}`,
            type: type
        });
    } catch (e) {
        console.log(e)
        return $fn.response.serverError(res, e);
    }
};


/**
 * API GET ARTICLE
 * @route GET /api/article
 * @param {string} param.body.required - {"must":"tỉnh","mustNot":"chiều","should":"chiều"}
 * @group Article - Operations about Article
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const search = async (req, res, next) => {

    let _data = _.pick(req.body, ['must', 'mustNot', 'should', 'page', 'limit', 'date', 'siteId']);
    if (!_data.must || !_data.mustNot || !_data.should) return $fn.response.clientError(res);
    try {
        let result = await $fn.article.search({
            must: _data.must,
            mustNot: _data.mustNot,
            should: _data.should,
            page: _data.page,
            limit: _data.limit,
            siteId: _data.siteId,
            date: _data.date
        });
        $fn.response.success(res, {total: result.total, data: result.result, limit: _data.limit});
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API GET DETAIL ARTICLE, replace id = ObjectId; egs: 7ee18932-0b06-47f2-9266-408bd4f62148
 * @route GET /api/article/7ee18932-0b06-47f2-9266-408bd4f62148
 * @group Article - Operations about Article
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const getDetail = async (req, res, next) => {

    try {
        let _data = _.pick(req.params, ['id']);
        const [err, article] = await $fn.helpers.wait($fn.article.getInfo({
            id: _data.id,
            include: true
        }));
        if (err) return $fn.response.serverError(res, err);
        if (!article || !article.id) return $fn.response.notFound(res, configs.text.common.notFoundArticle);
        $fn.response.success(res, article);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};

/**
 * API GET TOTAL ARTICLE
 * @route POST /api/article/count/total
 * @group Article - Operations about Article
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const getCountArticle = async (req, res, next) => {

    try {
        let _data = _.pick(req.body, [
            'condition'
        ]);

        const [err, article] = await $fn.helpers.wait($fn.article.count(_data.condition));
        if (err) return $fn.response.serverError(res, err);
        $fn.response.success(res, {count: article});
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};
