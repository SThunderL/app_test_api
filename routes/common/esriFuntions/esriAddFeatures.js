const { default: axios } = require("axios")
const qs = require("qs")
const reply = require("../reply")
const errorCode = "esriAddFeatures"

/**
 * 
 * @param {String} url feature layer url, the method will automatically add "/addFeatures" at the end
 * @param {Array} featuresList Array of features to add to the layer, sinlge feature example:
 * { geometry: {x: 12, "y": 3}, attributes: {SOMEID: 23} }
 * {object} funECode: default "", token: default "" should be esri token
//  * @returns object containing the add results { addResults: [{ objectId: 12, success: true/false }]}
 * @returns return array of results [{ objectId: 12, success: true/false }]
 */
module.exports = async function (url, featuresList, { funECode = "", token = "", inSR = null } = {}) {
    try {
        let data = {
            "features": JSON.stringify(featuresList),
            "f": "json",
            "token": token,
            "inSR": inSR
        }
        let options = {
            "method": "POST",
            "headers": { "content-type": "application/x-www-form-urlencoded" },
            "data": qs.stringify(data),
            "url": url + "/addFeatures"
        }

        const result = await axios(options)

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
            throw reply.error({ errorCode: `${errorCode}_Error`, data: result.data.error, status: 500, funECode })
        }
        return result.data.addResults
    } catch (err) {
        if (!reply.validateError(err))
            throw reply.error({
                errorCode: `${errorCode}_ARCLayerError`,
                data: err.data,
                status: 500,
                funECode,
                internalData: {
                    url,
                    featuresList
                }
            })
        throw err
    }
}