const logError = require("../../common/logError")
const reply = require("../../common/reply")

const apiErrorCode = "ErrorsCollector"

module.exports = async (req, res, next) => {
    try {
        logError(req.body, {
            headers: req.headers,
            folderName: 'collector',
            params: req.params,
            query: req.query,
        })
        return res.send(reply.done({}))
    } catch (err) {
        next(reply.passError(apiErrorCode, err))
    }
}