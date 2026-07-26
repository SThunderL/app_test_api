const esriRequestLayerJson = require("./esriRequestLayerJson")
const imposeFromKeys = require("./../imposeFromKeys")
const reply = require("./../reply")
const funECode = "TranslateAttributes"

module.exports = {
    sync: jsonSync,
    async: urlAsync
}

/**
 * url: layer url
 * dataSet = {}: ref data set of the feature layer, required if imposedKeys is true,
 * imposedKeys: false, if true the keys will be imposed before being returned,
 * filterFields: [], if provided it will filter only fields inside of it other fields will be omitted
 * fieldsRemoved: [], Removes fields from object, does not work filterFeilds
 * @param {Array} attributeData array of feature attributes to be translated
 * @returns array of attributeData with translated descriptions and imposed keys if imposedKeys is set to true
 */
async function urlAsync(attributeData, {
    url = "",
    token = "",
    dataSet = {},
    imposedKeys = false,
    filterFields = [],
    fieldsRemoved = []
} = {}) {
    if (!attributeData || !attributeData.length) return []
    let layerJson = await esriRequestLayerJson(url, { token, funECode })

    let translatedData = {}
    if (imposedKeys) {
        if (dataSet == undefined) {
            throw reply.error({ errorCode: "DatasetNotFound", funECode, message: "Server error while translating attributes", status: 500 })
        }
        const invertedDataSet = invertObject(dataSet)
        translatedData = attributeData.map(e => translateRowImposed(e, layerJson, invertedDataSet, filterFields, fieldsRemoved))
        translatedData = imposeFromKeys(translatedData, dataSet, {
            removeObjectId: true,
        })
    } else {
        translatedData = attributeData.map(e => translateRow(e, layerJson, filterFields, fieldsRemoved))
    }

    return translatedData
}

/**
 * layerJson layer json of the feature layer from which the attributes come from, you can use esriRequestLayerJson.
 * dataSet = {}: ref data set of the feature layer, required if imposedKeys is true,
 * imposedKeys: false, if true the keys will be imposed before being returned,
 * filterFields: [], if provided it will filter only fields inside of it other fields will be omitted
 * fieldsRemoved: [], Removes fields from object, does not work filterFeilds
 * @param {Array} attributeData array of feature attributes to be translated 
 * @returns array of attributeData with translated descriptions and imposed keys if imposedKeys is set to true
 */
function jsonSync(attributeData, {
    layerJson = {},
    dataSet = {},
    imposedKeys = false,
    filterFields = [],
    fieldsRemoved = []
} = {}) {
    if (!attributeData || !attributeData.length) return []
    let translatedData = {}
    if (imposedKeys) {
        if (dataSet == undefined) {
            throw reply.error({ errorCode: "DatasetNotFound", funECode, message: "Server error while translating attributes", status: 500 })
        }
        const invertedDataSet = invertObject(dataSet)
        translatedData = attributeData.map(e => translateRowImposed(e, layerJson, invertedDataSet, filterFields, fieldsRemoved))
        translatedData = imposeFromKeys(translatedData, dataSet, {
            removeObjectId: true,
        })
    } else {
        translatedData = attributeData.map(e => translateRow(e, layerJson, filterFields, fieldsRemoved))
    }

    return translatedData
}

function invertObject(obj) {
    const invertedObj = {}
    for (const key in obj) {
        invertedObj[obj[key]] = key
    }
    return invertedObj
}

