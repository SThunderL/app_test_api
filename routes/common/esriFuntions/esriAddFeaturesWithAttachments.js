const esriAddAttachments = require("./esriAddAttachments")
const esriAddFeatures = require("./esriAddFeatures")
const reply = require("../reply")
const esriDeleteFeatures = require("./esriDeleteFeatures")
const errorCode = "esriAddFeaturesWithAttachments"


/**
 * 
 * @param {String} apiErrorCode "_ARCLayerError": 424, "_EsriAddFeatures_TokenError": 401, 
 * "_EsriAddFeatures_TokenMissing": 401, "_EsriAddFeatures_Error": 500,
 * "_EsriAttachmentFeatures_TokenError": 401, "_EsriAttachmentFeatures_TokenMissing": 401, 
 * "_EsriAttachmentFeatures_Error": 500, "_AddFailed": 500, "_UnableToUploadAttachments": 500
 */

/**
 * 
 * @param {String} url 
 * @param {Array} featuresList {feature: {attributes, geometry}, attachments: [{ name, base }]} array of features, consult esri documentations -> 
 * {feature: is the single object from the array from esri docs, attachments: [{ name, base }]}
 * {object} funECode: default "", token: default "" should be esri token
 * @returns array of results as follows [{resultFeature: {objectId, success}, resultAttach: {objectId, success}}]
 */
module.exports = async function (url, featuresList, { funECode = "", token = "", inSR = "" } = {}) {
    try {
        let requestsArray = featuresList.map(e => {
            return addSingleFeature(url, e.feature, e.attachments, { funECode, token, inSR })
        })
        return await Promise.all(requestsArray)
    } catch (err) {

        if (reply.validateError(err)) {
            throw err
        }
        console.log(err)
        throw reply.error({ errorCode: `${errorCode}_UnableToUploadAttachments`, data: err.data, status: 500, funECode })
    }
}

async function addSingleFeature(url, feature, attachments, { funECode = "", token = "", inSR = "" } = {}) {
    let newFeature = []
    try {
        newFeature = await esriAddFeatures(url, [feature], { funECode, token, inSR })
        let featureResult = newFeature[0]
        if (!featureResult.success) {
            throw reply.error({ errorCode: `${errorCode}_AddFailed`, data: newFeature[0].error, status: 500, funECode })
        }

        let newObjectId = featureResult.objectId
        let attachArray = []
        if (attachments && attachments.length) {
            for (const e of attachments) {
                attachArray.push(await esriAddAttachments(url, e, newObjectId, { funECode, token }))
            }
        }
        return { resultFeature: featureResult, resultAttach: await Promise.all(attachArray), hasError: false }
    } catch (err) {
        await removeBadData(token, url, newFeature)
        throw err
    }
}

async function removeBadData(token, urlAttachments, attachResults) {
    try {
        if (attachResults?.length) { //  [{ objectId: 12, success: true/false }]
            let resultObjectArray = attachResults.map(e => e.objectId)
            await esriDeleteFeatures(urlAttachments, { objectIds: resultObjectArray, token })
        }
    } catch (err) {
        console.log(err)
        console.log('Unable to remove attachResults data')
    }
}