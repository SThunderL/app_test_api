const reply = require("../common/reply")
const { manageTokens, enumTokenNames } = require("../common/token/manageTokens")


const apiErrorCode = "TokenAdd"
module.exports = async (req, res, next) => {
    try {
        // const encryptedData = req.headers['access-token']
        let tokenData = await manageTokens(enumTokenNames.admin)
        req["tokenData"] = tokenData
        next()
    } catch (err) {
        next(reply.passError(apiErrorCode, err))
    }
}