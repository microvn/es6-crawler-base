// 'use strict';
// import configs from '../../config';
// import moment from 'moment';
//
// const createHash = async (_data) => {
//     return await Hash.create(_data);
// };
//
// const getInfo = async (_id, _column) => {
//     return await Hash.findById(_id, _column);
// };
//
// const update = async (_data, _id) => {
//     return await Hash.findByIdAndUpdate({ _id: _id }, _data, { new: true });
// };
//
// const getHashFrom = async (_options) => {
//     if (!_options || !_options.value || !_options.filter) return null;
//     switch (_options.filter) {
//         case 'hash':
//             let _data = await Hash.findOne({
//                 hash: _options.value,
//                 expiredAt: { $gte: moment().toISOString() },
//             });
//             if (!_data) return false;
//             return {
//                 id: _data.id,
//                 userId: _data.userId,
//                 hash: _data.hash,
//                 isUpdated: _data.isUpdated,
//                 event: {
//                     action: _data.action,
//                     actor: _data.actor,
//                 },
//             };
//         default:
//             break;
//     }
// };
//
// export {
//     getInfo,
//     update,
//     getHashFrom,
//     createHash,
// };
