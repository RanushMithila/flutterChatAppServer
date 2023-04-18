const mongoose = require('mongoose');
const schema = mongoose.Schema(
    {
        sourseId: { type: 'Number', required: true },
        targetId: { type: 'Number', required: true },
        message: { type: 'String', required: true }
    },
    { timestamps: true }
);

const message = mongoose.model('message', schema);
module.exports = message;