import $fn from '../functions';
import _ from 'lodash';
import fs from 'fs';
import request from 'request-promise';
import csv from 'fast-csv';
import TikTokAPI, {getRequestParams} from 'tiktok-api';
import configs from '../../config';
import * as articleFunctions from "../article/functions";
import * as helpers from "../helper/helper";

/**
 * API GET USER FROM TOKEN
 * @route GET /api/auth/me
 * @group Auth - Operations about Authentication
 * @security JWT
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 */
export const me = async (req, res, next) => {
    const _data = _.pick(req.body, ['email', 'password']);
    let options = Object.assign(configs.social.facebook.apps.android, {
        email: _data.email,
        password: _data.password,
    });
    console.log(options);
    await $fn.social.getToken(options);
    $fn.response.success(res, req.user);
};

/**
 * API GET VERIFY CODE FOR PHONE
 * @route POST /api/auth/code/phone
 * @group Auth - Operations about Authentication
 * @param {string} param.body.required - {"phoneNumber":"0800 037022","areaCode":"+84"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const getCode = async (req, res, next) => {
    try {
        const _data = _.pick(req.body, ['phoneNumber', 'areaCode']);
        if (!_data.phoneNumber || !_data.areaCode) return $fn.response.clientError(res);
        if (configs.sms.enable === 'true') await $fn.library.sms.getCode(_data);
        return $fn.response.success(res, true);
    } catch (e) {
        return $fn.response.serverError(res, e);
    }
};
