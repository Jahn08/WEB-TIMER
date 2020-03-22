const express = require('express');
express();

const path = require('path');
const rootPath = path.join(__dirname, '..', 'node_modules');

const router = express.Router();
router.use('/jquery', express.static(path.join(rootPath, 'jquery', 'dist')));
router.use('/bootstrap', express.static(path.join(rootPath, 'bootstrap', 'dist')));
router.use('/multiple-select', express.static(path.join(rootPath, 'multiple-select')));
router.use('/vue', express.static(path.join(rootPath, 'vue', 'dist')));
router.use('/vue-router', express.static(path.join(rootPath, 'vue-router', 'dist')));

const config = require('../config');

router.route('/about').get((req, res) => {
    res.status(200).json({
        email: config.mail.auth.user,
        website: config.about.website
    });
});

module.exports = router;