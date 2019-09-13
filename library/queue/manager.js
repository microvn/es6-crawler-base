"use strict";

import crawler from './crawler';
import crawlerAjax from './crawlerAjax';

module.exports = {
    crawler: crawler(),
    crawlerAjax: crawlerAjax(),
};
