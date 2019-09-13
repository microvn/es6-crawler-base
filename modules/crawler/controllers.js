import $fn from '../functions';
import configs from '../../config';
import es from '../../library/database/elasticsearch';
import _ from 'lodash';
import * as ChildProcess from 'child-process-promise';
import moment from "moment";
import * as articleFunctions from "../article/functions";
import * as helpers from "../helper/helper";
import {deleteError} from "./functions";


/**
 * API REGISTER NETWORK
 * @route POST /api/crawler/test
 * @group User - Operations about User
 * @param {string} param.body.required - {"email":"email@domain.com","password":"",'type':"facebook|google|instagram"}
 * @returns {object} 200 - true/false
 * @returns {Error}  default - Unexpected error
 */
export const crawler = async (req, res, next) => {
    try {
        let _data = _.pick(req.body, [
            'email',
            'password',
            'type',
        ]);

        let array = [];
        return $fn.response.success(res, 2)
    } catch (e) {
        console.log(e);
        return $fn.response.serverError(res, e);
    }
};
