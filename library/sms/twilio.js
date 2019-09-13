'use strict';
import authy from 'authy';
import configs from '../../config';

const twilio = authy(configs.sms.twilioKey);

export const getCode = (_data) => {
  return new Promise((resolve, reject) => {
    twilio.phones().verification_start(_data.phoneNumber, _data.areaCode, 'sms', function (err, res) {
      console.log(err)
      if (err) {
        reject(err.message);
      }
      if (res && res.success) resolve(true);
    });
  });
};


export const verifyCode = (_data) => {
  return new Promise((resolve, reject) => {
    twilio.phones().verification_check(_data.phoneNumber, _data.areaCode, _data.verifyCode, function (err, res) {
      if (err) {
        reject(err.message);
      }
      if (res && res.success) resolve(true);
    });
  });
};