function translateRowImposed(attData, layerJson, invertedDataSet, filterFields = [], fieldsRemoved = []) {
    // console.log(layerJson)
    const { fields } = layerJson
    let reConstructedData = reconstructData(attData, filterFields, fieldsRemoved)

    if (filterFields.length) {
        fields.forEach(e => {
            if (filterFields.includes(e.name)) {
                if (e.domain != null && invertedDataSet[e.name] != undefined) {
                    let trDom = translateDomValue(attData[e.name], e.domain.codedValues)
                    if (trDom)
                        reConstructedData[`${invertedDataSet[e.name]}Description`] = trDom
                }
            }
        })
    } else {
        fields.forEach(e => {
            if (e.domain != null && invertedDataSet[e.name] != undefined) {
                let trDom = translateDomValue(attData[e.name], e.domain.codedValues)
                if (trDom)
                    reConstructedData[`${invertedDataSet[e.name]}Description`] = trDom
            }
        })
    }

    if (filterFields.length) {
        if (filterFields.includes(layerJson.typeIdField)) {
            reConstructedData = filterTypesImposed(reConstructedData, attData, layerJson, "typeIdField", invertedDataSet)
        }
        if (filterFields.includes(layerJson.subtypeField)) {
            reConstructedData = filterTypesImposed(reConstructedData, attData, layerJson, "subtypeField", invertedDataSet)
        }
    } else {
        reConstructedData = filterTypesImposed(reConstructedData, attData, layerJson, "typeIdField", invertedDataSet)
        reConstructedData = filterTypesImposed(reConstructedData, attData, layerJson, "subtypeField", invertedDataSet)
    }
    return reConstructedData
}
function translateRow(attData, layerJson, filterFields = [], fieldsRemoved = []) {
    const { fields } = layerJson
    let reConstructedData = reconstructData(attData, filterFields, fieldsRemoved)

    if (filterFields.length) {
        fields.forEach(e => {
            if (filterFields.includes(e.name)) {
                if (e.domain != null) {
                    const trDom = translateDomValue(attData[e.name], e.domain.codedValues)
                    if (trDom)
                        reConstructedData[`${e.name}_Name`] = trDom
                }
            }
        })
    } else {
        fields.forEach(e => {
            if (e.domain != null) {
                const trDom = translateDomValue(attData[e.name], e.domain.codedValues)
                if (trDom)
                    reConstructedData[`${e.name}_Name`] = trDom
            }
        })
    }

    if (filterFields.length) {
        if (filterFields.includes(layerJson.typeIdField)) {
            reConstructedData = filterTypes(reConstructedData, attData, layerJson, "typeIdField")
        }
        if (filterFields.includes(layerJson.subtypeField)) {
            reConstructedData = filterTypes(reConstructedData, attData, layerJson, "subtypeField")
        }
    } else {
        reConstructedData = filterTypes(reConstructedData, attData, layerJson, "typeIdField")
        reConstructedData = filterTypes(reConstructedData, attData, layerJson, "subtypeField")
    }

    return reConstructedData
}
function reconstructData(attData, filterFields = [], fieldsRemoved = []) {
    let reConstructedData = {}

    if (filterFields.length) {
        for (let i in attData) {
            if (filterFields.includes(i)) {
                reConstructedData[i] = attData[i]
            }
        }
    } else {
        if (fieldsRemoved.length) {
            for (let i in attData) {
                if (!fieldsRemoved.includes(i)) {
                    reConstructedData[i] = attData[i]
                }
            }
        } else {
            for (let i in attData) {
                reConstructedData[i] = attData[i]
            }
        }
    }

    return reConstructedData
}
function translateDomValue(value, domain) {
    if (value == null) return null
    if (domain != null) {
        let filted = domain.filter(e => e.code == value)
        if (filted.length) {
            return filted[0].name //?.name // || ""
        }
        return ""
    }
    return value
}

function filterTypesImposed(reConstructedData, attData, layerJson, fieldNameId, invertedDataSet) {
    if (attData[layerJson[fieldNameId]] != null) {
        let type = {}
        const { types } = layerJson

        type = types.filter(e => e.id == attData[layerJson[fieldNameId]])[0]
        const typeDomains = type.domains

        reConstructedData[`${invertedDataSet[layerJson[fieldNameId]]}Description`] = type.name
        // get domain of sub type
        for (let i in typeDomains) {
            if (typeDomains[i].codedValues != undefined) {
                let trDom = typeDomains[i].codedValues.filter(e => e.code == attData[i])[0]?.name || null
                if (trDom)
                    reConstructedData[`${invertedDataSet[i]}Description`] = trDom
            }
        }
    }

    return reConstructedData
}
function filterTypes(reConstructedData, attData, layerJson, fieldNameId) {
    if (attData[layerJson[fieldNameId]] != null) {
        let type = {}
        const { types } = layerJson

        type = types.filter(e => e.id == attData[layerJson[fieldNameId]])[0]
        if (type == undefined) {
            return reConstructedData
        }
        const typeDomains = type.domains
        reConstructedData[`${layerJson[fieldNameId]}_Name`] = type.name

        for (let i in typeDomains) {
            if (typeDomains[i].codedValues != undefined) {
                const trDom = typeDomains[i].codedValues.filter(e => e.code == attData[i])[0]?.name || null
                if (trDom)
                    reConstructedData[`${i}_Name`] = trDom
            }
        }
    }
    return reConstructedData
}