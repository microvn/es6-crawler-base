'use strict';
import DB from '../../library/database/mysql/index';

const get = (_data) => {
    const page = _data.page;
    const limit = _data.limit;
    let offset = limit * (page - 1);
    let filter = {
        paranoid: _data.paranoid ? false : null,
        where: _data.deletedAt ? {deletedAt: {$not: null}} : _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order: _data.sort,
    };
    if (_data.include && _data.include.where) {
        filter.include = [
            {
                model: DB.SiteGroup,
                required: false,
                include: [
                    {
                        model: DB.Group,
                        as: 'group',
                        where: _data.include.where,
                        attributes: [
                            'id',
                            'name',
                            'slug',
                            'status'
                        ]
                    }
                ]
            }
        ]
    }
    return DB.Sites.findAll(filter);
};

const getInfo = async (_data, _filter = true) => {
    const data = await DB.Sites.findOne({
        where: {id: _data.id},
        attributes: _data.attributes,
        include: [
            {
                model: DB.SiteGroup,
                include: [
                    {
                        model: DB.Group,
                        as: 'group',
                        attributes: [
                            'id',
                            'name',
                            'slug',
                            'status'
                        ]
                    }
                ]
            },
            {
                model: DB.SiteCategory,
                include: [
                    {
                        model: DB.Category,
                        as: 'category',
                        attributes: [
                            'id',
                            'name',
                            'slug',
                            'status'
                        ]
                    }
                ]
            }
        ]
    });
    return data;
};

const update = async (_data) => {
    return DB.Sites.update(_data, {
        where: {
            id: _data.id
        },
        returning: true, plain: true
    });
};

const deleteSite = async (_id) => {
    return await DB.Sites.destroy({
        where: {
            id: _id
        }
    });
};

const restoreSite = async (_id) => {
    const category = await DB.Sites.findOne({
        where: {id: _id},
        paranoid: false
    });
    return await category.restore();
};

const create = async (_data) => {
    return await DB.Sites.create(_data);
};

const createSiteGroup = async (_data) => {
    let array = [];
    _data.groupId.forEach((item) => {
        let create = DB.SiteGroup.create({
            groupId: item,
            siteId: _data.siteId
        });
        array.push(create);
    });
    return Promise.all(array);
};


const createSiteCategory = async (_data) => {
    let array = [];
    _data.categoryId.forEach((item) => {
        let create = DB.SiteCategory.create({
            categoryId: item,
            siteId: _data.siteId
        });
        array.push(create);
    });
    return Promise.all(array);
};



const deleteSiteGroup = async (_data) => {
    return await DB.SiteGroup.destroy({
        where: {
            siteId: _data
        }
    });
};

const deleteCategory = async (_data) => {
    return await DB.SiteCategory.destroy({
        where: {
            siteId: _data
        }
    });
};

const pagingNetworkByUser = async (_data) => {
    const page = _data.page;
    const limit = _data.limit;
    let offset = limit * (page - 1);
    return DB.Sites.findAll({
        where: _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order: _data.sort,
    });
};

const count = async (_data) => {
    let filter = {
        paranoid: _data.paranoid ? false : null,
        where: _data.deletedAt ? {deletedAt: {$not: null}} : _data.where,
    };

    if (_data.include && _data.include.where) {
        filter.include = [
            {
                model: DB.SiteGroup,
                required: true,
                include: [
                    {
                        model: DB.Group,
                        as: 'group',
                        where: _data.include.where,
                        attributes: [
                            'id',
                            'name',
                            'slug',
                            'status'
                        ]
                    }
                ]
            }
        ]
    }
    return DB.Sites.count(filter);
};


export {
    deleteSite,
    update,
    getInfo,
    create,
    restoreSite,
    get,
    count,
    deleteSiteGroup,
    createSiteGroup,
    createSiteCategory,
    deleteCategory
};
