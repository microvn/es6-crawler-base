import $fn from '../functions';
import configs from '../../config';
import _ from 'lodash';


/**
 * API CHECK REGISTER USER
 * @route POST /api/user/check
 * @group User - Operations about User
 * @param {string} param.body.required - {"email":"email@domain.com","phoneNumber":"0394263910","areaCode":""}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const check = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'email',
            'phoneNumber',
        ]);
        if (!_data.email || !_data.phoneNumber || !$fn.helpers.isEmail(_data.email)) return $fn.response.clientError(res);
        const [errEmail, isEmail] = await $fn.helpers.wait($fn.user.getEmail(_data.email, ['id']));
        if (isEmail) return $fn.response.serverError(res, configs.text.common.emailExist);
        const [errPhone, isPhone] = await $fn.helpers.wait($fn.user.getPhone(_data.phoneNumber, ['id']));
        if (isPhone) return $fn.response.serverError(res, configs.text.common.phoneExist);
        if (errEmail || errPhone) return $fn.response.serverError(res);
        $fn.response.success(res, true);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};

/**
 * API GET USERS
 * @route GET /api/user
 * @group User - Operations about User
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const get = async (req, res, next) => {

    try {
        const filters = $fn.helpers.parseParams(req);
        let result = [];
        let dataCount = await $fn.user.count({
            deletedAt: filters.deletedAt,
            paranoid: filters.paranoid,
            where: {...filters.where}
        });
        if (dataCount > 0) {
            result = await $fn.user.get({
                where: {...filters.where},
                page: filters.page,
                limit: filters.limit,
                sort: filters.sort,
                fields: ['id',
                    'username',
                    'name',
                    'email',
                    'status',
                    'type',
                    'thumbnail',
                    'lastLogin',
                    'createdAt',
                    'updatedAt',
                    'deletedAt'],
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
 * API GET DETAIL USER, replace id = ObjectId; egs: 5cd258ca8145c92f316beb7d
 * @route GET /api/user/5cd258ca8145c92f316beb7d
 * @group User - Operations about User
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const getDetail = async (req, res, next) => {
    try {
        let _data = _.pick(req.params, ['id']);
        const [err, user] = await $fn.helpers.wait($fn.user.getInfo(_data.id));
        if (!user || !user.id) return $fn.response.clientError(res, configs.text.common.notFoundUser);
        if (err) return $fn.response.serverError(res);
        delete user.password;
        $fn.response.success(res, user);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};

/**
 * API ADD USER
 * @route POST /api/user/add
 * @group User - Operations about User
 * @param {string} param.body.required - {"name":"xxxx","email":"email@domain.com","password":"xxx","isGetToken":false}
 * @returns {object} 200 - Object
 * @returns {Error}  default - Unexpected error
 */
export const add = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'name',
            'username',
            'password',
            'email',
            'isGetToken',
            'status',
            'type',
        ]);
        if (!_data.name || !_data.username || !_data.email || !_data.password) return $fn.response.clientError(res);
        let [err, user] = await $fn.helpers.wait($fn.user.create(_data));
        if (err) return $fn.response.serverError(res, err);
        if (Boolean(_data.isGetToken)) {
            user = user.toJSON();
            user.token = $fn.user.generateToken(user.id);
        }
        $fn.response.success(res, user);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API UPDATE USER
 * @route POST /api/user/update
 * @group User - Operations about User
 * @param {string} param.body.required - {"name":"xxxx","username":"xxxx","password" :"xxxx","email":"email@domain.com","cover":"/zdata/guideble/abc.jpg","isUpdated":"false"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const update = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id',
            'name',
            'username',
            'password',
            'email',
            'cover',
            'isUpdated',
            'status',
            'type'
        ]);
        if (!req.user) return $fn.response.authenticateError(res);
        if (!req.user.id) return $fn.response.clientError(res, configs.text.common.notFoundUser);
        if (!_data) return $fn.response.clientError(res);
        const [err, user] = await $fn.helpers.wait($fn.user.update(_data, _data.id));
        if (err) return $fn.response.serverError(res, err);
        let update = await $fn.user.getInfo(req.user.id);
        $fn.response.success(res, update);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * API LOGIN BY PHONE/EMAIL && PASSWORD
 * @route POST /api/user/login
 * @group User - Operations about User
 * @param {string} param.body.required - {password:"xxxxxx","email":"xxx"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const loginByEmail = async (req, res, next) => {
    try {
        const _data = _.pick(req.body, ['password', 'email']);
        if (!_data.email || !_data.password) return $fn.response.clientError(res);
        let [err, user] = await $fn.helpers.wait($fn.user.getEmail(_data.email));
        if (err) return $fn.response.serverError(res, err);
        if (!user) return $fn.response.notFound(res, configs.text.common.notFoundUser);
        if (!await user.validPassword(_data.password)) return $fn.response.notFound(res, configs.text.common.notMatchPassword);
        user = user.toJSON();
        user.token = $fn.user.generateToken(user.id);
        delete user.password;
        $fn.response.success(res, user);
    } catch (e) {
        console.log(e);
        return $fn.response.serverError(res, e);
    }
};


/**
 * API DELETE USER
 * @route POST /api/user/delete
 * @group Category - Operations about Category
 * @param {string} param.body.required - {"id":"7ee18932-0b06-47f2-9266-408bd4f62148"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const deleteUser = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        const [err, user] = await $fn.helpers.wait($fn.user.deleteUser(_data.id));
        if (err) return $fn.response.serverError(res);
        if (!user) return $fn.response.notFound(res, configs.text.common.notFoundUser);
        $fn.response.success(res, true);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};

/**
 * API DELETE User
 * @route POST /api/user/restore
 * @group User - Operations about User
 * @param {string} param.body.required - {"id":"7ee18932-0b06-47f2-9266-408bd4f62148"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const restoreUser = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        const [err, user] = await $fn.helpers.wait($fn.user.restoreUser(_data.id));
        if (err) return $fn.response.serverError(res);
        if (!user) return $fn.response.notFound(res, configs.text.common.notFoundUser);
        $fn.response.success(res, user);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * VERIFY && PASSWORD
 * @route POST /api/user/password/verify
 * @group User - Operations about User
 * @param {string} param.body.required - {"verifyPassword":"xxxxxx"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const verifyPassword = async (req, res, next) => {
    try {
        const _data = _.pick(req.body, ['verifyPassword']);
        if (!_data.verifyPassword) return $fn.response.clientError(res);
        let [err, user] = await $fn.helpers.wait($fn.user.getInfo(req.user._id));
        if (err) return $fn.response.serverError(res, err);
        if (!user.verifyPasswordSync(_data.verifyPassword)) return $fn.response.notFound(res, configs.text.common.notVerifyPassword);
        $fn.response.success(res, true);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};


/**
 * GET CAMPAIGN BY USER
 * @route POST /api/user/campaign
 * @group User - Operations about User
 * @param {string} param.body.required - {"id":"7ee18932-0b06-47f2-9266-408bd4f62148"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const getCampaignByUser = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'id'
        ]);
        if (!_data.id) return $fn.response.clientError(res);
        const [err, campaign] = await $fn.helpers.wait($fn.user.getCampaignByUserId(_data.id));
        if (err) return $fn.response.serverError(res);
        if (!campaign) return $fn.response.notFound(res, configs.text.common.notFoundUser);
        $fn.response.success(res, campaign);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};
