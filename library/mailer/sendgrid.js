'use strict';
import sendGrid from '@sendgrid/mail';
import configs from '../../config';
import $func from '../../modules/functions';

export const sendMail = async (_data) => {
    try {
        // if (!configs.email.sendGridKey || !_data.sender || !_data.receiver || (!_data.text || !_data.html)) return false;
        sendGrid.setApiKey(configs.email.sendGridKey);
        await sendGrid.send({
            to: _data.receiver,
            from: _data.sender,
            subject: _data.subject,
            text: _data.text,
            html: _data.html,
            templateId: _data.templateId,
            dynamic_template_data: _data.templateData,
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};
