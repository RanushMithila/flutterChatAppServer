const mongoose = require('mongoose');
const schema = mongoose.Schema(
    {
        userID1: { type: 'Number', required: true },
        userID2: { type: 'Number', required: true },
        ShearedKey: { type: 'String', required: true }
    },
    { timestamps: true }
);

const message = mongoose.model('key', schema);
module.exports = message;

//test