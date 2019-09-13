'use strict';

// import * as amz from './amz';
import * as sendgrid from './sendgrid';
import configs from '../../config';

export const send = async (_data) => {
    const emailDriver = configs.email.driver;
    switch (emailDriver) {
        case 'amazon':
            break;
        case 'sendgrid':
            return sendgrid.sendMail(_data);
            break;
    }
};
