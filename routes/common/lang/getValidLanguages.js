const fs = require("fs")
// const { tableAttractionDescription } = require("../../../references/dbTables")
const esriRequestLayerJson = require("../esriFuntions/esriRequestLayerJson")
const langCodes = require("./langCodes.json")

const pathFolder = "./references/lang"
const pathFile = `${pathFolder}/langCollection.json`

const funECode = "LanguageCheck"

/**
 * 
 * token => esriToken, url => any layer with base translations or specific layer with translation base
 * clearStoredData (false) if set to true it would try to get a new json from the layer (requires url and token to be valid)
 * getAsArray (true) returns data as array of accepted languages if set to false the result would be an object of {"ar": "ar"}
 * @returns array of accepted languages depending if getAsArray = true
 */
module.exports = async function ({
    token = "",
    url,
    clearStoredData = false,
    getAsArray = true
}) {

    const fileExists = fs.existsSync(pathFile)
    if (clearStoredData) {
        fs.rmSync(pathFile, { force: true })
        createFile()
    } else if (!fileExists) {
        createFile()
    }
    let langCollection = JSON.parse(fs.readFileSync(pathFile, 'utf8'))

    if (!langCollection) {
        langCollection = {}
    }

    if (!Object.values(langCollection).length) {
        let lJson = await esriRequestLayerJson(url, { token, funECode })
        lJson.fields.forEach(e => {
            if (langCodes[e.name]) {
                langCollection[e.name] = e.name
            }
        })
        createFile(JSON.stringify(langCollection, null, 4))
    }

    if (getAsArray) {
        return Object.keys(langCollection)
    }
    return langCollection
}

function createFile(fileInfo = "{}") {
    fs.mkdirSync(pathFolder, { recursive: true })
    fs.writeFileSync(pathFile, fileInfo)
}