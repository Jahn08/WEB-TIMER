const router = require('express').Router();
const config = require('../config');

router.route('/about').get((req, res) => {
    res.status(200).json({
        email: config.mail.auth.user,
        website: config.about.website
    });
});

module.exports = router;
