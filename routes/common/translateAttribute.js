const ref = require("../../references/ref")
const esriRequestFeatures = require("./esriFuntions/esriRequestFeatures")
const toCamelCase = require("./toCamelCase")

module.exports = async function (token, {
    fieldData = [],
    language = "en",
    fieldName = ref.attractions.typeId,
    urlTranslation = tableAttractionTypeTranslation,
    getTranslationsOnly = false
} = {}) {
    if (!fieldData.length) {
        return fieldData
    }
    let idArray = fieldData.map(e => {
        return e[fieldName]
    })

    const whereId = `${ref.translationsBase.code} in ('${idArray.join("', '")}')`
    let idArrayTrans = await esriRequestFeatures(urlTranslation, whereId, { token, /* outFields */ })

    if (getTranslationsOnly) {
        let transByCode = {}
        if (idArrayTrans.length) {
            transByCode = idArrayTrans.reduce((obj, e) => ({ ...obj, [e[ref.translationsBase.code]]: e[language] }), {})
        }
        return {
            [fieldName]: transByCode
        }
    }

    if (idArrayTrans.length) {
        const transByCode = idArrayTrans.reduce((obj, e) => ({ ...obj, [e[ref.translationsBase.code]]: e[language] }), {})
        fieldData.forEach(e => {
            e[`${toCamelCase(fieldName)}Desc`] = transByCode[e[fieldName]]
        })
    }

    return fieldData
}