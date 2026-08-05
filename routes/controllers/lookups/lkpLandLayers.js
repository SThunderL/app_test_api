const obtainLayers = require("../../common/obtainLayers")
const reply = require("../../common/reply")
const { manageTokens, enumTokenNames } = require("../../common/token/manageTokens")

const apiErrorCode = "LookupTypes"

module.exports = async (req, res, next) => {

    try {
        let tokenData = await manageTokens(enumTokenNames.lands)

        let layerSection = await obtainLayers(tokenData.token, process.env.URL_LANDS)
        return res.send(reply.done(layerSection))
    } catch (err) {
        next(reply.passError(apiErrorCode, err))
    }
}