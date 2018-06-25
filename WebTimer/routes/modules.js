const express = require('express');
let app = express();

const path = require('path');
let rootPath = path.join(__dirname, '..', 'node_modules');

let router = express.Router();
router.use('/jquery', express.static(path.join(rootPath, 'jquery', 'dist')));
router.use('/bootstrap', express.static(path.join(rootPath, 'bootstrap', 'dist')));
router.use('/multiple-select', express.static(path.join(rootPath, 'multiple-select')));
router.use('/vue', express.static(path.join(rootPath, 'vue', 'dist')));
router.use('/vue-router', express.static(path.join(rootPath, 'vue-router', 'dist')));

module.exports = router;