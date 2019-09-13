'use strict';

import * as test from './helper/test';
import * as response from './helper/response';
import * as helper from './helper/helper';
import * as auth from './auth/functions';
import * as user from './user/functions';
import * as crawler from './crawler/functions';
import * as category from './category/functions';
import * as campaign from './campaign/functions';
import * as domain from './domain/functions';
import * as site from './site/functions';
import * as article from './article/functions';
import * as error from './error/functions';
import * as sms from './../library/sms';
import * as mailer from './../library/mailer';


module.exports = {
    response: response,
    helpers: helper,
    test: test,
    auth: auth,
    user: user,
    crawler: crawler,
    category: category,
    campaign: campaign,
    article: article,
    error: error,
    domain: domain,
    site: site,
    library: {
        sms: sms,
        mailer: mailer,
    },
};
