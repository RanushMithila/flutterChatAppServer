const mongoose = require('mongoose');
const schema = mongoose.Schema(
    {
        userID: { type: 'Number', required: true },
        PublicKey: { type: 'String', required: true },
        PrivateKey: { type: 'String', required: true }
    },
    { timestamps: true }
);

const message = mongoose.model('user', schema);
module.exports = message;