const esriRequestFeatures = require("../../common/esriFuntions/esriRequestFeatures")
const reply = require("../../common/reply")
const { manageTokens, enumTokenNames } = require("../../common/token/manageTokens")
// const layers = require("./../../../references/layers.json")
const apiErrorCode = "LookupTypes"

const url = "https://maps.dls.gov.jo/arcgis/rest/services/DLS_Cassini/MapServer/3"

module.exports = async (req, res, next) => {
    try {
        let tokenData = await manageTokens(enumTokenNames.lands)
        let lands = await esriRequestFeatures(url, `1=1`, { token: tokenData.token })

        const landsLength = lands.length
        let reqArray = []
        for (let i = 0; i < landsLength; i++) {
            const dlsKey = lands[i]["DLS_KEY"]
            reqArray.push(esriRequestFeatures("", `DLS_KEY = '${dlsKey}'`, { token: tokenData.token, outFields: ["OBJECTID"] }))
        }

        let result = Promise.allSettled(reqArray)
        return res.send(reply.done(result))
    } catch (err) {
        next(reply.passError(apiErrorCode, err))
    }
}