const reply = require("../../common/reply")

const apiErrorCode = "AuthApi"
const apiKey = process.env.APIKEY
const licenseKey = process.env.LICE_KEY

module.exports = async (req, res, next) => {
    try {
        return res.send(reply.done({ apiKey, licenseKey }))
    } catch (err) {
        next(reply.passError(apiErrorCode, err))
    }
}