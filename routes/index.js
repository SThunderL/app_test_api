const express = require('express')
const errorHandler = require('./middleware/errorHandler')
// const addToken = require('./middleware/addToken')
// const checkRequest = require('./middleware/checkRequest')
const router = express.Router()
// const { rateLimit } = require('express-rate-limit')
// const decryptToken = require('./middleware/decryptToken')

// router.use(function (req, res, next) { setTimeout(next, 1000) })
router.use('/auth', require('./controllers/auth'))
router.use('/lookups', require('./controllers/lookups'))
router.use('/errors', require('./controllers/collector'))

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     limit: 2,
//     standardHeaders: 'draft-8',
//     legacyHeaders: false,
//     ipv6Subnet: 56,
// })

router.use(errorHandler)

module.exports = router