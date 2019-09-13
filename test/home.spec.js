import {assert, expect, should} from 'chai';
import $fn from '../modules/functions';

should();
describe('API TESTING', function () {
    let token = '';
    before(function (done) {
        $fn.test.request.post('/auth/login/phone', null, {phone: phone})
            .end((err, res) => {
                if (res.body.response.token) {
                    token = res.body.response.token;
                    console.log(token);
                    console.log('----------------- BEGIN AUTOMATION TEST ----------------------');
                    done();
                } else {
                    throw new Error('Cannot Login');
                }
            });
    });

    describe('#AUTH ROUTES', function () {
        it('#ABCXYZ', function (done) {
            $fn.test.request.post('auth/code/phone', null, {
                phoneNumber: '394263910',
                areaCode: '+84',
            }).end((err, res) => {
                const {meta, response} = res.body;
                expect(res.status).to.equal(200);
                expect(response).to.be.true;
                done();
            });
        });

    });
});
