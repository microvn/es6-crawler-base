'use strict';
import dotenv from 'dotenv';

dotenv.config();

module.exports = {
    urlBase: 'http://localhost:3333/api/',
    port: process.env.PORT,
    env: process.env.ENVIRONMENT,
    urlImage: process.env.HOST_IMAGE,
    pathStorage: process.env.PATH_STORAGE,
    pathConvertTime: process.env.PATH_CONVERT_TIME,
    domainFiles: process.env.URL_STORAGE,
    isQueue:process.env.IS_QUEUE,
    upload: {
        pathImage: process.env.PATH_IMAGE,
        maxFiles: process.env.MAX_FILE_UPLOAD,
        textFilter: 'Only images are allowed!',
        textMaxFile: 'Max files Upload',
    },
    jwt: {
        key: process.env.JWT_KEY,
        expires: process.env.JWT_TIME,
    },
    slack: {
        key: process.env.SLACK_KEY,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        database: process.env.REDIS_DB,
        password: process.env.REDIS_PASSWORD,
        prefix: process.env.REDIS_PREFIX,
    },
    queue: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        db: process.env.REDIS_DB,
        password: process.env.REDIS_PASSWORD,
    },
    mysql: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        database: process.env.MYSQL_DB,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
    },
    es: {
        host: process.env.ES_HOST,
        port: process.env.ES_PORT
    },
    mongodb: {
        uri: process.env.MONGODB_URI,
    },
    text: {
        common: {
            emailExist: 'Email exists, please input again!',
            phoneExist: 'Phone exists, please input again!',
            phoneValidate: 'Phone exist, please input again!',
            emailValidate: 'Please input a valid email!',
            notFoundUser: 'NotFound User!',
            notFoundNetwork: 'NotFound Network!',
            notMatchPassword: 'Password not match!',
            notVerifyPassword: 'Not Verify Password!',
            notVerifyUser: 'Not Verify User, please check again your input !',
            notOwnerAccount: 'You are not owner account!',
            notTypeLoginSocial: 'Not accept type of social',
            lockedUser: 'You are unauthenticated or locked, please try login or contact to Administrator !',
            expiredToken: 'Token expired, please login again!',
            notFoundCategory: 'NotFound Category',
            notFoundCampaign: 'NotFound Campaign',
            notFoundSite: 'NotFound Site',
            notFoundDomain: 'NotFound Domain',
            notFoundArticle: 'NotFound Article',
            notFoundGroup: 'NotFound Group'
        },
        response: {
            notFoundRes: 'Cant found response!',
            error401: 'Bạn chưa được xác thực!',
            error403: 'Bạn không có quyền truy cập!',
            error404: 'Không tìm thấy dữ liệu!',
            error422: 'Kiểm tra dữ liều đầu vào!',
            error500: 'Đã xẩy ra lỗi, liên hệ quản trị!',
        },
        auth: {
            notCreate: 'Cant create hash!',
            notFoundHash: 'Link expired, please forgot password again!',
            updatedHash: 'Link used, please forgot password again!',
        },
    },
    email: {
        driver: process.env.EMAIL_DRIVER,
        sendGridKey: process.env.EMAIL_SENDGRID_KEY,
        sender: process.env.EMAIL_SENDER,
        template: {

        },
    },
    generator: {
        swaggerDefinition: {
            info: {
                description: 'Service for Project Name',
                title: 'Project Name',
                version: '1.0.0',
            },
            host: 'domain.com',
            basePath: '',
            produces: [
                'application/json',
                'application/xml',
            ],
            schemes: ['http', 'https'],
            securityDefinitions: {
                JWT: {
                    type: 'apiKey',
                    in: 'header',
                    scheme: 'bearer',
                    name: 'Authorization',
                    description: '',
                    authenticationScheme: 'Bearer',
                },
            },
        },
        basedir: __dirname, //app absolute path
        files: ['./../modules/*/controllers.js'], //Path to the API handle folder
    },
    sms: {
        driver: process.env.SMS_DRIVER,
        enable: process.env.SMS_ENABLE,
        twilioKey: process.env.SMS_KEY_TWILIO,
    },
    notify: {
        driver: process.env.NOTIFY_DRIVER,
        pushyKey: process.env.NOTIFY_KEY_PUSH,
    }
};

