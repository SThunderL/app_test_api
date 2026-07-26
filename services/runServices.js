const getValidLanguages = require("../routes/common/lang/getValidLanguages")
const { manageTokens, enumTokenNames } = require("../routes/common/token/manageTokens")
const generateLayersJson = require("./common/generateLayersJson")
require('dotenv').config({ path: './config/config.env' })
const fs = require("fs")

let urlLayers = process.env.URL_LAYERS

async function service() {
    try {
        const tokenData = await manageTokens(enumTokenNames.admin)
        console.log("------------------------------------------------------------------------------------")
        let layersAseza = await generateLayersJson(tokenData.token, urlLayers, {
            dbList: [
                process.env.DB_Zoning,
                process.env.DB_Tourism,
                process.env.DB_Tourism_Public,
                process.env.DB_Vocation,
                "Aseza/Aseza_API",
                "Aseza/Transport_Directorate_Service",
                "Aseza/Regional_Development_Directorate_Service"
            ],
            folderName: process.env.FOLDER
        })

        let layersHosted = await generateLayersJson(tokenData.token, urlLayers, {
            dbList: [
                "Hosted/Parcel",
            ],
            folderName: "Hosted"
        })

        const tokenOnline = await manageTokens(enumTokenNames.asezaOnline)
        let layersTourist = await generateLayersJson(tokenOnline.token, process.env.URL_LAYERS_EXTRA, {
            dbList: [
                // "Hosted/Aseza_Api",
                "Aseza/Aseza_Api"
            ],
            folderName: "Aseza"
            // folderName: "Hosted"
        })

        let layersData = {}
        let dataArray = [layersTourist, layersAseza, layersHosted]
        dataArray.forEach(e => {
            for (let key in e) {
                // console.log(e[key])
                if (!layersData[key])
                    layersData[key] = { ids: {}, links: {}, base: {} }
                if (e[key].ids)
                    layersData[key].ids = { ...e[key].ids, ...layersData[key].ids }
                if (e[key].links)
                    layersData[key].links = { ...e[key].links, ...layersData[key].links }
                if (e[key].base)
                    layersData[key].base = { ...e[key].base, ...layersData[key].base }
            }
        })

        fs.writeFile('./references/layers.json', JSON.stringify(layersData, null, 4), 'utf8', () => { })

        await getValidLanguages({ token: tokenData.token, clearStoredData: true, url: layersData.featureServer.links.Tourist_Trans_Facility_Description })

        console.log('Run Complete')
    } catch (err) {
        console.log(err)
        console.log("Error Found")
    }
}
service()