const express = require('express')
const router = express.Router()

router.get('/token', require('./getAppToken'))
router.get('/key', require('./getAppApiKey'))

module.exports = router