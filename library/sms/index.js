'use strict';

import * as twilio from './twilio';
import configs from '../../config';

// export const send = async (_data) => {
//   const smsDriver = configs.sms.driver;
//   switch (smsDriver) {
//     case 'twilio':
//       await twilio.sendSMS(_data);
//       break;
//   }
// };

export const getCode = async (_data) => {
  if (!_data.phoneNumber || !_data.areaCode) return false;
  const smsDriver = configs.sms.driver;
  switch (smsDriver) {
    case 'twilio':
      return await twilio.getCode(_data);
  }
};

export const verifyCode = async (_data) => {
  if (!_data.phoneNumber || !_data.areaCode || !_data.verifyCode) return false;
  const smsDriver = configs.sms.driver;
  switch (smsDriver) {
    case 'twilio':
      return await twilio.verifyCode(_data);

  }
};
