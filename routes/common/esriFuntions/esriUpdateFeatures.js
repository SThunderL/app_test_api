const reply = require("../reply")
const qs = require("qs")
const { default: axios } = require("axios")
const errorCode = "EsriUpdateFeatures"

/**
 * Async: creates a feature on the provided layer url
 * @param {String} apiErrorCode Error Strings: 
 * "_ARCLayerError": 424, 
 * "_EsriUpdateFeatures_TokenError": 401,
 * "_EsriUpdateFeatures_TokenMissing": 401, 
 * "_EsriUpdateFeaturesError": 500
 */

/**
 * 
 * @param {String} url feature layer url, the method will automatically add "/addFeatures" at the end
 * @param {Array} featuresList Array of features to update in the layer, sinlge feature example:
 * { geometry: {x: 12, "y": 3}, attributes: {SOMEID: 23} }
 * {object} funECode: default "", token: default "" should be esri token
 * @returns object containing the update results [{ objectId: 12, success: true/false }]
 */
module.exports = async function (url, featuresList, { funECode = "", token = "" } = {}) {
    try {
        let data = {
            "features": JSON.stringify(featuresList),
            "f": "json",
            "token": token
        }
        let options = {
            "method": "POST",
            "headers": { "content-type": "application/x-www-form-urlencoded" },
            "data": qs.stringify(data),
            "url": url + "/updateFeatures"
        }

        let result = await axios(options)

        if (result.data.error) {
            if (result.data.error.code === 498) throw reply.error({ errorCode: `${errorCode}_TokenError`, status: 401, message: "Token Error" })
            if (result.data.error.code === 499) throw reply.error({ errorCode: `${errorCode}_TokenMissing`, status: 401, message: "Token Missing" })
            throw reply.error({
                errorCode: `${errorCode}_Error`,
                data: result.data.error,
                status: 500,
                funECode,
                internalData: {
                    url,
                    data,
                    reply: result.data.error
                }
            })
        }

        return result.data.updateResults
    } catch (err) {
        if (err.isAxiosError)
            throw reply.error({
                errorCode: `${errorCode}_ARCLayerError`,
                internalData: {
                    url,
                    data,
                    reply: err.response?.data
                },
                status: 424,
                funECode
            })
        throw err
    }
}