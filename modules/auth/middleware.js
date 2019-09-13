/*
 * Copyright (c) 2019.
 * Author HoangNguyen
 * Email microvn.gm@gmail.com
 * Company: MobileFolk
 */

import passport from 'passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import configs from '../../config';
import $fn from '../functions';
import multer from 'multer';
import path from 'path';

const _authorizeJWT = (_options = null) => {
    let jwtOptions = {
        secretOrKey: configs.jwt.key,
        passReqToCallback: true,
    };
    if (_options) jwtOptions = Object.assign(jwtOptions, _options);
    return new Strategy(jwtOptions, async (request, jwt_payload, done) => {
        if (!jwt_payload._id || !jwt_payload.type) return done(null, false);
        let [err, user] = [];
        [err, user] = await $fn.helpers.wait($fn.user.getInfo(jwt_payload._id));

        if (err) return done(err, false);

        if (user) {
            // HoangHN - Enum define : 1 = active, 0 = inactive, 2 = locked
            // HoangHN - Check Status = 0 => Locked
            if (user.status === 0) return done(null, false);
            delete user.password;
            request.user = user;
            return done(null, true);
        } else {
            return done(null, false);
        }
    });
};


export const init = () => {
    let options = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('bearer'),
    };
    passport.use('jwt', _authorizeJWT(options));
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        console.log('deserializeUser', id);
        done(null, id);
    });
    return passport.initialize();
};


export const socketAuthorize = () => {
    let options = {
        jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
    };
    const strategy = _authorizeJWT(options);
    return (socket, accept) => {
        // Handle After Accept Request
        strategy.success = function success(user) {
            accept();
        };
        // Handle Fail Request
        strategy.fail = info => accept(new Error(info));
        // Handle Error Request
        strategy.error = error => accept(error);
        strategy.authenticate(socket.request, {});
    };
};


export const isAuth = (req, res, next) => passport.authenticate('jwt', {session: false}, (err, result) => {
    if (!result) {
        return $fn.response.forbiddenError(res, configs.text.common.lockedUser);
    } else {
        next();
    }
})(req, res, next);

export const isPermision = (_who) => {
    return (req, res, next) => {
        const user = req.user;
        switch (_who) {
            case 'user':
                if (user.type < 0) return $fn.response.forbiddenError(res, configs.text.common.lockedUser);
                break;
            case 'admin':
                if (user.type < 2) return $fn.response.forbiddenError(res, configs.text.common.lockedUser);
                break;
            case 'mod':
                if (!user.type > 0) return $fn.response.forbiddenError(res, configs.text.common.lockedUser);
                break;
        }
        next();
    }
};

export const isUploadWithoutAuthen = (req, res, next) => multer({
    storage: multer.diskStorage({
        destination: async (req, file, cb) => {
            await $fn.helpers.createDir(`${configs.upload.pathImage}tmp`);
            cb(null, `${configs.upload.pathImage}tmp`);
        },
        filename: function (req, file, cb) {
            const fileName = path.parse(file.originalname).name;
            const ext = path.extname(file.originalname);
            cb(null, `${fileName}_${Date.now()}${ext}`);
        },

    }),
    fileFilter: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        const mimeType = file.mimetype;
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && mimeType !== 'image/png' && mimeType !== 'image/jpg' && mimeType !== 'image/jpeg' && ext !== '.mp3' && ext !== '.wav' && mimeType !== 'audio/mp3') {
            req.fileValidationError = `${file.originalname} ${configs.upload.textFilter}`;
            return callback(null, false);
        }
        callback(null, true);
    },
    limits: {
        fileSize: 10024 * 1024,
    },
}).array('files', configs.upload.maxFiles)(req, res, function (err) {
    if (err) {
        return $fn.response.clientError(res, err.message);
    }
    next();
});

export const isUploadImagesMutiple = (req, res, next) => multer({
    storage: multer.diskStorage({
        destination: async (req, file, cb) => {
            await $fn.helpers.createDir(`${configs.upload.pathImage}${req.user._id}/images`);
            cb(null, `${configs.upload.pathImage}${req.user._id}/images`);
        },
        filename: function (req, file, cb) {
            const fileName = path.parse(file.originalname).name;
            const ext = path.extname(file.originalname);
            cb(null, `${fileName}_${Date.now()}${ext}`);
        },

    }),
    fileFilter: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        const mimeType = file.mimetype;
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && mimeType !== 'image/png' && mimeType !== 'image/jpg' && mimeType !== 'image/jpeg') {
            req.fileValidationError = `${file.originalname} ${configs.upload.textFilter}`;
            return callback(null, false);
        }
        callback(null, true);
    },
    limits: {
        fileSize: 5024 * 1024,
    },
}).array('images', configs.upload.maxFiles)(req, res, function (err) {
    if (err) {
        return $fn.response.clientError(res, err.message);
    }
    next();
});

export const isUploadAudioMutiple = (req, res, next) => multer({
    storage: multer.diskStorage({
        destination: async (req, file, cb) => {
            await $fn.helpers.createDir(`${configs.upload.pathImage}${req.user._id}/audio`);
            cb(null, `${configs.upload.pathImage}${req.user._id}/audio`);
        },
        filename: function (req, file, cb) {
            const fileName = path.parse(file.originalname).name;
            const ext = path.extname(file.originalname);
            cb(null, `${fileName}_${Date.now()}${ext}`);
        },

    }),
    fileFilter: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        const mimeType = file.mimetype;
        if (ext !== '.mp3' && ext !== '.wav' && mimeType !== 'audio/mp3') {
            req.fileValidationError = `${file.originalname} ${configs.upload.textFilter}`;
            return callback(null, false);
        }
        callback(null, true);
    },
    limits: {
        fileSize: 10024 * 1024,
    },
}).array('audio', configs.upload.maxFiles)(req, res, function (err) {
    if (err) {
        return $fn.response.clientError(res, err.message);
    }
    next();
});
