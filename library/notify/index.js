'use strict';

// import * as amz from './amz';
import * as pushy from './pushy';
import configs from '../../config';

export const push = async (_data) => {
    const notifyDriver = configs.notify.driver;
    switch (notifyDriver) {
        case 'sendgrid':
            await pushy.pushNotify(_data);
            break;
    }
};
