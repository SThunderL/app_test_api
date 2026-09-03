const express = require('express')
const reply = require('../../common/reply')
const router = express.Router()

router.get('/layers', require('./lkpLandLayers'))
router.get('/pass', (req, res, next) => {
    return res.send(reply.done())
})
router.get('/fail', (req, res, next) => {
    next(reply.passError("apiErrorCode", reply.error({
        errorCode: "Failed",
        message: "Failed to get layers"
    })))
})

module.exports = router