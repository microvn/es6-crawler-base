'use strict';
import {to} from 'await-to-js';
import crypto from 'crypto';
import _ from 'lodash';
import xmlbuilder from 'xmlbuilder';
import {ExportToCsv} from 'export-to-csv';
import fs from 'fs';
import configs from './../../config';
import {URL} from 'url';
import * as ChildProcess from "child-process-promise";
import moment from "moment";

const wait = async (_promise) => {
    const [err, res] = await to(_promise);
    if (err) return [err ? err : getError(err)];
    return [null, res];
};

const overrideDom = (_domain) => {
    return {
        list: _domain.ovDomList ? JSON.parse(_domain.ovDomList) : JSON.parse(_domain.site.domList),
        special: _domain.ovDomSpecial ? JSON.parse(_domain.ovDomSpecial) : JSON.parse(_domain.site.domSpecial),
        detail: _domain.ovDomDetail ? JSON.parse(_domain.ovDomDetail) : JSON.parse(_domain.site.domDetail)
    }
};

const exportToFile = (_options, _data, _type) => {
    let name = md5(JSON.stringify(_options));

    //HoangHn - Reformat content before export
    let newArrayArticle = [];
    _data.forEach((item, index) => {
        item = item.toJSON();
        if (item.site) item.site = item.site.toJSON().name;
        item.stt = index + 1;
        item.text = item.text.replace(/"/g, "'");
        item.content = item.content.replace(/"/g, "'");
        newArrayArticle.push(item);
    });
    _data = newArrayArticle;
    switch (_type) {
        case 'csv':
            const csvExporter = new ExportToCsv({
                fieldSeparator: ',',
                quoteStrings: '"',
                decimalSeparator: '.',
                showLabels: true,
                showTitle: true,
                title: 'Social Fire Exporter',
                useTextFile: false,
                useBom: true,
                useKeysAsHeaders: true,
                // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
            });
            let data = csvExporter.generateCsv(_data, true);
            fs.writeFileSync(`${configs.pathStorage}files/${name}.csv`, data);
            break;
        case 'xml':
            let xml = xmlbuilder.create('root').ele('articles');
            if (_data) {
                _data.forEach((item) => {
                    let articleNode = xml.ele('article', {id: item.id});
                    Object.keys(item).forEach((article) => {
                        articleNode.ele(article, item[article]).up();
                    });
                });
            }
            xml.end({pretty: true});
            fs.writeFileSync(`${configs.pathStorage}files/${name}.xml`, xml);
            break;
    }
    return `${configs.domainFiles}${name}.${_type}`;
};

const parseParams = (_req) => {
    let param = {
        page: 1,
        limit: 10,
    };

    let _param = _req.method === 'POST' ? _req.body : JSON.parse(_req.query.filters);
    if (_param.limit) param.limit = _param.limit && _param.limit > 100 ? 100 : _param.limit;
    if (_param.page) param.page = _param.page;
    if (_param.fields) param.fields = _param.fields;
    param.where = _param.where ? _param.where : {};
    param.deletedAt = _param.deletedAt ? _param.deletedAt : null;
    param.sort = _param.sort || [];
    param.paranoid = _param.paranoid ? _param.paranoid : null;
    param.include = _param.include ? _param.include : null;
    return param;
};

const md5 = (_string) => crypto.createHash('md5').update(_string).digest('hex');

const isEmail = (_string) => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(_string);

const isLink = (_string) => /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(_string);
const isUuid = (_string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(_string);

const getFinalUrl = (_string) => {
    try {
        const _url = new URL(_string);
        return `${_url.origin}${_url.pathname}`;
    } catch (e) {
        return false;
    }
};

const convertTime = async (_string) => {
    if (!_string || _string.trim().length > 200) throw ({stack: 'Exception with DOM Time'});
    let result = await ChildProcess.exec(`python ${configs.pathConvertTime} '${_string}'`);
    return result.stdout.trim() !== 'false' || result.stdout.trim() !== 'Module dateparser not install or missing argv' ? moment(result.stdout.trim() * 1000).format('YYYY-MM-DD HH:mm:ss') : null;
};

const getImages = (_string) => _string && _string.replace(configs.upload.pathImage, configs.urlImage);

const createDir = (_path) => {
    try {
        if (!fs.existsSync(_path)) {
            return fs.mkdirSync(_path, {recursive: true});
        }
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
};

const getError = (_error) => {
    let stack = _error.stack ? _error.stack : '';
    let stackObject = stack.split('\n');
    let position = getPositionError(stackObject);
    let splitMessage = _error.message ? _error.message.split('\n') : [''];
    return configs.env !== 'production' ? {
        filename: position.filename,
        line: position.line,
        row: position.line,
        code: _error.code ? _error.code : null,
        message: splitMessage[splitMessage.length - 1],
        type: _error.type ? _error.type : _error.name,
        stack: stack,
        arguments: _error.arguments,
    } : splitMessage[splitMessage.length - 1];
};


const slugify = (_string) => {
    _string = _string.toLowerCase();
    _string = _string.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    _string = _string.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    _string = _string.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    _string = _string.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    _string = _string.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    _string = _string.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    _string = _string.replace(/đ/gi, 'd');
    _string = _string.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    _string = _string.replace(/ /gi, "-");
    _string = _string.replace(/\-\-\-\-\-/gi, '-');
    _string = _string.replace(/\-\-\-\-/gi, '-');
    _string = _string.replace(/\-\-\-/gi, '-');
    _string = _string.replace(/\-\-/gi, '-');
    _string = '@' + _string + '@';
    _string = _string.replace(/\@\-|\-\@|\@/gi, '');
    return _string;
}

const getPositionError = (_stack) => {
    let filename,
        line,
        row;
    try {
        let filteredStack = _stack.filter(function (s) {
            return /\(.+?\)$/.test(s);
        });
        let splitLine;
        if (filteredStack.length > 0) {
            splitLine = filteredStack[0].match(/(?:\()(.+?)(?:\))$/)[1].split(':');
        } else {
            splitLine = _stack[0].split(':');
        }
        let splitLength = splitLine.length;
        filename = splitLine[splitLength - 3];
        line = Number(splitLine[splitLength - 2]);
        row = Number(splitLine[splitLength - 1]);
    } catch (err) {
        filename = '';
        line = 0;
        row = 0;
    }
    return {
        filename: filename,
        line: line,
        row: row,
    };
};


export {
    md5,
    wait,
    getImages,
    overrideDom,
    parseParams,
    slugify,
    getError,
    createDir,
    isEmail,
    isLink,
    isUuid,
    exportToFile,
    getFinalUrl,
    convertTime
};
