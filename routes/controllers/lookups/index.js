const express = require('express')
const router = express.Router()

router.get('/layers', require('./lkpLandLayers'))

module.exports = router