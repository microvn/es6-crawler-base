'use strict';
import DB from '../../library/database/mysql/index';

const get = (_data) => {
    const page = _data.page;
    const limit = _data.limit;
    let offset = limit * (page - 1);
    let query = {
        paranoid: _data.paranoid ? false : null,
        where: _data.deletedAt ? {deletedAt: {$not: null}} : _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order: _data.sort,
        raw:true
    };
    if (_data.user && _data.user.type === 0) {
        query.include = [
            {
                model: DB.CampaignUser,
                include: [
                    {
                        model: DB.Users,
                        require: false,
                        as: 'user',
                        where: {
                            id: _data.user.id
                        },
                        attributes: [
                            'id',
                            'name',
                            'username',
                            'status'
                        ]
                    }
                ]
            }
        ]
    }

    return DB.Campaigns.findAll(query);
};

const getInfo = async (_data, _column = ['*']) => {
    let query = {
        where: {id: _data.id},
        attributes: _column,
    };

    if (_data.user) {
        query.include = [
            {
                model: DB.CampaignUser,
                required: !!_data.user.type === 0,
                include: [
                    {
                        model: DB.Users,
                        as: 'user',
                        where: _data.user.type === 0 ? {
                            id: _data.user.id
                        } : {},
                        attributes: [
                            'id',
                            'name',
                            'username',
                            'status'
                        ]
                    }
                ]
            }
        ];
    }

    const data = await DB.Campaigns.findOne(query);
    return data;
};

const update = async (_data) => {
    return DB.Campaigns.update(_data, {
        where: {
            id: _data.id
        },
        returning: true, plain: true
    });
};

const deleteCampaign = async (_id) => {
    return await DB.Campaigns.destroy({
        where: {
            id: _id
        }
    });
};


const createCampaignUser = async (_data) => {
    let array = [];
    _data.userId.forEach((item) => {
        let create = DB.CampaignUser.create({
            userId: item,
            campaignId: _data.campaignId
        });
        array.push(create);
    });
    return Promise.all(array);
};


const deleteCampaignUser = async (_data) => {
    return await DB.CampaignUser.destroy({
        where: {
            campaignId: _data
        }
    });
};

const restoreCampaign = async (_id) => {
    const category = await DB.Campaigns.findOne({
        where: {id: _id},
        paranoid: false
    });
    return await category.restore();
};

const create = async (_data) => {
    return await DB.Campaigns.create(_data);
};

const count = async (_data) => {
    let filter = {
        paranoid: _data.paranoid ? false : null,
        where: _data.deletedAt ? {deletedAt: {$not: null}} : _data.where,
    };
    if (_data.user && _data.user.type === 0) {
        filter.include = [
            {
                model: DB.CampaignUser,
                required: true,
                include: [
                    {
                        model: DB.Users,
                        as: 'user',
                        where: {
                            id: _data.user.id
                        },
                        attributes: [
                            'id',
                            'name',
                            'username',
                            'status'
                        ]
                    }
                ]
            }
        ]
    }
    return DB.Campaigns.count(
        filter
    );
};


export {
    deleteCampaign,
    update,
    getInfo,
    create,
    restoreCampaign,
    get,
    count,
    deleteCampaignUser,
    createCampaignUser
};
