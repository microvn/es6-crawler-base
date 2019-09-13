'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import configs from '../../config';

chai.use(chaiHttp);

const request = {
    get: (path) => {
        return chai.request(configs.urlBase).get(path)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json');
    },
    post: (path, token, requestBody) => {
        try {
            return chai.request(configs.urlBase).post(path)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send(requestBody);
        } catch (err) {
            console.log('Error in sending POST Request: ', err);
        }
    },
    put: (path, requestBody) => {
        try {
            return supertest(configs.urlBase).put(path).retry(2)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(requestBody);
        } catch (err) {
            console.log('Error in sending PUT Request: ', err);
        }
    },
    delete: (path) => {
        try {
            return supertest(configs.urlBase).delete(path).retry(2)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json');
        } catch (err) {
            console.log('Error in sending DELETE Request: ', err);
        }
    },
};

export { request };
