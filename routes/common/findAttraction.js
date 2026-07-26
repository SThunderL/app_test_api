const { tableAttractions, tableAttractionTypeTranslation, tableAttractionActivities, tableAttractionDescription, tableLkpActivities, tablePreviewAttractions } = require("../../references/dbTables")
const { getAppLocation, appLocation } = require("../../references/enums")
const ref = require("../../references/ref")
const esriRequestFeatures = require("./esriFuntions/esriRequestFeatures")
const esriRequestFeaturesWithAttachBase64 = require("./esriFuntions/esriRequestFeaturesWithAttachBase64")
const imposeFromKeys = require("./imposeFromKeys")
const translationManager = require("./slaves/translationManager")
const toCamelCase = require("./toCamelCase")

/**
 * will search attractions based on specific search params if translateTypes is provided then language is required
 * token is an esri token
 * facilityId is optional 
 * getImages decides if images should be returned or not
 * getImagesAsLinks relies on get Images, returns images as links and not files
 * getImageMain relies on get Images: gets main image only if one is found
 * @returns array of attractions
 */
module.exports = async function ({
    name = "",
    token = "",
    facilityId = "",
    activityIdArray = [],
    isVisible = null,
    page = 1, count = 10,
    detailed = false,
    translateTypes = true,
    language = "ar",
    imposeKeys = true,

    getImages = false,
    getImagesAsLinks = false,
    getImageMain = false,
} = {}) {
    let attractionsList = await searchList({
        name,
        token,
        facilityId,
        activityIdArray,
        isVisible,
        page, count,
        getImages,
        getImagesAsLinks,
        getImageMain,
    })
    if (!attractionsList.length) {
        return []
    }
    // * get activities 
    const activityArray = []

    attractionsList = attractionsList.map(e => {
        activityArray.push(e[ref.attractions.facilityId])
        e["linkMain"] = {}
        if (e.links && e.links.length) {
            let mainIndex = e.links.findIndex((j, i) => j.info.keywords == "main")
            if (mainIndex > 0) {
                e.linkMain = e.links[mainIndex]
                e.links.splice(mainIndex, 1)
            }
        }
        if (getImageMain && e.links.length == 0) {
            delete e.links
        }
        e["name"] = language == "ar" ? e[ref.attractions.nameAr] : e[ref.attractions.nameEn]
        return e
    })

    const whereActivity = `${ref.attractionActivities.facilityId} in ('${activityArray.join("', '")}')`
    let activitesList = []
    if (detailed) {
        activitesList = await esriRequestFeatures(tableAttractionActivities, whereActivity, { token, funECode: "Activity" })
    }
    if (translateTypes) {
        const translated = await translateDetailed(token, attractionsList, {
            language,
            activitesList,
            detailed
        })
        return connectActivities({ ...translated, imposeKeys, language })
    }

    return connectActivities({ activitesList, attractionsList, imposeKeys, language })
}

async function searchList({
    name = "",
    token = "",
    facilityId = "",
    activityIdArray = [],
    isVisible = null,
    page = 1, count = 10,
    getImages = false,
    getImagesAsLinks = false,
    getImageMain = false,

    searchId = 0
}) {
    const whereArray = [
        `${ref.attractions.facilityId} is not Null`
    ]

    if (activityIdArray && activityIdArray.length) {
        const whereActivities = `${ref.attractionActivities.code} in ('${activityIdArray.join("', '")}')`
        let validFacilities = await esriRequestFeatures(tableAttractionActivities, whereActivities, { token, outFields: ref.attractionActivities.facilityId, funECode: "ActivitySearch" })
        let validActivites = validFacilities.map(e => e[ref.attractionActivities.facilityId])
        whereArray.push(`${ref.attractions.facilityId} in ('${validActivites.join("', '")}')`)
    } else if (facilityId) {
        whereArray.push(`${ref.attractions.facilityId} = '${facilityId}'`)
    }
    if (isVisible != null) {
        whereArray.push(`${ref.attractions.isVisible} = ${Number(isVisible)}`)
    }
    if (name != null) {
        switch (searchId) {
            case 0:
                whereArray.push(`(${ref.attractions.nameAr} Like '${name}%' OR ${ref.attractions.nameEn} Like '${name}%')`)
            default:
                whereArray.push(`(${ref.attractions.nameAr} Like '%${name}%' OR ${ref.attractions.nameEn} Like '%${name}%')`)
        }
    }
    const offset = (page - 1) * count
    const where = whereArray.join(" AND ")
    const options = {
        where,
        token,
        outFields: validFields.join(", "),
        orderByFields: [ref.attractions.objectId],
        resultRecordCount: count,
        resultOffset: offset,
        returnGeometry: true,
        keywords: getImageMain ? "main" : null,
        getImagesAsLinks,
        outSR: "4326"
    }
    let attractionsList = []

    if (getImages) {
        attractionsList = await esriRequestFeaturesWithAttachBase64(tablePreviewAttractions, options)
    } else {
        attractionsList = await esriRequestFeatures(tableAttractions, where, options)
    }

    if (!attractionsList.length && name) {
        if (searchId >= 1) {
            return []
        } else {
            searchId++
            attractionsList = await searchList({
                name,
                token,
                facilityId,
                activityIdArray,
                isVisible,
                page, count,
                getImages,
                getImagesAsLinks,
                getImageMain,
                searchId
            })
        }
    }

    return attractionsList
}

