import _ from 'lodash';
import $fn from '../functions';
import configs from '../../config';


/**
 * API REGISTER SITE
 * @route POST /api/site
 * @group Site - Operations about Site
 * @param {string} param.body.required - {"name":"vnexpress","shortName":"VNE"
 * "domSpecial":{"group":"main.content","subgroup":"article.post","title":"h2.entry-title > a","thumbnail":".post-image.entry-image","description":".entry-content > p","url":"h2.entry-title > a"},
 * "domList":{"group":"main.content","subgroup":"article.post","title":"h2.entry-title > a","thumbnail":".post-image.entry-image","description":".entry-content > p","url":"h2.entry-title > a"},
 * "domDetail":{"group":"main.content","subgroup":"article.post","title":"h2.entry-title > a","thumbnail":".post-image.entry-image","description":".entry-content > p","url":"h2.entry-title > a"}}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const add = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'name',
            'shortName',
            'domSpecial',
            'domList',
            'domDetail',
            'groupId',
            'categoryId',
            'url'
        ]);

        _data.url = _data.url.match("(^(?:(?:.*?)?//)?[^/?#;]*)")[1];
        if (!_data.name || !_data.shortName || !_data.url) return $fn.response.clientError(res);
        let [error, create] = await $fn.helpers.wait($fn.site.create({
            name: _data.name,
            slug: $fn.helpers.slugify(_data.name),
            url: _data.url,
            creator: req.user.id,
            shortName: _data.shortName,
            domDetail: JSON.stringify(_data.domDetail),
            domSpecial: JSON.stringify(_data.domSpecial),
            domList: JSON.stringify(_data.domList),
        }));
        if (create) {
            if (_data.groupId) {
                await $fn.site.deleteSiteGroup(create.id);
                await $fn.site.createSiteGroup({
                    groupId: _data.groupId,
                    siteId: create.id
                });
            }
            if (_data.categoryId) {
                await $fn.site.deleteCategory(create.id);
                await $fn.site.createSiteCategory({
                    categoryId: _data.categoryId,
                    siteId: create.id
                });
            }
        }

        if (error) return $fn.response.serverError(res, error);
        $fn.response.success(res, create);
    } catch (e) {
        console.log(e);
        return $fn.response.serverError(res, e);
    }
};


/**
 * API GET SITE
 * @route GET /api/site
 * @group Site - Operations about Site
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const get = async (req, res, next) => {

    try {
        const filters = $fn.helpers.parseParams(req);
        let dataCount = await $fn.site.count({
            deletedAt: filters.deletedAt,
            paranoid: filters.paranoid,
            where: {...filters.where},
            include: filters.include,
        });
        let result = await $fn.site.get({
            where: {...filters.where},
            page: filters.page,
            limit: filters.limit,
            sort: filters.sort,
            include: filters.include,
            fields: [
                'id',
                'name',
                'slug',
                'url',
                'shortName',
                'status',
                'createdAt',
                'updatedAt',
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
 * API GET DETAIL SITE, replace id = ObjectId; egs: 7ee18932-0b06-47f2-9266-408bd4f62148
 * @route GET /api/site/7ee18932-0b06-47f2-9266-408bd4f62148
 * @group Site - Operations about Site
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const getDetail = async (req, res, next) => {

    try {
        let _data = _.pick(req.params, ['id']);
        const [err, site] = await $fn.helpers.wait($fn.site.getInfo({
            id: _data.id,
            attributes: [
                'id',
                'name',
                'slug',
                'url',
                'shortName',
                'domSpecial',
                'domList',
                'domDetail',
                'status',
                'createdAt',
                'updatedAt',
                'deletedAt'
            ]
        }));
        if (!site || !site.id) return $fn.response.notFound(res, configs.text.common.notFoundSite);
        if (err) return $fn.response.serverError(res);
        $fn.response.success(res, site);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API UPDATE SITE
 * @route POST /api/site/update
 * @group Site - Operations about Site
 * @param {string} param.body.required - {"name":"xxxx","status":1,"shortName":"vne"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const update = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id',
            'name',
            'url',
            'domSpecial',
            'groupId',
            'categoryId',
            'domList',
            'domDetail',
            'shortName',
            'status'
        ]);

        _data.url = _data.url.match("(^(?:(?:.*?)?//)?[^/?#;]*)")[1];
        if (!_data.id) return $fn.response.clientError(res);
        let getCheck = await $fn.site.getInfo(_data);
        if (!getCheck) return $fn.response.notFound(res, configs.text.common.notFoundSite);
        if (getCheck.name === _data.name) delete _data.name;
        if (_data.name) _data.slug = $fn.helpers.slugify(_data.name);
        if (_data.domDetail) _data.domDetail = JSON.stringify(_data.domDetail);
        if (_data.domList) _data.domList = JSON.stringify(_data.domList);
        if (_data.domSpecial) _data.domSpecial = JSON.stringify(_data.domSpecial);
        const [errUpdate, update] = await $fn.helpers.wait($fn.site.update(_data, _data.id));
        if (errUpdate) return $fn.response.serverError(res, errUpdate);
        let info = await $fn.site.getInfo(_data);
        if (info) {
            if (_data.groupId) {
                await $fn.site.deleteSiteGroup(_data.id);
                await $fn.site.createSiteGroup({
                    groupId: _data.groupId,
                    siteId: _data.id
                });
            }

            if (_data.categoryId) {
                await $fn.site.deleteCategory(_data.id);
                await $fn.site.createSiteCategory({
                    categoryId: _data.categoryId,
                    siteId: _data.id
                });
            }
        }
        $fn.response.success(res, info);
    } catch (e) {
        console.log(e);
        return $fn.response.serverError(res, e);
    }
};

/**
 * API DELETE SITE
 * @route POST /api/site/delete
 * @group Site - Operations about Site
 * @param {string} param.body.required - {"id":"7ee18932-0b06-47f2-9266-408bd4f62148"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const deleteSite = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        const [err, campaign] = await $fn.helpers.wait($fn.site.deleteSite(_data.id));
        if (err) return $fn.response.serverError(res);
        if (!campaign) return $fn.response.notFound(res, configs.text.common.notFoundSite);
        $fn.response.success(res, true);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};

/**
 * API DELETE SITE
 * @route POST /api/site/restore
 * @group Site - Operations about Site
 * @param {string} param.body.required - {"id":"7ee18932-0b06-47f2-9266-408bd4f62148"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const restoreSite = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        const [err, campaign] = await $fn.helpers.wait($fn.site.restoreSite(_data.id));
        if (err) return $fn.response.serverError(res);
        if (!campaign) return $fn.response.notFound(res, configs.text.common.notFoundSite);
        $fn.response.success(res, campaign);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};
