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
    return DB.Category.findAll({
        paranoid: _data.paranoid ? false : null,
        where: _data.deletedAt ? { deletedAt: {$not:null} } : _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order: _data.sort,
        raw: true,
    });
};

const getInfo = async (_data, _column = ['*'], _filter = true) => {
    const data = await DB.Category.findOne({
        where: {id: _data.id},
        attributes: _column,
        raw: true,
    });
    if (!_filter) return data;
    return data;
};

const update = async (_data) => {
    return DB.Category.update(_data, {
        where: {
            id: _data.id
        },
        returning: true, plain: true
    });
};

const deleteCategory = async (_id) => {
    return await DB.Category.destroy({
        where: {
            id: _id
        }
    });
};

const restoreCategory = async (_id) => {
    const category = await DB.Category.findOne({
        where: {id: _id},
        paranoid: false
    });
    return await category.restore();
};

const create = async (_data) => {
    return await DB.Category.create(_data);
};

const pagingNetworkByUser = async (_data) => {
    const page = _data.page;
    const limit = _data.limit;
    let offset = limit * (page - 1);
    return DB.Category.findAll({
        where: _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order:  _data.sort,
    });
};
const count = async (_data) => {
    return DB.Category.count(
        {
            paranoid: _data.paranoid ? false : null,
            where: _data.deletedAt ? { deletedAt: {$not:null} } : _data.where
        },
    );
};


export {
    deleteCategory,
    update,
    getInfo,
    create,
    restoreCategory,
    get,
    count
};
