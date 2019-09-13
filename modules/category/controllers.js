import $fn from '../functions';
import configs from '../../config';
import _ from 'lodash';


/**
 * API REGISTER CATEGORY
 * @route POST /api/category
 * @group Category - Operations about Category
 * @param {string} param.body.required - {"name":"category",'type':"0||1"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const add = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'name',
            'type',
        ]);
        if (!_data.name) return $fn.response.clientError(res);
        let [error, create] = await $fn.helpers.wait($fn.category.create({
            name: _data.name,
            slug: $fn.helpers.slugify(_data.name),
            type: 0
        }));
        if (error) return $fn.response.serverError(res, error);
        $fn.response.success(res, create);
    } catch (e) {
        console.log(e);
        return $fn.response.serverError(res, e);
    }
};


/**
 * API GET CATEGORY
 * @route GET /api/category
 * @group Category - Operations about Category
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const get = async (req, res, next) => {

    try {
        const filters = $fn.helpers.parseParams(req);
        let dataCount = await $fn.category.count({
            deletedAt: filters.deletedAt,
            paranoid: filters.paranoid,
            where: {...filters.where}
        });
        let result = await $fn.category.get({
            where: {...filters.where},
            page: filters.page,
            limit: filters.limit,
            sort: filters.sort,
            fields: ['id',
                'name',
                'slug',
                'type',
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
 * API GET DETAIL CATEGORY, replace id = ObjectId; egs: 7ee18932-0b06-47f2-9266-408bd4f62148
 * @route GET /api/category/7ee18932-0b06-47f2-9266-408bd4f62148
 * @group Category - Operations about Category
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const getDetail = async (req, res, next) => {

    try {
        let _data = _.pick(req.params, ['id']);
        const [err, category] = await $fn.helpers.wait($fn.category.getInfo({
            id: _data.id
        }));
        if (!category || !category.id) return $fn.response.notFound(res, configs.text.common.notFoundCategory);
        if (err) return $fn.response.serverError(res);
        $fn.response.success(res, category);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API UPDATE CATEGORY
 * @route POST /api/category/update
 * @group Category - Operations about Category
 * @param {string} param.body.required - {"name":"xxxx","status":1,"type":0}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const update = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id',
            'name',
            'type',
            'status'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        if (!req.user) return $fn.response.authenticateError(res);
        if (!_data) return $fn.response.clientError(res);
        let getCheck = await $fn.category.getInfo(_data);
        if (!getCheck) return $fn.response.notFound(res, configs.text.common.notFoundCategory);
        if (getCheck.name === _data.name) delete _data.name;
        if (_data.name) _data.slug = $fn.helpers.slugify(_data.name)
        await $fn.category.update(_data, _data.id);
        let updateNetwork = await $fn.category.getInfo(_data);
        $fn.response.success(res, updateNetwork);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};

/**
 * API DELETE CATEGORY
 * @route POST /api/category/delete
 * @group Category - Operations about Category
 * @param {string} param.body.required - {"id":"7ee18932-0b06-47f2-9266-408bd4f62148"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const deleteCategory = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        const [err, category] = await $fn.helpers.wait($fn.category.deleteCategory(_data.id));
        if (err) return $fn.response.serverError(res);
        if (!category) return $fn.response.notFound(res, configs.text.common.notFoundCategory);
        $fn.response.success(res, true);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};

/**
 * API DELETE CATEGORY
 * @route POST /api/category/restore
 * @group Category - Operations about Category
 * @param {string} param.body.required - {"id":"7ee18932-0b06-47f2-9266-408bd4f62148"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const restoreCategory = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        const [err, category] = await $fn.helpers.wait($fn.category.restoreCategory(_data.id));
        if (err) return $fn.response.serverError(res);
        if (!category) return $fn.response.notFound(res, configs.text.common.notFoundCategory);
        $fn.response.success(res, category);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};
