const obtainLayers = require("../routes/common/obtainLayers")
const { manageTokens, enumTokenNames } = require("../routes/common/token/manageTokens")
require('dotenv').config({ path: './config/config.env' })
const fs = require('fs')

async function service() {
    try {
        let tokenData = await manageTokens(enumTokenNames.lands)

        let layersData = await obtainLayers(tokenData.token, process.env.URL_LANDS, {
        // let layersData = await obtainLayers("", process.env.URL_LANDS, {
            dbList: [
                "DLS_Service",
                "DLS_Cassini",
                "DLS_JTM",
                "Tables",
            ],
        })
        for (let k in layersData.mapServer.base) {
            let newK = k
            if (k.includes("_Mobile")) {
                newK = k.replace("_Mobile", "")
            }
            if (k.includes("_JS_Viewer")) {
                newK = k.replace("_JS_Viewer", "")
            }
            layersData.mapServer.base[newK] = layersData.mapServer.base[k]
        }
        fs.writeFile('./references/layers.json', JSON.stringify(layersData, null, 4), 'utf8', () => { })
        console.log('Run Complete -- ')
    } catch (err) {
        console.log(err)
        console.log("Error Found")
    }
}
service()