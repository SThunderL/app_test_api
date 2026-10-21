const { manageTokens, enumTokenNames } = require("../../common/token/manageTokens")
const reply = require("../../common/reply")
const layers = require("./../../../references/layers.json")
const obtainLayers = require("../../common/obtainLayers")
const esriRequestFeatures = require("../../common/esriFuntions/esriRequestFeatures")
const dbTables = require("../../../references/dbTables")
const ref = require("../../../references/ref")
const apiErrorCode = "LookupTypes"

module.exports = async (req, res, next) => {
    try {
        let { token } = await manageTokens(enumTokenNames.lands)

        try {
            const where = `${ref.lands.villCode} = '001'`
            let data = await esriRequestFeatures(dbTables.tableParcelMainCass, where, { token, timeOut: 10000 })
            return res.send(reply.done(layers.main))
        } catch (err) {
            return res.send(reply.done(layers.stg))
        }

        let layerSection = await obtainLayers(tokenData.token, process.env.URL_LANDS, {
            dbList: {
                list: [
                    "DLS_Layers_Service",
                    "Tables",
                ],
                named: {
                    "DLS_JTM_Service": {
                        name: "DLS_JTM"
                    },
                    "DLS_Cassini_Service": {
                        name: "DLS_Cassini"
                    }
                }
            },
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