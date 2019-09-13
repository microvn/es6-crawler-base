'use strict';
import _ from 'lodash';
import DB from '../../library/database/mysql/index';
import ES from '../../library/database/elasticsearch';

const get = (_data) => {
    const page = _data.page;
    const limit = _data.limit;
    let offset = limit * (page - 1);
    if (!_data.include) return DB.Articles.findAll({
        where: _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order: _data.sort,
        raw: true
    });
    return DB.Articles.findAll({
        where: _data.where,
        limit: limit,
        offset: offset,
        attributes: _data.fields,
        order: _data.sort,
        include: [{
            required: false,
            model: DB.Sites,
            as: 'site',
        }],
    });
};

const getAll = (_data) => {
    return DB.Articles.findAll({
        where: _data.where,
        attributes: _data.fields,
        include: [{
            required: false,
            model: DB.Sites,
            as: 'site',
            attributes:['name']
        }],
    });
};

const search = async (_data) => {

    let data = {
        total: 0,
        result: []
    };
    if (!_data.must) return data;
    const page = _data.page < 1 ? 1 : _data.page;
    const limit = _data.limit;
    let offset = limit * (page - 1);

    let query = {
        index: 'articles',
        type: 'article',
        body: {
            query: {
                bool: {
                    must: [],
                    must_not: [
                        {
                            query_string: {
                                fields: ["text", "title"],
                                query: _data.mustNot
                            }
                        }
                    ],
                    should: [
                        {
                            query_string: {
                                fields: ["text", "title"],
                                query: _data.should
                            }
                        }
                    ]
                }
            },
            from: offset,
            size: limit,
            sort: [
                {
                    createdAt: "asc"
                }
            ],
            highlight: {
                pre_tags: "<b>",
                post_tags: "</b>",
                fields: {
                    text: {
                        fragment_size: 1,
                        number_of_fragments: 30,
                        require_field_match: true
                    }
                }
            }
        }
    };


    if (_data.must) {
        let arrayQuery = [];
        _data.must.split(',').forEach((item) => {
            arrayQuery.push(
                {
                    match_phrase: {
                        text: item.trim()
                    }
                }
            )
        });
        query.body.query.bool.must.push(
            {
                bool: {
                    should: arrayQuery
                }
            }
        )
    }


    if (_data.siteId) query.body.query.bool.must.push(
        {
            match: {
                "site.id": _data.siteId
            }
        }
    );

    if (_data.date && _data.date.lte && _data.date.gte) query.body.query.bool.must.push(
        {
            range: {
                createdAt: {
                    lte: _data.date.lte,
                    gte: _data.date.gte
                }
            }
        }
    );

    const result = await ES.search(query);

    const removeTags = (str) => {
        return str.match(/<b>(.*?)<\/b>/g).map(function (val) {
            return val.replace(/<\/?b>/g, '');
        })
    };

    if (result.body.hits && result.body.hits.hits) {
        let _data = [];
        result.body.hits.hits.forEach((item) => {
            let highLight = [];
            if (item && item.highlight && item.highlight.content) {
                highLight = _.union(removeTags(item.highlight.content.join(',')));
            }
            _data.push({
                id: item._id,
                site: item._source.site,
                domain: item._source.domain,
                title: item._source.title,
                url: item._source.url,
                text: item._source.text,
                status: item._source.status,
                createdAt: item._source.createdAt,
                isPositive: item._source.isPositive,
                time: item._source.time,
                highLight
            })
        });
        data.result = _data;
        data.total = result.body.hits.total;
    }

    return data;
};

const getInfo = async (_data) => {
    if (!_data.include) return await DB.Articles.findOne({
        where: {id: _data.id},
    });

    return await DB.Articles.findOne({
        where: {id: _data.id},
        include: [
            {
                required: false,
                model: DB.Sites,
                as: 'site',
                where: {status: 1},
                attributes: ['name', 'url']
            },
            {
                required: false,
                model: DB.Domains,
                as: 'domain',
                attributes: ['name', 'url']
            }
        ],
    });
};


const count = async (whereCondition) => {
    return DB.Articles.count(
        {
            where: whereCondition,
        },
    );
};


const getLinkByUrl = async (_url) => {
    return await DB.Articles.count({
        where: {
            url: _url,
        },
        attributes: ['id'],
        raw: true
    });
};

const createArticle = async (_data) => {
    return await DB.Articles.create(_data);
};

export {
    getInfo,
    get,
    count,
    search,
    createArticle,
    getLinkByUrl,
    getAll
};
