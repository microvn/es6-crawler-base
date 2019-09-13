import Bull from 'bull';
import cheerio from 'cheerio';
import htmlparser2 from 'htmlparser2';
import _ from 'lodash';
import request from 'request-promise';
import configs from '../../config';
import * as helpers from '../../modules/helper/helper';
import puppeteer from '../../library/puppeteer';
import DB from "../../library/database/mysql";
import * as domainFunctions from "../domain/functions";
import * as articleFunctions from "../article/functions";
import sanitizeHtml from 'sanitize-html';
import moment from 'moment';
import ValidationError from "sequelize/lib/errors/validation-error";

const crawler = async (_data) => {
    // HoangHn - Type: 0 = category , 1 = detail
    switch (_data.type) {
        case 0:
            return getListArticle(_data);
        case 1:
            return getArticle(_data);
    }
    return _data;
};


const getListArticle = async (_domain) => {
    let result = [];
    if (!_domain.site) return {domain: _domain, result};
    switch (_domain.isAjax) {
        case 0:
            let page = _domain.isRequested ? _domain.currentPage : _domain.maxPage;
            while (page > 0) {
                let data = await requestCategory(_domain, page);
                //HoangHn - Return false if one page error
                if (data.status !== 0) {
                    console.log('Update Error Domain', data.status, _domain.url);

                    page = 0;
                } else {
                    result = data.data;
                    page--;
                }
            }
            break;
        case 1:
            let dataAjax = await getCateByAjax(_domain);
            result = [...result, dataAjax];
            break;
    }
    if (!_domain.isRequested) await domainFunctions.update({id: _domain.id, isRequested: 1});
    return {_domain, result}
};
const getArticle = async (_domain) => {
    let page = 1;
    return await requestDetail(_domain, page);
};

const requestCategory = async (_domain, _page) => {
    let data = [];
    const dom = helpers.overrideDom(_domain);
    const urlRequest = _domain.url.replace(/{page}+/gi, _page);
    console.log('requestCategory', urlRequest);
    try {
        const result = await request({
            uri: `${urlRequest}`,
            method: 'GET',
        });
        const $ = cheerio.load(result);
        const Queue = new Bull('CrawlerQueue', {redis: configs.queue});
        if (dom.special) {
            dom.special.length > 0 && dom.special.forEach(async (item) => {
                $(item.url).map(async (i, element) => {
                    try {
                        let time = moment().tz('UTC').format('YYYY-MM-DD HH:mm:ss');
                        let url = getUrlFromElement(_domain.site.url, $(element));
                        let title = $(element).parent().find(item.title).text();
                        let description = $(element).parent().find(item.description).text();
                        if (helpers.isLink(url)) {
                            url = helpers.getFinalUrl(url);
                            await Queue.add({
                                site: _domain,
                                item: {title, description, url, time}
                            }, {
                                removeOnComplete: true
                            });
                        }
                    } catch (e) {
                        console.log(`Error DOM Exception ${urlRequest}`);
                    }
                })
            });
        }

        if (!$(dom.list.subgroup).length) return {status: 1, data: []};

        $(dom.list.subgroup).map(async (key, item) => {
            try {
                let title = $(item).find(dom.list.title).text().replace('[…]', '').trim();
                let time = moment().tz('UTC').format('YYYY-MM-DD HH:mm:ss');
                let description = $(item).find(dom.list.description) ? $(item).find(dom.list.description).text().trim() : '';
                let url = getUrlFromElement(_domain.site.url, $(item).find(dom.list.url));
                let image = getImageFromElement(_domain.site.url, $(item).find(dom.list.thumbnail));
                if (title && helpers.isLink(url)) {
                    url = helpers.getFinalUrl(url);
                    await Queue.add({
                        site: _domain,
                        item: {title, description, url, image, time}
                    }, {
                        removeOnComplete: true
                    });
                    data.push({title, description, url, image});
                }
            } catch (e) {
                console.log(`Error DOM Exception ${urlRequest}`);
            }
        });

        return {status: 0, data}
    } catch (e) {
        console.log(`Error Request Exception ${urlRequest}`);
        return {status: 2, data: []};
    }
};

