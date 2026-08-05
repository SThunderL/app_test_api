const express = require('express')
const errorHandler = require('./middleware/errorHandler')
const router = express.Router()

router.use('/auth', require('./controllers/auth'))
router.use('/lookups', require('./controllers/lookups'))
router.use('/errors', require('./controllers/collector'))

router.use(errorHandler)

module.exports = router