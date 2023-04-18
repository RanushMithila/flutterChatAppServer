const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '.' + file.mimetype.split('/')[1]);
    }
});

const upload = multer({
    storage: storage,
});
router.route('/addimage').post(upload.single("img"), (req, res) => {
    try {
        return res.json({ path: req.file.filename });
    } catch (err) {
        return res.json({ error: err.message });
    }
});

module.exports = router;