const requestDetail = async (_domain, _item) => {
    try {
        if (!_item.url || typeof _item.url === "undefined" || await articleFunctions.getLinkByUrl(helpers.getFinalUrl(_item.url)) || !_domain.id) return false;
        const dom = helpers.overrideDom(_domain).detail;
        const data = await request({
            uri: `${_item.url}?v=${Date.now()}`,
            method: 'GET',
        });
        const $ = cheerio.load(data);
        let title = getDataFromElement.getTitle($, dom);
        let description = getDataFromElement.getDescription($, dom);
        let thumbnail = getDataFromElement.getImage($, _item);
        let content = getDataFromElement.getContent($, dom);
        let text = getDataFromElement.getText(content);
        let time = await helpers.convertTime(getDataFromElement.getTime($, dom));
        let json = prepareContent(content, _domain).content;
        let createdAt = time ? time : _item.time;
        let url = _item.url;
        let siteId = _domain.site.id ? _domain.site.id : _domain.id;
        let domainId = _domain.id;
        if (title && content !== 'null') {
            let article = await articleFunctions.createArticle({
                title: title ? title : _item.title,
                slug: helpers.slugify(title ? title : _item.title),
                description: description ? description : _item.description,
                thumbnail,
                content,
                json,
                time,
                siteId,
                domainId,
                url,
                text,
                createdAt
            });
            if (article && _domain.error) {
                await deleteError(_domain.error).catch((e) => console.log('Error Remove Log'))
            }

        } else {
            if (!title) throw ({stack: 'Exception Title Null'});
            if (!content) throw ({stack: 'Exception Content null'});
            throw ({stack: 'Exception with Dom Error'});
        }
    } catch (error) {
        // console.log('Error Detail',error,_item.url);
        if (!(error instanceof ValidationError)) {
            console.log(error.stack);
            await createErrorArticle({
                url: _item.url,
                domainId: _domain.id,
                siteId: _domain.site.id,
                reason: error.stack,
                data: JSON.stringify({_domain, _item}),
                retries: 0,
                type: 0
            }).catch((e) => console.log('Error Write Log'));
        }

    }
};

const createErrorArticle = async (_data) => {
    return await DB.Error.create(_data);
};