async function translateDetailed(token, attractionsList, { language = "ar", activitesList = [], detailed = false } = {}) {
    const translationRequestArray = [
        {
            id: "type",
            language,
            urlTranslation: tableAttractionTypeTranslation,
            fieldName: ref.attractions.typeId,
            fieldData: attractionsList,
            getTranslationsOnly: true
        },
        {
            id: "desc",
            language,
            urlTranslation: tableAttractionDescription,
            fieldName: ref.attractions.facilityId,
            fieldData: attractionsList,
            getTranslationsOnly: true
        },
    ]
    if (detailed) {
        translationRequestArray.push({
            id: "activity",
            language,
            urlTranslation: tableLkpActivities,
            fieldName: ref.attractionActivities.code,
            fieldData: activitesList,
            getTranslationsOnly: true
        })
    }

    let translated = await translationManager(token, { translationRequestArray })
    const passed = translated.passed.list

    for (const id in passed) {
        switch (id) {
            case "activity":
                activitesList.forEach(e => {
                    e["codeDesc"] = passed[id][ref.translationsBase.code][e[ref.translationsBase.code]]
                })
                break
            default:
                attractionsList.forEach(e => {
                    for (let key in passed[id]) {
                        e[`${toCamelCase(key).split("_").join("")}Desc`] = passed[id][key][e[key]]
                    }
                })
                break
        }
    }

    return { attractionsList, activitesList }
}

function connectActivities({ attractionsList, activitesList, imposeKeys, language = "ar" } = {}) {
    if (imposeKeys) {
        if (!activitesList.length)
            return imposeFromKeys(attractionsList, ref.attractions)

        let activityByFacility = activitesList.reduce((obj, e) => ({
            ...obj,
            [e[ref.attractionActivities.facilityId]]: imposeFromKeys(e, ref.attractionActivities, { removeObjectId: true })
        }), {})
        attractionsList.forEach(e => {
            e["name"] = language == "ar" ? e[ref.attractions.nameAr] : e[ref.attractions.nameEn]
            e["activityList"] ??= []
            if (activityByFacility[e[ref.attractions.facilityId]])
                e["activityList"].push(activityByFacility[e[ref.attractions.facilityId]])
        })
        return imposeFromKeys(attractionsList, ref.attractions)
    }

    if (!activitesList.length) {
        return attractionsList
    }

    let activityByFacility = activitesList.reduce((obj, e) => {
        delete e[ref.attractions.objectId]
        return {
            ...obj,
            [e[ref.attractionActivities.facilityId]]: e
        }
    }, {})
    attractionsList.forEach(e => {
        e["activityList"] ??= []
        if (activityByFacility[e[ref.attractions.facilityId]])
            e["activityList"].push(activityByFacility[e[ref.attractions.facilityId]])
    })
    return attractionsList
}

const validFields = [
    ref.attractions.objectId,
    ref.attractions.nameAr,
    ref.attractions.nameEn,
    ref.attractions.typeId,
    ref.attractions.facilityId,
    ref.attractions.governorateArabicName,
    ref.attractions.govCode,
    ref.attractions.districtArabicName,
    ref.attractions.distCode,
    ref.attractions.subDistrictArabicName,
    ref.attractions.subDistCode,
    ref.attractions.facilityNationalId,
    // ref.attractions.workingHours,
    ref.attractions.isVisible,
    ref.attractions.priceEntrance,
    ref.attractions.website,
    ref.attractions.explorationTime,
    ref.attractions.phoneNumber
]