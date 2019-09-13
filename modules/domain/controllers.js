import _ from 'lodash';
import $fn from '../functions';
import configs from '../../config';
import moment from "moment";


/**
 * API REGISTER DOMAIN
 * @route POST /api/domain
 * @group Domain - Operations about Domain
 * @param {string} param.body.required - {"name":"vnexpress","siteId":"2753ed9d-ace7-47af-9e60-0bbbcc4d9e2c",
 * "ovDomSpecial":{"group":"main.content","subgroup":"article.post","title":"h2.entry-title > a","thumbnail":".post-image.entry-image","description":".entry-content > p","url":"h2.entry-title > a"},
 * "ovDomList":{"group":"main.content","subgroup":"article.post","title":"h2.entry-title > a","thumbnail":".post-image.entry-image","description":".entry-content > p","url":"h2.entry-title > a"},
 * "ovDomDetail":{"group":"main.content","subgroup":"article.post","title":"h2.entry-title > a","thumbnail":".post-image.entry-image","description":".entry-content > p","url":"h2.entry-title > a"},
 * "currentPage":1,"maxPage":1,"lastPage":1,"url":"http://vnexpress.vn","delay":30,"requestAt":"2019-07-02 00:00:00"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const add = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'name',
            'siteId',
            'url',
            'ovDomDetail',
            'ovDomList',
            'ovDomSpecial',
            'currentPage',
            'isAjax',
            'isErrorCrawler',
            'maxPage',
            'lastPage',
            'requestAt',
            'delay'
        ]);
        if (!_data.name || !_data.siteId || !_data.url || !_data.currentPage || !_data.maxPage || !_data.lastPage) return $fn.response.clientError(res);
        const [err, site] = await $fn.helpers.wait($fn.site.getInfo({
            id: _data.siteId
        }));
        if (!site || !site.id) return $fn.response.notFound(res, configs.text.common.notFoundSite);
        let [error, create] = await $fn.helpers.wait($fn.domain.create({
            name: _data.name,
            slug: $fn.helpers.slugify(_data.name),
            siteId: _data.siteId,
            currentPage: _data.currentPage,
            ovDomDetail: JSON.stringify(_data.ovDomDetail),
            ovDomSpecial: JSON.stringify(_data.ovDomSpecial),
            ovDomList: JSON.stringify(_data.ovDomList),
            maxPage: _data.maxPage,
            lastPage: _data.lastPage,
            url: _data.url,
            isAjax: _data.isAjax,
            isErrorCrawler: _data.isErrorCrawler,
            creator: req.user.id,
            requestAt:moment().format('YYYY-MM-DD hh:mm:ss')
        }));
        if (error) return $fn.response.serverError(res, error);
        $fn.response.success(res, create);
    } catch (e) {
        console.log(e);
        return $fn.response.serverError(res, e);
    }
};


/**
 * API GET DOMAIN
 * @route GET /api/domain
 * @group Domain - Operations about Domain
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const get = async (req, res, next) => {

    try {
        const filters = $fn.helpers.parseParams(req);
        let result = [];
        let dataCount = await $fn.domain.count({
            deletedAt: filters.deletedAt,
            paranoid: filters.paranoid,
            where: {...filters.where}
        });
        result = await $fn.domain.get({
            where: {...filters.where},
            page: filters.page,
            limit: filters.limit,
            sort: filters.sort,
            include: true,
            fields: [
                'id',
                'name',
                'slug',
                'ovDomList',
                'ovDomSpecial',
                'ovDomDetail',
                'status',
                'createdAt',
                'updatedAt',
                'type',
                'status',
                'siteId',
                'url',
                'isAjax',
                'isErrorCrawler',
                'currentPage',
                'maxPage',
                'lastPage',
                'delay',
                'deletedAt'
            ],
            deletedAt: filters.deletedAt,
            paranoid: filters.paranoid
        });
        $fn.response.success(res, {total: dataCount, data: result, limit: filters.limit});
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API GET DETAIL DOMAIN, replace id = ObjectId; egs: 7ee18932-0b06-47f2-9266-408bd4f62148
 * @route GET /api/domain/7ee18932-0b06-47f2-9266-408bd4f62148
 * @group Domain - Operations about Domain
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const getDetail = async (req, res, next) => {

    try {
        let _data = _.pick(req.params, ['id']);
        const [err, domain] = await $fn.helpers.wait($fn.domain.getInfo({
            id: _data.id,
            include: true
        }));
        if (!domain || !domain.id) return $fn.response.notFound(res, configs.text.common.notFoundDomain);
        if (err) return $fn.response.serverError(res);
        $fn.response.success(res, domain);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API UPDATE DOMAIN
 * @route POST /api/domain/update
 * @group Domain - Operations about Domain
 * @param {string} param.body.required - {"name":"vnexpress","siteId":"2753ed9d-ace7-47af-9e60-0bbbcc4d9e2c",
 * "ovDomSpecial":{"group":"main.content","subgroup":"article.post","title":"h2.entry-title > a","thumbnail":".post-image.entry-image","description":".entry-content > p","url":"h2.entry-title > a"},
 * "ovDomList":{"group":"main.content","subgroup":"article.post","title":"h2.entry-title > a","thumbnail":".post-image.entry-image","description":".entry-content > p","url":"h2.entry-title > a"},
 * "ovDomDetail":{"group":"main.content","subgroup":"article.post","title":"h2.entry-title > a","thumbnail":".post-image.entry-image","description":".entry-content > p","url":"h2.entry-title > a"},
 * "currentPage":1,"maxPage":1,"lastPage":1,"url":"http://vnexpress.vn","type":1,"status":1,"id":"ab23cb47-5c95-4584-a4af-c8ec3f57a477","delay":30}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const update = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id',
            'name',
            'siteId',
            'url',
            'ovDomDetail',
            'ovDomList',
            'ovDomSpecial',
            'currentPage',
            'isAjax',
            'isErrorCrawler',
            'maxPage',
            'lastPage',
            'status',
            'type',
            'delay'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        let getCheck = await $fn.domain.getInfo(_data);
        if (!getCheck) return $fn.response.notFound(res, configs.text.common.notFoundDomain);
        if (getCheck.name === _data.name) delete _data.name;
        if (_data.siteId) {
            const [err, site] = await $fn.helpers.wait($fn.site.getInfo({
                id: _data.siteId
            }));
            if (!site || !site.id) return $fn.response.notFound(res, configs.text.common.notFoundSite);
        }
        if (_data.name) _data.slug = $fn.helpers.slugify(_data.name);
        if (_data.ovDomDetail) _data.ovDomDetail = JSON.stringify(_data.ovDomDetail);
        if (_data.ovDomList) _data.ovDomList = JSON.stringify(_data.ovDomList);
        if (_data.ovDomSpecial) _data.ovDomSpecial = JSON.stringify(_data.ovDomSpecial);
        await $fn.domain.update(_data, _data.id);
        let update = await $fn.domain.getInfo({
            id: _data.id,
            include: false
        });
        $fn.response.success(res, update);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};

/**
 * API DELETE DOMAIN
 * @route POST /api/domain/delete
 * @group Domain - Operations about Domain
 * @param {string} param.body.required - {"id":"7ee18932-0b06-47f2-9266-408bd4f62148"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const deleteDomain = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        const [err, domain] = await $fn.helpers.wait($fn.domain.deleteDomain(_data.id));
        if (err) return $fn.response.serverError(res);
        if (!domain) return $fn.response.notFound(res, configs.text.common.notFoundDomain);
        $fn.response.success(res, true);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};

/**
 * API DELETE DOMAIN
 * @route POST /api/domain/restore
 * @group Domain - Operations about Domain
 * @param {string} param.body.required - {"id":"7ee18932-0b06-47f2-9266-408bd4f62148"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const restoreDomain = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        const [err, domain] = await $fn.helpers.wait($fn.domain.restoreDomain(_data.id));
        if (err) return $fn.response.serverError(res);
        if (!domain) return $fn.response.notFound(res, configs.text.common.notFoundDomain);
        $fn.response.success(res, domain);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};
