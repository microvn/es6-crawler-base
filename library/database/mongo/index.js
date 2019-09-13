// import mongoose from 'mongoose';
// import configs from './../../../config';
//
// mongoose.Promise = global.Promise;
// mongoose.set('useCreateIndex', true);
// const connection = mongoose.connect(configs.mongodb.uri, { useNewUrlParser: true });
// if (configs.env === 'development') mongoose.set('debug', true);
// connection.then(db => {
//     console.log(`Successfully connected to ${configs.mongodb.uri} MongoDB in ${configs.env} mode.`);
//     return db;
// }).catch(err => {
//     if (err.message.code === 'ETIMEDOUT') {
//         console.log('Attempting to re-establish database connection.');
//         mongoose.connect(configs.mongodb.uri);
//     } else {
//         console.log(err);
//     }
// });
//
// module.exports = connection;
