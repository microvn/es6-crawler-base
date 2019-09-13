'use strict';
import DB from '../../library/database/mysql/index';

const get = (_data) => {
    const page = _data.page;
    const limit = _data.limit;
    let offset = limit * (page - 1);
    if (!_data.include) return DB.Error.findAll({
        where: _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order: _data.sort,
        raw: true
    });
    return DB.Error.findAll({
        where: _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order: _data.sort,
        include:
            [{
                required: false,
                model: DB.Sites,
                as: 'site',
            },
                {
                    required: false,
                    model: DB.Domains,
                    as: 'domain',
                }],
    });
};


const count = async (whereCondition) => {
    return DB.Error.count(
        {
            where: whereCondition,
        },
    );
};


const getErrorsByListId = async (_id) => {
    return await DB.Error.findAll({
        where: {
            type: 0,
            id: {$in: _id},
            retries: {
                $lte: 3
            }
        },
        order: [
            ['createdAt', 'DESC'],
        ],
        include: [{
            required: false,
            model: DB.Domains,
            as: 'domain',
            include: [
                {
                    required: false,
                    model: DB.Sites,
                    as: 'site',
                }
            ]
        }],
    });
};


export {
    get,
    getErrorsByListId,
    count,
};
