'use strict';
import jwt from 'jsonwebtoken';
import Sequelize from 'sequelize';
import configs from '../../config';
import DB from '../../library/database/mysql/index';
import request from 'request-promise';

const get = (_data) => {
    const page = _data.page;
    const limit = _data.limit;
    let offset = limit * (page - 1);
    return DB.Users.findAll({
        paranoid: _data.paranoid ? false : null,
        where: _data.deletedAt ? { deletedAt: {$not:null} } : _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order: _data.sort,
        raw: true,
    });
};

const getInfo = (_id, _column = ['*']) => {
    return DB.Users.findOne({
        where: {id: _id},
        attributes: _column,
        raw: true,
    });
};

const update = (_data, _id) => {
    return DB.Users.update(_data, {where: {id: _id}, returning: true,});
};

const deleteUser = async (_id) => {
    return await DB.Users.destroy({
        where: {
            id: _id
        }
    });
};

const restoreUser = async (_id) => {
    const user = await DB.Users.findOne({
        where: {id: _id},
        paranoid: false
    });
    return await user.restore();
};

const getCampaignByUserId = async (_id) => {
    const campaign = await DB.CampaignUser.findAll({
        where: {userId: _id},
        include: [{
            required: false,
            model: DB.Campaigns,
            as: 'campaign'
        }],
    });
    return await campaign;
};

const verify3rdParty = async (_token, _type) => {
    return await request({
        uri: 'https://datatracking.vn/api/v1/datafb/getphone?data_hovercard=%2Fajax%2Fhovercard%2Fuser.php%3Fid%3D100003389654805&client=4',
        headers: {
            'Authorization': `Bearer ${_token}`,
        },
        json: true,
        method: 'GET',
    });
};

const generateToken = (_userId) => {
    let isUpdateLogin = updateLoginAt(_userId);
    return jwt.sign({
        _id: _userId,
        type: 3,
    }, configs.jwt.key, {expiresIn: configs.jwt.expires});
};

const create = async (_data) => {
    return await DB.Users.create(_data);
};

const createBatch = (_data) => {
    return DB.Users.insertMany(_data);
};

const updateLoginAt = (_userId) => {
    return update({lastLogin: new Date()}, _userId);
};

const getEmail = (_email) => {
    return DB.Users.findOne({
        where: {email: _email}
    });
};

const getPhone = (_phone, _column = ['*']) => {
    return DB.Users.findOne({
        where: {phone: _phone},
        attributes: _column,
    });
};

const count = async (_data) => {
    return DB.Users.count(
        {
            paranoid: _data.paranoid ? false : null,
            where: _data.deletedAt ? { deletedAt: {$not:null} } : _data.where
        },
    );
};


export {
    get,
    deleteUser,
    updateLoginAt,
    update,
    getInfo,
    getEmail,
    getPhone,
    createBatch,
    create,
    generateToken,
    verify3rdParty,
    restoreUser,
    count,
    getCampaignByUserId
};
