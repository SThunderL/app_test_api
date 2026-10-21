const obtainLayers = require("../../routes/common/obtainLayers")
const fs = require('fs')
const { manageTokens, enumTokenNames } = require("../../routes/common/token/manageTokens")

module.exports = async function (token) {
    try {
        if (!token) {
            token = (await manageTokens(enumTokenNames.lands)).token
        }

        let layersData = await obtainLayers(token, process.env.URL_LANDS, {
            // let layersData = await obtainLayers("", process.env.URL_LANDS, {
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

        let layersStg = await obtainLayers(token, process.env.URL_LANDS, {
            dbList: {
                list: [],
                named: {
                    "DLS_Layers_Service_STG": {
                        name: "DLS_Layers_Service",
                    },
                    "DLS_JTM_Service_STG": {
                        name: "DLS_JTM"
                    },
                    "DLS_Cassini_Service_STG": {
                        name: "DLS_Cassini"
                    },
                    "Tables_STG": {
                        name: "Tables"
                    }
                }
            },
        })
        console.log(layersStg)
        // for (let k in layersData.mapServer.base) {
        //     let newK = k
        //     if (k.includes("_Mobile")) {
        //         newK = k.replace("_Mobile", "")
        //     }
        //     if (k.includes("_JS_Viewer")) {
        //         newK = k.replace("_JS_Viewer", "")
        //     }
        //     layersData.mapServer.base[newK] = layersData.mapServer.base[k]
        // }
        fs.writeFileSync('./references/layers.json', JSON.stringify({ main: layersData, stg: layersStg }, null, 4), {
            encoding: 'utf8',
            flag: 'w'
        })
    } catch (err) {
        console.log(err)
        console.log("Error Found")
    }
}