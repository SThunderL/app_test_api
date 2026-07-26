const express = require('express')
const router = express.Router()

router.post('/', require('./wirteErrors'))
router.get('/', require('./wirteErrors'))
// router.get('/key', require('./getAppApiKey'))

module.exports = router