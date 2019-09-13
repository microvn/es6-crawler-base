'use strict'
import request from 'request';
import configs from '../../config'

module.exports = (_message) => {
    if(configs.env !== 'production') return {};
    const options = {
        method: 'POST',
        url: `https://hooks.slack.com/services/${configs.slack.key}`,
        headers:
            {
                'content-type': 'application/json'
            },
        body: JSON.stringify({"text": JSON.stringify({error: _message})})
    };
    request(options, function (error, response, body) {
        return {};
    });
};

