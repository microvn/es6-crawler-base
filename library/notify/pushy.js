'use strict';
import Pushy from 'pushy';
import configs from '../../config';
import $func from '../../modules/functions';

const pushyService = new Pushy('SECRET_API_KEY');

/**
 *
 * @param message - Text Message
 * @param deviceToken - deviceToken of Target
 * @param topic - Topic if push more device
 */
export const pushNotify = (_data) => {
    return new Promise((resolve, reject) => {
        if (!_data.message || (!_data.deviceToken || !_data.topic)) return reject(false);

        let data = {
            message: _data.message,
        };

        let to = _data.deviceToken ? _data.deviceToken : _data.topic;

        pushyService.sendPushNotification(data, to, options, function (err, id) {
            if (err) {
                reject(err);
            }
            console.log(`Push sent successfully! (ID: ${id})`);
            resolve(id);
        });
    });
};