const getErrors = async () => {
    return await DB.Error.findAll({
        where: {
            type: 0,
            retries: {
                $lte: 3
            }
        },
        order: [
            ['createdAt', 'DESC'],
        ],
        limit: 1000,
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

const updateError = async (_data) => {
    return DB.Error.update(_data, {
        where: {
            id: _data.id
        }
    });
};

const deleteError = async (_id) => {
    return await DB.Error.destroy({
        where: {
            id: _id
        }
    });
};

const getUrlFromElement = (_url, _element) => {
    let url = "";
    if (_element && _element[0] && _element[0].name === 'a') url = _element.attr('href');
    if (!url) _element = _element.parent().find('a');
    if (_element && _element[0] && _element[0].name === 'a') url = _element.attr('href');
    if (!url) return null;
    return helpers.isLink(url) ? url : `${_url}/${url.replace(/^\/+/, "")}`;
};


const getImageFromElement = (_domain, _element) => {
    let src = "";
    if (_element && _element[0] && _element[0].name === 'img') src = _element.attr('src');
    if (!src) _element = _element.parent().find('img');
    if (_element && _element[0] && _element[0].name === 'img') src = _element.attr('src');
    if (_element && !src) {
        _element = _element.attr('style');
        if (src !== "" && typeof src !== "undefined") src = _element.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
    }
    if (!src) return null;
    return helpers.isLink(src) ? src : `${_domain}/${src.replace(/^\/+/, "")}`;
};


const prepareContent = (content, site) => {
    content.replace('<p style="text-align: center;"></p>', '')
    content.replace('<img/> ', '').replace('<img/>', '')
        .replace('<p style="text-align: justify;"> </p>', '')
        .replace('<p style="text-align: justify;"><figure', '<figure')
        .replace('<p><figure', '<figure')
        .replace('<p><figure', '<figure')
        .replace('<p></p>', '')
        .replace('<p><p>', '<p>')
        .replace('</p></p>', '')
        .replace('<div', '<p')
        .replace('</div>', '</p>')
        .replace('<h3', '<p')
        .replace('</h3>', '</p>')
        .replace('<p>&nbsp;</p>', '')
        .replace('<table>', '')
        .replace('<tr>', '')
        .replace('<td>', '<p>')
        .replace('</td>', '</p>')
        .replace('</tr>', '')
        .replace('</table>', '')
        .replace('<strong><em>', '<text-bold-italic>')
        .replace('</strong></em>', '</text-bold-italic>')
        .replace('<em><strong>', '<text-bold-italic>')
        .replace('</em></strong>', '</text-bold-italic>')
        .replace('<iframe></iframe>', '')
    let array = [];
    let extend = {};
    let parser = new htmlparser2.parseDOM(content);
    if (parser) {
        parser.forEach((item) => {
            if (item.type === 'text' && item.data && item.data.trim()) array.push({type: "text", content: item.data});
            if (item.type === "tag") {
                if (item.name === 'p' || item.name === 'table' || item.name === 'div' || item.name === 'i' || item.name === 'b' || item.name === 'strong' || item.name === 'em' || item.name === 'a' || item.name === 'img') {
                    let parsedContent = parseChildNode(item, null, site);
                    if (parsedContent && !_.isEmpty(parsedContent.content)) {
                        if (parsedContent && !_.isEmpty(parsedContent.extend)) extend = {...extend, ...parsedContent.extend};
                        _.isArray(parsedContent.content) ? array.push({
                            type: "text",
                            content: parsedContent.content
                        }) : array.push(parsedContent.content)
                    }
                }
            }
        })
    }

    return {extend: extend, content: JSON.stringify(array)};
};

const parseChildNode = (item, parent = null, site) => {
    let array = [];
    let extend = {};
    if (item && item.children && item.children.length > 0) {
        for (let subItem of item.children) {
            if (subItem.type !== 'text' && subItem.children && subItem.children.length > 0) {
                let converted = parseChildNode(subItem, item, site).content;
                if (converted) {
                    if (converted.type === "video") {
                        extend.video = [];
                        extend.video.push(converted)
                    }
                    array.push(converted)
                }
            } else {
                let converted = formatChild(subItem, item, site);
                if (converted) {
                    if (converted.type === "video") {
                        extend.video = [];
                        extend.video.push(converted)
                    }
                    array.push(converted)
                }
            }
        }
    } else {
        let converted = formatChild(item, parent, site);
        if (converted && converted.content) {
            if (converted.type === "video") {
                extend.video = [];
                extend.video.push(converted)
            }
            array.push(converted)
        }
    }
    return array.length <= 1 ? {extend: extend, content: array[0]} : {extend: extend, content: array};
};

const formatChild = (item, parent, site) => {
    if (item.type === 'text' && item.data && item.data.trim() && parent.name === 'p') return {
        type: 'text',
        content: item.data.trim()
    };
    if (parent && parent.name === 'a') {
        if (item.data) {
            let data = {
                type: 'link',
                content: item.data && item.data.trim() ? item.data.trim() : parent.attribs.href,
                href: parent.attribs.href,
                origin: false,
                path: ""
            };

            let parseLink = getDomainFromUrl(parent.attribs.href);
            if (parseLink && parseLink.domain === site.site) data = Object.assign(data, {
                origin: true,
                path: parseLink.path
            });

            return data;
        }

        if (!item.data) {
            let content = parseChildNode(item, {})
            return {
                type: 'link',
                content: _.isObject(content.content) ? [content.content] : content.content,
                href: parent.attribs.href
            }
        }
    }
    if ((parent && parent.name === 'video' || item.name === 'source') && (item && item.attribs && item.attribs.src)) return {
        type: 'video',
        content: item.attribs.src,
        thumbnail: parent.attribs['data-poster'] ? parent.attribs['data-poster'] : parent.attribs['poster']
    };
    if (item.name === 'img') {
        return {
            type: 'image',
            content: item.attribs.src,
            dimension: {width: item.attribs.cw, height: item.attribs.ch, ratio: item.attribs.cr}
        }
    }
    if ((parent && (parent.name === 'em' || parent.name === 'i')) && item.data && item.data.trim()) return {
        type: "text-italic",
        content: item.data
    };
    if ((parent && (parent.name === 'strong' || parent.name === 'b')) && item.data && item.data.trim()) return {
        type: "text-strong",
        content: item.data
    }
};

const getDomainFromUrl = (str) => {
    try {
        if (helpers.isLink(str)) {
            let url = new URL(str);
            let _path = url.pathname.substr(url.pathname.indexOf('/') + 1);
            if (_path.lastIndexOf("/") > 0) _path = _path.substring(0, _path.lastIndexOf("/"));
            return {
                domain: url.hostname.substring(0, url.hostname.lastIndexOf(".")),
                path: _path
            };
        }
    } catch (e) {
        console.log(e)
    }
};


const getDataFromElement = {
    getTitle: ($, dom) => {
        try {
            // console.log(dom.title)
            return $(dom.title).text().replace(/(?:\\[rn])+/g, "").trim() || null
        } catch (e) {
            throw ({stack: 'Exception with DOM Title'});
        }
    },
    getDescription: ($, dom) => {
        try {
            const elDescription = $(dom.description);
            elDescription.children().map((i, item) => $(item).remove());
            let description = elDescription.text();
            description = elDescription && description ? elDescription.text() : $(dom.content).find('> p:first-of-type').text();
            return description.replace(/(?:\\[rn])+/g, "").trim() || "";
        } catch (e) {
            throw ({stack: 'Exception with DOM Description'});
        }
    },
    getImage: ($, _item) => {
        try {
            let image = $("meta[property='og:image']").attr("content");
            if (!image) image = $("meta[itemprop='image']").attr("content");
            if (!image) image = _item.image;
            return image;
        } catch (e) {
            throw ({stack: 'Exception with DOM Thumbnail'});
        }
    },
    getContent: ($, _dom) => {
        try {
            return cleanContent($(_dom.content).html(), _dom)
        } catch (e) {
            throw ({stack: 'Exception with DOM Content'});
        }
    },
    getText: (_content) => {
        try {
            return sanitizeHtml(_content, {
                allowedTags: [],
                textFilter: function (text) {
                    return text.replace(/\r?\n|\r/g, '');
                }
            }).trim();
        } catch (e) {
            throw ({stack: 'Exception with DOM Text'});
        }
    },
    getTime: ($, _dom) => {
        try {
            return $(_dom.time).text().replace(/(?:\\[rn])+/g, "").trim();
        } catch (e) {
            throw ({stack: 'Exception with DOM Time'});
        }
    }
};


const cleanContent = (_string, _site) => {
    return sanitizeHtml(_string, getConfig());
};

const getConfig = () => {
    return {
        allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol',
            'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'hr', 'br',
            'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'img', 'video', 'source'],
        allowedAttributes: {
            a: ['href', 'name', 'target'],
            // We don't currently allow img itself by default, but this
            // would make sense if we did
            img: ['src', 'cw', 'ch', 'cr'],
            iframe: ['src'],
            video: ['src', 'source', 'data-poster', 'poster'],
            source: ['src']
        },
        allowedClasses: {
            'iframe': ['a']
        },
        allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
        allowedSchemes: ['http', 'https', 'mailto'],
        exclusiveFilter: function (frame) {
            if (frame.tag === 'source' || frame.tag === 'img') {
                frame.text += frame.attribs.src;
            }
            return frame.tag === 'p' && !frame.text.trim();
        },
        transformTags: {
            'div': 'p',
            'h1': 'p',
            'h2': 'p',
            'h3': 'p',
            'h4': 'p',
            'h5': 'p',
            'h6': 'p',
            'li': '',
            'ol': 'ul',
            'ul': 'p'
        }
    }
};

const getCateByAjax = async (_domain) => {
    if (!await puppeteer) return null;
    const browser = await puppeteer;
    const page = await browser.newPage();
    try {
        _domain.dom = helpers.overrideDom(_domain);
        page.setViewport({width: 1920, height: 1080});
        const urlRequest = _domain.url.replace(/{page}+/gi, 1);
        await page.goto(urlRequest, {waitUntil: 'networkidle2', timeout: 100000});
        let listArticles = await page.evaluate(onBrowser, _domain);
        if (listArticles) {
            listArticles = listArticles.filter(function (item, pos, array) {
                return array.map(function (mapItem) {
                    return mapItem['url'];
                }).indexOf(item['url']) === pos;
            });
            const Queue = new Bull('CrawlerQueueAjax', {redis: configs.queue});
            listArticles.forEach(async (item) => {
                await Queue.add({
                    site: _domain,
                    item: item
                }, {
                    removeOnComplete: true
                });
            })
        }
        await page.goto('about:blank');
        await page.close();
        return listArticles;
    } catch (e) {
        console.log('Error Crawler getCateByAjax');
        await domainFunctions.update({isErrorCrawler: 1, id: _domain.id});
        await page.goto('about:blank');
        await page.close();
    }
};


const onBrowser = (_domain) => {
    return new Promise((resolve, reject) => {
        // Class for Individual Thread
        const C_THREAD = `${_domain.dom.list.subgroup}:not(.pagedlist_hidden)`;
        // Class for threads marked for deletion on subsequent loop
        const C_THREAD_TO_REMOVE = `${_domain.dom.list.subgroup}:not(.pagedlist_hidden) .TO_REMOVE`;
        // Class for Title
        const C_THREAD_TITLE = _domain.dom.list.title;
        // Class for Thumbnail
        const C_THREAD_THUMBNAIL = _domain.dom.list.thumbnail;
        // Class for Thumbnail
        const C_THREAD_LINK = _domain.dom.list.url;
        // Class for Description
        const C_THREAD_DESCRIPTION = _domain.dom.list.description;

        const _log = console.info,
            _warn = console.warn,
            _error = console.error,
            _time = console.time,
            _timeEnd = console.timeEnd;

        _time("Scrape");

        let page = 1;

        // Global Set to store all entries
        let threads = new Set(); // Eliminates dupes

        // Pause between pagination
        const PAUSE = 4000;

        // Accepts a parent DOM element and extracts the title and URL
        const scrapeSingleThread = (elThread) => {
            try {
                const elTitle = elThread.querySelector(C_THREAD_TITLE),
                    elLink = elThread.querySelector(C_THREAD_LINK),
                    elDescription = elThread.querySelector(C_THREAD_DESCRIPTION),
                    elThumbnail = elThread.querySelector(C_THREAD_THUMBNAIL),
                    time = new Date().toISOString();

                let title = elTitle && elTitle.innerText ? elTitle.innerText.trim() : "",
                    description = elDescription && elDescription.innerText ? elDescription.innerText.trim() : "",
                    thumbnail = getImageFromElement(_domain.site.url, elThumbnail),
                    url = getUrlFromElement(_domain.site.url, elLink);
                if (isLink(url)) {
                    url = getFinalUrl(url);
                    threads.add({
                        title,
                        description,
                        url,
                        time,
                        thumbnail
                    });
                }
            } catch (e) {
                _error("Error capturing individual thread", e);
            }
        };

        const getFinalUrl = (_string) => {
            try {
                const _url = new URL(_string);
                return `${_url.origin}${_url.pathname}`;
            } catch (e) {
                return false;
            }
        };

        const isLink = (_string) => /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(_string)

        const getImageFromElement = (_domain, _element) => {
            let src = null;
            if (_element && _element.nodeName === 'IMG') src = _element.getAttribute('src');
            if (_element && !src) {
                _element = _element.getAttribute('style');
                if (src !== null && typeof src !== "undefined") src = _element.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
            }

            if (!src) return null;
            return isLink(src) ? src : `${_domain}/${src.replace(/^\/+/, "")}`;
        };

        const getUrlFromElement = (_url, _element) => {
            let url = null;
            if (_element && _element.nodeName === 'A') url = _element.getAttribute('href');
            if (!url) _element = _element.parentNode;
            if (_element && _element.nodeName === 'A') url = _element.getAttribute('href');
            if (!url) _element = _element.parentNode.querySelector('a');
            if (_element && _element.nodeName === 'A') url = _element.getAttribute('href');
            if (!url) return null;
            return isLink(`${url}`) ? url : `${_url}/${url.replace(/^\/+/, "")}`;
        };


        const scrapeSingleThreadsSpecial = (element, item) => {
            try {
                item.description = `${item.description}:not(.pagedlist_hidden)`;
                item.title = `${item.title}:not(.pagedlist_hidden)`;
                item.thumbnail = `${item.thumbnail}:not(.pagedlist_hidden)`;

                const elParent = element.parentNode.parentNode.parentNode;
                const elDescription = elParent.querySelector(item.description);
                const elTitle = elParent.querySelector(item.title);
                const elThumbnail = elParent.querySelector(item.thumbnail);

                const time = new Date().toISOString();
                const title = elTitle && elTitle.innerText ? elTitle.innerText.trim() : "";
                const description = elDescription && elDescription.innerText ? elDescription.innerText.trim() : "";
                const thumbnail = getImageFromElement(_domain.site.url, elThumbnail);
                let url = getUrlFromElement(_domain.site.url, element);

                //Remove Class Dom
                element.className = element.className.replace(/\./g, '');
                if (isLink(url)) {
                    url = getFinalUrl(url);
                    threads.add({
                        title,
                        description,
                        url,
                        time,
                        thumbnail
                    });
                }
            } catch (e) {
                _error("Error capturing scrapeSingleThreadsSpecial", e);
            }
        };


        // Get all threads in the visible context
        const scrapeSpecialThreads = () => {
            _log("Scraping SpecialThreads");
            _domain.dom.special.forEach((item) => {
                const specialLink = document.querySelectorAll(item.url);
                Array.from(specialLink).forEach((elemLink) => scrapeSingleThreadsSpecial(elemLink, item));
            });
        };


        // Get all threads in the visible context
        const scrapeThreads = () => {
            _log("Scraping page %d", page);

            // scrape Special
            scrapeSpecialThreads();

            const visibleThreads = document.querySelectorAll(C_THREAD);

            if (visibleThreads.length > 0) {
                _log("Scraping page %d... found %d threads", page, visibleThreads.length);
                Array.from(visibleThreads).forEach(scrapeSingleThread);
            } else {
                _warn("Scraping page %d... found no threads", page);
            }

            // Return master list of threads;
            return visibleThreads.length;
        };

        // Clears the list between pagination to preserve memory
        // Otherwise, browser starts to lag after about 1000 threads
        const clearList = () => {
            _log("Clearing list page %d", page);
            const toRemove = `${C_THREAD_TO_REMOVE}_${(page - 1)}`,
                toMark = `${C_THREAD_TO_REMOVE}_${(page)}`;
            try {
                // Remove threads previously marked for removal
                document.querySelectorAll(toRemove)
                    .forEach(e => e.parentNode.removeChild(e));
                // Mark visible threads for removal on next iteration
                document.querySelectorAll(C_THREAD)
                    .forEach(e => e.className = toMark.replace(/\./g, ''));

            } catch (e) {
                _error("Unable to remove elements", e.message)
            }
        };

        // Scrolls to the bottom of the viewport
        const loadMore = () => {
            _log("Load more... page %d", page);
            if (document.querySelector(_domain.dom.list.next)) document.querySelector(_domain.dom.list.next).click();
            window.scrollTo(0, document.body.scrollHeight);
        };

        // Recursive loop that ends when there are no more threads
        const loop = () => {
            _log("Looping... %d entries added", threads.size);
            let _conditionPage = _domain.isRequested ? _domain.currentPage : _domain.maxPage;
            if (scrapeThreads() && page < _conditionPage) {
                try {
                    clearList();
                    loadMore();
                    page++;
                    setTimeout(loop, PAUSE)
                } catch (e) {
                    reject(e);
                }
            } else {
                _timeEnd("Scrape");
                if (threads.size < 1) reject('Cannot Find Anything!');
                resolve(Array.from(threads));
            }
        };

        loop();
    });
};

export {
    crawler,
    requestDetail,
    requestCategory,
    cleanContent,
    getConfig,
    prepareContent,
    formatChild,
    getDomainFromUrl,
    parseChildNode,
    getCateByAjax,
    createErrorArticle,
    getUrlFromElement,
    getErrors,
    deleteError,
    updateError
};
