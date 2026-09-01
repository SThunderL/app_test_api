const obtainLayers = require("../../common/obtainLayers")
const { manageTokens, enumTokenNames } = require("../../common/token/manageTokens")
const reply = require("../../common/reply")
const layers = require("./../../../references/layers.json")
const apiErrorCode = "LookupTypes"

module.exports = async (req, res, next) => {
    try {
        return res.send(reply.done(layers))

        let tokenData = await manageTokens(enumTokenNames.lands)

        let layerSection = await obtainLayers(tokenData.token, process.env.URL_LANDS, {
            dbList: [
                "DLS_Service",
                "DLS_Cassini",
                "DLS_JTM",
                "Tables",
            ]
        })
        // return res.send(layerSection)
        for (let k in layerSection.mapServer.base) {
            let newK = k
            if (k.includes("_Mobile")) {
                newK = k.replace("_Mobile", "")
            }
            layerSection.mapServer.base[newK] = layerSection.mapServer.base[k]
        }
        return res.send(reply.done(layerSection))
    } catch (err) {
        next(reply.passError(apiErrorCode, err))
    }
}