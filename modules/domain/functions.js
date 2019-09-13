'use strict';
import DB from '../../library/database/mysql/index';
import moment from 'moment';

const get = (_data) => {
    const page = _data.page;
    const limit = _data.limit;
    let offset = limit * (page - 1);
    return DB.Domains.findAll({
        paranoid: _data.paranoid ? false : null,
        where: _data.deletedAt ? {deletedAt: {$not: null}} : _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order: _data.sort,
        include: [{
            required: false,
            model: DB.Sites,
            as: 'site',
            where: {status: 1}
        }],
    });
};

const getDomainCrawler = async (_delayTime) => {
    const data = DB.Domains.findAll({
        where: {
            status: 1,
            $and: DB.Sequelize.where(DB.Sequelize.fn('date_add', DB.Sequelize.col('requestAt'), DB.Sequelize.literal(`INTERVAL Domains.delay MINUTE`)), {
                $lte: moment().format('YYYY-MM-DD HH:mm:ss')
            })
        },
        include: [{
            required: false,
            model: DB.Sites,
            as: 'site',
            where: {status: 1}
        }]
    });
    return data.map((node) => node.get({plain: true}));
};


const getInfo = async (_data) => {
    if (!_data.include) return await DB.Domains.findOne({
        where: {id: _data.id},
    });

    return await DB.Domains.findOne({
        where: {id: _data.id},
        include: [{
            required: false,
            model: DB.Sites,
            as: 'site',
            where: {status: 1}
        }],
    });
};

const update = async (_data) => {
    return DB.Domains.update(_data, {
        where: {
            id: _data.id
        }
    });
};

const deleteDomain = async (_id) => {
    return await DB.Domains.destroy({
        where: {
            id: _id
        }
    });
};

const restoreDomain = async (_id) => {
    const category = await DB.Domains.findOne({
        where: {id: _id},
        paranoid: false
    });
    return await category.restore();
};

const create = async (_data) => {
    return await DB.Domains.create(_data);
};

const count = async (_data) => {
    return DB.Domains.count(
        {
            paranoid: _data.paranoid ? false : null,
            where: _data.deletedAt ? {deletedAt: {$not: null}} : _data.where
        },
    );
};

const pagingNetworkByUser = async (_data) => {
    const page = _data.page;
    const limit = _data.limit;
    let offset = limit * (page - 1);
    return DB.Domains.findAll({
        where: _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order: _data.sort,
    });
};


export {
    deleteDomain,
    update,
    getInfo,
    create,
    restoreDomain,
    get,
    getDomainCrawler,
    count
};
