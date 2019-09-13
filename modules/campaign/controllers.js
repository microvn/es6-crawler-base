import _ from 'lodash';
import $fn from '../functions';
import configs from '../../config';


/**
 * API REGISTER CAMPAIGN
 * @route POST /api/campaign
 * @group Campaign - Operations about Campaign
 * @param {string} param.body.required - {"name":"category",'description':"Test","must":"","mustNot":"","should":""}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const add = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'name',
            'description',
            'must',
            'mustNot',
            'should',
            'userId'
        ]);
        if (!_data.name || !_data.description) return $fn.response.clientError(res);
        let [error, create] = await $fn.helpers.wait($fn.campaign.create({
            name: _data.name,
            slug: $fn.helpers.slugify(_data.name),
            description: _data.description,
            must: _data.must,
            mustNot: _data.mustNot,
            should: _data.should
        }));
        if (error) return $fn.response.serverError(res, error);
        if (create) {
            if (_data.userId) {
                await $fn.campaign.deleteCampaignUser(create.id);
                await $fn.campaign.createCampaignUser({
                    userId: _data.userId,
                    campaignId: create.id
                });
            }
        }
        $fn.response.success(res, create);
    } catch (e) {
        console.log(e);
        return $fn.response.serverError(res, e);
    }
};


/**
 * API GET CAMPAIGN
 * @route GET /api/campaign
 * @group Campaign - Operations about Campaign
 * * @param {string} param.body.required -
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const get = async (req, res, next) => {
    try {
        const filters = $fn.helpers.parseParams(req);
        let result = [];
        let dataCount = await $fn.campaign.count({
            deletedAt: filters.deletedAt,
            paranoid: filters.paranoid,
            where: {...filters.where},
            user: req.user,
        });
        if (dataCount > 0) {
            result = await $fn.campaign.get({
                where: {...filters.where},
                page: filters.page,
                limit: filters.limit,
                sort: filters.sort,
                user: req.user,
                fields: [
                    'id',
                    'name',
                    'slug',
                    'description',
                    'status',
                    'must',
                    'createdAt',
                    'updatedAt',
                    'deletedAt'
                ],
                deletedAt: filters.deletedAt,
                paranoid: filters.paranoid
            });
        }
        $fn.response.success(res, {total: dataCount, data: result, limit: filters.limit});
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API GET DETAIL CAMPAIGN, replace id = ObjectId; egs: 7ee18932-0b06-47f2-9266-408bd4f62148
 * @route GET /api/campaign/7ee18932-0b06-47f2-9266-408bd4f62148
 * @group Campaign - Operations about Campaign
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const getDetail = async (req, res, next) => {
    try {
        let _data = _.pick(req.params, ['id']);
        const [err, campaign] = await $fn.helpers.wait($fn.campaign.getInfo({
            id: _data.id,
            user: req.user
        }, [
            'id',
            'name',
            'slug',
            'description',
            'status',
            'must',
            'mustNot',
            'should'
        ]));
        if (!campaign || !campaign.id) return $fn.response.notFound(res, configs.text.common.notFoundCampaign);
        if (err) return $fn.response.serverError(res);
        $fn.response.success(res, campaign);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API UPDATE CAMPAIGN
 * @route POST /api/campaign/update
 * @group Campaign - Operations about Campaign
 * @param {string} param.body.required - {"name":"xxxx","status":1,"type":0,"must":"","mustNot":"","should":""}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const update = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id',
            'name',
            'type',
            'status',
            'must',
            'mustNot',
            'should',
            'userId'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        let getCheck = await $fn.campaign.getInfo(_data, [
            'id',
            'name'
        ]);
        if (!getCheck) return $fn.response.notFound(res, configs.text.common.notFoundCampaign);
        if (getCheck.name === _data.name) delete _data.name;
        if (_data.name) _data.slug = $fn.helpers.slugify(_data.name);
        await $fn.campaign.update(_data, _data.id);
        let info = await $fn.campaign.getInfo(_data, [
            'id',
            'name'
        ]);
        if (info) {
            if (_data.userId) {
                await $fn.campaign.deleteCampaignUser(_data.id);
                await $fn.campaign.createCampaignUser({
                    userId: _data.userId,
                    campaignId: _data.id
                });
            }
        }
        $fn.response.success(res, info);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};

/**
 * API DELETE CAMPAIGN
 * @route POST /api/campaign/delete
 * @group Campaign - Operations about Campaign
 * @param {string} param.body.required - {"id":"7ee18932-0b06-47f2-9266-408bd4f62148"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const deleteCampaign = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        const [err, campaign] = await $fn.helpers.wait($fn.campaign.deleteCampaign(_data.id));
        if (err) return $fn.response.serverError(res);
        if (!campaign) return $fn.response.notFound(res, configs.text.common.notFoundCampaign);
        $fn.response.success(res, true);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};

/**
 * API DELETE CAMPAIGN
 * @route POST /api/campaign/restore
 * @group Campaign - Operations about Campaign
 * @param {string} param.body.required - {"id":"7ee18932-0b06-47f2-9266-408bd4f62148"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const restoreCampaign = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        const [err, campaign] = await $fn.helpers.wait($fn.campaign.restoreCampaign(_data.id));
        if (err) return $fn.response.serverError(res);
        if (!campaign) return $fn.response.notFound(res, configs.text.common.notFoundCampaign);
        $fn.response.success(res, campaign);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};
